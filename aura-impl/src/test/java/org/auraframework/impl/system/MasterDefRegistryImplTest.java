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

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;

import org.auraframework.def.DescriptorMatcher;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.RootDefFactory;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.SourceLoader;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

/**
 * @see org.auraframework.impl.registry.RootDefFactoryTest
 */
public class MasterDefRegistryImplTest extends AuraImplTestCase {
    private String baseContents = "<aura:application></aura:application>";
    private Set<String> prefixes = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);
    private Set<DefType> defTypes = EnumSet.of(DefType.APPLICATION, DefType.COMPONENT);

    public MasterDefRegistryImplTest(String name) {
        super(name);
    }

    @SuppressWarnings("unchecked")
    public void testFindRegex() throws Exception {
        String namespace = "testFindRegex" + auraTestingUtil.getNonce();
        DefDescriptor<ApplicationDef> houseboat = addSourceAutoCleanup(ApplicationDef.class, baseContents,
                String.format("%s:houseboat", namespace));
        addSourceAutoCleanup(ApplicationDef.class, baseContents,
                String.format("%s:houseparty", namespace));
        addSourceAutoCleanup(ApplicationDef.class, baseContents,
                String.format("%s:pantsparty", namespace));

        StringSourceLoader loader =  StringSourceLoader.getInstance();
        List<SourceLoader> loaders = Lists.newArrayList((SourceLoader)loader);
        RootDefFactory factory = new RootDefFactory(new SourceFactory(loaders));
        NonCachingDefRegistryImpl nonCachDefReg = new NonCachingDefRegistryImpl(factory, defTypes, prefixes);
        MasterDefRegistryImpl masterDefReg = new MasterDefRegistryImpl(nonCachDefReg);

        assertTrue("find() not finding all sources",
                   masterDefReg.find(new DescriptorMatcher(String.format("markup://%s:*", namespace))).size() == 3);
        assertEquals("find() fails with wildcard as prefix", 1,
                     masterDefReg.find(new DescriptorMatcher("*://" + houseboat.getDescriptorName())).size());
        assertEquals("find() fails with wildcard as namespace", 1,
                     masterDefReg.find(new DescriptorMatcher("markup://*:" + houseboat.getName())).size());
        assertEquals("find() fails with wildcard as name", 1,
                     masterDefReg.find(new DescriptorMatcher(houseboat.getQualifiedName())).size());
        assertEquals("find() fails with wildcard at end of name", 2,
                     masterDefReg.find(new DescriptorMatcher(String.format("markup://%s:house*", namespace))).size());
        assertEquals("find() fails with wildcard at beginning of name", 2,
                     masterDefReg.find(new DescriptorMatcher(String.format("markup://%s:*party*", namespace))).size());

        assertEquals("find() should not find nonexistent name", 0,
                     masterDefReg.find(new DescriptorMatcher(String.format("markup://%s:househunters", namespace))).size());
        assertEquals("find() should not find nonexistent name ending with wildcard", 0,
                     masterDefReg.find(new DescriptorMatcher(String.format("markup://%s:househunters*", namespace))).size());
        assertEquals("find() should not find nonexistent name with preceeding wildcard", 0,
                     masterDefReg.find(new DescriptorMatcher(String.format("markup://%s:*notherecaptain", namespace))).size());
    }
}
