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
package org.auraframework.test;

import java.io.IOException;
import java.util.Collection;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import javax.annotation.Nullable;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Source;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

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
     * @return a {@link DefDescriptor} with name that is guaranteed to be unique in the string: namespace.
     */
    public final <D extends Definition> DefDescriptor<D> createStringSourceDescriptor(@Nullable String namePrefix,
            Class<D> defClass) {
        return StringSourceLoader.getInstance().createStringSourceDescriptor(namePrefix, defClass);
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

    /**
     * Clear cached defs from the system. When mocking a def, if the def has already been cached, as itself, or as part
     * of a preloaded set, the mock will not be effective, so it's safer to clear any cached defs after setting up mocks
     * but before executing a test. This relies on source change notifications to get the servlets to clear their
     * caches.
     * 
     * @param defs the Definitions to be cleared from any caches
     * @throws InterruptedException
     */
    public static <T extends Definition> void clearCachedDefs(Collection<T> defs) throws Exception {
        if (defs == null || defs.isEmpty()) {
            return;
        }

        // Get the Descriptors for the provided Definitions
        final DefinitionService definitionService = Aura.getDefinitionService();
        final Set<DefDescriptor<?>> cached = Sets.newHashSet();
        for (T def : defs) {
            if (def != null) {
                cached.add(def.getDescriptor());
            }
        }

        // Wait for the change notifications to get processed. We expect listeners to get processed in the order in
        // which they subscribe.
        final CountDownLatch latch = new CountDownLatch(cached.size());
        SourceListener listener = new SourceListener() {
            private Set<DefDescriptor<?>> descriptors = Sets.newHashSet(cached);

            @Override
            public void onSourceChanged(DefDescriptor<?> source, SourceMonitorEvent event, String filePath) {
                if (descriptors.remove(source)) {
                    latch.countDown();
                }
                if (descriptors.isEmpty()) {
                    definitionService.unsubscribeToChangeNotification(this);
                }
            }
        };
        definitionService.subscribeToChangeNotification(listener);
        for (DefDescriptor<?> desc : cached) {
            definitionService.onSourceChanged(desc, SourceMonitorEvent.CHANGED, null);
        }
        if (!latch.await(CACHE_CLEARING_TIMEOUT_SECS, TimeUnit.SECONDS)) {
            throw new AuraRuntimeException(String.format(
                    "Timed out after %s seconds waiting for cached Aura definitions to clear: %s",
                    CACHE_CLEARING_TIMEOUT_SECS, defs));
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
    public String getContext(Mode mode, Format format, String desc, Class<? extends BaseComponentDef> type,
            boolean modified) throws QuickFixException {
        return getContext(mode, format, Aura.getDefinitionService().getDefDescriptor(desc, type), modified);
    }

    /**
     * Get a context as a string.
     *
     * @param mode the Aura mode to use.
     * @param format the format (HTML vs JSON) to use
     * @param desc the descriptor to set as the primary object.
     * @param modified break the context uid.
     */
    public String getContext(Mode mode, Format format, DefDescriptor<? extends BaseComponentDef> desc,
            boolean modified) throws QuickFixException {
        AuraContext ctxt = setupContext(mode, format, desc);
        String ctxtString;
        if (modified) {
            String uid = modifyUID(ctxt.getLoaded().get(desc));
            ctxt.addLoaded(desc, uid);
        }
        ctxtString = getSerializedAuraContext(ctxt);
        Aura.getContextService().endContext();
        return ctxtString;
    }

    /**
     * Get a serialized context with a possibly modified UID.
     *
     * FIXME: this should be cleaned out.
     */
    public String getSerializedAuraContextWithModifiedUID(AuraContext ctx, boolean modify) throws QuickFixException {
        String uid = ctx.getDefRegistry().getUid(null, ctx.getApplicationDescriptor());
        if (modify) {
            uid = modifyUID(uid);
        }
        ctx.addLoaded(ctx.getApplicationDescriptor(), uid);
        return getSerializedAuraContext(ctx);
    }

    /**
     * Serialize a context.
     *
     * This simply runs the serialization and handles exceptions.
     *
     * @param ctx the context to serialize.
     * @return the serialized context as a string
     * @throws QuickFixException if the serialization service does (unlikely).
     */
    public String getSerializedAuraContext(AuraContext ctx) throws QuickFixException {
        StringBuilder sb = new StringBuilder();
        try {
            Aura.getSerializationService().write(ctx, null, AuraContext.class, sb, "HTML");
        } catch (IOException e) {
            // This should never happen, stringbuilders don't throw IOException.
            throw new AuraRuntimeException(e);
        }
        return sb.toString();
    }

    /**
     * Make a UID be incorrect.
     */
    protected String modifyUID(String old) {
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

}
