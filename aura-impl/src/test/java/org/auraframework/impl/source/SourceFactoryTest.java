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

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.PrivilegedNamespaceSourceLoader;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class SourceFactoryTest extends AuraImplTestCase {

    public SourceFactoryTest(String name) {
        super(name);
    }

    public void testSourceFactory() {
        SourceLoader loader = StringSourceLoader.getInstance();
        try {
            List<SourceLoader> loaders = Lists.newArrayList(loader, loader);
            new SourceFactory(loaders);
            fail("Should have failed with AuraException('Namespace claimed by 2 SourceLoaders')");
        } catch (AuraRuntimeException e) {
        }
    }
    
    /**
     * Verify that SourceFactory registers Privileged namespaces based on loader information. 
     * SourceLoaders that implement PrivilegedNamespaceSourceLoaders are considered for determining if a namespace is privileged.
     * Namespaces served by SourceLoaders that do not implement PrivilegedNamespaceSourceLoaders are not privileged. 
     */
    public void testPrivilegedNamespaceSourceLoadersAreRegisteredWithConfigAdapter(){
        SourceLoader friendlyLoader = new FriendlySourceLoader();
        SourceLoader selectiveLoader = new SelectiveSourceLoader();
        SourceLoader unprivilegedLoader = new UnprivilegedSourceLoader();
        List<SourceLoader> loaders = Lists.newArrayList(friendlyLoader, selectiveLoader, unprivilegedLoader);
        SourceFactory sf = new SourceFactory(loaders);
        assertEquals(Sets.newHashSet("VIP", "Guest", "Friend1", "Friend2", "Custom_1","Custom_2"), sf.getNamespaces());
        
        ConfigAdapter c = Aura.getConfigAdapter();
        //Assert namespaces of PrivilegedNamespaceSourceLoaders are privileged based on isPrivilegedNamespace()
        assertTrue(c.isPrivilegedNamespace("Friend1"));
        assertTrue(c.isPrivilegedNamespace("Friend2"));
        
        assertTrue(c.isPrivilegedNamespace("VIP"));
        assertFalse(c.isPrivilegedNamespace("Guest"));
        
        //Assert namspaces of non-PrivilegedNamespaceSourceLoaders are not privileged
        assertFalse(c.isPrivilegedNamespace("Custom_1"));
        assertFalse(c.isPrivilegedNamespace("Custom_2"));
    }
    
    //SelectiveSourceLoader considered chosen namespace as privileged
    private class SelectiveSourceLoader extends BaseSourceLoader implements PrivilegedNamespaceSourceLoader{
        @Override
        public boolean isPrivilegedNamespace(String namespace) {
            return namespace.equals("VIP")? true : false; 
        }
        @Override
        public Set<String> getNamespaces() {
            return Sets.newHashSet("VIP", "Guest");
        }
        @Override
        public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {return null;}
        @Override
        public Set<DefDescriptor<?>> find(DescriptorFilter dm) {return null;}
        @Override
        public <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace) {return null;}
    }
    
    //FriendlySourceLoader considered everything as privileged namespace
    private class FriendlySourceLoader extends BaseSourceLoader implements PrivilegedNamespaceSourceLoader{
        @Override
        public boolean isPrivilegedNamespace(String namespace) {
            return true;
        }
        @Override
        public Set<String> getNamespaces() {
            return Sets.newHashSet("Friend1", "Friend2");
        }
        @Override
        public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {return null;}
        @Override
        public Set<DefDescriptor<?>> find(DescriptorFilter dm) {return null;}
        @Override
        public <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace) {return null;}
    }
    //UnprivilegedSourceLoader considered everything as unprivileged namespace
    private class UnprivilegedSourceLoader extends BaseSourceLoader{
        @Override
        public Set<String> getNamespaces() {
            return Sets.newHashSet("Custom_1","Custom_2");
        }
        @Override
        public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {return null;}
        @Override
        public Set<DefDescriptor<?>> find(DescriptorFilter dm) {return null;}
        @Override
        public <T extends Definition> Set<DefDescriptor<T>> find(Class<T> primaryInterface, String prefix, String namespace) {return null;}
    }
}
