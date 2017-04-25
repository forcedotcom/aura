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
package org.auraframework.impl.system;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.InterfaceDef;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Source;
import org.auraframework.test.util.AuraTestCase;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Ignore;
import org.junit.Test;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class RegistryTrieTest extends AuraTestCase {
    class MockRegistry implements DefRegistry {
        private static final long serialVersionUID = 1707712096451860232L;

        private Set<DefType> defTypes = Sets.newHashSet(DefType.COMPONENT);
        private Set<String> prefixes = Sets.newHashSet("markup");
        private Set<String> namespaces = Sets.newHashSet("*");

        @Override
        public <T extends Definition> T getDef(DefDescriptor<T> descriptor) throws QuickFixException {
            return null;
        }

        @Override
        public boolean hasFind() {
            return true;
        }

        @Override
        public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
            return null;
        }

        @Override
        public <T extends Definition> boolean exists(DefDescriptor<T> descriptor) {
            return false;
        }

        @Override
        public Set<DefType> getDefTypes() {
            return defTypes;
        }

        MockRegistry setDefTypes(DefType... defTypes) {
            this.defTypes = Sets.newHashSet(defTypes);
            return this;
        }

        @Override
        public Set<String> getPrefixes() {
            return prefixes;
        }

        MockRegistry setPrefixes(String... prefixes) {
            this.prefixes = Sets.newHashSet(prefixes);
            return this;
        }

        @Override
        public Set<String> getNamespaces() {
            return namespaces;
        }

        MockRegistry setNamespaces(String... namespaces) {
            this.namespaces = Sets.newHashSet(namespaces);
            return this;
        }

        @Override
        public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
            return null;
        }

        @Override
        public boolean isCacheable() {
            return false;
        }

        @Override
        public void reset() {
        }

        @Override
        public boolean isStatic() {
            return false;
        }

        @Override
        public String toString() {
            return "{" + defTypes + "/" + prefixes + "/" + namespaces + "}";
        }
    }

    @Test
    public void testInitEmpty() {
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList());
        Collection<DefRegistry> actual = trie.getAllRegistries();
        assertNotNull(actual);
        assertEquals(0, actual.size());
    }

    @Test
    public void testInitWithNull() {
        try {
            new RegistryTrie((Collection<DefRegistry>)null);
            fail("NPE expected on init");
        } catch (NullPointerException expected) {
        }

        try {
            new RegistryTrie(Lists.newArrayList((DefRegistry)null));
            fail("NPE expected on init");
        } catch (NullPointerException expected) {
        }
    }

    @Test
    public void testInitWithDuplicateRegistries() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.APPLICATION,
                DefType.COMPONENT);
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace", "anotherNamespace")
                .setDefTypes(DefType.COMPONENT);
        try {
            new RegistryTrie(Lists.newArrayList(reg1, reg2));
            fail("No error thrown for duplicate registries");
        } catch (AuraError t) {
            assertExceptionMessageStartsWith(t, AuraError.class,
                    "Duplicate DefType/Prefix/Namespace combination claimed by 2 DefRegistries : ");
        }
    }

    @Test
    public void testInitWithDuplicateRegistriesBasedOnNamespaceCaseInsensitivity() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("TESTNAMESPACE");
        try {
            new RegistryTrie(Lists.newArrayList(reg1, reg2));
            fail("No error thrown for duplicate registries");
        } catch (AuraError t) {
            assertExceptionMessageStartsWith(t, AuraError.class,
                    "Duplicate DefType/Prefix/Namespace combination claimed by 2 DefRegistries : {[COMPONENT]/[markup]/[testNamespace]} and {[COMPONENT]/[markup]/[TESTNAMESPACE]}");
        }
    }

    @Test
    @Ignore("It is expected that DefRegistry.getPrefixes() returns all lowercase values")
    public void testInitWithDuplicateRegistriesBasedOnPrefixCaseInsensitivity() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("markup");
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("MARKUP");
        try {
            new RegistryTrie(Lists.newArrayList(reg1, reg2));
            fail("No error thrown for duplicate registries");
        } catch (AuraError t) {
            assertExceptionMessageStartsWith(t, AuraError.class,
                    "Duplicate DefType/Prefix/Namespace combination claimed by 2 DefRegistries : {[COMPONENT]/[markup]/[testNamespace]} and {[COMPONENT]/[MARKUP]/[testNamespace]}");
        }
    }

    @Test
    public void testGetAllRegistriesIsEquivalent() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("first");
        MockRegistry reg2 = new MockRegistry().setNamespaces("second");
        List<DefRegistry> registries = Lists.newArrayList(reg1, reg2);
        RegistryTrie trie = new RegistryTrie(registries);

        Collection<DefRegistry> actual = trie.getAllRegistries();
        assertEquals(Lists.newArrayList(registries), Lists.newArrayList(actual));
    }

    @Test
    public void testGetRegistriesWithoutMatch() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1));

        Collection<DefRegistry> actual = trie.getRegistries(new DescriptorFilter("otherNamepsace"));
        assertEquals(0, actual.size());
    }

    @Test
    public void testGetRegistryForNonMatchingPrefix() {
        MockRegistry reg = new MockRegistry().setNamespaces("testNamespace");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg));

        DefDescriptor<ComponentDef> descriptor = new DefDescriptorImpl("js://*:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(null, actual);
    }

    @Test
    public void testGetRegistryForNonMatchingNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("first");
        MockRegistry reg2 = new MockRegistry().setNamespaces("second");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("otherNamespace:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(null, actual);
    }

    @Test
    public void testGetRegistryForNonMatchingSingularNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("markup");
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("js");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup://otherNamespace:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        
        assertNull(actual);
    }

    @Test
    public void testGetRegistryForNonMatchingWildcardNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("first");
        MockRegistry reg2 = new MockRegistry().setNamespaces("second");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(null, actual);
    }

    @Test
    @Ignore("Should have returned null")
    public void testGetRegistryForNonMatchingWildcardSingularNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("first").setPrefixes("js");
        MockRegistry reg2 = new MockRegistry().setNamespaces("second").setPrefixes("markup");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(null, actual);
    }

    @Test
    public void testGetRegistryForNonMatchingDefType() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.APPLICATION);
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.COMPONENT);
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("testNamespace:*", InterfaceDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(null, actual);
    }

    @Test
    public void testGetRegistryForNonMatchingSingularDefType() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("otherNamespace").setDefTypes(DefType.COMPONENT);
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.COMPONENT, DefType.APPLICATION);
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("testNamespace:*", ApplicationDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        
        // normally would expect null, but reg2 will ultimately return null for the specific descriptor requested anyways
        assertEquals(reg2, actual); 
    }

    @Test
    public void testGetRegistryForMatchingNamespace() {
        MockRegistry reg = new MockRegistry().setNamespaces("testNamespace");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("testNamespace:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(reg, actual);
    }

    @Test
    public void testGetRegistryForMatchingDefType() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.APPLICATION);
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.COMPONENT);
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("testNamespace:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(reg2, actual);

        descriptor = new DefDescriptorImpl<>("testNamespace:*", ApplicationDef.class);
        actual = trie.getRegistryFor(descriptor);
        assertEquals(reg1, actual);
    }

    @Test
    public void testGetRegistryForMatchingPrefix() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.APPLICATION)
                .setPrefixes("markup");
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.COMPONENT)
                .setPrefixes("markup");
        MockRegistry reg3 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.COMPONENT)
                .setPrefixes("js");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2, reg3));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("markup://testNamespace:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(reg2, actual);

        descriptor = new DefDescriptorImpl<>("js://testNamespace.*", ComponentDef.class);
        actual = trie.getRegistryFor(descriptor);
        assertEquals(reg3, actual);
    }

    @Test
    public void testGetRegistryForMatchingWildcardNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("*");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("*:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(reg2, actual);
    }

    @Test
    public void testGetRegistryForMatchingExplicitNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("*");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("testNamespace:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(reg1, actual);
    }

    @Test
    public void testGetRegistryForFallThroughToWildcardNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("*").setDefTypes(DefType.COMPONENT);
        MockRegistry reg3 = new MockRegistry().setNamespaces("*").setDefTypes(DefType.APPLICATION);
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2, reg3));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("otherNamespace:*", ComponentDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(reg2, actual);
    }

    @Test
    public void testGetRegistryForNonMatchingFallThroughToWildcardNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setDefTypes(DefType.COMPONENT);
        MockRegistry reg2 = new MockRegistry().setNamespaces("*").setDefTypes(DefType.COMPONENT, DefType.APPLICATION);
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>("otherNamespace:*", ApplicationDef.class);
        DefRegistry actual = trie.getRegistryFor(descriptor);
        assertEquals(reg2, actual);
    }

    @Test
    public void testGetRegistriesNonMatchingNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1));

        DescriptorFilter matcher = new DescriptorFilter("otherNamespace");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(0, actual.size());
    }

    @Test
    public void testGetRegistriesNonMatchingPrefix() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("markup");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1));

        DescriptorFilter matcher = new DescriptorFilter("js://testNamespace:*");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(0, actual.size());
    }

    @Test
    public void testGetRegistriesMatchSingle() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("otherNamespace");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DescriptorFilter matcher = new DescriptorFilter("testNamespace:*");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(1, actual.size());
        assertEquals(true, actual.contains(reg1));
    }

    @Test
    public void testGetRegistriesMatchNamespaceWithWildcard() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("otherNamespace");
        MockRegistry reg3 = new MockRegistry().setNamespaces("other");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2, reg3));

        DescriptorFilter matcher = new DescriptorFilter("*Namespace:*");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(2, actual.size());
        assertEquals(true, actual.contains(reg1));
        assertEquals(true, actual.contains(reg2));
    }

    @Test
    public void testGetRegistriesMatchAllNamespaces() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("otherNamespace");
        MockRegistry reg3 = new MockRegistry().setNamespaces("other");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2, reg3));

        DescriptorFilter matcher = new DescriptorFilter("*:*");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(3, actual.size());
        assertEquals(true, actual.contains(reg1));
        assertEquals(true, actual.contains(reg2));
        assertEquals(true, actual.contains(reg3));
    }

    @Test
    public void testGetRegistriesMatchIncludesWildcardRegistry() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("otherNamespace");
        MockRegistry reg3 = new MockRegistry().setNamespaces("*");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2, reg3));

        DescriptorFilter matcher = new DescriptorFilter("testNamespace:*");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(2, actual.size());
        assertEquals(true, actual.contains(reg1));
        assertEquals(true, actual.contains(reg3));
    }

    @Test
    public void testGetRegistriesMatchPrefix() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("markup");
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("js");
        MockRegistry reg3 = new MockRegistry().setNamespaces("other").setPrefixes("js");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2, reg3));

        DescriptorFilter matcher = new DescriptorFilter("js://testNamespace:*");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(1, actual.size());
        assertEquals(true, actual.contains(reg2));
    }

    /**
     * Test that registries are matched based on existence of ANY of the matcher DefTypes
     */
    @Test
    public void testGetRegistriesMatchesDefTypes() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("markup");
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("js").setDefTypes(DefType.DOCUMENTATION, DefType.DESCRIPTION);
        MockRegistry reg3 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("js").setDefTypes(DefType.COMPONENT);
        MockRegistry reg4 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("js").setDefTypes(DefType.LIBRARY);
        MockRegistry reg5 = new MockRegistry().setNamespaces("other").setPrefixes("js");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2, reg3, reg4,reg5));

        DescriptorFilter matcher = new DescriptorFilter("js://testNamespace:*", Lists.newArrayList(DefType.COMPONENT, DefType.DOCUMENTATION));
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals("Should return two matching registries",2, actual.size());
        assertTrue("Should contain partial DefType match registry", actual.contains(reg2));
        assertTrue("Should contain DefType match registry", actual.contains(reg3));
        assertFalse("Should not contain markup prefix registry", actual.contains(reg1));
    }

    @Test
    public void testGetRegistriesMatchCaseInsensitiveNamespace() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace");
        MockRegistry reg2 = new MockRegistry().setNamespaces("otherNamespace");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2));

        DescriptorFilter matcher = new DescriptorFilter("TESTNAMESPACE:*");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(1, actual.size());
        assertEquals(true, actual.contains(reg1));
    }

    @Test
    public void testGetRegistriesMatchCaseInsensitivePrefix() {
        MockRegistry reg1 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("markup");
        MockRegistry reg2 = new MockRegistry().setNamespaces("testNamespace").setPrefixes("js");
        MockRegistry reg3 = new MockRegistry().setNamespaces("other").setPrefixes("js");
        RegistryTrie trie = new RegistryTrie(Lists.newArrayList(reg1, reg2, reg3));

        DescriptorFilter matcher = new DescriptorFilter("JS://testNamespace:*");
        Collection<DefRegistry> actual = trie.getRegistries(matcher);
        assertEquals(1, actual.size());
        assertEquals(true, actual.contains(reg2));
    }
}
