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
package org.auraframework.integration.test.def;

import java.util.HashSet;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.root.component.BaseComponentDefTest;
import org.auraframework.service.CompilerService;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.FlavorNameNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

public class ComponentDefTest extends BaseComponentDefTest<ComponentDef> {
    @Inject
    protected CompilerService compilerService;

    public ComponentDefTest() {
        super(ComponentDef.class, "aura:component");
    }

    /**
     * InvalidDefinitionException if we try to instantiate an abstract component with no providers.
     */
    @Test
    public void testAbstractNoProvider() throws Exception {
        try {
            ComponentDef cd = define(baseTag, "abstract='true'", "");
            instanceService.getInstance(cd);
            fail("Should not be able to instantiate a component with no providers.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "cannot be instantiated directly");
        }
    }

    @Test
    public void testAppendsStandardFlavorToDependencies() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<div aura:flavorable='true'></div>"));
        DefDescriptor<FlavoredStyleDef> flavor = addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc),
                ".THIS--test{}");

        Set<DefDescriptor<?>> dependencies = new HashSet<>();
        definitionService.getDefinition(desc).appendDependencies(dependencies);
        assertTrue(dependencies.contains(flavor));
    }

    /**
     * Tests that confirm the specified default flavor exists
     */

    @Test
    public void testErrorsWhenDefaultFlavorDoesntExist() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "defaultFlavor='tesst'", "<div aura:flavorable='true'></div>"));
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS--test{}");

        try {
            definitionService.getDefinition(desc).validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, FlavorNameNotFoundException.class, "was not found");
        }
    }

    @Test
    public void testNoErrorWhenDefaultFlavorExistsOnParent() throws Exception {
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><div aura:flavorable='true'>{!v.body}</div></aura:component>");
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(parent), ".THIS--fromParent{}");

        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format("<aura:component extends='%s' defaultFlavor='fromParent'></aura:component>",
                        parent.getDescriptorName()));

        definitionService.getDefinition(desc).validateReferences(); // no exception
    }

    @Test
    public void testNoErrorWhenDefaultFlavorExistsOnDistantParent() throws Exception {
        // hierarchy two levels deep, up one level doesn't not have flavorable but above that does
        DefDescriptor<ComponentDef> distant = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><div aura:flavorable='true'>{!v.body}</div></aura:component>");
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(distant), ".THIS--fromParent{}");

        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                String.format("<aura:component extends='%s' extensible='true'><div>{!v.body}</div></aura:component>",
                        distant.getDescriptorName()));

        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format("<aura:component extends='%s' defaultFlavor='fromParent'></aura:component>",
                        parent.getDescriptorName()));

        definitionService.getDefinition(desc).validateReferences(); // no exception
    }

    @Test
    public void testValidatesMultipleDefaultFlavorNamesBothValid() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                "<aura:component defaultFlavor='test, test2'><div aura:flavorable='true'></div></aura:component>");
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS--test{} .THIS--test2{}");
        definitionService.getDefinition(desc).validateReferences(); // no exception
    }

    @Test
    public void testValidatesMultipleDefaultFlavorNamesFromParent() throws Exception {
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><div aura:flavorable='true'>{!v.body}</div></aura:component>");
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(parent), ".THIS--test{} .THIS--test2{}");

        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(
                getDefClass(),
                String.format("<aura:component extends='%s' defaultFlavor='test, test2'></aura:component>",
                        parent.getDescriptorName()));
        definitionService.getDefinition(desc).validateReferences(); // no exception
    }

    @Test
    public void testValidatesMultipleDefaultFlavorNamesOneInvalid() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                "<aura:component defaultFlavor='test, bad'><div aura:flavorable='true'></div></aura:component>");
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS--test{} .THIS--test2{}");

        try {
            definitionService.getDefinition(desc).validateReferences(); // no exception
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, FlavorNameNotFoundException.class, "was not found");
        }
    }

    /** when a default flavor is specified, validation should ensure there is a flavorable element */
    @Test
    public void testValidatesComponentIsFlavorable() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "defaultFlavor='test'", "<div></div>"));
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS--test{background:red;}");
        Exception expected = null;

        try {
            definitionService.getDefinition(desc);
        } catch (Exception e) {
            expected = e;
        }
        assertNotNull("expected to get an exception", expected);
        //
        // FIXME: This check oscilates back and forth. It can be either
        // The defaultFlavor attribute cannot be specified on a component with no flavorable children
        //   -or-
        // must contain at least one aura:flavorable element
        //
        checkExceptionContains(expected, InvalidDefinitionException.class, "flavorable");

        boolean match = false;
        match = match | expected.getMessage().contains("must contain at least one aura:flavorable element");
        match = match | expected.getMessage().contains("The defaultFlavor attribute cannot be specified on a component with no flavorable children");
        assertTrue("The compilation must match one of two errors", match);
    }

    /** if extending from a component with a flavorable element, the validation should pass */
    @Test
    public void testValidatesComponentIsFlavorableFromParent() throws Exception {
        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><div aura:flavorable='true'>{!v.body}</div></aura:component>");
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(parent), ".THIS--fromParent{}");

        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(
                getDefClass(),
                String.format("<aura:component extends='%s' defaultFlavor='fromParent'></aura:component>",
                        parent.getDescriptorName()));

        definitionService.getDefinition(desc).validateReferences(); // no exception
    }

    @Test
    public void testValidatesComponentIsFlavorableFromDistantParent() throws Exception {
        // hierarchy two levels deep, up one level doesn't not have flavorable but above that does
        DefDescriptor<ComponentDef> distant = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><div aura:flavorable='true'>{!v.body}</div></aura:component>");
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(distant), ".THIS--fromParent{}");

        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(
                ComponentDef.class,
                String.format("<aura:component extends='%s' extensible='true'><div>{!v.body}</div></aura:component>",
                        distant.getDescriptorName()));

        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format("<aura:component extends='%s' defaultFlavor='fromParent'></aura:component>",
                        parent.getDescriptorName()));

        definitionService.getDefinition(desc).validateReferences(); // no exception
    }

    @Test
    public void testValidatesComponentNotFlavorableFromAnyParent() throws Exception {
        DefDescriptor<ComponentDef> distant = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true'><div>{!v.body}</div></aura:component>");

        DefDescriptor<ComponentDef> parent = addSourceAutoCleanup(
                ComponentDef.class,
                String.format("<aura:component extends='%s' extensible='true'><div>{!v.body}</div></aura:component>",
                        distant.getDescriptorName()));

        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format("<aura:component extends='%s' defaultFlavor='fromParent'></aura:component>",
                        parent.getDescriptorName()));
        Exception expected = null;

        try {
            definitionService.getDefinition(desc).validateReferences();
        } catch (Exception e) {
            expected = e;
        }
        assertNotNull("expected to get an exception", expected);
        checkExceptionContains(expected, InvalidDefinitionException.class, "The defaultFlavor attribute cannot");
    }

    /**
     * The implicit default flavor is "default", but only when an explicit default isn't specified, the component has a
     * flavorable child (or is marked dynamicallyFlavorable), a flavor file exists, and the flavor file defines a flavor named "default".
     */

    @Test
    public void testImplicitDefaultFlavor() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<div aura:flavorable='true'></div>"));
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS--default{}");
        assertEquals("default", definitionService.getDefinition(desc).getDefaultFlavorOrImplicit());
    }

    @Test
    public void testImplicitDefaultFlavorDynamicallyFlavored() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "dynamicallyFlavorable='true'", "<div></div>"));
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS--default{}");
        assertEquals("default", definitionService.getDefinition(desc).getDefaultFlavorOrImplicit());
    }

    @Test
    public void testImplicitDefaultFlavorShorthand() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<div aura:flavorable='true'></div>"));
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS{}");
        assertEquals("default", definitionService.getDefinition(desc).getDefaultFlavorOrImplicit());
    }

    @Test
    public void testImplicitDefaultFlavorNoFlavoredStyleDef() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<div aura:flavorable='true'></div>"));
        assertNull(definitionService.getDefinition(desc).getDefaultFlavorOrImplicit());
    }

    @Test
    public void testImplicitDefaultFlavorDifferentName() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<div aura:flavorable='true'></div>"));
        // flavor name is "test", not "default"
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS--test{}");
        assertNull(definitionService.getDefinition(desc).getDefaultFlavorOrImplicit());
    }

    // TODO: re-enable when validateReferences in FlavoredStyleDefImpl is fixed.
//    @Test
//    public void testImplicitDefaultFlavorWithoutFlavorable() throws Exception {
//        try {
//            DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
//                    String.format(baseTag, "", "<div></div>"));
//            addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc), ".THIS--default{}");
//            definitionService.getDefinition(desc).validateDefinition();
//            fail("expected to get an exception");
//        } catch (Exception e) {
//            checkExceptionContains(e, InvalidDefinitionException.class, "must contain at least one aura:flavorable");
//        }
//    }

    @Test
    public void testExplicitAndImplicitDefaultFlavor() throws Exception {
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "defaultFlavor='test'", "<div aura:flavorable='true'></div>"));
        addSourceAutoCleanup(Flavors.standardFlavorDescriptor(desc),
                ".THIS--default{}" +
                        ".THIS--test{}");
        assertEquals("test", definitionService.getDefinition(desc).getDefaultFlavorOrImplicit());
    }

    @Test
    public void testValidateDefinitionValidateJsCode() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class, "<aura:component></aura:component>");
        DefDescriptor<ControllerDef> controllerDesc = definitionService.getDefDescriptor(cmpDesc,
                DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);

        String controllerCode = "({ function1: function(cmp) {var a = {k:}} })";
        addSourceAutoCleanup(controllerDesc, controllerCode);

        Source<ComponentDef> source = stringSourceLoader.getSource(cmpDesc);

        try {
            compilerService.compile(cmpDesc, source);
            fail("Expecting an InvalidDefinitionException");
        } catch(Exception e) {
            String expectedMsg = String.format("JS Processing Error: %s", cmpDesc.getQualifiedName());
            this.assertExceptionMessageContains(e, InvalidDefinitionException.class, expectedMsg);
        }
    }

    @Test
    public void testGetComponentDefWithExtends() throws Exception {
        DefDescriptor<ComponentDef> childDescriptor = definitionService.getDefDescriptor("test:extendsChild",
                ComponentDef.class);
        DefDescriptor<ComponentDef> parentDescriptor = definitionService.getDefDescriptor("test:extendsParent",
                ComponentDef.class);
        ComponentDef def = definitionService.getDefinition(childDescriptor);
        assertEquals(parentDescriptor, def.getExtendsDescriptor());
        assertEquals(2, def.getModelDefDescriptors().size());
        assertEquals("java://org.auraframework.components.test.java.controller.TestController", def.getControllerDefDescriptors()
                .get(0).getQualifiedName());
        assertEquals("java://org.auraframework.components.test.java.model.TestModel", def.getModelDef().getDescriptor()
                .getQualifiedName());
    }
}
