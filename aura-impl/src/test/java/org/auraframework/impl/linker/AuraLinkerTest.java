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
package org.auraframework.impl.linker;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.cache.Cache;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.StaticDefRegistryImpl;
import org.auraframework.impl.util.mock.MockDefDescriptor;
import org.auraframework.impl.util.mock.MockDefinition;
import org.auraframework.impl.util.mock.MockRegistrySet;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraLocalStore;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Location;
import org.auraframework.system.RegistrySet;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class AuraLinkerTest {
    private final MockRegistrySet registries = new MockRegistrySet();

    @Mock
    private LoggingService loggingService;

    @Before
    public void initMocks() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void testGetCompilingSameForEqualDescriptors() {
        MockDefDescriptor desc1 = new MockDefDescriptor("markup", "b", "b");
        MockDefDescriptor desc2 = new MockDefDescriptor("markup", "b", "B");

        AuraLinker linker = new AuraLinker(desc1, null, null, null, null, null, null, null, registries);
        LinkingDefinition<Definition> ld1 = linker.getLinkingDef(desc1);
        LinkingDefinition<Definition> ld2 = linker.getLinkingDef(desc2);
        Assert.assertSame("Definitions should be the same", ld1, ld2);
    }

    @Test
    public void testSortForVerificationWithInheritance() {
        MockDefDescriptor desc1 = new MockDefDescriptor("markup", "b", "b");
        MockDefinition def1 = new MockDefinition(desc1);

        MockDefDescriptor desc2 = new MockDefDescriptor("markup", "a", "b");
        MockDefinition def2 = new MockDefinition(desc1);

        AuraLinker linker = new AuraLinker(desc1, null, null, null, null, null, null, null, registries);

        LinkingDefinition<Definition> ld = linker.getLinkingDef(desc1);
        ld.def = def1;
        //ld.inheritanceLevel = 0;
        ld.level = 0;

        ld = linker.getLinkingDef(desc2);
        ld.def = def2;
        //ld.inheritanceLevel = 1;
        ld.level = 0;

        List<LinkingDefinition<?>> ordered = linker.getNameSort();
        Assert.assertSame(def2, ordered.get(0).def);
        Assert.assertSame(def1, ordered.get(1).def);
    }

    //@XFailure
    //@Test
    public void testSortForLevelWithInheritance() {
        MockDefDescriptor desc1 = new MockDefDescriptor("markup", "b", "b");
        MockDefinition def1 = new MockDefinition(desc1);

        MockDefDescriptor desc2 = new MockDefDescriptor("markup", "a", "b");
        MockDefinition def2 = new MockDefinition(desc1);

        AuraLinker linker = new AuraLinker(desc1, null, null, null, null, null, null, null, registries);

        LinkingDefinition<Definition> ld = linker.getLinkingDef(desc1);
        ld.def = def1;
        //ld.inheritanceLevel = 1;
        ld.level = 0;

        ld = linker.getLinkingDef(desc2);
        ld.def = def2;
        //ld.inheritanceLevel = 0;
        ld.level = 1;

        List<LinkingDefinition<?>> ordered = linker.getDepthSort();
        Assert.assertSame(def2, ordered.get(0).def);
        Assert.assertSame(def1, ordered.get(1).def);
    }

    private static SecureRandom random = new SecureRandom();

    @SuppressWarnings("serial")
    private static class TestDef implements Definition {
        private final DefDescriptor<ComponentDef> descriptor;
        private final String ownHash;
        private ArrayList<DefDescriptor<?>> parents = Lists.newArrayList();
        private ArrayList<DefDescriptor<?>> dependents = Lists.newArrayList();

        public TestDef(String name) {
            this.descriptor = new DefDescriptorImpl<>("markup", "ns", name, ComponentDef.class);
            this.ownHash = Long.toString(random.nextLong(), 15);
        }

        public void flip() {
            Collections.reverse(parents);
            Collections.reverse(dependents);
        }

        public void addDependent(DefDescriptor<?> descriptor) {
            dependents.add(descriptor);
        }

        public List<DefDescriptor<?>> getDependents() {
            return dependents;
        }

        public void addParent(DefDescriptor<?> descriptor) {
            parents.add(descriptor);
        }

        public List<DefDescriptor<?>> getParents() {
            return parents;
        }

        @Override
        public void serialize(Json json) throws IOException {
        }

        @Override
        public void validateDefinition() throws QuickFixException {
        }

        @Override
        public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
            dependencies.addAll(dependents);
            dependencies.addAll(parents);
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
            return ownHash;
        }

        @Override
        public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
            supers.addAll(parents);
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
            Set<DefDescriptor<?>> deps = Sets.newLinkedHashSet();
            appendDependencies(deps);
            return deps;
        }
    }

    private static class TreePopulator {
        private SecureRandom random = new SecureRandom();
        private TestDef [] pool;
        private List<TestDef> definitions;
        private List<Integer> indexes;
        private Map<DefDescriptor<?>,TestDef> defMap = Maps.newHashMap();
        private final int poolSize;
        private final int maxParent;
        private final int maxDependent;
        private final int maxInTree;
        private int count;

        public TreePopulator(int poolSize, int maxParent, int maxDependent, int maxInTree) {
            this.pool = new TestDef[poolSize];
            this.poolSize = poolSize;
            this.maxParent = maxParent;
            this.maxDependent = maxDependent;
            this.maxInTree = maxInTree;
            this.definitions = Lists.newArrayList();
        }

        private TestDef populateTree(int idx) {
            if (pool[idx] != null) {
                return pool[idx];
            }
            TestDef current = new TestDef("test"+idx);
            pool[idx] = current;
            definitions.add(current);
            defMap.put(current.getDescriptor(), current);
            if (count < maxInTree) {
                int parentCount = random.nextInt(maxParent);
                int dependentCount = random.nextInt(maxDependent)+1;
                int i;
                count += parentCount+dependentCount;
                Collections.shuffle(indexes, random);
                for (i = 0; i < parentCount; i++) {
                    current.addParent(populateTree(indexes.get(i).intValue()).getDescriptor());
                }
                Collections.shuffle(indexes, random);
                for (i = 0; i < dependentCount; i++) {
                    current.addDependent(populateTree(indexes.get(i).intValue()).getDescriptor());
                }
            }
            return current;
        }

        public TestDef populateTree() {
            TestDef root;
            int i;

            this.indexes = Lists.newArrayList();
            for (i = 1; i < poolSize; i++) {
                this.indexes.add(Integer.valueOf(i));
            }
            root = populateTree(0);
            this.indexes = Lists.newArrayList();
            for (i = 0; i < poolSize; i++) {
                if (pool[i] != null) {
                    this.indexes.add(Integer.valueOf(i));
                }
            }
            return root;
        }

        public List<TestDef> getDefinitions() {
            return definitions;
        }

        public void randomFlip(int flipCount) {
            TestDef current;
            int i;

            Collections.shuffle(indexes, random);
            for (i = 0; i < flipCount; i++) {
                current = pool[indexes.get(i).intValue()];
                current.flip();
            }
        }

        private StringBuffer recursiveToString(StringBuffer text, TestDef current,
                Set<DefDescriptor<?>> stack, String tabs) {
            String nextTabs = tabs+"\t";
            DefDescriptor<?> descriptor = current.getDescriptor();

            text.append(tabs);
            text.append(descriptor);
            text.append("\n");
            if (stack.contains(descriptor)) {
                return text;
            }
            stack.add(descriptor);
            text.append(tabs);
            text.append("Parents:\n");
            for (DefDescriptor<?> parent : current.getParents()) {
                recursiveToString(text, defMap.get(parent), stack, nextTabs);
            }
            text.append(tabs);
            text.append("Dependents:\n");
            for (DefDescriptor<?> dependent : current.getDependents()) {
                recursiveToString(text, defMap.get(dependent), stack, nextTabs);
            }
            stack.remove(descriptor);
            return text;
        }

        @Override
        public String toString() {
            return recursiveToString(new StringBuffer(), pool[0], Sets.newHashSet(), "").toString();
        }
    };

    private String buildLinkedString(String header, List<LinkingDefinition<?>> linked) {
        StringBuffer sb = new StringBuffer(header);
        sb.append("\n");
        for (LinkingDefinition<?> ld : linked) {
            sb.append("\t");
            sb.append(ld.toString());
            sb.append("\n");
        }
        return sb.toString();
    }

    private String buildLinkedNoLevelString(String header, List<LinkingDefinition<?>> linked) {
        StringBuffer sb = new StringBuffer(header);
        sb.append("\n");
        for (LinkingDefinition<?> ld : linked) {
            sb.append("\t");
            sb.append(ld.toNoLevelString());
            sb.append("\n");
        }
        return sb.toString();
    }

    private AuraLinker getPopulatedLinker(List<TestDef> definitions, TestDef root) {
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        LoggingService loggingService = Mockito.mock(LoggingService.class);
        AccessChecker accessChecker = Mockito.mock(AccessChecker.class);
        RegistrySet registries = Mockito.mock(RegistrySet.class);
        DefRegistry registry = new StaticDefRegistryImpl(Sets.newHashSet(), Sets.newHashSet(), Sets.newHashSet(),
                definitions);
        Mockito.doReturn(registry).when(registries).getRegistryFor(Matchers.any());
        AuraLocalStore localStore = Mockito.mock(AuraLocalStore.class);
        @SuppressWarnings("unchecked")
        Cache<DefDescriptor<?>, Optional<? extends Definition>> defsCache = Mockito.mock(Cache.class);
        return new AuraLinker(root.getDescriptor(), defsCache, null,
                loggingService, configAdapter, accessChecker, localStore, null, registries);
    }

    // This is here to allow tests to be run easily, it does a random set of dependencies and
    // checks for consistency.
    public void testLinkOrderConsistencyRandom() throws Exception {
        int i, j;

        for (i = 0; i < 1000; i++) {
            //TreePopulator populator = new TreePopulator(100, 3, 10, 100);
            TreePopulator populator = new TreePopulator(20, 2, 5, 20);
            TestDef root = populator.populateTree();

            AuraLinker linker = getPopulatedLinker(populator.getDefinitions(), root);

            linker.linkDefinition(root.getDescriptor(), false);
            String verifiedBase = buildLinkedString("VERIFY SORT", linker.getNameSort());
            String leveledBase = buildLinkedString("LEVEL SORT", linker.getDepthSort());
            String treeBase = populator.toString();

            for (j = 0; j < 5; j++) {
                populator.randomFlip(1);
                linker = getPopulatedLinker(populator.getDefinitions(), root);
                linker.linkDefinition(root.getDescriptor(), false);
                String verified = buildLinkedString("VERIFY SORT", linker.getNameSort());
                String leveled = buildLinkedString("LEVEL SORT", linker.getDepthSort());
                String tree = populator.toString();
                if (!verifiedBase.equals(verified)) {
                    String origStuff = treeBase+"\n\n"+verifiedBase;
                    String newStuff = tree+"\n\n"+verified;
                    Assert.assertEquals(origStuff, newStuff);
                }
                if (!leveledBase.equals(leveled)) {
                    String origStuff = treeBase+"\n\n"+leveledBase;
                    String newStuff = tree+"\n\n"+leveled;
                    Assert.assertEquals(origStuff, newStuff);
                }
            }
        }
    }

    /**
     * Test one of our pathological cases.
     *
     * appplication -> template -> html -> component
     *              -> component -> template -> html
     */
    @Test
    public void testLinkOrderConsistencyFixedForName() throws Exception {
        TestDef application = new TestDef("application");
        TestDef template = new TestDef("template");
        TestDef component = new TestDef("component");
        TestDef html = new TestDef("html");

        application.addDependent(component.getDescriptor());
        application.addDependent(template.getDescriptor());

        component.addDependent(template.getDescriptor());

        template.addDependent(html.getDescriptor());
        template.addDependent(component.getDescriptor());

        html.addDependent(component.getDescriptor());

        List<TestDef> definitions = Lists.newArrayList();
        definitions.add(application);
        definitions.add(template);
        definitions.add(component);
        definitions.add(html);

        AuraLinker linker = getPopulatedLinker(definitions, application);
        linker.linkDefinition(application.getDescriptor(), false);
        String verifiedBase = buildLinkedNoLevelString("VERIFY SORT", linker.getNameSort());

        application.flip();
        linker = getPopulatedLinker(definitions, application);
        linker.linkDefinition(application.getDescriptor(), false);
        String verified = buildLinkedNoLevelString("VERIFY SORT", linker.getNameSort());

        Assert.assertEquals(verifiedBase, verified);
    }

    //@Test
    //@XFailure
    public void testLinkOrderConsistencyFixedForLevel() throws Exception {
        TestDef application = new TestDef("application");
        TestDef template = new TestDef("template");
        TestDef component = new TestDef("component");
        TestDef html = new TestDef("html");

        application.addDependent(component.getDescriptor());
        application.addDependent(template.getDescriptor());

        component.addDependent(template.getDescriptor());

        template.addDependent(html.getDescriptor());
        template.addDependent(component.getDescriptor());

        html.addDependent(component.getDescriptor());

        List<TestDef> definitions = Lists.newArrayList();
        definitions.add(application);
        definitions.add(template);
        definitions.add(component);
        definitions.add(html);

        AuraLinker linker = getPopulatedLinker(definitions, application);
        linker.linkDefinition(application.getDescriptor(), false);
        String leveledBase = buildLinkedString("LEVEL SORT", linker.getDepthSort());

        application.flip();
        linker = getPopulatedLinker(definitions, application);
        linker.linkDefinition(application.getDescriptor(), false);
        String leveled = buildLinkedString("LEVEL SORT", linker.getDepthSort());

        Assert.assertEquals(leveledBase, leveled);
    }
}
