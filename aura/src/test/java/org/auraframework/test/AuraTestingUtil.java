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

import java.util.Collection;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import javax.annotation.Nullable;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Source;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.throwable.AuraRuntimeException;

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
        StringSourceLoader loader = StringSourceLoader.getInstance();
        DefDescriptor<T> descriptor = loader.addSource(defClass, contents, namePrefix).getDescriptor();
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
        StringSourceLoader loader = StringSourceLoader.getInstance();
        loader.putSource(descriptor, contents, false);
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
            public void onSourceChanged(DefDescriptor<?> source, SourceMonitorEvent event) {
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
            definitionService.onSourceChanged(desc, SourceMonitorEvent.changed);
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
}
