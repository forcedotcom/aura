/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.test.source;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.Nullable;
import javax.inject.Inject;

import org.apache.commons.lang3.CharEncoding;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.test.source.StringSourceLoaderImpl.DescriptorInfo;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.test.configuration.TestServletConfig;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * This Loader is intended for integration tests running in an ApplicationContext external to the server's context. This
 * will then marshal all requests to the StringSourceLoaderController at the server, which can operate on the "real"
 * StringSourceLoader.
 */
public class StringSourceExternalLoader implements StringSourceLoader {
    // WARNING: All injected services are in an external ApplicationContext (from the server), so do not rely on updates
    // to those services being reflected at the server, and vice versa.

    @Inject
    private TestServletConfig testServletConfig;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private DefinitionService definitionService;

    private final Map<DefDescriptor<? extends Definition>, StringSource<? extends Definition>> localSources = new ConcurrentHashMap<>();

    private final ConcurrentHashMap<String, NamespaceAccess> localAccess = new ConcurrentHashMap<>();

    private String buildContextForPost(Mode mode,
                                       DefDescriptor<? extends BaseComponentDef> app, String fwuid,
                                       List<String> dn) throws QuickFixException {
        StringBuffer sb = new StringBuffer();
        JsonEncoder json = new JsonEncoder(sb, false, false);

        if (fwuid == null) {
            fwuid = configAdapter.getAuraFrameworkNonce();
        }
        if (dn == null) {
            dn = Lists.newArrayList();
        }

        try {
            json.writeMapBegin();
            json.writeMapEntry("mode", mode.toString());
            if (app.getDefType() == DefType.APPLICATION) {
                json.writeMapEntry("app", app.getQualifiedName());
            } else {
                json.writeMapEntry("cmp", app.getQualifiedName());
            }
            json.writeMapEntry("dn", dn);
            json.writeMapEntry("fwuid", fwuid);
            json.writeMapEntry("test", "undefined");
            json.writeMapEnd();
        } catch (IOException ioe) {
            // you can't get an io exception writing to a stringbuffer.....
            throw new RuntimeException(ioe);
        }
        return sb.toString();
    }

    private HttpPost obtainPostMethod(String path, Map<String, String> params)
            throws MalformedURLException, URISyntaxException,
            UnsupportedEncodingException {

        HttpPost post = new HttpPost(testServletConfig.getBaseUrl().toURI()
                .resolve(path).toString());

        List<NameValuePair> nvps = Lists.newArrayList();
        if (params != null) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                nvps.add(new BasicNameValuePair(entry.getKey(), entry
                        .getValue()));
            }
            post.setEntity(new UrlEncodedFormEntity(nvps, CharEncoding.UTF_8));

        }
        return post;
    }

    private HttpPost getPostMethod(String qualifiedName,
                                   Map<String, Object> actionParams) throws Exception {
        Map<String, Object> message = Maps.newHashMap();
        ArrayList<Map<String, Object>> actionInstanceArray = new ArrayList<>();
        Map<String, Object> actionInstance = Maps.newHashMap();
        actionInstance.put("descriptor", qualifiedName);
        if (actionParams != null) {
            actionInstance.put("params", actionParams);
        }
        actionInstanceArray.add(actionInstance);
        DefDescriptor<ApplicationDef> app = definitionService.getDefDescriptor(
                "aura:application", ApplicationDef.class);
        message.put("actions", actionInstanceArray.toArray());
        String jsonMessage = JsonEncoder.serialize(message);
        Map<String, String> params = Maps.newHashMap();
        params.put("message", jsonMessage);
        params.put("aura.token", testServletConfig.getCsrfToken());

        params.put("aura.context",
                buildContextForPost(Mode.PROD, app, null, null));
        HttpPost post = obtainPostMethod("/aura", params);
        return post;
    }

    @SuppressWarnings("unchecked")
    private Object invokeAction(String qualifiedName,
                                Map<String, Object> actionParams) throws AuraExecutionException {
        try {
            HttpPost post = getPostMethod(qualifiedName, actionParams);
            HttpResponse response = testServletConfig.getHttpClient().execute(
                    post);
            assert HttpStatus.SC_OK == response.getStatusLine().getStatusCode();

            HttpEntity entity = response.getEntity();
            String rawResponse = entity == null ? null : EntityUtils
                    .toString(entity);
            assert AuraBaseServlet.CSRF_PROTECT.equals(rawResponse.substring(0,
                    AuraBaseServlet.CSRF_PROTECT.length()));

            if (rawResponse.endsWith("/*ERROR*/")) {
                throw new AuraExecutionException("Error response:"
                        + rawResponse, null);
            }
            Map<String, Object> json = (Map<String, Object>) new JsonReader()
                    .read(rawResponse.substring(AuraBaseServlet.CSRF_PROTECT
                            .length()));
            ArrayList<Map<String, Object>> actions = (ArrayList<Map<String, Object>>) json
                    .get("actions");
            assert 1 == actions.size();
            Map<String, Object> action = (Map<String, Object>) ((List<Object>) json
                    .get("actions")).get(0);
            List<Object> errors = (List<Object>) action.get("error");
            if (errors != null && errors.size() > 0) {
                throw new AuraExecutionException(errors.toString(), null);
            }
            assert "SUCCESS".equals(action.get("state"));
            return action.get("returnValue");

        } catch (Exception e) {
            throw new AuraExecutionException(e, null);
        }
    }

    private String getControllerDescriptor(String methodName) {
        return "java://"
                + StringSourceLoaderController.class.getCanonicalName()
                + "/ACTION$" + methodName;
    }

    @Override
    public final <D extends Definition, B extends Definition> DefDescriptor<D> createStringSourceDescriptor(
            @Nullable String namePrefix, Class<D> defClass,
            @Nullable DefDescriptor<B> bundle) {
        Map<String, Object> params = Maps.newHashMap();
        params.put("namePrefix", namePrefix);
        params.put("defClass", defClass.getCanonicalName());
        params.put("bundleName",
                bundle == null ? bundle : bundle.getQualifiedName());
        params.put("bundleDefClass", bundle == null ? bundle : bundle
                .getDefType().getPrimaryInterface().getCanonicalName());
        String name = invokeAction(getControllerDescriptor("createStringSourceDescriptor"), params).toString();
        return definitionService.getDefDescriptor(name, defClass, bundle);
    }

    @Override
    public final <D extends Definition> StringSource<D> addSource(
            Class<D> defClass, String contents, @Nullable String namePrefix,
            NamespaceAccess access) {
        return putSource(defClass, contents, namePrefix, false,
                access);
    }

    @Override
    public final <D extends Definition> StringSource<D> putSource(
            Class<D> defClass, String contents, @Nullable String namePrefix,
            boolean overwrite, NamespaceAccess access) {
        return putSource(defClass, contents, namePrefix, overwrite,
                access, null);
    }

    @Override
    public final <D extends Definition, B extends Definition> StringSource<D> putSource(
            Class<D> defClass, String contents, @Nullable String namePrefix,
            boolean overwrite, NamespaceAccess access, @Nullable DefDescriptor<B> bundle) {
        DefDescriptor<D> descriptor = createStringSourceDescriptor(namePrefix, defClass, bundle);
        return putSource(descriptor, contents, overwrite, access);
    }

    @Override
    public final <D extends Definition> StringSource<D> putSource(
            DefDescriptor<D> descriptor, String contents, boolean overwrite) {
        return putSource(descriptor, contents, overwrite, NamespaceAccess.INTERNAL);
    }

    @Override
    public final <D extends Definition> StringSource<D> putSource(
            DefDescriptor<D> descriptor, String contents, boolean overwrite,
            NamespaceAccess access) {
        return putRemoteSource(descriptor, contents, overwrite, access);
    }

    private final <D extends Definition> RemoteStringSource<D> putRemoteSource(
            DefDescriptor<D> descriptor, String contents, boolean overwrite, NamespaceAccess access) {
        Map<String, Object> params = Maps.newHashMap();
        params.put("name", descriptor.getQualifiedName());
        params.put("defClass", descriptor.getDefType().getPrimaryInterface().getCanonicalName());
        DefDescriptor<? extends Definition> bundle = descriptor.getBundle();
        params.put("bundleName",
                bundle == null ? bundle : bundle.getQualifiedName());
        params.put("bundleDefClass", bundle == null ? bundle : bundle
                .getDefType().getPrimaryInterface().getCanonicalName());
        params.put("contents", contents);
        params.put("overwrite", overwrite);
        params.put("access", access);

        Format format = DescriptorInfo.get(descriptor.getDefType().getPrimaryInterface()).getFormat();

        RemoteStringSource<D> source = new RemoteStringSource<>(descriptor, contents,
                descriptor.getQualifiedName(), format, access);
        localSources.put(descriptor, source);
        localAccess.putIfAbsent(descriptor.getNamespace(), access);

        invokeAction(getControllerDescriptor("putSource"), params);
        return source;
    }

    /**
     * Remove a definition from the source loader.
     *
     * @param descriptor the descriptor identifying the loaded definition to remove.
     */
    @Override
    public final void removeSource(DefDescriptor<?> descriptor) {
        Map<String, Object> params = Maps.newHashMap();
        params.put("name", descriptor.getQualifiedName());
        params.put("defClass", descriptor.getDefType().getPrimaryInterface().getCanonicalName());
        DefDescriptor<? extends Definition> bundle = descriptor.getBundle();
        params.put("bundleName",
                bundle == null ? bundle : bundle.getQualifiedName());
        params.put("bundleDefClass", bundle == null ? bundle : bundle
                .getDefType().getPrimaryInterface().getCanonicalName());
        invokeAction(getControllerDescriptor("removeSource"), params);
        localSources.remove(descriptor);
    }

    /**
     * Remove a definition from the source loader.
     *
     * @param source the loaded definition to remove.
     */
    @Override
    public final void removeSource(StringSource<?> source) {
        removeSource(source.getDescriptor());
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        return null;
    }

    @Override
    public <D extends Definition> Set<DefDescriptor<D>> find(
            Class<D> primaryInterface, String prefix, String namespace) {
        return null;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Set<DefType> getDefTypes() {
        return (Set<DefType>) invokeAction(getControllerDescriptor("getDefTypes"), null);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Set<String> getNamespaces() {
        return (Set<String>) invokeAction(getControllerDescriptor("getNamespaces"), null);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Set<String> getPrefixes() {
        return (Set<String>) invokeAction(getControllerDescriptor("getPrefixes"), null);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        return (Source<D>) localSources.get(descriptor);
    }

    @Override
    public boolean isInternalNamespace(String namespace) {
        if (namespace == null) {
            return false;
        }
        NamespaceAccess access = localAccess.get(namespace);
        return access == NamespaceAccess.INTERNAL;
    }

    @Override
    public boolean isPrivilegedNamespace(String namespace) {
        if (namespace == null) {
            return false;
        }
        NamespaceAccess access = localAccess.get(namespace);
        return access == NamespaceAccess.PRIVILEGED;
    }

    private class RemoteStringSource<D extends Definition> extends StringSource<D> {
        private static final long serialVersionUID = 2891764196250418955L;
        NamespaceAccess access;

        private RemoteStringSource(DefDescriptor<D> descriptor, String contents,
                                   String id, Format format, NamespaceAccess access) {
            super(descriptor, contents, id, format);
            this.access = access;
        }

        @Override
        public boolean addOrUpdate(CharSequence newContents) {
            StringSourceExternalLoader.this.putRemoteSource(getDescriptor(), newContents.toString(), true, access);
            return super.addOrUpdate(newContents);
        }
    }
}
