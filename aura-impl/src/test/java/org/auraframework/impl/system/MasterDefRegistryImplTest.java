/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.io.File;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.concurrent.TimeUnit;

import org.auraframework.Aura;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.XMLHandler.InvalidSystemAttributeException;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.service.BuilderService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Source;
import org.auraframework.test.util.AuraPrivateAccessor;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.mockito.Mockito;
import org.mockito.internal.util.MockUtil;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import com.google.common.cache.Cache;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * @see org.auraframework.impl.registry.RootDefFactoryTest
 */
public class MasterDefRegistryImplTest extends AuraImplTestCase {
    public MasterDefRegistryImplTest(String name) {
        super(name);
    }

    private MasterDefRegistryImpl getDefRegistry(boolean asMocks) {
        Collection<RegistryAdapter> providers = AuraImpl.getRegistryAdapters();
        List<DefRegistry<?>> mdrregs = Lists.newArrayList();

        AuraContext context = Aura.getContextService().getCurrentContext();
        for (RegistryAdapter provider : providers) {
            DefRegistry<?>[] registries = provider.getRegistries(context.getMode(), context.getAccess(), null);
            if (registries != null) {
                for (DefRegistry<?> reg : registries) {
                    Set<String> ns = reg.getNamespaces();

                    if (ns != null && ns.contains("aura") || ns.contains("*")) {
                        mdrregs.add(asMocks ? Mockito.spy(reg) : reg);
                    }
                }
            }
        }
        MasterDefRegistryImpl registry = new MasterDefRegistryImpl(mdrregs.toArray(new DefRegistry<?>[mdrregs.size()]));
        return asMocks ? Mockito.spy(registry) : registry;
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    private void spyOnDefs(final MasterDefRegistryImpl registry) throws QuickFixException {
        final MockUtil mockUtil = new MockUtil();
        for (DefRegistry<?> subReg : registry.getAllRegistries()) {
            Mockito.doAnswer(new Answer<Definition>() {
                @Override
                public Definition answer(InvocationOnMock invocation) throws Throwable {
                    Definition ret = (Definition) invocation.callRealMethod();
                    if (mockUtil.isMock(ret)) {
                        return ret;
                    } else {
                        ret = Mockito.spy(ret);
                        registry.addLocalDef(ret);
                        return ret;
                    }
                }
            }).when(subReg).getDef(Mockito.<DefDescriptor> any());
        }
    }

    /**
     * Verify some of the assertions (copied here) made by compileDef (excluding #2 & #5).
     * <ol>
     * <li>Each definition has 'validateDefinition()' called on it exactly once.</li>
     * <li>No definition is marked as valid until all definitions in the dependency set have been validated</li>
     * <li>Each definition has 'validateReferences()' called on it exactly once, after the definitions have been put in
     * local cache</li>
     * <li>All definitions are marked valid by the DefRegistry after the validation is complete</li>
     * <li>No definition should be available to other threads until it is marked valid</li>
     * <ol>
     */
    private void assertCompiledDef(Definition def) throws QuickFixException {
        Mockito.verify(def, Mockito.times(1)).validateDefinition();
        Mockito.verify(def, Mockito.times(1)).validateReferences();
        Mockito.verify(def, Mockito.times(1)).markValid();
        assertEquals("definition not valid: " + def, true, def.isValid());
    }

    private void assertIdenticalDependencies(DefDescriptor<?> desc1, DefDescriptor<?> desc2) throws Exception {
        MasterDefRegistryImpl registry = getDefRegistry(false);
        Set<DefDescriptor<?>> deps1 = registry.getDependencies(registry.getUid(null, desc1));
        Set<DefDescriptor<?>> deps2 = registry.getDependencies(registry.getUid(null, desc2));
        assertNotNull(deps1);
        assertNotNull(deps2);
        assertEquals("Descriptors should have the same number of dependencies", deps1.size(), deps2.size());

        // Loop through and check individual dependencies. Order doesn't matter.
        for (DefDescriptor<?> dep : deps1) {
            assertTrue("Descriptors do not have identical dependencies",
                    checkDependenciesContains(deps2, dep.getQualifiedName()));
        }
    }

    private boolean checkDependenciesContains(Set<DefDescriptor<?>> deps, String depSearch) {
        for (DefDescriptor<?> dep : deps) {
            if (dep.getQualifiedName().equals(depSearch)) {
                return true;
            }
        }
        return false;
    }

    private void updateStringSource(DefDescriptor<?> desc, String content) {
        Source<?> src = StringSourceLoader.getInstance().getSource(desc);
        src.addOrUpdate(content);
    }

    public void testFindRegex() throws Exception {
        String namespace = "testFindRegex" + auraTestingUtil.getNonce();
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "", ""), String.format("%s:houseboat", namespace));
        addSourceAutoCleanup(ApplicationDef.class, String.format(baseApplicationTag, "", ""),
                String.format("%s:houseparty", namespace));
        addSourceAutoCleanup(ApplicationDef.class, String.format(baseApplicationTag, "", ""),
                String.format("%s:pantsparty", namespace));

        MasterDefRegistryImpl masterDefReg = getDefRegistry(false);

        assertTrue("find() not finding all sources",
                masterDefReg.find(new DescriptorFilter(String.format("markup://%s:*", namespace))).size() == 3);
        assertEquals("find() fails with wildcard as prefix", 1,
                masterDefReg.find(new DescriptorFilter("*://" + houseboat.getDescriptorName())).size());
        assertEquals("find() fails with wildcard as namespace", 1,
                masterDefReg.find(new DescriptorFilter("markup://*:" + houseboat.getName())).size());
        assertEquals("find() fails with wildcard as name", 1,
                masterDefReg.find(new DescriptorFilter(houseboat.getQualifiedName())).size());
        assertEquals("find() fails with wildcard at end of name", 2,
                masterDefReg.find(new DescriptorFilter(String.format("markup://%s:house*", namespace))).size());
        assertEquals("find() fails with wildcard at beginning of name", 2,
                masterDefReg.find(new DescriptorFilter(String.format("markup://%s:*party*", namespace))).size());

        assertEquals("find() should not find nonexistent name", 0,
                masterDefReg.find(new DescriptorFilter(String.format("markup://%s:househunters", namespace))).size());
        assertEquals("find() should not find nonexistent name ending with wildcard", 0,
                masterDefReg.find(new DescriptorFilter(String.format("markup://%s:househunters*", namespace))).size());
        assertEquals("find() should not find nonexistent name with preceeding wildcard", 0,
                masterDefReg.find(new DescriptorFilter(String.format("markup://%s:*notherecaptain", namespace))).size());
    }

    public void testStringCache() throws Exception {
        String namespace = "testStringCache" + auraTestingUtil.getNonce();
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "", ""), String.format("%s:houseboat", namespace));
        MasterDefRegistryImpl masterDefReg = getDefRegistry(false);
        String uid = masterDefReg.getUid(null, houseboat);
        assertNull("Found string in new MDR", masterDefReg.getCachedString(uid, houseboat, "test1"));
        masterDefReg.putCachedString(uid, houseboat, "test1", "value");
        assertEquals("value", masterDefReg.getCachedString(uid, houseboat, "test1"));
    }

    public void testGetUidClientOutOfSync() throws Exception {
        String namespace = "testStringCache" + auraTestingUtil.getNonce();
        String namePrefix = String.format("%s:houseboat", namespace);
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "", ""), namePrefix);
        MasterDefRegistryImpl masterDefReg = getDefRegistry(false);
        String uid = masterDefReg.getUid(null, houseboat);
        assertNotNull(uid);
        // Check unchanged app gets same UID value
        assertEquals(uid, masterDefReg.getUid(uid, houseboat));

        //
        // When given an incorrect UID, masterDefReg simply returns the correct one.
        String newUid = masterDefReg.getUid(uid + " or not", houseboat);
        assertEquals(uid, newUid);
    }

    /**
     * Verify getting the UID of a dependency doesn't affect the original UID.
     */
    public void testUidDependencies() throws Exception {
        DefDescriptor<ComponentDef> child = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component></aura:component>", "testUidDependenciesChild");
        DefDescriptor<ApplicationDef> parent = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application><" + child.getDescriptorName() + "/></aura:application>",
                "testUidDependenciesParent");

        MasterDefRegistryImpl masterDefReg1 = getDefRegistry(false);
        String parentUid1 = masterDefReg1.getUid(null, parent);

        MasterDefRegistryImpl masterDefReg2 = getDefRegistry(false);
        masterDefReg2.getUid(null, child);
        String parentUid2 = masterDefReg2.getUid(null, parent);

        assertTrue("UIDs do not match after getting a dependencies UID", parentUid1.equals(parentUid2));
    }

    /**
     * Verify UID values and dependencies against a gold file.
     * 
     * This does a recursive set of dependencies checks to build a gold file with the resulting descriptors and UIDs to
     * ensure that we get both a valid set and can tell what changed (and thus verify that it should have changed).
     * 
     * The format of the file is:
     * <ul>
     * <li>Top level descriptor ':' global UID.
     * <li>
     * <li>dependency ':' own hash
     * <li>
     * <li>...</li>
     * </ul>
     */
    public void testUidValue() throws Exception {
        StringBuilder buffer = new StringBuilder();
        String cmpName = "test:layoutNoLayout";
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService()
                .getDefDescriptor(cmpName, ApplicationDef.class);
        MasterDefRegistryImpl masterDefReg = getDefRegistry(false);
        Aura.getContextService().getCurrentContext().clearPreloads();
        String uid = masterDefReg.getUid(null, desc);
        assertNotNull("Could not retrieve UID for component " + cmpName, uid);
        Set<DefDescriptor<?>> dependencies = masterDefReg.getDependencies(uid);
        assertNotNull("Could not retrieve dependencies for component " + cmpName, dependencies);

        buffer.append(desc.toString());
        buffer.append(" : ");
        buffer.append(uid);
        buffer.append("\n");

        SortedSet<DefDescriptor<?>> sorted = Sets.newTreeSet(dependencies);
        for (DefDescriptor<?> dep : sorted) {
            buffer.append(dep);
            buffer.append(" : ");
            buffer.append(masterDefReg.getDef(dep).getOwnHash());
            buffer.append("\n");
        }
        goldFileText(buffer.toString());
    }

    public void testGetUidDescriptorNull() throws Exception {
        MasterDefRegistryImpl registry = getDefRegistry(false);
        assertNull(registry.getUid(null, null));
    }

    public void testGetUidDescriptorDoesntExist() throws Exception {
        MasterDefRegistryImpl registry = getDefRegistry(false);
        assertNull(registry.getUid(null, DefDescriptorImpl.getInstance("unknown:soldier", ComponentDef.class)));
    }

    public void testGetUidLocalDef() throws Exception {
        MasterDefRegistryImpl registry = getDefRegistry(false);
        ComponentDef def = Mockito.spy(registry.getDef(DefDescriptorImpl.getInstance("aura:component",
                ComponentDef.class)));
        registry.invalidate(null); // clear any cached results from the preceding getDef call
        registry = getDefRegistry(false);
        registry.addLocalDef(def);
        assertNotNull(registry.getUid(null, def.getDescriptor()));
    }

    public void testGetUidSameAcrossInstances() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        MasterDefRegistryImpl registry1 = getDefRegistry(false);
        String uid1 = registry1.getUid(null, cmpDesc);
        MasterDefRegistryImpl registry2 = getDefRegistry(false);
        registry2.invalidate(null);
        String uid2 = registry2.getUid(null, cmpDesc);
        assertEquals("Expected same UID for def from separate registry instances", uid1, uid2);
    }

    public void testGetUidUnique() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc1 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> cmpDesc2 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        MasterDefRegistryImpl registry = getDefRegistry(false);
        String uid1 = registry.getUid(null, cmpDesc1);
        String uid2 = registry.getUid(null, cmpDesc2);
        assertTrue("Components with same markup and dependencies should have different UIDs", !uid1.equals(uid2));
    }

    public void testGetUidCachedForChangedDefinition() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        MasterDefRegistryImpl registry = getDefRegistry(false);
        String uid = registry.getUid(null, cmpDesc);

        // UID cached for current registry
        registry.getSource(cmpDesc).addOrUpdate(
                "<aura:component><aura:attribute name='str' type='String'/></aura:component>");
        String uidNew = registry.getUid(null, cmpDesc);
        assertEquals("UID not cached", uid, uidNew);

        // UID not cached for new registry
        MasterDefRegistryImpl registryNext = getDefRegistry(false);
        String uidNext = registryNext.getUid(null, cmpDesc);
        assertFalse("UID not cached in new registry", uid.equals(uidNext));
    }

    public void testGetUidCachedForRemovedDefinition() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = StringSourceLoader.getInstance()
                .addSource(ComponentDef.class, "<aura:component/>", null).getDescriptor();
        DefDescriptor<ComponentDef> rmDesc = cmpDesc;
        try {
            MasterDefRegistryImpl registry = getDefRegistry(false);
            String uid = registry.getUid(null, cmpDesc);

            // UID cached for current registry
            StringSourceLoader.getInstance().removeSource(cmpDesc);
            rmDesc = null;
            String uidNew = registry.getUid(null, cmpDesc);
            assertEquals("UID not cached", uid, uidNew);

            // UID not cached for new registry
            MasterDefRegistryImpl registryNext = getDefRegistry(false);
            String uidNext = registryNext.getUid(null, cmpDesc);
            assertNull("UID cached in new registry", uidNext);
        } finally {
            if (rmDesc != null) {
                StringSourceLoader.getInstance().removeSource(cmpDesc);
            }
        }
    }

    public void testGetUidForQuickFixException() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = StringSourceLoader.getInstance()
                .addSource(ComponentDef.class, "<aura:component><unknown:component/></aura:component>", null)
                .getDescriptor();
        MasterDefRegistryImpl registry = getDefRegistry(true);
        try {
            registry.getUid(null, cmpDesc);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            checkExceptionStart(e, null, "No COMPONENT named markup://unknown:component found");
        }
        Mockito.verify(registry, Mockito.times(1)).compileDef(Mockito.eq(cmpDesc),
                Mockito.<Map<DefDescriptor<?>, Definition>> any());

        // another request for getUid will not re-compile
        Mockito.reset(registry);
        try {
            registry.getUid(null, cmpDesc);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            checkExceptionStart(e, null, "No COMPONENT named markup://unknown:component found");
        }
        Mockito.verify(registry, Mockito.times(0)).compileDef(Mockito.eq(cmpDesc),
                Mockito.<Map<DefDescriptor<?>, Definition>> any());
    }

    public void testGetUidForNonQuickFixException() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = StringSourceLoader.getInstance()
                .addSource(ComponentDef.class, "<aura:component invalidAttribute=''/>", null).getDescriptor();
        MasterDefRegistryImpl registry = getDefRegistry(true);
        try {
            registry.getUid(null, cmpDesc);
            fail("Expected InvalidSystemAttributeException");
        } catch (InvalidSystemAttributeException e) {
            checkExceptionFull(e, null,
                    String.format("%s:1,38: Invalid attribute \"invalidAttribute\"", cmpDesc.getQualifiedName()));
        }

        // another request for getUid will re-compile again
        Mockito.reset(registry);
        try {
            registry.getUid(null, cmpDesc);
            fail("Expected InvalidSystemAttributeException");
        } catch (InvalidSystemAttributeException e) {
            checkExceptionFull(e, null,
                    String.format("%s:1,38: Invalid attribute \"invalidAttribute\"", cmpDesc.getQualifiedName()));
        }
        Mockito.verify(registry, Mockito.times(1)).compileDef(Mockito.eq(cmpDesc),
                Mockito.<Map<DefDescriptor<?>, Definition>> any());
    }

    public void testCompileDef() throws Exception {
        // create test component with 2 explicit dependencies
        DefDescriptor<ComponentDef> cmpDesc1 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> cmpDesc2 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "",
                        String.format("<%s/><%s/>", cmpDesc1.getDescriptorName(), cmpDesc2.getDescriptorName())));

        // spy on MDR
        final MasterDefRegistryImpl registry = getDefRegistry(true);
        registry.invalidate(null);
        spyOnDefs(registry);

        // get def UID to trigger compileDef, etc.
        String uid = registry.getUid(null, cmpDesc);
        assertNotNull(uid);
        ComponentDef def = registry.getDef(cmpDesc);
        assertNotNull(def);
        Mockito.verify(registry, Mockito.times(1)).compileDef(Mockito.eq(cmpDesc),
                Mockito.<Map<DefDescriptor<?>, Definition>> any());
        assertCompiledDef(def);

        // check all dependencies
        MockUtil mockUtil = new MockUtil();
        Set<DefDescriptor<?>> dependencies = registry.getDependencies(uid);
        for (DefDescriptor<?> dep : dependencies) {
            Definition depDef = registry.getDef(dep);
            if (mockUtil.isMock(depDef)) {
                // why not controllers?
                if (dep.getDefType().equals(DefType.CONTROLLER)) {
                    continue;
                }
                assertCompiledDef(depDef);
            }
        }
    }

    public void testCompileDefLocalDef() throws Exception {
        // build a mock def
        String descName = String.format("%s:ghost", System.nanoTime());
        Definition def = Mockito.mock(RootDefinition.class);
        Mockito.doReturn(DefDescriptorImpl.getInstance(descName, ComponentDef.class)).when(def).getDescriptor();

        // spy on MDR's registries to spy on defs
        final MasterDefRegistryImpl registry = getDefRegistry(true);
        registry.invalidate(null);
        spyOnDefs(registry);
        registry.addLocalDef(def);

        // get def UID to trigger compileDef, etc.
        String uid = registry.getUid(null, def.getDescriptor());
        assertNotNull(uid);
        Mockito.verify(registry, Mockito.times(1)).compileDef(Mockito.eq(def.getDescriptor()),
                Mockito.<Map<DefDescriptor<?>, Definition>> any());
        Mockito.doReturn(true).when(def).isValid();
        assertCompiledDef(def);

        // check all dependencies
        MockUtil mockUtil = new MockUtil();
        Set<DefDescriptor<?>> dependencies = registry.getDependencies(uid);
        for (DefDescriptor<?> dep : dependencies) {
            Definition depDef = registry.getDef(dep);
            if (mockUtil.isMock(depDef)) {
                assertCompiledDef(depDef);
            }
        }
    }

    public void testCompileDefOnlyOnce() throws Exception {
        // getDef on registry should compile the def
        String cmpContent = "<aura:component/>";
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpContent);
        MasterDefRegistryImpl registry = getDefRegistry(true);
        registry.getDef(cmpDesc);
        Mockito.verify(registry, Mockito.times(1)).compileDef(Mockito.eq(cmpDesc),
                Mockito.<Map<DefDescriptor<?>, Definition>> any());

        // another getDef on same registry should not re-compile the def
        Mockito.reset(registry);
        assertNotNull(registry.getDef(cmpDesc));
        Mockito.verify(registry, Mockito.times(0)).compileDef(Mockito.eq(cmpDesc),
                Mockito.<Map<DefDescriptor<?>, Definition>> any());

        // another getDef on other registry instance should re-compile the def
        registry = getDefRegistry(true);
        assertNotNull(registry.getDef(cmpDesc));
        Mockito.verify(registry, Mockito.times(1)).compileDef(Mockito.eq(cmpDesc),
                Mockito.<Map<DefDescriptor<?>, Definition>> any());
    }

    public void testGetDefDescriptorNull() throws Exception {
        MasterDefRegistryImpl registry = getDefRegistry(false);
        assertNull(registry.getDef(null));
    }

    public void testGetDefDescriptorDoesntExist() throws Exception {
        MasterDefRegistryImpl registry = getDefRegistry(false);
        assertNull(registry.getDef(DefDescriptorImpl.getInstance("unknown:soldier", ComponentDef.class)));
    }

    public void testGetDefCachedForChangedDefinition() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        MasterDefRegistryImpl registry = getDefRegistry(false);
        ComponentDef def = registry.getDef(cmpDesc);
        assertNull(def.getAttributeDef("str"));

        // Definition cached for current registry
        registry.getSource(cmpDesc).addOrUpdate(
                "<aura:component><aura:attribute name='str' type='String'/></aura:component>");
        ComponentDef defNew = registry.getDef(cmpDesc);
        assertNull(defNew.getAttributeDef("str"));

        // Definition not cached for new registry
        MasterDefRegistryImpl registryNext = getDefRegistry(false);
        ComponentDef defNext = registryNext.getDef(cmpDesc);
        assertNotNull(defNext.getAttributeDef("str"));
    }

    public void testGetDefCachedForRemovedDefinition() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = StringSourceLoader.getInstance()
                .addSource(ComponentDef.class, "<aura:component/>", null).getDescriptor();
        DefDescriptor<ComponentDef> rmDesc = cmpDesc;
        try {
            MasterDefRegistryImpl registry = getDefRegistry(false);
            ComponentDef def = registry.getDef(cmpDesc);
            assertNotNull(def);

            // Definition cached for current registry
            StringSourceLoader.getInstance().removeSource(cmpDesc);
            rmDesc = null;
            ComponentDef defNew = registry.getDef(cmpDesc);
            assertNotNull(defNew);

            // Definition not cached for new registry
            MasterDefRegistryImpl registryNext = getDefRegistry(false);
            ComponentDef defNext = registryNext.getDef(cmpDesc);
            assertNull(defNext);
        } finally {
            if (rmDesc != null) {
                StringSourceLoader.getInstance().removeSource(cmpDesc);
            }
        }
    }

    /**
     * Circular dependencies case 1: A has inner component B, and B has an explicit dependency on A (via aura:dependency
     * tag)
     */
    public void testCircularDependenciesInnerCmp() throws Exception {
        DefDescriptor<ComponentDef> cmpDescA = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> cmpDescB = addSourceAutoCleanup(
                ComponentDef.class,
                String.format("<aura:component><aura:dependency resource=\"%s\"/></aura:component>",
                        cmpDescA.getQualifiedName()));
        updateStringSource(cmpDescA,
                String.format("<aura:component><%s/></aura:component>", cmpDescB.getDescriptorName()));
        // Circular dependency cases should result in identical dependencies
        assertIdenticalDependencies(cmpDescA, cmpDescB);
    }

    /**
     * Circular dependencies case 2: D extends C, and C has explicit dependency on D (via aura:dependency tag)
     */
    public void testCircularDependenciesExtendsCmp() throws Exception {
        DefDescriptor<ComponentDef> cmpDescC = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> cmpDescD = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component extends=\"%s\"/>", cmpDescC.getDescriptorName()));
        updateStringSource(
                cmpDescC,
                String.format(
                        "<aura:component extensible=\"true\"><aura:dependency resource=\"%s\"/></aura:component>",
                        cmpDescD.getQualifiedName()));
        // Circular dependency cases should result in identical dependencies
        assertIdenticalDependencies(cmpDescC, cmpDescD);
    }

    /**
     * Circular dependencies case 3: E has dependency on F, and F has dependency on E (both through aura:dependency tag)
     */
    public void testCircularDependenciesDepTag() throws Exception {
        DefDescriptor<ComponentDef> cmpDescE = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> cmpDescF = addSourceAutoCleanup(
                ComponentDef.class,
                String.format("<aura:component><aura:dependency resource=\"%s\"/></aura:component>",
                        cmpDescE.getQualifiedName()));
        updateStringSource(
                cmpDescE,
                String.format("<aura:component><aura:dependency resource=\"%s\"/></aura:component>",
                        cmpDescF.getQualifiedName()));
        // Circular dependency cases should result in identical dependencies
        assertIdenticalDependencies(cmpDescE, cmpDescF);
    }

    /**
     * Verify correct dependencies are attached to a component.
     */
    public void testGetDependencies() throws Exception {
        DefDescriptor<ComponentDef> depCmpDesc1 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> depCmpDesc2 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> cmpDesc1 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        // Manually add dependency to inner component
        DefDescriptor<ComponentDef> cmpDesc2 = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:dependency resource=\"" + depCmpDesc1.getQualifiedName()
                        + "\"/></aura:component>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "",
                        String.format("<aura:dependency resource=\"" + depCmpDesc2.getQualifiedName()
                                + "\"/><%s/><%s/>",
                                cmpDesc1.getDescriptorName(), cmpDesc2.getDescriptorName())));

        MasterDefRegistryImpl registry = getDefRegistry(false);
        String uid = registry.getUid(null, cmpDesc);
        Set<DefDescriptor<?>> deps = registry.getDependencies(uid);
        assertTrue("Component should have dependency on aura:component by default",
                checkDependenciesContains(deps, "markup://aura:component"));
        assertTrue("Component should have dependency on aura:rootComponent by default",
                checkDependenciesContains(deps, "markup://aura:rootComponent"));
        assertTrue("Component should not have a dependency on aura:application",
                !checkDependenciesContains(deps, "markup://aura:application"));
        assertTrue("No dependency on self found in Component",
                checkDependenciesContains(deps, cmpDesc.getQualifiedName()));
        assertTrue("Dependency on inner component not found",
                checkDependenciesContains(deps, cmpDesc1.getQualifiedName()));
        assertTrue("Dependency on inner component not found",
                checkDependenciesContains(deps, cmpDesc2.getQualifiedName()));
        assertTrue("Explicitly declared dependency on inner component not found",
                checkDependenciesContains(deps, depCmpDesc1.getQualifiedName()));
        assertTrue("Explicitly declared dependency on top level component not found",
                checkDependenciesContains(deps, depCmpDesc2.getQualifiedName()));
    }

    /**
     * Check access assertion on abstract applications.
     */
    public void testAssertAcessAbstractApp() throws Exception {
        DefDescriptor<ApplicationDef> abApp = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application abstract=\"true\"/>");
        DefDescriptor<ApplicationDef> app = addSourceAutoCleanup(ApplicationDef.class,
                String.format("<aura:application extends=\"%s:%s\"/>", abApp.getNamespace(), abApp.getName()));
        DefDescriptor<ApplicationDef> auraApp = Aura.getDefinitionService().getDefDescriptor(
                "markup://aura:application",
                ApplicationDef.class);
        MasterDefRegistryImpl mdr = getDefRegistry(false);
        AuraContext context = Aura.getContextService().getCurrentContext();

        //
        // Check aura:application for failure first, as it will get put in the cache later.
        //
        context.setApplicationDescriptor(auraApp);
        try {
            mdr.assertAccess(auraApp);
            fail("should fail to grant access to aura:application");
        } catch (NoAccessException nae) {
            assertTrue("exception should say something about abstract",
                    nae.getMessage().contains("Abstract definition"));
        }

        //
        // Check for failure when abstract app is top level.
        //
        context.setApplicationDescriptor(abApp);
        try {
            mdr.assertAccess(abApp);
            fail("should fail to grant access to an abstract application");
        } catch (NoAccessException nae) {
            assertTrue("exception should say something about abstract",
                    nae.getMessage().contains("Abstract definition"));
        }
        mdr.assertAccess(auraApp);

        //
        // Check for success when non-abstract app is top level.
        //
        context.setApplicationDescriptor(app);
        mdr.assertAccess(app);
        mdr.assertAccess(abApp);
        mdr.assertAccess(auraApp);
    }

    /**
     * Check access assertion on abstract components.
     */
    public void testAssertAcessAbstractComponent() throws Exception {
        DefDescriptor<ComponentDef> abComp = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component abstract=\"true\"/>");
        DefDescriptor<ComponentDef> comp = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component extends=\"%s:%s\"/>", abComp.getNamespace(), abComp.getName()));
        MasterDefRegistryImpl mdr = getDefRegistry(false);
        AuraContext context = Aura.getContextService().getCurrentContext();

        //
        // Check for failure when abstract app is top level.
        //
        context.setApplicationDescriptor(abComp);
        try {
            mdr.assertAccess(abComp);
            fail("should fail to grant access to an abstract component");
        } catch (NoAccessException nae) {
            assertTrue("exception should say something about abstract",
                    nae.getMessage().contains("Abstract definition"));
        }

        //
        // Check for success when non-abstract app is top level.
        //
        context.setApplicationDescriptor(comp);
        mdr.assertAccess(comp);
        mdr.assertAccess(abComp);
    }

    /**
     * Verify that the file source listener picks up a newly created file and sends out a notification to clear the
     * proper caches.
     */
    public void testSourceChangeClearsCachesInDevMode() throws Exception {
        AuraContext currContext = Aura.getContextService().getCurrentContext();
        Aura.getContextService().startContext(Mode.DEV, currContext.getFormat(), currContext.getAccess());
        DefDescriptor<ComponentDef> cmpDesc = Aura.getDefinitionService().getDefDescriptor("test:deleteMeAfterTest",
                ComponentDef.class);

        // Make sure we have something in the caches before we check that they're cleared
        Aura.getDefinitionService().getDefDescriptor("test:text", ComponentDef.class).getDef();
        assertTrue("MasterDefRegistry should not be empty after calling getDef() on a component", !isMdrCacheEmpty());
        assertTrue("CachingDefRegistry should not be empty after calling getDef() on a component", !isCdrCacheEmpty());

        // Delete added files at end of test
        Source<?> source = Aura.getContextService().getCurrentContext().getDefRegistry().getSource(cmpDesc);
        File f = new File(source.getUrl().replace("file:", ""));
        deleteFileOnTeardown(f);
        deleteFileOnTeardown(f.getParentFile());

        // Save file to filesystem and wait for source change to clear caches
        BuilderService builderService = Aura.getBuilderService();
        ComponentDef def = builderService.getComponentDefBuilder().setDescriptor(cmpDesc).build();
        Aura.getDefinitionService().save(def);
        waitForCachesToClear();
    }

    /**
     * Wait for MasterDefRegistry and CachingDefRegistry caches to be cleared after a source change.
     */
    private void waitForCachesToClear() throws Exception {
        long startTime = System.nanoTime();
        long timeoutInMilliseconds = 10000;
        long intervalInMilliseconds = 100;
        while (TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startTime) < timeoutInMilliseconds) {
            if (isMdrCacheEmpty() && isCdrCacheEmpty()) {
                return;
            }
            Thread.sleep(intervalInMilliseconds);
        }
        fail("Caches did not clear within " + (timeoutInMilliseconds / 1000) + " seconds after a source change");
    }

    /**
     * Return true if the MasterDefRegistry static cache is empty. This does not take into account non-static
     * localDependencies cache.
     */
    private boolean isMdrCacheEmpty() throws Exception {
        Object dependencies = AuraPrivateAccessor.get(MasterDefRegistryImpl.class, "dependencies");
        Cache<?,?> c = (Cache<?,?>) dependencies;
        if (c.size() == 0) {
            return true;
        }
        return false;
    }

    /**
     * Return true if all CachingDefRegistry caches are empty, false otherwise.
     */
    private boolean isCdrCacheEmpty() throws Exception {
        MasterDefRegistryImpl mdr = (MasterDefRegistryImpl) Aura.getContextService().getCurrentContext()
                .getDefRegistry();
        DefRegistry<?>[] regs = mdr.getAllRegistries();
        for (DefRegistry<?> dr : regs) {
            if (dr instanceof CachingDefRegistryImpl) {
                CachingDefRegistryImpl<? extends Definition> cdr = (CachingDefRegistryImpl<? extends Definition>) dr;
                Collection<?> defsCache = cdr.getCachedDefs();

                Object existsCache = AuraPrivateAccessor.get(cdr, "existsCache");
                @SuppressWarnings("unchecked")
                Cache<DefDescriptor<?>, Boolean> eCache = (Cache<DefDescriptor<?>, Boolean>) existsCache;

                if (!defsCache.isEmpty() && eCache.size() > 0) {
                    return false;
                }
            }
        }
        return true;
    }
}
