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

import java.util.*;

import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.RootDefFactory;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.SourceLoader;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

public class MasterDefRegistryImplTest extends AuraImplTestCase {
    private String baseContents = "<aura:application></aura:application>";
    private Set<String> prefixes = ImmutableSet.of(DefDescriptor.MARKUP_PREFIX);
    private Set<DefType> defTypes = EnumSet.of(DefType.APPLICATION, DefType.COMPONENT);

    public MasterDefRegistryImplTest(String name) {
        super(name);
    }

    @SuppressWarnings("unchecked")
    public void testFindRegex() throws Exception {
        SourceLoader stringLoader = StringSourceLoader.getInstance();
        List<SourceLoader> stringLoaders = Lists.newArrayList(stringLoader);
        RootDefFactory factory = new RootDefFactory(new SourceFactory(stringLoaders));
        NonCachingDefRegistryImpl nonCachDefReg = new NonCachingDefRegistryImpl(factory, defTypes, prefixes);
        MasterDefRegistryImpl masterDefReg = new MasterDefRegistryImpl(nonCachDefReg);
        
        addSource("houseboat", baseContents, ApplicationDef.class);
        addSource("houseparty", baseContents, ApplicationDef.class);
        addSource("pantsparty", baseContents, ApplicationDef.class);

        assertEquals("find() not finding all sources", 3, masterDefReg.find("markup://string:*").size());
        assertEquals("find() fails with wildcard as prefix", 1, masterDefReg.find("*://string:houseboat").size());
        assertEquals("find() fails with wildcard as namespace", 1, masterDefReg.find("markup://*:houseboat").size());
        assertEquals("find() fails with wildcard as name", 1, masterDefReg.find("markup://string:houseboat").size());
        assertEquals("find() fails with wildcard at end of name", 2, masterDefReg.find("markup://string:house*").size());
        assertEquals("find() fails with wildcard at beginning of name", 2, masterDefReg.find("markup://string:*party").size());
        assertEquals("find() should not find nonexistent name", 0, masterDefReg.find("markup://string:househunters").size());
        assertEquals("find() should not find nonexistent name with preceeding wildcard",
                0, masterDefReg.find("markup://string:*notherecaptain").size());
    }
}
