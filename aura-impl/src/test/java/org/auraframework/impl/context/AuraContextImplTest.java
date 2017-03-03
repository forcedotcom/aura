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

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.RegistryTrie;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class AuraContextImplTest extends AuraImplTestCase {
    @Test
    public void testModeSetToPROD() {
        Mode m = Mode.PROD;
        AuraContextImpl impl = new AuraContextImpl(m, null, null, null, null, null, null, null, null, null);

        assertEquals(impl.getMode(), m);
    }

    @Test
    public void testModeSetToDEV() {
        Mode m = Mode.DEV;
        AuraContextImpl impl = new AuraContextImpl(m, null, null, null, null, null, null, null, null, null);

        assertEquals(impl.getMode(), m);
    }
    @Test
    public void testRegistries() {
        RegistryTrie rt = Mockito.mock(RegistryTrie.class);
        AuraContextImpl impl = new AuraContextImpl(null, rt, null, null, null, null, null, null, null, null);
        assertEquals(impl.getRegistries(), rt);
    }

    @Test
    public void testDefaultPrefixesSet() {
        Map<DefType, String> p = Maps.newHashMap();
        AuraContextImpl impl = new AuraContextImpl(null, null, p, null, null, null, null, null, null, null);

        assertEquals(impl.getDefaultPrefixes(), p);
    }

    @Test
    public void testDefaultPrefixesConsulted() {
        Map<DefType, String> p = Maps.newHashMap();
        p.put(DefType.APPLICATION, "expected");
        AuraContextImpl impl = new AuraContextImpl(null, null, p, null, null, null, null, null, null, null);

        assertEquals(impl.getDefaultPrefix(DefType.APPLICATION), "expected");
        assertEquals(impl.getDefaultPrefix(DefType.COMPONENT), null);
    }

    @Test
    public void testFormatSet() {
        Format x = Format.HTML;
        AuraContextImpl impl = new AuraContextImpl(null, null, null, x, null, null, null, null, null, null);

        assertEquals(impl.getFormat(), x);
    }

    @Test
    public void testAuthenticationSetToAuthenticated() {
        Authentication a = Authentication.AUTHENTICATED;
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, a, null, null, null, null, null);

        assertEquals(impl.getAccess(), a);
    }

    @Test
    public void testAuthenticationSetToUnAuthenticated() {
        Authentication a = Authentication.UNAUTHENTICATED;
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, a, null, null, null, null, null);

        assertEquals(impl.getAccess(), a);
    }

    // JsonSerializationContext jsonContext,
    // Map<String, GlobalValueProvider> globalProviders,
    // ConfigAdapter configAdapter,
    // DefinitionService definitionService,
    // TestContextAdapter testContextAdapter,

    @SuppressWarnings("serial")
    private class FakeDescriptor implements DefDescriptor<Definition> {
        private String prefix;
        private String namespace;
        private String name;
        private DefType type;
        private String qualifiedName;

        public FakeDescriptor(String prefix, String namespace, String name, DefType type) {
            this.prefix = prefix;
            this.namespace = namespace;
            this.name = name;
            this.type = type;
            this.qualifiedName = String.format("%s://%s:%s@%s", prefix, namespace, name, type.toString());
        }

        @Override
        public void serialize(Json json) throws IOException {
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
        public Definition getDef() throws QuickFixException {
            return null;
        }

        @Override
        public boolean exists() {
            return false;
        }
    }

    @SuppressWarnings("serial")
    private class FakeDefinition implements Definition {
        DefDescriptor<?> descriptor;

        public FakeDefinition(DefDescriptor<?> descriptor) {
            this.descriptor = descriptor;
        }

        @Override
        public void serialize(Json json) throws IOException {
        }

        @Override
        public void validateDefinition() throws QuickFixException {
        }

        @Override
        public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        }

        @Override
        public void validateReferences() throws QuickFixException {
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
        public void retrieveLabels() throws QuickFixException {
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
        public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
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
        public boolean hasSwitchableReference() {
            return false;
        }
    }

    @Test
    public void testHasLocalDefFalse() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        assertNull(impl.getLocalDef(desc));
    }

    @Test
    public void testGetLocalDefNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        assertNull(impl.getLocalDef(desc));
    }

    @Test
    public void testHasLocalDefTrueAfterAddOfNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, null);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testHasLocalDefTrueAfterAddOfNonNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testGetLocalDefAfterAddOfNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, null);
        assertNull(impl.getLocalDef(desc).orNull());
    }

    @Test
    public void testGetLocalDefAfterAddOfNonNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testIsLocalDefNotCacheableFalse() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        assertFalse(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testSetLocalDefNotCacheable() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.setLocalDefNotCacheable(desc);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testHasLocalDefTrueIfSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, null);
        impl.setSystemMode(true);
        assertNotNull(impl.getLocalDef(desc));
    }

    @Test
    public void testAddLocalDefInSystemModeStaysInSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
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
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        impl.setSystemMode(true);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testGetLocalDefFromNonSystemEvenIfSetInSystem() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        Definition definition2 = Mockito.mock(Definition.class);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        impl.setSystemMode(true);
        impl.addLocalDef(desc, definition2);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testIsLocalDefNotCacheableStaysInSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.setLocalDefNotCacheable(desc);
        impl.setSystemMode(true);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testSetLocalDefNotCacheableSetsFromSystemModeToNormal() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.setSystemMode(true);
        impl.setLocalDefNotCacheable(desc);
        assertTrue(impl.isLocalDefNotCacheable(desc));
        impl.setSystemMode(false);
        assertFalse(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testFilterWithNoDefs() {
        Set<DefDescriptor<?>> preloaded = Sets.newHashSet();
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(preloaded);
        assertEquals(0, result.size());
    }

    @Test
    public void testFilterWithEmpty() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        Set<DefDescriptor<?>> preloaded = Sets.newHashSet();
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
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
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
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
        Set<DefDescriptor<?>> preloaded = Sets.newHashSet();
        preloaded.add(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addLocalDef(desc, definition);
        Map<DefDescriptor<?>,Definition> result;

        result = impl.filterLocalDefs(preloaded);
        assertEquals(0, result.size());
    }

    @Test
    public void testAddDynamicDefAddsDef() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addDynamicDef(definition);
        assertNotNull(impl.getLocalDef(desc));
        assertEquals(impl.getLocalDef(desc).orNull(), definition);
    }

    @Test
    public void testAddDynamicDefAddsNotCacheable() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addDynamicDef(definition);
        assertTrue(impl.isLocalDefNotCacheable(desc));
    }

    @Test
    public void testAddDynamicMatchesOnEmpty() {
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        Set<DefDescriptor<?>> result = Sets.newHashSet();
        impl.addDynamicMatches(result, everything);
        assertEquals(0, result.size());
    }

    @Test
    public void testAddDynamicMatchesOnDescriptor() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
        impl.addDynamicDef(definition);

        Set<DefDescriptor<?>> result = Sets.newHashSet();
        impl.addDynamicMatches(result, everything);
        assertTrue(result.contains(desc));
        assertEquals(1, result.size());
    }

    @Test
    public void testAddDynamicDefInSystemModeDoesNotChangeNonSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);
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
        AuraContextImpl impl = new AuraContextImpl(null, null, null, null, null, null, null, null, null, null);

        assertFalse(impl.isSystemMode());
        impl.setSystemMode(false);
        assertFalse(impl.isSystemMode());
        impl.setSystemMode(true);
        assertTrue(impl.isSystemMode());
        impl.setSystemMode(false);
        assertFalse(impl.isSystemMode());
    }
}
