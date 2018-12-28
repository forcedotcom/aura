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
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Sets;

public class AuraLocalStoreImplTest {
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
        public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
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
        public Set<DefDescriptor<?>> getDependencySet() {
            return Sets.newHashSet();
        }
    }

    @Test
    public void testGetDefNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        Assert.assertNull(impl.getDefinition(desc));
    }

    @Test
    public void testDefNonNullAfterAddOfNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDefinition(desc, null);
        Assert.assertNotNull(impl.getDefinition(desc));
    }

    @Test
    public void testGetDefAfterAddOfNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDefinition(desc, null);
        Assert.assertNull(impl.getDefinition(desc).orNull());
    }

    @Test
    public void testGetDefAfterAddOfNonNull() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDefinition(desc, definition);
        Assert.assertEquals(impl.getDefinition(desc).orNull(), definition);
    }

    @Test
    public void testIsDefNotCacheableFalse() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        Assert.assertFalse(impl.isDefNotCacheable(desc));
    }

    @Test
    public void testSetDefNotCacheable() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.setDefNotCacheable(desc);
        Assert.assertTrue(impl.isDefNotCacheable(desc));
    }

    @Test
    public void testHasDefTrueIfSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDefinition(desc, null);
        impl.setSystemMode(true);
        Assert.assertNotNull(impl.getDefinition(desc));
    }

    @Test
    public void testAddDefInSystemModeStaysInSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.setSystemMode(true);
        impl.addDefinition(desc, definition);
        impl.setSystemMode(false);
        Assert.assertNull(impl.getDefinition(desc));
        impl.setSystemMode(true);
        Assert.assertNotNull(impl.getDefinition(desc));
        Assert.assertEquals(impl.getDefinition(desc).orNull(), definition);
    }

    @Test
    public void testGetDefFromNonSystemModeInSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDefinition(desc, definition);
        impl.setSystemMode(true);
        Assert.assertNotNull(impl.getDefinition(desc));
        Assert.assertEquals(impl.getDefinition(desc).orNull(), definition);
    }

    @Test
    public void testIsDefNotCacheableStaysInSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.setDefNotCacheable(desc);
        impl.setSystemMode(true);
        Assert.assertTrue(impl.isDefNotCacheable(desc));
    }

    @Test
    public void testSetDefNotCacheableSetsFromSystemModeToNormal() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.setSystemMode(true);
        impl.setDefNotCacheable(desc);
        Assert.assertTrue(impl.isDefNotCacheable(desc));
        impl.setSystemMode(false);
        Assert.assertFalse(impl.isDefNotCacheable(desc));
    }

    @Test
    public void testGetDefinitionsEmpty() {
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        Map<DefDescriptor<?>,Definition> result;

        result = impl.getDefinitions();
        Assert.assertEquals(0, result.size());
    }

    @Test
    public void testGetDefinitionsEmptyAfterNull() {
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Map<DefDescriptor<?>,Definition> result;
        impl.addDefinition(desc, null);

        result = impl.getDefinitions();
        Assert.assertEquals(0, result.size());
    }

    @Test
    public void testGetDefinitionsHasDefinition() {
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        Map<DefDescriptor<?>,Definition> result;
        impl.addDefinition(desc, definition);

        result = impl.getDefinitions();
        Assert.assertEquals(1, result.size());
        Assert.assertSame(result.get(desc), definition);
    }

    @Test
    public void testGetDefinitionsHasDefinitionAndNotNull() {
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        FakeDescriptor desc2 = new FakeDescriptor("c", "d", "e", DefType.APPLICATION);
        Definition definition = Mockito.mock(Definition.class);
        Map<DefDescriptor<?>,Definition> result;
        impl.addDefinition(desc, definition);
        impl.addDefinition(desc2, null);

        result = impl.getDefinitions();
        Assert.assertEquals(1, result.size());
        Assert.assertSame(result.get(desc), definition);
    }

    @Test
    public void testAddDynamicDefAddsDef() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDynamicDefinition(definition);
        Assert.assertNotNull(impl.getDefinition(desc));
        Assert.assertEquals(impl.getDefinition(desc).orNull(), definition);
    }

    @Test
    public void testAddDynamicDefAddsNotCacheable() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDynamicDefinition(definition);
        Assert.assertTrue(impl.isDefNotCacheable(desc));
    }

    @Test
    public void testAddDynamicMatchesOnEmpty() {
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        Set<DefDescriptor<?>> result = Sets.newHashSet();
        impl.addDynamicMatches(result, everything);
        Assert.assertEquals(0, result.size());
    }

    @Test
    public void testAddDynamicMatchesOnDescriptor() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDynamicDefinition(definition);

        Set<DefDescriptor<?>> result = Sets.newHashSet();
        impl.addDynamicMatches(result, everything);
        Assert.assertTrue(result.contains(desc));
        Assert.assertEquals(1, result.size());
    }

    @Test
    public void testAddDynamicMatchesOnDescriptorChangesSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDynamicDefinition(definition);

        impl.setSystemMode(true);
        Set<DefDescriptor<?>> result = Sets.newHashSet();
        impl.addDynamicMatches(result, everything);
        Assert.assertTrue(result.contains(desc));
        Assert.assertEquals(1, result.size());
    }

    @Test
    public void testAddDynamicMatchesInSystemOnDescriptorDoesntChangesUserMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        DescriptorFilter everything = new DescriptorFilter("*");
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.setSystemMode(true);
        impl.addDynamicDefinition(definition);

        impl.setSystemMode(false);
        Set<DefDescriptor<?>> result = Sets.newHashSet();
        impl.addDynamicMatches(result, everything);
        Assert.assertFalse(result.contains(desc));
        Assert.assertEquals(0, result.size());
    }


    @Test
    public void testAddDynamicDefInSystemModeDoesNotChangeNonSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.setSystemMode(true);
        impl.addDynamicDefinition(definition);
        Assert.assertNotNull(impl.getDefinition(desc));
        Assert.assertEquals(impl.getDefinition(desc).orNull(), definition);
        impl.setSystemMode(false);
        Assert.assertNull(impl.getDefinition(desc));
        Assert.assertFalse(impl.isDefNotCacheable(desc));
    }

    @Test
    public void testAddDynamicDefInUserModeDoesChangeSystemMode() {
        FakeDescriptor desc = new FakeDescriptor("a", "b", "c", DefType.APPLICATION);
        Definition definition = new FakeDefinition(desc);
        AuraLocalStoreImpl impl = new AuraLocalStoreImpl();
        impl.addDynamicDefinition(definition);
        Assert.assertNotNull(impl.getDefinition(desc));
        Assert.assertEquals(impl.getDefinition(desc).orNull(), definition);
        impl.setSystemMode(true);
        Assert.assertNotNull(impl.getDefinition(desc));
        Assert.assertTrue(impl.isDefNotCacheable(desc));
    }
}
