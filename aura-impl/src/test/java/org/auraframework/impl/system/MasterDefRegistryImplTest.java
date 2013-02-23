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

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
import org.auraframework.system.AuraContext;
import org.auraframework.system.DefRegistry;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Ignore;
import org.mockito.Mockito;
import org.mockito.internal.util.MockUtil;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import com.google.common.collect.Lists;

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
     * Verify getUid() returns the correct value. If the component itself, any of it's dependencies, or the logic to
     * calculate the UID are modified, then this hard-coded UID will need to be changed as well.
     */
    @Ignore("W-1551219")
    public void testUidValue() throws Exception {
        // Known UID, assuming no dependencies or the file itself have changed.
        String knownUid = "3VBCHFMNOup__UlHicckgg";
        String cmpName = "test:layoutNoLayout";
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService()
                .getDefDescriptor(cmpName, ApplicationDef.class);
        MasterDefRegistryImpl masterDefReg = getDefRegistry(false);
        String uid = masterDefReg.getUid(null, desc);
        assertNotNull("Could not retrieve UID for component " + cmpName, uid);
        assertEquals("Unexpected UID value on component " + cmpName, knownUid, uid);
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

        // UID also cached for new registry
        MasterDefRegistryImpl registryNext = getDefRegistry(false);
        String uidNext = registryNext.getUid(null, cmpDesc);
        assertEquals("UID not cached in new registry", uid, uidNext);
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
}
