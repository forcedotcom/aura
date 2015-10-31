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
package org.auraframework.test.util;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

import javax.annotation.Nullable;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class AuraTestingUtil {
    public static final long CACHE_CLEARING_TIMEOUT_SECS = 60;
    private static AtomicLong nonce = new AtomicLong(System.currentTimeMillis());

    private Set<DefDescriptor<?>> cleanUpDds;

    public void tearDown() {
        if (cleanUpDds != null) {
            StringSourceLoader loader = StringSourceLoader.getInstance();
            for (DefDescriptor<?> dd : cleanUpDds) {
                loader.removeSource(dd);
            }
            cleanUpDds.clear();
        }
    }

    /**
     * Get a unique value for use in tests
     */
    public String getNonce() {
        return Long.toString(nonce.incrementAndGet());
    }

    /**
     * Get a unique value and append it to a provided string
     */
    public String getNonce(String prefix) {
        return (prefix == null ? "" : prefix) + getNonce();
    }

    /**
     * Retrieves the source of a component resource. Note: Works only for markup://string:XXXXX components and not for
     * any other namespace. By default, test util is aware of StringSourceLoader only.
     *
     * @param descriptor Descriptor of the resource you want to see the source of
     * @return
     */
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        // Look up in the registry if a context is available. Otherwise, we're
        // probably running a context-less unit test
        // and better be using StringSourceLoader
        AuraContext context = Aura.getContextService().getCurrentContext();
        if (context != null) {
            return context.getDefRegistry().getSource(descriptor);
        } else {
            return StringSourceLoader.getInstance().getSource(descriptor);
        }
    }

    /**
     * update source for a resource
     * @param desc definition descriptor of the resource
     * @param content new content for the descriptor
     */
    public void updateSource(DefDescriptor<?> desc, String content) {
        Source<?> src = getSource(desc);
        src.addOrUpdate(content);
    }

    /**
     * Generate a {@link DefDescriptor} with a unique name. If namePrefix does not contain a namespace, the descriptor
     * will be created in the 'string' namespace. If namePrefix does not contain the name portion (i.e. it is null,
     * empty, or just a namespace with the trailing delimiter), 'thing' will be used as the base name.
     *
     * @param namePrefix if non-null, then generate some name with the given prefix for the descriptor.
     * @param defClass the interface of the type definition
     * @param bundle the bundle for this descriptor
     * @return a {@link DefDescriptor} with name that is guaranteed to be unique in the string: namespace.
     */
    public final <D extends Definition, B extends Definition> DefDescriptor<D> createStringSourceDescriptor(
            @Nullable String namePrefix, Class<D> defClass, DefDescriptor<B> bundle) {
        return StringSourceLoader.getInstance().createStringSourceDescriptor(namePrefix, defClass, bundle);
    }

    /**
     * Convenience method to create a description and load a source in one shot.
     *
     * @param defClass interface of the definition represented by this source
     * @param contents source contents
     * @return the {@link DefDescriptor} for the created definition
     */
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents) {
        return addSourceAutoCleanup(defClass, contents, null);
    }

    /**
     * Convenience method to create a description and load a source in one shot.
     *
     * @param defClass interface of the definition represented by this source
     * @param contents source contents
     * @param namePrefix package name prefix
     * @return the {@link DefDescriptor} for the created definition
     */
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents,
            String namePrefix) {
        return addSourceAutoCleanup(defClass, contents, namePrefix, true);
    }

    /**
     * Convenience method to create a description and load a source in one shot.
     *
     * @param defClass interface of the definition represented by this source
     * @param contents source contents
     * @param namePrefix package name prefix
     * @param isPrivilegedNamespace if true, namespace is privileged
     * @return the {@link DefDescriptor} for the created definition
     */
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents,
            String namePrefix, boolean isPrivilegedNamespace) {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        DefDescriptor<T> descriptor = loader.addSource(defClass, contents, namePrefix, isPrivilegedNamespace).getDescriptor();
        markForCleanup(descriptor);
        return descriptor;
    }

    /**
     * Convenience method to create a description and load a source in one shot.
     *
     * @param descriptor descriptor for the source to be created
     * @param contents source contents
     * @return the {@link DefDescriptor} for the created definition
     */
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents) {
        return addSourceAutoCleanup(descriptor, contents, true);
    }

    /**
     * Convenience method to create a description and load a source in one shot.
     *
     * @param descriptor descriptor for the source to be created
     * @param contents source contents
     * @return the {@link DefDescriptor} for the created definition
     */
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents, boolean isPrivilegedNamespace) {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        loader.putSource(descriptor, contents, false, isPrivilegedNamespace);
        markForCleanup(descriptor);
        return descriptor;
    }

    /**
     * Remove a definition from the source loader.
     *
     * @param descriptor the descriptor identifying the loaded definition to remove.
     */
    public <T extends Definition> void removeSource(DefDescriptor<T> descriptor) {
        StringSourceLoader.getInstance().removeSource(descriptor);
        if (cleanUpDds != null) {
            cleanUpDds.remove(descriptor);
        }
    }

    private void markForCleanup(DefDescriptor<?> desc) {
        if (cleanUpDds == null) {
            cleanUpDds = Sets.newHashSet();
        }
        cleanUpDds.add(desc);
    }

    /**
     * Start a context and set up default values.
     */
    protected AuraContext setupContext(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc)
            throws QuickFixException {
        AuraContext ctxt = Aura.getContextService().startContext(mode, format, Authentication.AUTHENTICATED, desc);
        ctxt.setFrameworkUID(Aura.getConfigAdapter().getAuraFrameworkNonce());
        String uid = ctxt.getDefRegistry().getUid(null, desc);
        ctxt.addLoaded(desc, uid);
        return ctxt;
    }

    /**
     * restart context.
     */
    public void restartContext() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<? extends BaseComponentDef> cmp = context.getApplicationDescriptor();
        String uid = context.getUid(cmp);
        Aura.getContextService().endContext();
        AuraContext newctxt = setupContext(context.getMode(), context.getFormat(), cmp);
        newctxt.addLoaded(cmp, uid);
    }

    /**
     * Get a context for use with a get/post.
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the descriptor name to set as the primary object.
     * @param type the type of descriptor.
     * @param modified break the context uid.
     */
    public String getContextURL(Mode mode, Format format, String desc, Class<? extends BaseComponentDef> type,
            boolean modified) throws QuickFixException {
        return getContextURL(mode, format, Aura.getDefinitionService().getDefDescriptor(desc, type), modified);
    }

    @Deprecated
    public String getContext(Mode mode, Format format, String desc, Class<? extends BaseComponentDef> type,
            boolean modified) throws QuickFixException {
        return getContextURL(mode, format, desc, type, modified);
    }

    /**
     * Get a context as a string.
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the descriptor to set as the primary object.
     * @param modified break the context uid.
     */
    public String getContextURL(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc,
            boolean modified) throws QuickFixException {
        AuraContext ctxt = setupContext(mode, format, desc);
        String ctxtString;
        if (modified) {
            String uid = modifyUID(ctxt.getLoaded().get(desc));
            ctxt.addLoaded(desc, uid);
        }
        ctxtString = ctxt.getEncodedURL(AuraContext.EncodingStyle.Normal);
        Aura.getContextService().endContext();
        return ctxtString;
    }

    public String buildContextForPost(Mode mode, DefDescriptor<? extends BaseComponentDef> app)
            throws QuickFixException {
        return buildContextForPost(mode, app, null, null, null, null);
    }

    public String buildContextForPost(Mode mode, DefDescriptor<? extends BaseComponentDef> app,
            Map<DefDescriptor<?>,String> extraLoaded, List<String> dn) throws QuickFixException {
        return buildContextForPost(mode, app, null, null, extraLoaded, dn);
    }

    /**
     * Serialize a context for a post.
     *
     * This must remain in sync with AuraContext.js
     *
     * <code>
     * return aura.util.json.encode({
     *     "mode" : this.mode,
     *     "loaded" : this.loaded,
     *     "dn" : $A.services.component.getDynamicNamespaces(),
     *     "app" : this.app,
     *     "cmp" : this.cmp,
     *     "fwuid" : this.fwuid,
     *     "test" : this.test
     * });
     * </code>
     */
    public String buildContextForPost(Mode mode, DefDescriptor<? extends BaseComponentDef> app, String appUid,
            String fwuid, Map<DefDescriptor<?>,String> extraLoaded, List<String> dn) throws QuickFixException {
        StringBuffer sb = new StringBuffer();
        JsonEncoder json = new JsonEncoder(sb, false, false);
        Map<String,String> loaded = Maps.newHashMap();

        if (appUid == null) {
            AuraContext ctx = null;
            if (!Aura.getContextService().isEstablished()) {
                ctx = Aura.getContextService().startContext(mode, Format.JSON, Authentication.AUTHENTICATED, app);
            }
            appUid = Aura.getDefinitionService().getDefRegistry().getUid(null, app);
            if (ctx != null) {
                Aura.getContextService().endContext();
            }
        }
        if (fwuid == null) {
            fwuid = Aura.getConfigAdapter().getAuraFrameworkNonce();
        }
        if (dn == null) {
            dn = Lists.newArrayList();
        }
        if (extraLoaded != null) {
            for (Map.Entry<DefDescriptor<?>,String> entry : extraLoaded.entrySet()) {
                loaded.put(String.format("%s@%s", entry.getKey().getDefType().toString(),
                        entry.getKey().getQualifiedName()), entry.getValue());
            }
        }
        loaded.put(String.format("%s@%s", app.getDefType().toString(), app.getQualifiedName()), appUid);

        try {
            json.writeMapBegin();
            json.writeMapEntry("mode", mode.toString());
            json.writeMapEntry("loaded", loaded);
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

    /**
     * Make a UID be incorrect.
     */
    public String modifyUID(String old) {
        StringBuilder sb = new StringBuilder(old);
        char flip = sb.charAt(3);

        // change the character.
        if (flip == 'a') {
            flip = 'b';
        } else {
            flip = 'a';
        }
        sb.setCharAt(3, flip);
        return sb.toString();
    }

    /**
     * Starts spring application context with provided annotated configuration class
     *
     * @param configurationClass annotated spring configuration class
     */
    public void startSpringContext(Class<?> configurationClass) {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
        applicationContext.register(configurationClass);
        applicationContext.refresh();
    }

}
