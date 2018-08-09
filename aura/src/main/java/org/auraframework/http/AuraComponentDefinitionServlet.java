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
package org.auraframework.http;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Stream;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.output.StringBuilderWriter;
import org.apache.commons.lang3.LocaleUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ServerService;
import org.auraframework.service.ServerService.HYDRATION_TYPE;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonEncoder;

public class AuraComponentDefinitionServlet extends AuraBaseServlet {

    public final static String URI_DEFINITIONS_PATH = "/auraCmpDef";

    private final static StringParam appDescriptorParam = new StringParam("aura.app", 0, false);
    private final static StringParam formFactorParam = new StringParam("_ff", 0, false);
    private final static StringParam lockerParam = new StringParam("_l", 0, false);
    private final static StringParam localeParam = new StringParam("_l10n", 0, false);
    private final static StringParam styleParam = new StringParam("_style", 0, false);
    private final static StringParam defDescriptorParam = new StringParam("_def", 0, false);
    private final static StringParam componentUIDParam = new StringParam("_uid", 0, false);

    private final static List<Class> DESCRIPTOR_DEF_TYPES = Arrays.asList(ModuleDef.class, ComponentDef.class, EventDef.class, LibraryDef.class);

    private DefinitionService definitionService;
    private LoggingService loggingService;
    private ServerService serverService;
    private ContextService contextService;
    protected ConfigAdapter configAdapter;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String requestedUID = componentUIDParam.get(request);
        String appReferrrer = appDescriptorParam.get(request);
        String locale = localeParam.get(request);
        String formFactor = formFactorParam.get(request);

        List<String> requestedDescriptors = extractDescriptors(request);

        response.setContentType("text/javascript");
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);

        StringBuilderWriter responseStringWriter = new StringBuilderWriter();

        AuraContext context = contextService.getCurrentContext();

        try {
            if (requestedDescriptors.size() == 0) {
                throw new InvalidDefinitionException("Descriptor required", null);
            }

            // if locale provided, set the it on the context as a requested locale
            Locale l = null;
            if (StringUtils.isNotEmpty(locale)) {
                l = LocaleUtils.toLocale(locale);
            }
            updateContext(l, formFactor, appReferrrer);

            Map<DefDescriptor<?>, String> descriptors = mapDescriptorsToDefDesriptorAndUid(requestedDescriptors);

            StringBuilder allUIDs = new StringBuilder();

            for (Entry defDesc : descriptors.entrySet()) {
                allUIDs.append(defDesc.getValue());
            }
            String computedUID = allUIDs.toString();

            int requestedHashCode = 0;
            if (descriptors.size() > 1) {
                try {
                    requestedHashCode = Integer.parseInt(requestedUID);
                } catch (NumberFormatException nfe) {
                    loggingService.warn("Requested uid should have been a hash of the UIDs", nfe);
                }
            }

            if ((descriptors.size() == 1 && !computedUID.equals(requestedUID)) ||
                (descriptors.size() > 1  && computedUID.hashCode() != requestedHashCode)) {
                if ("null".equals(requestedUID)) {
                    throw new InvalidDefinitionException("requestedComponentUID can't be 'null'", null);
                }

                StringBuilder redirectUrl = getHost(request);
                redirectUrl.append(generateRedirectURI(descriptors, computedUID, appReferrrer, formFactor, locale, styleParam.get(request)));

                servletUtilAdapter.setNoCache(response);
                response.sendRedirect(redirectUrl.toString());
                return;
            }

            HYDRATION_TYPE hydrationType;
            if (configAdapter.getDefaultMode() == Mode.PROD) {
                hydrationType = HYDRATION_TYPE.one;
            } else {
                // in non prod modes, we want to use hydration in order to make it easier for developers to debug
                hydrationType = HYDRATION_TYPE.all;
            }

            serverService.writeDefinitions(descriptors.keySet(), responseStringWriter, false, 0, hydrationType, false);

            try {
                definitionService.populateGlobalValues(AuraValueProviderType.LABEL.getPrefix(),
                        mapDescriptorToDefinition(descriptors.keySet()));
            } catch (QuickFixException qfe) {
                // this should not throw a QFE
                loggingService.warn("attempting to populate labels for requested definitions: " + StringUtils.join(requestedDescriptors, ","), qfe);
            }

           definitionService.updateLoaded(descriptors.keySet());

            Set<DefDescriptor<?>> dependencies = new HashSet<>();
            descriptors.entrySet().stream().forEach((entry)->{
                dependencies.addAll(definitionService.getDependencies(entry.getValue()));
            });
            dependencies.removeAll(descriptors.keySet());

            DefDescriptor<ApplicationDef> appDescriptor = definitionService.getDefDescriptor(appReferrrer, ApplicationDef.class);
            String appUID;
            try {
                appUID = definitionService.getUid(null, appDescriptor);
            } catch (DefinitionNotFoundException dnfe) {
                // mainly tests directly access components as top level without an app.
                // if neither exist, let the error bubble up
                appUID = definitionService.getUid(null, definitionService.getDefDescriptor(appReferrrer, ComponentDef.class));
            }
            dependencies.removeAll(definitionService.getDependencies(appUID));

            serverService.writeDefinitions(dependencies, responseStringWriter, false, 0, HYDRATION_TYPE.all, false);

            if (!dependencies.isEmpty()) {
                try {
                    String providerPrefix = AuraValueProviderType.LABEL.getPrefix();
                    definitionService.populateGlobalValues(providerPrefix, mapDescriptorToDefinition(dependencies));
                } catch (QuickFixException qfe) {
                    // this should not throw a QFE
                    loggingService.warn("attempting to populate labels for requested definitions: " + StringUtils.join(requestedDescriptors, ","), qfe);
                }

                for (DefDescriptor<?> descriptor : dependencies) {
                    definitionService.updateLoaded(descriptor);
                }
            }

            // write Value Providers Labels and Global
            String gvps = serializeGVPs(context);
            if (StringUtils.isNotEmpty(gvps)) {
                responseStringWriter.write("$A.getContext().mergeGVPs(");
                responseStringWriter.write(gvps);
                responseStringWriter.write(");");
            }

            if(containsRestrictedDefs(context, descriptors)) {
                servletUtilAdapter.setLongCachePrivate(response);
            } else {
                servletUtilAdapter.setLongCache(response);
            }

        } catch (Exception e) {
            PrintWriter out = response.getWriter();

            String loaderErrorString = request.getQueryString().split("&" + componentUIDParam.name)[0];
            loaderErrorString = loaderErrorString.substring(loaderErrorString.lastIndexOf("&_") + 2);
            int nextAnd = loaderErrorString.indexOf("&");
            if (nextAnd < 0) {
                if (loaderErrorString.startsWith("def=")) {
                    nextAnd = 4;
                } else {
                    nextAnd = 0;
                }
            }
            loaderErrorString = loaderErrorString.substring(nextAnd);
            loaderErrorString = loaderErrorString.replaceAll("[^&=_,:/a-zA-Z0-9-]+","");

            out.append(String.format("if(!Aura.componentDefLoaderError['%s']){Aura.componentDefLoaderError['%s'] = []} Aura.componentDefLoaderError['%s'].push(/*", loaderErrorString, loaderErrorString, loaderErrorString));
            servletUtilAdapter.handleServletException(e, false, context, request, response, true);
            out.append(");\n");
            servletUtilAdapter.setNoCache(response);
            response.setStatus(HttpStatus.SC_OK);
        } finally {
            response.getWriter().print(responseStringWriter.toString());
            responseStringWriter.close();
        }
    }

    protected void updateContext(Locale locale, String formFactor, String applicationName) {
        if (locale != null) {
            contextService.getCurrentContext().setRequestedLocales(Arrays.asList(locale));
        }
    }

    protected StringBuilder getHost(HttpServletRequest request) {
        StringBuilder sb = new StringBuilder("http");
        if (configAdapter.isSecureRequest(request)) {
            sb.append("s");
        }
        sb.append("://");
        sb.append(request.getHeader("Host"));
        return sb;
    }

    private Boolean containsRestrictedDefs(AuraContext context, Map<DefDescriptor<?>, String> requestedDescriptors) {

        Set<String> restrictedNamespaces = context.getRestrictedNamespaces();
        Stream<String> nameSpaces = requestedDescriptors.entrySet().stream().map(e -> e.getKey().getNamespace());
        boolean hasRestrictedName = nameSpaces.anyMatch(restrictedNamespaces::contains);

        return hasRestrictedName;
    }

    @SuppressWarnings("unchecked")
    private Map<DefDescriptor<?>, Definition> mapDescriptorToDefinition(Set<DefDescriptor<?>> descriptors) {
        Map<DefDescriptor<?>, Definition> map = new HashMap<>();
        for (DefDescriptor defDescriptor : descriptors) {
            try {
                map.put(defDescriptor, definitionService.getDefinition(defDescriptor));
            } catch (QuickFixException e) {
                // ignore
                loggingService.warn("attempting to look up definition failed for: " + defDescriptor.getQualifiedName(), e);
            }
        }
        return map;
    }

    private List<String> extractDescriptors(HttpServletRequest request) {
        String requestedComponentDescriptor = defDescriptorParam.get(request);

        if (StringUtils.isNotEmpty(requestedComponentDescriptor)) {
            return Arrays.asList(requestedComponentDescriptor);
        }

        List<String> requestedDescriptors = new ArrayList<>();
        for (Entry<String, String[]> param : request.getParameterMap().entrySet()) {
            if (param.getKey().startsWith("_") || appDescriptorParam.name.equals(param.getKey())) {
                continue;
            }
            for (String value : param.getValue()) {
                for (String name : value.split(",")) {
                    requestedDescriptors.add(String.format("markup://%s:%s", param.getKey(), name));
                }
            }
        }
        return requestedDescriptors;
    }

    @SuppressWarnings("unchecked")
    private Map<DefDescriptor<?>, String> mapDescriptorsToDefDesriptorAndUid(List<String> requestedDescriptors) throws Exception {
        Map<DefDescriptor<?>, String> descriptors = new TreeMap<>(
                Comparator.comparing((DefDescriptor defDescriptor)->{return defDescriptor.getNamespace();})
                        .thenComparing((DefDescriptor defDescriptor)->{return defDescriptor.getName();}));


        for (String requestedDefDescriptor: requestedDescriptors) {
            Exception trackedException = null;
            for (Class defType : DESCRIPTOR_DEF_TYPES) {
                try {
                    DefDescriptor defDescriptor = definitionService.getDefDescriptor(requestedDefDescriptor, defType);
                    String uid = definitionService.getUid(null, defDescriptor);
                    descriptors.put(defDescriptor, uid);
                    trackedException = null;
                    break;
                } catch (Exception e) {
                    if (defType == ComponentDef.class) {
                        trackedException = e;
                    } else if (trackedException == null) {
                        trackedException = e;
                    }
                }
            }
            if (trackedException != null) {
                throw trackedException;
            }
        }

        return descriptors;
    }

    private String generateRedirectURI(Map<DefDescriptor<?>, String> descriptors, String computedUID, String appReferrrer,
                                       String formFactor, String locale, String styleContext) {
        StringBuilder redirectURI = new StringBuilder(URI_DEFINITIONS_PATH);

        // note, keep parameters in alpha order and keep in sync with componentDefLoader.js to increase chances of cache hits
        // with the exception of '_def', all definitions requested will be towards the end, followed by UID last, since it's calculated based on defs.
        redirectURI.append("?");
        // app param
        redirectURI.append(appDescriptorParam.name).append("=").append(appReferrrer);

        redirectURI.append("&").append(formFactorParam.name).append("=").append(formFactor);

        redirectURI.append("&").append(lockerParam.name).append("=").append(configAdapter.isLockerServiceEnabled());

        if (locale != null) {
            redirectURI.append("&").append(localeParam.name).append("=").append(locale);
        }

        if (styleContext != null) {
            redirectURI.append("&").append(styleParam.name).append("=").append(styleContext);
        }

        redirectURI.append(generateDefinitionsURIParameters(descriptors));

        if (descriptors.size() > 1) {
            computedUID = String.format("%d", computedUID.hashCode());
        }

        redirectURI.append("&").append(componentUIDParam.name).append("=").append(computedUID);

        return redirectURI.toString();
    }

    private String generateDefinitionsURIParameters(Map<DefDescriptor<?>, String> descriptors) {
        StringBuilder parameters = new StringBuilder();
        if (descriptors.size() == 1) {
            parameters.append("&").append(defDescriptorParam.name).append("=").append(descriptors.entrySet().iterator().next().getKey().getQualifiedName());
        } else {
            String previousNamespace = null;
            boolean firstName = true;
            for (DefDescriptor descriptor : descriptors.keySet()) {
                if (!descriptor.getNamespace().equals(previousNamespace)) {
                    previousNamespace = descriptor.getNamespace();
                    parameters.append("&").append(previousNamespace).append("=");
                    firstName = true;
                }
                if (firstName) {
                    firstName = false;
                } else {
                    parameters.append(",");
                }
                parameters.append(descriptor.getName());
            }
        }
        return parameters.toString();
    }

    private String serializeGVPs(AuraContext ctx) throws IOException {
        StringBuilder sb = new StringBuilder();
        Json json = new JsonEncoder(sb, ctx.isDevMode());
        Map<String, GlobalValueProvider> globalProvidersMap = ctx.getGlobalProviders();
        GlobalValueProvider labelValueProvider = globalProvidersMap.get(AuraValueProviderType.LABEL.getPrefix());

        boolean firstEntry = true;

        if (labelValueProvider != null && !labelValueProvider.isEmpty()) {
            json.writeArrayBegin();
            // seems odd, but we're not using json.writeArrayEntry, which assumes you write a comma every entry and it's tracking if it's first or not
            json.writeComma();
            json.writeMapBegin();
            json.writeMapEntry("type", labelValueProvider.getValueProviderKey().getPrefix());
            json.writeMapEntry("values", labelValueProvider.getData());
            json.writeMapEnd();
            firstEntry = false;
        }

        // only if srcdoc was updated should we update the GVP
        // once it's set it should remain that way and URI def requests don't get the context to know if it was already set
        Boolean srcdocEnabled = ctx.validateGlobal("srcdoc") && (Boolean)ctx.getGlobal("srcdoc");
        if (srcdocEnabled != null && srcdocEnabled.booleanValue()) {
                if (!firstEntry) {
                    json.writeComma();
                } else {
                    json.writeArrayBegin();
                }
                json.writeMapBegin();
                json.writeMapEntry("type", AuraValueProviderType.GLOBAL.getPrefix());
                json.writeMapKey("values");
                json.writeMapBegin();
                json.writeMapEntry("srcdoc", globalProvidersMap.get(AuraValueProviderType.GLOBAL.getPrefix()).getData().get("srcdoc"));
                json.writeMapEnd();
                json.writeMapEnd();
                firstEntry = false;
        }

        if (!firstEntry) {
            json.writeArrayEnd();
        }
        return sb.toString();
    }

    @Inject
    public void setDefinitionService(DefinitionService definitionService) {
        this.definitionService = definitionService;
    }

    @Inject
    public void setServerService(ServerService serverService) {
        this.serverService = serverService;
    }

    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    @Inject
    public void setConfigAdapter(ConfigAdapter configAdapter) {
        this.configAdapter = configAdapter;
    }
}
