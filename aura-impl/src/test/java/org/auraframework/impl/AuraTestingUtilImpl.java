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
package org.auraframework.impl;

import java.io.File;
import java.util.Collection;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Source;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;
import org.auraframework.test.AuraTestingUtil;

import com.google.common.collect.Sets;

public class AuraTestingUtilImpl implements AuraTestingUtil {
    private final Set<DefDescriptor<?>> cleanUpDds = Sets.newHashSet();
    private static AtomicLong nonce = new AtomicLong(System.currentTimeMillis());

    public AuraTestingUtilImpl() {
    }

    @Override
    public void setUp() {
        // Do nothing
    }

    @Override
    public void tearDown() {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        for (DefDescriptor<?> dd : cleanUpDds) {
            loader.removeSource(dd);
        }
        cleanUpDds.clear();
    }

    @Override
    public File getAuraJavascriptSourceDirectory() {
        return AuraImplFiles.AuraJavascriptSourceDirectory.asFile();
    }

    @Override
    public String getNonce() {
        return Long.toString(nonce.incrementAndGet());
    }

    @Override
    public String getNonce(String prefix) {
        return (prefix == null ? "" : prefix) + getNonce();
    }

    @Override
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

    @Override
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents) {
        return addSourceAutoCleanup(defClass, contents, null);
    }

    @Override
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(Class<T> defClass, String contents,
            String namePrefix) {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        DefDescriptor<T> descriptor = loader.addSource(defClass, contents, namePrefix).getDescriptor();
        cleanUpDds.add(descriptor);
        return descriptor;
    }

    @Override
    public <T extends Definition> DefDescriptor<T> addSourceAutoCleanup(DefDescriptor<T> descriptor, String contents) {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        loader.putSource(descriptor, contents, false);
        cleanUpDds.add(descriptor);
        return descriptor;
    }

    @Override
    public <T extends Definition> void clearCachedDefs(Collection<T> defs) throws Exception {
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
        latch.await(30, TimeUnit.SECONDS);
    }
}
