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
package org.auraframework.test.css.flavor;

import java.util.HashSet;
import java.util.Set;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.QuickFixException;

public class FlavorAssortmentDefImplTest extends StyleTestCase {

    public FlavorAssortmentDefImplTest(String name) {
        super(name);
    }

    public void testLoadsIndependently() throws QuickFixException {
        // flavor assortments can be placed independently in their own bundles
        DefDescriptor<FlavorAssortmentDef> fa = addFlavorAssortment("<aura:flavors></aura:flavors>");
        assertTrue(fa.exists());
        fa.getDef().validateDefinition(); // no errors
    }

    public void testLoadsFromAppBundle() throws QuickFixException {
        DefDescriptor<FlavorAssortmentDef> fa = addSourceAutoCleanup(FlavorAssortmentDef.class, "<aura:flavors></aura:flavors>");

        DefDescriptor<ApplicationDef> app = DefDescriptorImpl.getAssociateDescriptor(fa, ApplicationDef.class,
                DefDescriptor.MARKUP_PREFIX);
        addSourceAutoCleanup(app, String.format("<aura:application></aura:application>"));

        assertTrue(fa.exists());
        fa.getDef().validateDefinition(); // no errors
    }

    public void testGetFlavorIncludes() throws QuickFixException {
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        addStandardFlavor(cmp, "@flavor test");

        String src = "<aura:flavors>"
                + String.format("<aura:flavor component='%s' flavor='test'/>", cmp.getDescriptorName())
                + "</aura:flavors>";
        DefDescriptor<FlavorAssortmentDef> fa = addFlavorAssortment(src);
        assertEquals("flavors did not have the right size", 1, fa.getDef().getFlavorIncludeDefs().size());
    }

    public void testAppendsDependencies() throws QuickFixException {
        DefDescriptor<ComponentDef> cmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        addStandardFlavor(cmp, "@flavor test");

        String src = "<aura:flavors>"
                + String.format("<aura:flavor component='%s' flavor='test'/>", cmp.getDescriptorName())
                + "</aura:flavors>";
        DefDescriptor<FlavorAssortmentDef> fa = addFlavorAssortment(src);

        Set<DefDescriptor<?>> set = new HashSet<>();
        fa.getDef().appendDependencies(set);
        assertEquals("did not append correct # of dependencies", 2, set.size()); // cmp and flavor
    }
}
