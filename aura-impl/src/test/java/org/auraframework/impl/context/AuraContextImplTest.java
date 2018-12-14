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
package org.auraframework.impl.context;

import static org.mockito.Mockito.mock;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.RegistryTrie;
//import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.GlobalValueProviderFactory;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.util.json.Json;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Test;
import org.mockito.Mockito;

public class AuraContextImplTest extends AuraImplTestCase {
    //private final static Map<String, GlobalValueProvider> MOCK_GLOBAL_VALUE_PROVIDER_MAP = Collections.singletonMap("Mock", mock(GlobalValueProvider.class));
    
    private final static GlobalValueProviderFactory MOCK_GLOBAL_VALUE_PROVIDER_FACTORY = mock(GlobalValueProviderFactory.class);

    @Test
    public void testModeSetToPROD() {
        Mode m = Mode.PROD;
        AuraContextImpl impl = new AuraContextImpl(m, null,  null, null, null, null, null, null, null);

        assertEquals(impl.getMode(), m);
    }

    @Test
    public void testModeSetToDEV() {
        Mode m = Mode.DEV;
        AuraContextImpl impl = new AuraContextImpl(m, null, null, null, null, null, null, null, null);

        assertEquals(impl.getMode(), m);
    }

    @Test
    public void testRegistries() {
        RegistryTrie rt = Mockito.mock(RegistryTrie.class);
        AuraContextImpl impl = new AuraContextImpl(null, rt, null, null, null, null, null, null, null);
        assertEquals(impl.getRegistries(), rt);
    }

    @Test
    public void testFormatSet() {
        Format x = Format.HTML;
        AuraContextImpl impl = new AuraContextImpl(null, null, x, null, null, null, null, null, null);

        assertEquals(impl.getFormat(), x);
    }

    @Test
    public void testAuthenticationSetToAuthenticated() {
        Authentication a = Authentication.AUTHENTICATED;
        AuraContextImpl impl = new AuraContextImpl(null, null, null, a, null, null, null, null, null);

        assertEquals(impl.getAccess(), a);
    }

    @Test
    public void testAuthenticationSetToUnAuthenticated() {
        Authentication a = Authentication.UNAUTHENTICATED;
        AuraContextImpl impl = new AuraContextImpl(null, null, null, a, null, null, null, null, null);

        assertEquals(impl.getAccess(), a);
    }

    // JsonSerializationContext jsonContext,
    // Map<String, GlobalValueProvider> globalProviders,
    // ConfigAdapter configAdapter,
    // DefinitionService definitionService,
    // TestContextAdapter testContextAdapter,

    private static class FakeDescriptor implements DefDescriptor<Definition> {
        private static final long serialVersionUID = -3836839688106062864L;
        
        private final String prefix;
        private final String namespace;
        private final String name;
        private final DefType type;
        private final String qualifiedName;

        public FakeDescriptor(String prefix, String namespace, String name, DefType type) {
            this.prefix = prefix;
            this.namespace = namespace;
            this.name = name;
            this.type = type;
            this.qualifiedName = String.format("%s://%s:%s@%s", prefix, namespace, name, type.toString());
        }

        @Override
        public void serialize(Json json) {
            // do nothing
        }

        @Override
        public int compareTo(DefDescriptor<?> o) {
            if (o == null) {
                return 1;
            }
            return qualifiedName.compareTo(o.getQualifiedName());
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getQualifiedName() {
            return qualifiedName;
        }

        @Override
        public String getDescriptorName() {
            return qualifiedName;
        }

        @Override
        public String getPrefix() {
            return prefix;
        }

        @Override
        public String getNamespace() {
            return namespace;
        }

        @Override
        public String getNameParameters() {
            return null;
        }

        @Override
        public boolean isParameterized() {
            return false;
        }

        @Override
        public org.auraframework.def.DefDescriptor.DefType getDefType() {
            return type;
        }

        @Override
        public DefDescriptor<? extends Definition> getBundle() {
            return null;
        }

        @Override
        public Definition getDef() {
            return null;
        }

        @Override
        public boolean exists() {
            return false;
        }
    }

    private static class FakeDefinition implements Definition {

        private static final long serialVersionUID = -4753887241336313349L;
        
        private final DefDescriptor<?> descriptor;

        public FakeDefinition(DefDescriptor<?> descriptor) {
            this.descriptor = descriptor;
        }

        @Override
        public void serialize(Json json) {
        }

        @Override
        public void validateDefinition() {
        }

        @Override
        public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        }

        @Override
        public void validateReferences(ReferenceValidationContext validationContext) {
        }

        @Override
        public void markValid() {
        }

        @Override
        public boolean isValid() {
            return false;
        }

        @Override
        public String getName() {
            return null;
        }

        @Override
        public Location getLocation() {
            return null;
        }

        @Override
        public DefinitionAccess getAccess() {
            return null;
        }

        @Override
        public String getDescription() {
            return null;
        }

        @Override
        public String getAPIVersion() {
            return null;
        }

        @Override
        public String getOwnHash() {
            return null;
        }

        @Override
        public void appendSupers(Set<DefDescriptor<?>> supers) {
        }

        @Override
        public DefDescriptor<? extends Definition> getDescriptor() {
            return descriptor;
        }

        @Override
        public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
            return null;
        }

        @Override
        public Set<DefDescriptor<?>> getDependencySet() {
            return new HashSet<>();
        }
    }

    @Test
    public void testHasLocalDefFalse() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        assertNull(impl.getLocalDef(desc));
    }

    @Test
    public void testGetLocalDefNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        assertNull(impl.getLocalDef(desc));
    }

    @Test
    public void testHasLocalDefTrueAfterAddOfNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, null);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testHasLocalDefTrueAfterAddOfNonNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testGetLocalDefAfterAddOfNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, null);
        assertNull(impl.getLocalDef(desc).orNull());
    }

    @Test
    public void testGetLocalDefAfterAddOfNonNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testIsLocalDefNotCacheableFalse() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        assertFalse(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testSetLocalDefNotCacheable() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.setLocalDefNotCacheable(desc);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testHasLocalDefTrueIfSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, null);
        impl.setSystemMode(true);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testAddLocalDefInSystemModeStaysInSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.setSystemMode(true);
        impl.addLocalDef(desc, definition);
        impl.setSystemMode(false);
        assertNull(impl.getLocalDef(desc));
        impl.setSystemMode(true);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testGetLocalDefFromNonSystemModeInSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        impl.setSystemMode(true);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testIsLocalDefNotCacheableStaysInSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.setLocalDefNotCacheable(desc);
        impl.setSystemMode(true);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testSetLocalDefNotCacheableSetsFromSystemModeToNormal() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.setSystemMode(true);
        impl.setLocalDefNotCacheable(desc);
        assertTrue(impl.isLocalDefNotCacheable(desc));
        impl.setSystemMode(false);
        assertFalse(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testFilterWithNoDefs() {
        Set<DefDescriptor<?>> preloaded = Collections.emptySet();
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(preloaded);
        assertEquals(0, result.size());
    }

    @Test
    public void testFilterWithEmpty() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        Set<DefDescriptor<?>> preloaded = Collections.emptySet();
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(preloaded);
        assertEquals(definition, result.get(desc));
        assertEquals(1, result.size());
        assertTrue(result.containsKey(desc));
    }

    @Test
    public void testFilterWithNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(null);
        assertEquals(definition, result.get(desc));
        assertEquals(1, result.size());
        assertTrue(result.containsKey(desc));
    }

    @Test
    public void testFilterWithEntries() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        Set<DefDescriptor<?>> preloaded = Collections.singleton(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(preloaded);
        assertEquals(0, result.size());
    }

    @Test
    public void testAddDynamicDefAddsDef() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addDynamicDef(definition);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testAddDynamicDefAddsNotCacheable() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addDynamicDef(definition);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testAddDynamicMatchesOnEmpty() {
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        Set<DefDescriptor<?>> result = new HashSet<>();
        impl.addDynamicMatches(result, everything);
        assertEquals(0, result.size());
    }

    @Test
    public void testAddDynamicMatchesOnDescriptor() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.addDynamicDef(definition);

        Set<DefDescriptor<?>> result = new HashSet<>();
        impl.addDynamicMatches(result, everything);
        assertTrue(result.contains(desc));
        assertEquals(1, result.size());
    }

    @Test
    public void testAddDynamicDefInSystemModeDoesNotChangeNonSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);
        impl.setSystemMode(true);
        impl.addDynamicDef(definition);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
        impl.setSystemMode(false);
        assertNull(impl.getLocalDef(desc));
        assertFalse(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testIsSystemMode() {
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null);

        assertFalse(impl.isSystemMode());
        impl.setSystemMode(false);
        assertFalse(impl.isSystemMode());
        impl.setSystemMode(true);
        assertTrue(impl.isSystemMode());
        impl.setSystemMode(false);
        assertFalse(impl.isSystemMode());
    }
    
    @Test
    public void testModeSetToPROD2() {
        Mode m = Mode.PROD;
        AuraContextImpl impl = new AuraContextImpl(m, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);

        assertEquals(impl.getMode(), m);
    }

    @Test
    public void testModeSetToDEV2() {
        Mode m = Mode.DEV;
        AuraContextImpl impl = new AuraContextImpl(m, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);

        assertEquals(impl.getMode(), m);
    }

    @Test
    public void testRegistries2() {
        RegistryTrie rt = Mockito.mock(RegistryTrie.class);
        AuraContextImpl impl = new AuraContextImpl(null, rt, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        assertEquals(impl.getRegistries(), rt);
    }

    @Test
    public void testFormatSet2() {
        Format x = Format.HTML;
        AuraContextImpl impl = new AuraContextImpl(null, null, x, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);

        assertEquals(impl.getFormat(), x);
    }

    @Test
    public void testAuthenticationSetToAuthenticated2() {
        Authentication a = Authentication.AUTHENTICATED;
        AuraContextImpl impl = new AuraContextImpl(null, null, null, a, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);

        assertEquals(impl.getAccess(), a);
    }

    @Test
    public void testAuthenticationSetToUnAuthenticated2() {
        Authentication a = Authentication.UNAUTHENTICATED;
        AuraContextImpl impl = new AuraContextImpl(null, null, null, a, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);

        assertEquals(impl.getAccess(), a);
    }
    
    @Test
    public void testHasLocalDefFalse2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        assertNull(impl.getLocalDef(desc));
    }

    @Test
    public void testGetLocalDefNull2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        assertNull(impl.getLocalDef(desc));
    }

    @Test
    public void testHasLocalDefTrueAfterAddOfNull2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, null);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testHasLocalDefTrueAfterAddOfNonNull2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, definition);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testGetLocalDefAfterAddOfNull2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, null);
        assertNull(impl.getLocalDef(desc).orNull());
    }

    @Test
    public void testGetLocalDefAfterAddOfNonNull2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, definition);
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testIsLocalDefNotCacheableFalse2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        assertFalse(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testSetLocalDefNotCacheable2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.setLocalDefNotCacheable(desc);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testHasLocalDefTrueIfSystemMode2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, null);
        impl.setSystemMode(true);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testAddLocalDefInSystemModeStaysInSystemMode2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.setSystemMode(true);
        impl.addLocalDef(desc, definition);
        impl.setSystemMode(false);
        assertNull(impl.getLocalDef(desc));
        impl.setSystemMode(true);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testGetLocalDefFromNonSystemModeInSystemMode2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, definition);
        impl.setSystemMode(true);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testIsLocalDefNotCacheableStaysInSystemMode2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.setLocalDefNotCacheable(desc);
        impl.setSystemMode(true);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testSetLocalDefNotCacheableSetsFromSystemModeToNormal2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.setSystemMode(true);
        impl.setLocalDefNotCacheable(desc);
        assertTrue(impl.isLocalDefNotCacheable(desc));
        impl.setSystemMode(false);
        assertFalse(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testFilterWithNoDefs2() {
        Set<DefDescriptor<?>> preloaded = Collections.emptySet();
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(preloaded);
        assertEquals(0, result.size());
    }

    @Test
    public void testFilterWithEmpty2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        Set<DefDescriptor<?>> preloaded = Collections.emptySet();
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, definition);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(preloaded);
        assertEquals(definition, result.get(desc));
        assertEquals(1, result.size());
        assertTrue(result.containsKey(desc));
    }

    @Test
    public void testFilterWithNull2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, definition);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(null);
        assertEquals(definition, result.get(desc));
        assertEquals(1, result.size());
        assertTrue(result.containsKey(desc));
    }

    @Test
    public void testFilterWithEntries2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        Set<DefDescriptor<?>> preloaded = Collections.singleton(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addLocalDef(desc, definition);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(preloaded);
        assertEquals(0, result.size());
    }

    @Test
    public void testAddDynamicDefAddsDef2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addDynamicDef(definition);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testAddDynamicDefAddsNotCacheable2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addDynamicDef(definition);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testAddDynamicMatchesOnEmpty2() {
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        Set<DefDescriptor<?>> result = new HashSet<>();
        impl.addDynamicMatches(result, everything);
        assertEquals(0, result.size());
    }

    @Test
    public void testAddDynamicMatchesOnDescriptor2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.addDynamicDef(definition);

        Set<DefDescriptor<?>> result = new HashSet<>();
        impl.addDynamicMatches(result, everything);
        assertTrue(result.contains(desc));
        assertEquals(1, result.size());
    }

    @Test
    public void testAddDynamicDefInSystemModeDoesNotChangeNonSystemMode2() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);
        impl.setSystemMode(true);
        impl.addDynamicDef(definition);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
        impl.setSystemMode(false);
        assertNull(impl.getLocalDef(desc));
        assertFalse(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testIsSystemMode2() {
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, MOCK_GLOBAL_VALUE_PROVIDER_FACTORY);

        assertFalse(impl.isSystemMode());
        impl.setSystemMode(false);
        assertFalse(impl.isSystemMode());
        impl.setSystemMode(true);
        assertTrue(impl.isSystemMode());
        impl.setSystemMode(false);
        assertFalse(impl.isSystemMode());
    }
}
