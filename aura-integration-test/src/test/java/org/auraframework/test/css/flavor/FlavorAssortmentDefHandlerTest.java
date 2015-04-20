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

import java.util.List;

import org.auraframework.def.*;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

import com.google.common.collect.Iterables;

public class FlavorAssortmentDefHandlerTest extends StyleTestCase {

    public FlavorAssortmentDefHandlerTest(String name) {
        super(name);
    }

    public void testInvalidChild() throws Exception {
        try {
            addFlavorAssortment("<aura:flavors><aura:foo/></aura:flavors>").getDef();
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:flaors");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Found unexpected tag");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
            addFlavorAssortment("<aura:flavors>Test</aura:flavors>").getDef();
            fail("Should have thrown AuraException because text is between aura:flavors tags");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No literal text");
        }
    }

    public void testFlavorIncludes() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        DefDescriptor<ComponentDef> cmp2 = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");

        addStandardFlavor(cmp1, "@flavor test;");
        addStandardFlavor(cmp2, "@flavor test2;");

        String src = "<aura:flavors>"
                + String.format("<aura:flavor component='%s' flavor='test'/>", cmp1.getDescriptorName())
                + String.format("<aura:flavor component='%s' flavor='test2'/>", cmp2.getDescriptorName())
                + "</aura:flavors>";
        DefDescriptor<FlavorAssortmentDef> fa = addFlavorAssortment(src);

        List<FlavorIncludeDef> flavorIncludes = fa.getDef().getFlavorIncludeDefs();
        assertEquals("did not find the right number of flavors", 2, flavorIncludes.size());
        assertEquals("test", Iterables.getOnlyElement(flavorIncludes.get(0).computeFilterMatches(false).values()).getFlavorName());
        assertEquals("test2", Iterables.getOnlyElement(flavorIncludes.get(1).computeFilterMatches(false).values()).getFlavorName());
    }
}
