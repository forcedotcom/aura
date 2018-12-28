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

import javax.inject.Inject;

import org.auraframework.css.FlavorOverrideLocator;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Ignore;
import org.junit.Test;

public class FlavorsDefImplTest extends StyleTestCase {

    @Inject
    DefinitionService definitionService;

    @Test
    @Ignore("BUNDLES")
    public void testLoadsIndependently() throws QuickFixException {
        // flavor assortments can be placed independently in their own bundles
        DefDescriptor<FlavorsDef> fa = addFlavorAssortment("<aura:flavors></aura:flavors>");
        assertTrue(fa.exists());
        definitionService.getDefinition(fa).validateDefinition(); // no errors
    }

    @Test
    @Ignore("BUNDLES")
    public void testLoadsFromAppBundle() throws QuickFixException {
        DefDescriptor<FlavorsDef> fa = addSourceAutoCleanup(FlavorsDef.class, "<aura:flavors></aura:flavors>");

        DefDescriptor<ApplicationDef> app = DefDescriptorImpl.getAssociateDescriptor(fa, ApplicationDef.class,
                DefDescriptor.MARKUP_PREFIX);
        addSourceAutoCleanup(app, String.format("<aura:application></aura:application>"));

        assertTrue(fa.exists());
        definitionService.getDefinition(fa).validateDefinition(); // no errors
    }

    @Test
    @Ignore("BUNDLES")
    public void testGetFlavorIncludeDefs() throws QuickFixException {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        addStandardFlavor(cmp, ".THIS--test{}");

        String src = "<aura:flavors><aura:include source='flavorTestAlt:flavorsAlt'/></aura:flavors>";
        DefDescriptor<FlavorsDef> fa = addFlavorAssortment(src);
        assertEquals("flavors did not have the right size", 1, definitionService.getDefinition(fa).getFlavorIncludeDefs().size());
    }

    @Test
    @Ignore("BUNDLES")
    public void testGetFlavorDefaultDefs() throws QuickFixException {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        addStandardFlavor(cmp, ".THIS--test{}");

        String src = "<aura:flavors>"
                + String.format("<aura:flavor component='%s' default='test'/>", cmp.getDescriptorName())
                + "</aura:flavors>";
        DefDescriptor<FlavorsDef> fa = addFlavorAssortment(src);
        assertEquals("flavors did not have the right size", 1, definitionService.getDefinition(fa).getFlavorDefaultDefs().size());
    }

    @Test
    @Ignore("BUNDLES")
    public void testIterationOrderOfComputeOverrides() throws Exception {
        // both of these should have flavors for x_sample
        String fmt = "<aura:flavors>"
                + "<aura:include source='flavorTestAlt:flavors'/>"
                + "<aura:include source='flavorTestAlt:flavorsAlt'/>"
                + "</aura:flavors>";

        DefDescriptor<ComponentDef> cmp1 = definitionService.getDefDescriptor("flavorTest:x_sample", ComponentDef.class);
        DefDescriptor<FlavoredStyleDef> style = Flavors.customFlavorDescriptor(cmp1, "flavorTestAlt", "flavorsAlt");

        DefDescriptor<FlavorsDef> fa = addFlavorAssortment(fmt);
        FlavorOverrideLocator mapping = definitionService.getDefinition(fa).computeOverrides();

        assertEquals(style, mapping.getLocation(cmp1, "default").get().getDescriptor());
    }

    @Test
    @Ignore("BUNDLES")
    public void testSerialization() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = definitionService.getDefDescriptor("flavorTest:x_sample", ComponentDef.class);
        DefDescriptor<ComponentDef> cmp2 = definitionService.getDefDescriptor("flavorTest:x_landmark", ComponentDef.class);

        String fmt = "<aura:flavors>"
                + "<aura:include source='flavorTestAlt:flavors'/>"
                + "<aura:flavor component='*' default='flavorA' context='{!$Browser.isPhone}'/>"
                + "<aura:flavor component='*' default='flavorD'/>"
                + "</aura:flavors>";
        DefDescriptor<FlavorsDef> fa = addContextAppFlavorAssortment(fmt);

        addContextApp(String.format("<aura:application><%s/><%s/></aura:application>", cmp1.getDescriptorName(),
                cmp2.getDescriptorName()));

        serializeAndGoldFile(definitionService.getDefinition(fa));
    }
}
