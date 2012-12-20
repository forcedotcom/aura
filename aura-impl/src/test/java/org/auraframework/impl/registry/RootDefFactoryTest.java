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
package org.auraframework.impl.registry;

import java.util.List;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DescriptorMatcher;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.RootDefFactory;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.SourceLoader;

import com.google.common.collect.Lists;

public class RootDefFactoryTest extends AuraImplTestCase {
    // TODO FIXME This class needs to test RootDefFactory none of these objects should be instantiated outside of a test
    // context

    private String baseContents = "<aura:application></aura:application>";

    public RootDefFactoryTest(String name) {
        super(name);
    }

    public void testGetComponentDef() throws Exception {
        /*
         * FIXMEDLP
         */
    }

    /**
     * Test find(String) using regex's.
     */
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

        assertTrue("RootDefFactory should have a find() method", factory.hasFind());
        assertTrue("find() not finding all sources",
                   factory.find(new DescriptorMatcher(String.format("markup://%s:*", namespace))).size() == 3);
        assertEquals("find() fails with wildcard as prefix", 1,
                     factory.find(new DescriptorMatcher("*://" + houseboat.getDescriptorName())).size());
        assertEquals("find() fails with wildcard as namespace", 1,
                     factory.find(new DescriptorMatcher("markup://*:" + houseboat.getName())).size());
        assertEquals("find() fails with wildcard as name", 1,
                     factory.find(new DescriptorMatcher(houseboat.getQualifiedName())).size());
        assertEquals("find() fails with wildcard at end of name", 2,
                     factory.find(new DescriptorMatcher(String.format("markup://%s:house*", namespace))).size());
        assertEquals("find() fails with wildcard at beginning of name", 2,
                     factory.find(new DescriptorMatcher(String.format("markup://%s:*party*", namespace))).size());

        assertEquals("find() should not find nonexistent name", 0,
                     factory.find(new DescriptorMatcher(String.format("markup://%s:househunters", namespace))).size());
        assertEquals("find() should not find nonexistent name ending with wildcard", 0,
                     factory.find(new DescriptorMatcher(String.format("markup://%s:househunters*", namespace))).size());
        assertEquals("find() should not find nonexistent name with preceeding wildcard", 0,
                     factory.find(new DescriptorMatcher(String.format("markup://%s:*notherecaptain", namespace))).size());
    }
}
