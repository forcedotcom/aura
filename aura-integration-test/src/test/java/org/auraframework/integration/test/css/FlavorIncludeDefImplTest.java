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
package org.auraframework.integration.test.css;

import com.google.common.collect.Table;
import org.auraframework.css.FlavorOverrideLocation;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import javax.inject.Inject;
import java.util.HashSet;
import java.util.Set;

public class FlavorIncludeDefImplTest extends StyleTestCase {

    @Inject
    DefinitionService definitionService;

    /* util */
    private FlavorIncludeDef source(String flavorIncludeSource) throws QuickFixException {
        String fmt = String.format("<aura:flavors>%s</aura:flavors>", flavorIncludeSource);
        DefDescriptor<FlavorsDef> parent = addFlavorAssortment(fmt);
        return definitionService.getDefinition(parent).getFlavorIncludeDefs().get(0);
    }

    @Test
    public void testComputeFilterMatches() throws Exception {
        FlavorIncludeDef fi = source("<aura:include source='flavorTestAlt:flavorIncludeDefTestFlavors'/>");
        Table<DefDescriptor<ComponentDef>, String, FlavorOverrideLocation> overrides = fi.computeOverrides();

        DefDescriptor<ComponentDef> sample1 = definitionService.getDefDescriptor("flavorTest:x_sample", ComponentDef.class);
        DefDescriptor<ComponentDef> sample2 = definitionService.getDefDescriptor("flavorTest:x_landmark", ComponentDef.class);

        DefDescriptor<FlavoredStyleDef> sample1Flavor = Flavors.customFlavorDescriptor(sample1, "flavorTestAlt", "flavorIncludeDefTestFlavors");
        DefDescriptor<FlavoredStyleDef> sample2Flavor = Flavors.customFlavorDescriptor(sample2, "flavorTestAlt", "flavorIncludeDefTestFlavors");

        assertEquals(3, overrides.row(sample1).size());
        assertEquals(sample1Flavor, overrides.get(sample1, "default").getDescriptor());
        assertEquals(sample1Flavor, overrides.get(sample1, "default2").getDescriptor());
        assertEquals(sample1Flavor, overrides.get(sample1, "default3").getDescriptor());

        assertEquals(1, overrides.row(sample2).size());
        assertEquals(sample2Flavor, overrides.get(sample2, "neutral").getDescriptor());
        assertNull(overrides.get(sample2, "default"));
    }

    @Test
    public void testAppendsDependencies() throws Exception {
        FlavorIncludeDef fi = source("<aura:include source='flavorTestAlt:flavorIncludeDefTestFlavors'/>");
        Set<DefDescriptor<?>> dependencies = fi.getDependencySet();

        DefDescriptor<ComponentDef> sample1 = definitionService.getDefDescriptor("flavorTest:x_sample", ComponentDef.class);
        DefDescriptor<ComponentDef> sample2 = definitionService.getDefDescriptor("flavorTest:x_landmark", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> sample1Flavor = Flavors.customFlavorDescriptor(sample1, "flavorTestAlt", "flavorIncludeDefTestFlavors");
        DefDescriptor<FlavoredStyleDef> sample2Flavor = Flavors.customFlavorDescriptor(sample2, "flavorTestAlt", "flavorIncludeDefTestFlavors");

        assertEquals(2, dependencies.size());
        assertTrue(dependencies.contains(sample1Flavor));
        assertTrue(dependencies.contains(sample2Flavor));
    }

    @Test
    public void testErrorsInInvalidSource() throws Exception {
        try {
            source("<aura:include source='foo'/>").validateDefinition();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "The 'source' attribute must take the format");
        }
    }
}
