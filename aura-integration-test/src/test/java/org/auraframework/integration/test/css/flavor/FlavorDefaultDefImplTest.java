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
package org.auraframework.integration.test.css.flavor;

import java.util.Map;
import java.util.Map.Entry;

import org.auraframework.css.FlavorMapping;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavorDefaultDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.flavor.FlavorMappingImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableMap;

public class FlavorDefaultDefImplTest extends StyleTestCase {
    private static final FlavorMapping NO_MAPPING = new FlavorMappingImpl.Builder().build();

    public FlavorDefaultDefImplTest(String name) {
        super(name);
    }

    /* util */
    private FlavorDefaultDef source(String flavorDefaultSource) throws QuickFixException {
        String fmt = String.format("<aura:flavors>%s</aura:flavors>", flavorDefaultSource);
        DefDescriptor<FlavorAssortmentDef> parent = addFlavorAssortment(fmt);
        return parent.getDef().getFlavorDefaultDefs().get(0);
    }

    /* util */
    @SafeVarargs
    private final void addApp(DefDescriptor<ComponentDef>... dds) throws QuickFixException {
        StringBuilder builder = new StringBuilder();
        builder.append("<aura:application>");
        for (DefDescriptor<ComponentDef> dd : dds) {
            builder.append(String.format("<%s/>", dd.getDescriptorName()));
        }
        builder.append("</aura:application>");
        addContextApp(builder.toString());
    }

    /* util: given source results in given cmp => flavor override map */
    private void checkMatches(String src, Map<DefDescriptor<ComponentDef>, String> expected, FlavorMapping mapping)
            throws Exception {
        Map<DefDescriptor<ComponentDef>, String> matches = source(src).computeFilterMatches(mapping);
        assertEquals("didn't get expected number of matches", expected.size(), matches.size());
        for (Entry<DefDescriptor<ComponentDef>, String> entry : expected.entrySet()) {
            assertEquals("didn't find expected match", entry.getValue(), matches.get(entry.getKey()));
        }
    }

    public void testSingleComponentStandardFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        addStandardFlavor(cmp, ".THIS--foo{}");

        String fmt = String.format("<aura:flavor component='%s' default='foo'/>", cmp.getDescriptorName());
        checkMatches(fmt, ImmutableMap.of(cmp, "foo"), NO_MAPPING);
    }

    public void testSingleComponentFromMapping() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<FlavoredStyleDef> style = addCustomFlavor(cmp, "THIS--foo{}");
        FlavorMapping mapping = new FlavorMappingImpl.Builder().put(cmp, "foo", style).build();

        String fmt = String.format("<aura:flavor component='%s' default='foo'/>", cmp.getDescriptorName());
        checkMatches(fmt, ImmutableMap.of(cmp, "foo"), mapping);
    }

    public void testFullGlobMatchFromBundle() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        addStandardFlavor(cmp, ".THIS{} .THIS--foo{}");
        addApp(cmp);
        String fmt = "<aura:flavor component='*' default='foo'/>";
        checkMatches(fmt, ImmutableMap.of(cmp, "foo"), NO_MAPPING);
    }

    public void testFullGlobMatchFromMapping() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<FlavoredStyleDef> style = addCustomFlavor(cmp, "THIS--foo{}");
        FlavorMapping mapping = new FlavorMappingImpl.Builder().put(cmp, "foo", style).build();
        addApp(cmp);
        String fmt = "<aura:flavor component='*' default='foo'/>";
        checkMatches(fmt, ImmutableMap.of(cmp, "foo"), mapping);
    }

    public void testFullGlobMatchInBoth() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        addStandardFlavor(cmp, ".THIS{} .THIS--foo{}");
        DefDescriptor<FlavoredStyleDef> style = addCustomFlavor(cmp, "THIS--foo{}");
        FlavorMapping mapping = new FlavorMappingImpl.Builder().put(cmp, "foo", style).build();
        addApp(cmp);
        String fmt = "<aura:flavor component='*' default='foo'/>";
        checkMatches(fmt, ImmutableMap.of(cmp, "foo"), mapping);
    }

    public void testFullGlobNoMatch() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        addApp(cmp);
        String fmt = "<aura:flavor component='*' default='foo'/>";
        checkMatches(fmt, ImmutableMap.<DefDescriptor<ComponentDef>, String>of(), NO_MAPPING);
    }

    public void testNamespaceGlobMatchFromBundle() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<ComponentDef> cmp2 = addComponentDefOtherNamespace("<aura:component><div aura:flavorable='true'></div></aura:component>");

        addStandardFlavor(cmp, ".THIS{} .THIS--foo{}");
        addStandardFlavor(cmp2, ".THIS{} .THIS--foo{}");

        addApp(cmp, cmp2);

        String fmt = String.format("<aura:flavor component='%s:*' default='foo'/>", getNs1());
        checkMatches(fmt, ImmutableMap.of(cmp, "foo"), NO_MAPPING);
    }

    public void testNamespaceGlobNoMatch() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<ComponentDef> cmp2 = addComponentDefOtherNamespace("<aura:component><div aura:flavorable='true'></div></aura:component>");

        addStandardFlavor(cmp, ".THIS{} .THIS--bar{}");
        addStandardFlavor(cmp2, ".THIS{} .THIS--bar{}");

        addApp(cmp, cmp2);

        String fmt = String.format("<aura:flavor component='%s:*' default='foo'/>", getNs1());
        checkMatches(fmt, ImmutableMap.<DefDescriptor<ComponentDef>, String>of(), NO_MAPPING);
    }

    public void testNameGlobMatchFromBundle() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<ComponentDef> cmp2 = addComponentDefOtherNamespace("<aura:component><div aura:flavorable='true'></div></aura:component>");

        addStandardFlavor(cmp, ".THIS{} .THIS--foo{}");
        addStandardFlavor(cmp2, ".THIS{} .THIS--foo{}");

        addApp(cmp, cmp2);

        String fmt = String.format("<aura:flavor component='*:%s' default='foo'/>", cmp.getName());
        checkMatches(fmt, ImmutableMap.of(cmp, "foo"), NO_MAPPING);
    }

    public void testNameGlobNoMatch() throws Exception {
        DefDescriptor<ComponentDef> cmp = addFlavorableComponentDef();
        DefDescriptor<ComponentDef> cmp2 = addComponentDefOtherNamespace("<aura:component><div aura:flavorable='true'></div></aura:component>");

        addStandardFlavor(cmp, ".THIS{} .THIS--foo{}");
        addStandardFlavor(cmp2, ".THIS{} .THIS--bar{}");

        addApp(cmp, cmp2);

        String fmt = String.format("<aura:flavor component='*:%s' default='bar'/>", cmp.getName());
        checkMatches(fmt, ImmutableMap.<DefDescriptor<ComponentDef>, String>of(), NO_MAPPING);
    }

    public void testValidatesReferenceNotFlavorable() throws Exception {
        try {
            DefDescriptor<ComponentDef> cmp = addComponentDef();
            String fmt = String.format("<aura:flavor component='%s' default='foo'/>", cmp.getDescriptorName());
            source(fmt).validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must contain at least one aura:flavorable");
        }
    }
}
