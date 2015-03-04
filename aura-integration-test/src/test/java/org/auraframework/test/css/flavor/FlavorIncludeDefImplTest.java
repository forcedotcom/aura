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
import java.util.Map;
import java.util.Set;

import org.auraframework.css.FlavorRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.flavor.FlavorRefImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.FlavorNameNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

public class FlavorIncludeDefImplTest extends StyleTestCase {

    public FlavorIncludeDefImplTest(String name) {
        super(name);
    }

    private FlavorIncludeDef source(String flavorIncludeSource) throws QuickFixException {
        String fmt = String.format("<aura:flavors>%s</aura:flavors>", flavorIncludeSource);
        DefDescriptor<FlavorAssortmentDef> parent = addSourceAutoCleanup(FlavorAssortmentDef.class, fmt);
        return parent.getDef().getFlavorIncludeDefs().get(0);
    }

    private DefDescriptor<ComponentDef> cmp() {
        return getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
    }

    public void testMissingComponentAttribute() throws Exception {
        try {
            source("<aura:flavor flavor='test'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing component");
        }
    }

    public void testMissingFlavorAttribute() throws Exception {
        try {
            source("<aura:flavor component='ui:button'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing flavor");
        }
    }

    public void testComponentAtrributeEmptyString() throws Exception {
        try {
            source("<aura:flavor component='' flavor='test'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing component");
        }
    }

    public void testFlavorAttributeEmptyString() throws Exception {
        try {
            source("<aura:flavor component='ui:button' flavor=''/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing flavor");
        }
    }

    public void testInvalidComponentRef() throws Exception {
        try {
            source("<aura:flavor component='fake:fake' flavor='test'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No COMPONENT");
        }
    }

    public void testInvalidStandardFlavorRef() throws Exception {
        DefDescriptor<ComponentDef> cmp = cmp();
        addStandardFlavor(cmp, "@flavor test");
        String fmt = String.format("<aura:flavor component='%s' flavor='rest'/>", cmp.getDescriptorName());
        try {
            source(fmt).validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, FlavorNameNotFoundException.class, "was not found");
        }
    }

    public void testInvalidCustomFlavorRef() throws Exception {
        DefDescriptor<ComponentDef> cmp = cmp();
        DefDescriptor<FlavoredStyleDef> custom = addCustomFlavor(cmp, "@flavor test");
        String fmt = String.format("<aura:flavor component='%s' flavor='%s.rest'/>", cmp.getDescriptorName(), custom.getNamespace());
        try {
            source(fmt).validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, FlavorNameNotFoundException.class, "was not found");
        }
    }

    public void testComponentPlusNamedUsedTogether() throws Exception {
        try {
            source("<aura:flavor component='ui:button'  named='test'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot use both");
        }
    }

    public void testFlavorPlusNamedUsedTogether() throws Exception {
        try {
            source("<aura:flavor component='ui:button' flavor='test' named='test'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot use both");
        }
    }

    public void testGetFlavorsWhenIndividual() throws Exception {
        DefDescriptor<ComponentDef> cmp = cmp();
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp, "@flavor test");
        FlavorIncludeDef flavorInclude = source(String.format("<aura:flavor component='%s' flavor='test'/>", cmp.getDescriptorName()));

        Map<DefDescriptor<ComponentDef>, FlavorRef> map = flavorInclude.getFlavorsMap();
        assertEquals("did not return the correct number of flavors", 1, map.size());
        assertEquals(map.get(cmp).getFlavoredStyleDescriptor(), flavor);
    }

    @SuppressWarnings("unused")
    public void testGetFlavorsFilteredByName() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = cmp();
        DefDescriptor<ComponentDef> cmp2 = cmp();
        DefDescriptor<ComponentDef> cmp3 = cmp();
        DefDescriptor<ComponentDef> cmp4 = cmp();
        DefDescriptor<ComponentDef> cmp5 = cmp();

        DefDescriptor<FlavoredStyleDef> flavor1 = addCustomFlavor(cmp1, "@flavor yes;");
        DefDescriptor<FlavoredStyleDef> flavor2 = addCustomFlavor(cmp2, "@flavor no;");
        DefDescriptor<FlavoredStyleDef> flavor3 = addCustomFlavor(cmp3, "@flavor yes;");
        DefDescriptor<FlavoredStyleDef> flavor4 = addCustomFlavor(cmp4, "@flavor nah; @flavor yes; @flavor no;");
        DefDescriptor<FlavoredStyleDef> flavor5 = addCustomFlavor(cmp5, "@flavor no; @flavor noagain;");

        String src = "<aura:flavors><aura:flavor named='yes'/></aura:flavors>";
        DefDescriptor<FlavorAssortmentDef> parent = addFlavorAssortmentOtherNamespace(src);
        FlavorIncludeDef fi = parent.getDef().getFlavorIncludeDefs().get(0);

        Map<DefDescriptor<ComponentDef>, FlavorRef> map = fi.getFlavorsMap();

        assertEquals("did not find the expected number of flavors", 3, map.size());
        assertEquals(new FlavorRefImpl(flavor1, "yes"), map.get(cmp1));
        assertEquals(new FlavorRefImpl(flavor3, "yes"), map.get(cmp3));
        assertEquals(new FlavorRefImpl(flavor4, "yes"), map.get(cmp4));
    }

    @SuppressWarnings("unused")
    public void testGetFlavorsFilteredByNameDifferentNamespace() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = cmp();
        DefDescriptor<ComponentDef> cmp2 = cmp();
        DefDescriptor<ComponentDef> cmp3 = cmp();

        // these are added to same ns as components
        DefDescriptor<FlavoredStyleDef> flavor1a = addCustomFlavorSameNamespace(cmp1, "@flavor yes;");
        DefDescriptor<FlavoredStyleDef> flavor2a = addCustomFlavorSameNamespace(cmp2, "@flavor yes;");
        DefDescriptor<FlavoredStyleDef> flavor3a = addCustomFlavorSameNamespace(cmp3, "@flavor yes;");

        // these are added to another namespace
        DefDescriptor<FlavoredStyleDef> flavor1b = addCustomFlavor(cmp1, "@flavor yes;");
        DefDescriptor<FlavoredStyleDef> flavor2b = addCustomFlavor(cmp2, "@flavor no;");

        // this is added to the same ns as components, but has a filter for flavors in ns2
        String src = String.format("<aura:flavors><aura:flavor named='yes' namespace='%s'/></aura:flavors>", getNs2());
        DefDescriptor<FlavorAssortmentDef> parent = addFlavorAssortment(src);
        FlavorIncludeDef fi = parent.getDef().getFlavorIncludeDefs().get(0);

        // so basically this is testing that a flavor assortment in ns1 can include flavors from ns2 using a named
        // filter.
        Map<DefDescriptor<ComponentDef>, FlavorRef> map = fi.getFlavorsMap();

        assertEquals("did not find the expected number of flavors", 1, map.size());
        assertEquals(new FlavorRefImpl(flavor1b, "yes"), map.get(cmp1));
    }

    public void testAppendDependencies() throws Exception {
        DefDescriptor<ComponentDef> cmp = cmp();
        DefDescriptor<FlavoredStyleDef> flavor = addStandardFlavor(cmp, "@flavor test");
        FlavorIncludeDef fi = source(String.format("<aura:flavor component='%s' flavor='test'/>", cmp.getDescriptorName()));

        Set<DefDescriptor<?>> deps = new HashSet<>();
        fi.appendDependencies(deps);
        assertEquals("did not get correct number of dependencies", 2, deps.size());
        assertTrue("did not append correct dependencies", deps.contains(cmp));
        assertTrue("did not append correct dependencies", deps.contains(flavor));
    }

    @SuppressWarnings("unused")
    public void testAppendFilteredDependencies() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = cmp();
        DefDescriptor<ComponentDef> cmp2 = cmp();
        DefDescriptor<ComponentDef> cmp3 = cmp();
        DefDescriptor<ComponentDef> cmp4 = cmp();
        DefDescriptor<ComponentDef> cmp5 = cmp();

        DefDescriptor<FlavoredStyleDef> flavor1 = addCustomFlavor(cmp1, "@flavor yes;");
        DefDescriptor<FlavoredStyleDef> flavor2 = addCustomFlavor(cmp2, "@flavor no;");
        DefDescriptor<FlavoredStyleDef> flavor3 = addCustomFlavor(cmp3, "@flavor yes;");
        DefDescriptor<FlavoredStyleDef> flavor4 = addCustomFlavor(cmp4, "@flavor nah; @flavor yes; @flavor no;");
        DefDescriptor<FlavoredStyleDef> flavor5 = addCustomFlavor(cmp5, "@flavor no; @flavor noagain;");

        String src = "<aura:flavors><aura:flavor named='yes'/></aura:flavors>";
        DefDescriptor<FlavorAssortmentDef> parent = addFlavorAssortmentOtherNamespace(src);
        FlavorIncludeDef fi = parent.getDef().getFlavorIncludeDefs().get(0);

        Set<DefDescriptor<?>> deps = new HashSet<>();
        fi.appendDependencies(deps);
        assertEquals("did not get correct number of dependencies", 6, deps.size());
        assertTrue("did not append correct dependencies", deps.contains(cmp1));
        assertTrue("did not append correct dependencies", deps.contains(cmp3));
        assertTrue("did not append correct dependencies", deps.contains(cmp4));
        assertTrue("did not append correct dependencies", deps.contains(flavor1));
        assertTrue("did not append correct dependencies", deps.contains(flavor3));
        assertTrue("did not append correct dependencies", deps.contains(flavor4));
    }
}
