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
import java.util.Map.Entry;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.css.FlavorRef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorAssortmentDef;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.flavor.FlavorRefImpl;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.FlavorNameNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableMap;

public class FlavorIncludeDefImplTest extends StyleTestCase {

    public FlavorIncludeDefImplTest(String name) {
        super(name);
    }

    /* util */
    private FlavorIncludeDef source(String flavorIncludeSource) throws QuickFixException {
        String fmt = String.format("<aura:flavors>%s</aura:flavors>", flavorIncludeSource);
        DefDescriptor<FlavorAssortmentDef> parent = addFlavorAssortment(fmt);
        return parent.getDef().getFlavorIncludeDefs().get(0);
    }

    /* util: given source results in given cmp => flavor override map */
    private void checkMatches(String src, Map<DefDescriptor<ComponentDef>, FlavorRef> expected) throws Exception {
        Map<DefDescriptor<ComponentDef>, FlavorRef> matches = source(src).computeFilterMatches();
        assertEquals("didn't get expected number of matches", expected.size(), matches.size());
        for (Entry<DefDescriptor<ComponentDef>, FlavorRef> entry : expected.entrySet()) {
            assertEquals("didn't find expected match", entry.getValue(), matches.get(entry.getKey()));
        }
    }

    /** component="foo:bar" flavor="someFlavor" */
    public void testSpecificComponentAndStandardFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component/>");
        addStandardFlavor(cmp, "@flavor foo");

        FlavorRef ref = Flavors.buildFlavorRef(cmp, "foo");
        String fmt = String.format("<aura:flavor component='%s' flavor='foo'/>", cmp.getDescriptorName());
        checkMatches(fmt, ImmutableMap.of(cmp, ref));
    }

    /** component="foo:bar" flavor="someNamespace:someFlavor" */
    public void testSpecificComponentAndCustomFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component/>");
        addCustomFlavor(cmp, "@flavor foo");
        FlavorRef ref = new FlavorRefImpl(Flavors.customFlavorDescriptor(cmp, getNs2(), "flavors"), "foo");
        String fmt = String.format("<aura:flavor component='%s' flavor='%s:foo'/>", cmp.getDescriptorName(), getNs2());
        checkMatches(fmt, ImmutableMap.of(cmp, ref));
    }

    /** component="*" flavor="someFlavor" */
    public void testComponentGlobAndStandardFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp2 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp3 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp4 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp5 = addComponentDef("<aura:component/>");

        addStandardFlavor(cmp1, "@flavor foo;");
        addStandardFlavor(cmp2, "@flavor baz;");
        addStandardFlavor(cmp3, "@flavor foo, bar");
        // none for cmp4
        addStandardFlavor(cmp5, "@flavor foo");

        addContextApp(String.format("<aura:application> <%s/> <%s/> <%s/> <%s/> <%s/> </aura:application>",
                cmp1.getDescriptorName(), cmp2.getDescriptorName(), cmp3.getDescriptorName(), cmp4.getDescriptorName(),
                cmp5.getDescriptorName()));

        FlavorRef ref1 = Flavors.buildFlavorRef(cmp1, "foo");
        FlavorRef ref3 = Flavors.buildFlavorRef(cmp3, "foo");
        FlavorRef ref5 = Flavors.buildFlavorRef(cmp5, "foo");
        checkMatches("<aura:flavor component='*' flavor='foo'/>", ImmutableMap.of(cmp1, ref1, cmp3, ref3, cmp5, ref5));
    }

    /** component="*" flavor="someNamespace:someFlavor" */
    @SuppressWarnings("unused")
    public void testComponentGlobAndCustomFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp2 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp3 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp4 = addComponentDef("<aura:component/>");

        addStandardFlavor(cmp1, "@flavor foo;"); // ignored because standard
        addStandardFlavor(cmp2, "@flavor baz;"); // ignored
        // other two don't have flavors

        DefDescriptor<FlavoredStyleDef> custom1 = addCustomFlavor(cmp1, "@flavor foo;"); // match
        DefDescriptor<FlavoredStyleDef> custom2 = addCustomFlavor(cmp2, "@flavor foo;"); // match
        DefDescriptor<FlavoredStyleDef> custom3 = addCustomFlavor(cmp3, "@flavor baz;"); // ignored
        // no custom flavor for component4

        // add custom flavor in a bundle different from "flavors" which should be ignored
        DefDescriptor<FlavoredStyleDef> desc = Flavors.customFlavorDescriptor(cmp1, getNs2(), "flavors2");
        addSourceAutoCleanup(desc, "@flavor foo;"); // ignored

        FlavorRef ref1 = new FlavorRefImpl(Flavors.customFlavorDescriptor(cmp1, custom1.getNamespace(), "flavors"), "foo");
        FlavorRef ref2 = new FlavorRefImpl(Flavors.customFlavorDescriptor(cmp2, custom2.getNamespace(), "flavors"), "foo");

        String fmt = String.format("<aura:flavor component='*' flavor='%s:foo'/>", custom1.getNamespace());
        checkMatches(fmt, ImmutableMap.of(cmp1, ref1, cmp2, ref2));
    }

    /** component="someNamespace:*" flavor="someFlavor" */
    public void testComponentNameGlobAndStandardFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp2 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp3 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp4 = addComponentDef("<aura:component/>");

        DefDescriptor<ComponentDef> cmp5 = addComponentDefOtherNamespace("<aura:component/>");
        DefDescriptor<ComponentDef> cmp6 = addComponentDefOtherNamespace("<aura:component/>");

        addStandardFlavor(cmp1, "@flavor foo");
        addStandardFlavor(cmp2, "@flavor foo");
        addStandardFlavor(cmp3, "@flavor baz"); // ignored because different name
        // none for 4

        addStandardFlavor(cmp5, "@flavor foo"); // ignored because component in non-matching ns
        addStandardFlavor(cmp6, "@flavor foo"); // ignored because component in non-matching ns

        addContextApp(String.format("<aura:application> <%s/> <%s/> <%s/> <%s/> <%s/> <%s/> </aura:application>",
                cmp1.getDescriptorName(), cmp2.getDescriptorName(), cmp3.getDescriptorName(), cmp4.getDescriptorName(),
                cmp5.getDescriptorName(), cmp6.getDescriptorName()));

        FlavorRef ref1 = Flavors.buildFlavorRef(cmp1, "foo");
        FlavorRef ref2 = Flavors.buildFlavorRef(cmp2, "foo");

        String fmt = String.format("<aura:flavor component='%s:*' flavor='foo'/>", getNs1());
        checkMatches(fmt, ImmutableMap.of(cmp1, ref1, cmp2, ref2));
    }

    /** component="someNamespace:*" flavor="someNamespace:someFlavor" */
    public void testComponentNameGlobAndCustomFlavor() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp2 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp3 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp4 = addComponentDef("<aura:component/>");

        DefDescriptor<ComponentDef> cmp5 = addComponentDefOtherNamespace("<aura:component/>");
        DefDescriptor<ComponentDef> cmp6 = addComponentDefOtherNamespace("<aura:component/>");

        DefDescriptor<FlavoredStyleDef> custom1 = addCustomFlavor(cmp1, "@flavor foo");
        DefDescriptor<FlavoredStyleDef> custom2 = addCustomFlavor(cmp2, "@flavor foo");
        addCustomFlavor(cmp3, "@flavor baz"); // ignored
        // none for 4
        addCustomFlavor(cmp5, "@flavor foo"); // ignored because component in non-matching ns
        addCustomFlavor(cmp6, "@flavor foo"); // ignored because component in non-matching ns

        addContextApp(String.format("<aura:application> <%s/> <%s/> <%s/> <%s/> <%s/> <%s/> </aura:application>",
                cmp1.getDescriptorName(), cmp2.getDescriptorName(), cmp3.getDescriptorName(), cmp4.getDescriptorName(),
                cmp5.getDescriptorName(), cmp6.getDescriptorName()));

        FlavorRef ref1 = new FlavorRefImpl(Flavors.customFlavorDescriptor(cmp1, custom1.getNamespace(), "flavors"), "foo");
        FlavorRef ref2 = new FlavorRefImpl(Flavors.customFlavorDescriptor(cmp2, custom2.getNamespace(), "flavors"), "foo");

        String fmt = String.format("<aura:flavor component='%s:*' flavor='%s:foo'/>", getNs1(), custom1.getNamespace());
        checkMatches(fmt, ImmutableMap.of(cmp1, ref1, cmp2, ref2));
    }

    /** component="*:button" flavor="someFlavor" */
    public void testComponentNamespaceGlobAndStandardFlavor() throws Exception {
        // cmp1 has a name that matches, cmp2 doesn't
        DefDescriptor<ComponentDef> cmp1Desc = DefDescriptorImpl.getInstance(
                String.format("markup://%s:%s", getNs1(), getAuraTestingUtil().getNonce("button")), ComponentDef.class);

        DefDescriptor<ComponentDef> cmp1 = addSourceAutoCleanup(cmp1Desc, "<aura:component/>");
        DefDescriptor<ComponentDef> cmp2 = addComponentDef("<aura:component/>");

        // cmp3 (which is in another namespace) has a name that matches, cmp4 doesn't.
        DefDescriptor<ComponentDef> cmp3Desc = DefDescriptorImpl.getInstance(
                String.format("markup://%s:%s", getNs2(), getAuraTestingUtil().getNonce("button")), ComponentDef.class);

        DefDescriptor<ComponentDef> cmp3 = addSourceAutoCleanup(cmp3Desc, "<aura:component/>");
        DefDescriptor<ComponentDef> cmp4 = addComponentDefOtherNamespace("<aura:component/>");

        addStandardFlavor(cmp1, "@flavor foo");
        addStandardFlavor(cmp2, "@flavor foo");
        addStandardFlavor(cmp3, "@flavor foo");
        addStandardFlavor(cmp4, "@flavor foo");

        addContextApp(String.format("<aura:application> <%s/> <%s/> <%s/> <%s/> </aura:application>",
                cmp1.getDescriptorName(), cmp2.getDescriptorName(), cmp3.getDescriptorName(), cmp4.getDescriptorName()));

        FlavorRef ref1 = Flavors.buildFlavorRef(cmp1, "foo");
        FlavorRef ref3 = Flavors.buildFlavorRef(cmp3, "foo");

        checkMatches("<aura:flavor component='*:button*' flavor='foo'/>", ImmutableMap.of(cmp1, ref1, cmp3, ref3));
    }

    /** component="foo:bar" flavor="~someFlavor" */
    public void testSpecificComponentAndFuzzyFlavorMatch() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addComponentDefOtherNamespace("<aura:component/>");

        addCustomFlavorToFirstNamespace(cmp1, "@flavor foo");
        addStandardFlavor(cmp1, "@flavor foo"); // ignored

        DefDescriptor<ApplicationDef> app = addContextApp(String.format(
                "<aura:application> <%s/> </aura:application>", cmp1.getDescriptorName()));

        FlavorRef ref1 = new FlavorRefImpl(Flavors.customFlavorDescriptor(cmp1, app.getNamespace(), "flavors"), "foo");

        String fmt = String.format("<aura:flavor component='%s' flavor='~foo'/>", cmp1.getDescriptorName());
        checkMatches(fmt, ImmutableMap.of(cmp1, ref1));
    }

    /** component="foo:bar" flavor="~someFlavor" */
    public void testSpecificComponentAndFuzzyFlavorMatchStandard() throws Exception {
        DefDescriptor<ComponentDef> cmp1 = addComponentDefOtherNamespace("<aura:component/>");

        addStandardFlavor(cmp1, "@flavor foo");

        addContextApp(String.format(
                "<aura:application> <%s/> </aura:application>", cmp1.getDescriptorName()));

        FlavorRef ref1 = new FlavorRefImpl(Flavors.standardFlavorDescriptor(cmp1), "foo");

        String fmt = String.format("<aura:flavor component='%s' flavor='~foo'/>", cmp1.getDescriptorName());
        checkMatches(fmt, ImmutableMap.of(cmp1, ref1));
    }

    /** component="*" flavor="~someFlavor" */
    public void testComponentGlobAndFuzzyFlavorMatch() throws Exception {
        // matching custom flavor not present, matching standard flavor not present
        DefDescriptor<ComponentDef> cmp1 = addComponentDefOtherNamespace("<aura:component/>");
        // matching custom flavor not present, matching standard flavor present
        DefDescriptor<ComponentDef> cmp2 = addComponentDefOtherNamespace("<aura:component/>");
        // matching custom flavor present, matching standard flavor not present
        DefDescriptor<ComponentDef> cmp3 = addComponentDefOtherNamespace("<aura:component/>");
        // matching custom flavor present, matching standard flavor not present
        DefDescriptor<ComponentDef> cmp4 = addComponentDefOtherNamespace("<aura:component/>");

        addStandardFlavor(cmp1, "@flavor ignored;");
        addStandardFlavor(cmp2, "@flavor foo;");
        addStandardFlavor(cmp4, "@flavor foo, ignored;");

        addCustomFlavorToFirstNamespace(cmp3, "@flavor foo;");
        addCustomFlavorToFirstNamespace(cmp4, "@flavor foo, ignored;");

        // and now some extraneous data to make sure things are robust
        addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> e1 = addComponentDef("<aura:component/>");
        addStandardFlavor(e1, "@flavor ignored");
        addCustomFlavor(e1, "@flavor ignored");

        DefDescriptor<ApplicationDef> app = addContextApp(String.format(
                "<aura:application> <%s/> <%s/> <%s/> <%s/> </aura:application>",
                cmp1.getDescriptorName(), cmp2.getDescriptorName(), cmp3.getDescriptorName(), cmp4.getDescriptorName()));

        // cmp1 doesn't have a flavor with a matching name, so should not be present

        // custom flavor isn't present for cmp2, so should pick up standard flavor
        FlavorRef ref2 = new FlavorRefImpl(Flavors.standardFlavorDescriptor(cmp2), "foo");

        // custom flavor is present for cmp3 so should that up
        FlavorRef ref3 = new FlavorRefImpl(Flavors.customFlavorDescriptor(cmp3, app.getNamespace(), "flavors"), "foo");

        // custom and standard flavors both present, but custom should take precedence as it is in the same ns as the
        // override
        FlavorRef ref4 = new FlavorRefImpl(Flavors.customFlavorDescriptor(cmp4, app.getNamespace(), "flavors"), "foo");

        checkMatches("<aura:flavor component='*' flavor='~foo'/>", ImmutableMap.of(cmp2, ref2, cmp3, ref3, cmp4, ref4));
    }

    public void testMissingComponentAttribute() throws Exception {
        try {
            source("<aura:flavor flavor='test'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute 'component'");
        }
    }

    public void testMissingFlavorAttribute() throws Exception {
        try {
            source("<aura:flavor component='ui:button'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute 'flavor'");
        }
    }

    public void testComponentAtrributeEmptyString() throws Exception {
        try {
            source("<aura:flavor component='' flavor='test'/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute 'component'");
        }
    }

    public void testFlavorAttributeEmptyString() throws Exception {
        try {
            source("<aura:flavor component='ui:button' flavor=''/>").validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Missing required attribute 'flavor'");
        }
    }

    public void testInvalidFlavorRef() throws Exception {
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component/>");
        addStandardFlavor(cmp, "@flavor foo");
        String fmt = String.format("<aura:flavor component='%s' flavor='bar'/>", cmp.getDescriptorName());
        try {
            source(fmt).validateDefinition();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, FlavorNameNotFoundException.class, "was not found");
        }
    }

    public void testAppendDependencies() throws Exception {
        DefDescriptor<ComponentDef> cmp = addComponentDef("<aura:component/>");
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
        DefDescriptor<ComponentDef> cmp1 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp2 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp3 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp4 = addComponentDef("<aura:component/>");
        DefDescriptor<ComponentDef> cmp5 = addComponentDef("<aura:component/>");

        DefDescriptor<FlavoredStyleDef> flavor1 = addCustomFlavor(cmp1, "@flavor yes;"); // yes
        DefDescriptor<FlavoredStyleDef> flavor2 = addCustomFlavor(cmp2, "@flavor no;");
        DefDescriptor<FlavoredStyleDef> flavor3 = addCustomFlavor(cmp3, "@flavor yes;"); // yes
        DefDescriptor<FlavoredStyleDef> flavor4 = addCustomFlavor(cmp4, "@flavor nah; @flavor yes; @flavor no;"); // yes
        DefDescriptor<FlavoredStyleDef> flavor5 = addCustomFlavor(cmp5, "@flavor no; @flavor noagain;");

        String src = String.format("<aura:flavors><aura:flavor component='*' flavor='%s:yes'/></aura:flavors>", getNs2());
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

    public void testSerialization() throws Exception {
        DefDescriptor<FlavorAssortmentDef> fa = Aura.getDefinitionService().getDefDescriptor("flavorTest:serializationTest",
                FlavorAssortmentDef.class);

        FlavorIncludeDef fi = fa.getDef().getFlavorIncludeDefs().get(0);
        serializeAndGoldFile(fi);
    }
}
