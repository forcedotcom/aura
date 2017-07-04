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
package org.auraframework.impl.source;

import java.util.List;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.InternalNamespaceSourceLoader;
import org.auraframework.system.SourceLoader;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class SourceFactoryTest extends AuraImplTestCase {
    @Inject
    SourceLoader loader;

    @Inject
    ConfigAdapter configAdapter;

    @Test
    public void testSourceFactory() {
        try {
            List<SourceLoader> loaders = Lists.newArrayList(loader, loader);
            new SourceFactory(loaders, configAdapter);
            fail("Should have failed with AuraException('Namespace claimed by 2 SourceLoaders')");
        } catch (AuraRuntimeException e) {
        }
    }
    
    /**
     * Verify that SourceFactory registers internal namespaces based on loader information.
     * SourceLoaders that implement InternalNamespaceSourceLoaders are considered for determining if a namespace is internal.
     * Namespaces served by SourceLoaders that do not implement InternalNamespaceSourceLoaders are not internal.
     */
	@Test
    public void testInternalNamespaceSourceLoadersAreRegisteredWithConfigAdapter(){
        SourceLoader friendlyLoader = new FriendlySourceLoader();
        SourceLoader selectiveLoader = new SelectiveSourceLoader();
        SourceLoader externalLoader = new ExternalSourceLoader();
        List<SourceLoader> loaders = Lists.newArrayList(friendlyLoader, selectiveLoader, externalLoader);
        SourceFactory sf = new SourceFactory(loaders, configAdapter);
        assertEquals(Sets.newHashSet("VIP", "Guest", "Friend1", "Friend2", "Custom_1","Custom_2"), sf.getNamespaces());

        ConfigAdapter c = getMockConfigAdapter();
        //Assert namespaces of InternalNamespaceSourceLoaders are internal based on isInternalNamespace()
        assertTrue(c.isInternalNamespace("Friend1"));
        assertTrue(c.isInternalNamespace("Friend2"));

        assertTrue(c.isInternalNamespace("VIP"));
        assertFalse(c.isInternalNamespace("Guest"));

        //Assert namespaces of non-InternalNamespaceSourceLoaders are not internal
        assertFalse(c.isInternalNamespace("Custom_1"));
        assertFalse(c.isInternalNamespace("Custom_2"));
    }
    
    //SelectiveSourceLoader considered chosen namespace as internal
    private class SelectiveSourceLoader extends BaseSourceLoader implements InternalNamespaceSourceLoader {
        @Override
        public boolean isInternalNamespace(String namespace) {
            return namespace.equals("VIP")? true : false; 
        }
        @Override
        public Set<String> getNamespaces() {
            return Sets.newHashSet("VIP", "Guest");
        }
        @Override
        public <D extends Definition> TextSource<D> getSource(DefDescriptor<D> descriptor) {return null;}
        @Override
        public Set<DefDescriptor<?>> find(DescriptorFilter dm) {return null;}
        @Override public void reset() {}
    }
    
    //FriendlySourceLoader considered everything as internal namespace
    private class FriendlySourceLoader extends BaseSourceLoader implements InternalNamespaceSourceLoader {
        @Override
        public boolean isInternalNamespace(String namespace) {
            return true;
        }
        @Override
        public Set<String> getNamespaces() {
            return Sets.newHashSet("Friend1", "Friend2");
        }
        @Override
        public <D extends Definition> TextSource<D> getSource(DefDescriptor<D> descriptor) {return null;}
        @Override
        public Set<DefDescriptor<?>> find(DescriptorFilter dm) {return null;}
        @Override public void reset() {}
    }
    //ExternalSourceLoader considered everything as non-internal namespace
    private class ExternalSourceLoader extends BaseSourceLoader{
        @Override
        public Set<String> getNamespaces() {
            return Sets.newHashSet("Custom_1","Custom_2");
        }
        @Override
        public <D extends Definition> TextSource<D> getSource(DefDescriptor<D> descriptor) {return null;}
        @Override
        public Set<DefDescriptor<?>> find(DescriptorFilter dm) {return null;}
        @Override public void reset() {}
    }
}
