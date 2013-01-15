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
import java.util.Set;

import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.throwable.ClientOutOfSyncException;

import com.google.common.collect.Lists;

/**
 * @see org.auraframework.impl.registry.RootDefFactoryTest
 */
public class MasterDefRegistryImplTest extends AuraImplTestCase {
    private final String baseContents = "<aura:application></aura:application>";

    public MasterDefRegistryImplTest(String name) {
        super(name);
    }

    private MasterDefRegistryImpl getDefRegistry() {
        Collection<RegistryAdapter> providers = AuraImpl.getRegistryAdapters();
        List<DefRegistry<?>> mdrregs = Lists.newArrayList();

        for (RegistryAdapter provider : providers) {
            DefRegistry<?>[] registries = provider.getRegistries(Mode.DEV, Access.AUTHENTICATED, null);
            if (registries != null) {
                for (DefRegistry<?> reg : registries) {
                    Set<String> ns = reg.getNamespaces();

                    if (ns != null && ns.contains("aura") || ns.contains("*")) {
                        mdrregs.add(reg);
                    }
                }
            }
        }
        return new MasterDefRegistryImpl(mdrregs.toArray(new DefRegistry<?>[mdrregs.size()]));
    }

    public void testFindRegex() throws Exception {
        String namespace = "testFindRegex" + auraTestingUtil.getNonce();
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class, baseContents,
                String.format("%s:houseboat", namespace));
        addSourceAutoCleanup(ApplicationDef.class, baseContents, String.format("%s:houseparty", namespace));
        addSourceAutoCleanup(ApplicationDef.class, baseContents, String.format("%s:pantsparty", namespace));

        MasterDefRegistryImpl masterDefReg = getDefRegistry();

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
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class, baseContents,
                String.format("%s:houseboat", namespace));
        MasterDefRegistryImpl masterDefReg = getDefRegistry();
        String uid = masterDefReg.getUid(null, houseboat);
        assertNull("Found string in new MDR", masterDefReg.getCachedString(uid, houseboat, "test1"));
        masterDefReg.putCachedString(uid, houseboat, "test1", "value");
        assertEquals("value", masterDefReg.getCachedString(uid, houseboat, "test1"));
    }

    public void testUidChanges() throws Exception {
        String namespace = "testStringCache" + auraTestingUtil.getNonce();
        String namePrefix = String.format("%s:houseboat", namespace);
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class, baseContents, namePrefix);
        MasterDefRegistryImpl masterDefReg = getDefRegistry();
        String uid = masterDefReg.getUid(null, houseboat);
        assertNotNull(uid);
        // Check unchanged app gets same UID value
        assertEquals(uid, masterDefReg.getUid(uid, houseboat));

        // Check asking with an incorrect "old UID" would throw
        try {
            String newUid = masterDefReg.getUid(uid + " or not", houseboat);
            fail(String.format("Should have thrown when fetching from non-null stale UID, but returned %s (was %s)",
                    newUid, uid));
        } catch (ClientOutOfSyncException e) {
            // pass.
        }
    }
}
