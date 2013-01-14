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
package org.auraframework.def;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.def.BaseComponentDef.RenderType;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.root.component.LazyComponentDefRef;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidReferenceException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonStreamReader;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

public abstract class BaseComponentDefTest<T extends BaseComponentDef> extends RootDefinitionTest<T> {

    protected final String interfaceTag = "<aura:interface provider='%s'>%s</aura:interface>";

    public BaseComponentDefTest(String name, Class<T> defClass, String tag) {
        super(name, defClass, tag);
    }

    /**
     * Test method for {@link ApplicationDef#getLocalModelDefDescriptor()}.
     */
    public void testGetLocalModelDefDescriptor() throws Exception {
        DefDescriptor<ModelDef> dd = define(baseTag, "", "").getLocalModelDefDescriptor();
        assertNull(dd);

        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestModel2'", "").getDescriptor();
        dd = define(
                baseTag,
                "model='java://org.auraframework.impl.java.model.TestModel' extends='" + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'", "").getLocalModelDefDescriptor();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.java.model.TestModel", dd.getQualifiedName());
    }

    /**
     * Test method for {@link ApplicationDef#getModelDefDescriptors()}.
     */
    public void testGetModelDefDescriptors() throws Exception {
        List<DefDescriptor<ModelDef>> dds = define(baseTag, "", "").getModelDefDescriptors();
        assertNotNull(dds);
        assertTrue(dds.isEmpty());

        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestModel2'", "").getDescriptor();
        dds = define(
                baseTag,
                "model='java://org.auraframework.impl.java.model.TestModel' extends='" + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'", "").getModelDefDescriptors();
        assertNotNull(dds);
        assertEquals(2, dds.size());
        List<String> names = Lists.transform(dds, new Function<DefDescriptor<?>, String>() {
            @Override
            public String apply(DefDescriptor<?> input) {
                return input.getQualifiedName();
            }
        });
        assertTrue(names.containsAll(ImmutableSet.of("java://org.auraframework.impl.java.model.TestModel",
                "java://org.auraframework.impl.java.model.TestModel2")));
    }

    /**
     * Test method for {@link ApplicationDef#getModelDef()}.
     */
    public void testGetModelDef() throws Exception {
        ModelDef d = define(baseTag, "", "").getModelDef();
        assertNull(d);

        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestModel2'", "").getDescriptor();
        d = define(
                baseTag,
                "model='java://org.auraframework.impl.java.model.TestModel' extends='" + ddParent.getNamespace() + ":"
                        + ddParent.getName() + "'", "").getModelDef();
        assertNotNull(d);
        assertEquals("TestModel", d.getName());
    }

    /**
     * Test method for {@link ApplicationDef#getControllerDefDescriptors()}.
     */
    public void testGetControllerDefDescriptors() throws Exception {
        List<DefDescriptor<ControllerDef>> dds = define(baseTag, "", "").getControllerDefDescriptors();
        assertNotNull(dds);
        assertTrue(dds.isEmpty());

        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' controller='java://org.auraframework.impl.java.controller.TestController2'", "")
                .getDescriptor();
        dds = define(
                baseTag,
                "controller='java://org.auraframework.impl.java.controller.TestController' extends='"
                        + ddParent.getNamespace() + ":" + ddParent.getName() + "'", "").getControllerDefDescriptors();
        assertNotNull(dds);
        assertEquals(2, dds.size());
        List<String> names = Lists.transform(dds, new Function<DefDescriptor<?>, String>() {
            @Override
            public String apply(DefDescriptor<?> input) {
                return input.getQualifiedName();
            }
        });
        assertTrue(names.containsAll(ImmutableSet.of("java://org.auraframework.impl.java.controller.TestController",
                "java://org.auraframework.impl.java.controller.TestController2")));
    }

    /**
     * Test method for {@link ApplicationDef#getControllerDef()}.
     */
    public void testGetControllerDef() throws Exception {
        ControllerDef d = define(baseTag, "", "").getControllerDef();
        assertNull(d);

        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(baseTag,
                "extensible='true' controller='java://org.auraframework.impl.java.controller.TestController2'", "")
                .getDescriptor();
        d = define(
                baseTag,
                "controller='java://org.auraframework.impl.java.controller.TestController' extends='"
                        + ddParent.getNamespace() + ":" + ddParent.getName() + "'", "").getControllerDef();
        assertNotNull(d);
        String name = d.getDescriptor().getQualifiedName();
        assertTrue("Unexpected name: " + name, name.matches("compound://string\\..*"));
    }

    /**
     * Test method for {@link ApplicationDef#getRendererDescriptor()}.
     */
    public void testGetRendererDescriptor() throws Exception {
        DefDescriptor<RendererDef> dd = define(baseTag, "", "").getRendererDescriptor();
        assertNull(dd);

        @SuppressWarnings("unchecked")
        DefDescriptor<T> ddParent = (DefDescriptor<T>) define(
                baseTag,
                "extensible='true' renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestOverridingRenderer'",
                "").getDescriptor();
        dd = define(
                baseTag,
                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer' extends='"
                        + ddParent.getNamespace() + ":" + ddParent.getName() + "'", "").getRendererDescriptor();
        assertNotNull(dd);
        assertEquals("java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer",
                dd.getQualifiedName());
    }

    /**
     * Test method for {@link BaseComponentDef#getHandlerDefs()}.
     */
    public void testGetHandlerDefs() throws Exception {
        // Verify no handlers for empty component
        T def = define(baseTag, "", "");
        Collection<EventHandlerDef> handlerDefs = def.getHandlerDefs();
        assertEquals("Should have no handlers for empty component", 0, handlerDefs.size());

        // Verify multiple handlers can be added
        def = define(baseTag, "", "<aura:handler event=\"aura:doneWaiting\" action=\"{!c.empty}\"/>"
                + "<aura:handler event=\"aura:doneRendering\" action=\"{!c.empty}\"/>");
        handlerDefs = def.getHandlerDefs();
        assertEquals("Wrong number of handlers", 2, handlerDefs.size());
        for (EventHandlerDef handlerDef : handlerDefs) {
            assertTrue("Wrong handlers added to definiton", handlerDef.toString().equals("markup://aura:doneWaiting")
                    || handlerDef.toString().equals("markup://aura:doneRendering"));
        }
    }

    /**
     * Test method for {@link BaseComponentDef#getThemeDescriptor()}.
     */
    public void testGetThemeDescriptor() throws Exception {
        T def = define(baseTag, "", "");
        DefDescriptor<ThemeDef> themeDef = def.getThemeDescriptor();
        assertNull("ThemeDescriptor for component without theme should be null", themeDef);

        def = define(baseTag, "theme=\"templateCss://test.themeTestTemplate\"", "");
        themeDef = def.getThemeDescriptor();
        assertNotNull("ThemeDescriptor not found on component", themeDef);
        assertEquals("Wrong ThemeDescriptor found on component", "templateCss://test.themeTestTemplate",
                themeDef.getQualifiedName());
    }

    /**
     * Verify the render attribute specified on a component tag. Detection logic
     * to render a component serverside or clientside is controlled by an
     * attribute on the top level component. By default the rendering logic is
     * turned on. Test method for {@link BaseComponentDef#getRender()}.
     * 
     * @userStory a07B0000000EWWg
     */
    public void testGetRender() throws Exception {
        RenderType defaultRender = define(baseTag, "", "").getRender();
        assertEquals("By default, rendering detection logic should be on.", RenderType.AUTO, defaultRender);

        T serverRenderedComponentDef = define(baseTag, " render='server'", "");
        assertEquals("Rendering detection logic was expected to be forced to be serverside.", RenderType.SERVER,
                serverRenderedComponentDef.getRender());
        assertTrue("A component which wishes to be rendered server side cannot be locally renderable?",
                serverRenderedComponentDef.isLocallyRenderable());

        T clientRenderedComponentDef = define(baseTag, " render='client'", "");
        assertEquals("Rendering detection logic was expected to be forced to be clientside.", RenderType.CLIENT,
                clientRenderedComponentDef.getRender());
        assertFalse("A component which wishes to be rendered client side can be locally renderable?",
                clientRenderedComponentDef.isLocallyRenderable());

    }

    /**
     * Verify the whitespace attribute specified on a component tag. Detection
     * logic to whitespace preserve or optimize is controlled by an attribute on
     * the top level component. By default the whitespace logic is optimize,
     * which removes all non-necessary whitespace. Test method for
     * {@link aura.def.BaseComponentDef#getWhitespace()}.
     * 
     * @userStory W-1348188
     */
    public void testGetWhitespaceAttribute() throws Exception {
        WhitespaceBehavior defaultWhitespaceBehavior = define(baseTag, "", "").getWhitespaceBehavior();
        assertEquals("By default, whitespace optimize should be true.", BaseComponentDef.DefaultWhitespaceBehavior,
                defaultWhitespaceBehavior);

        T preserveWhitespaceComponentDef = define(baseTag, " whitespace='preserve'", "");
        assertEquals("Whitespace behavior was expected to be forced to be preserve.", WhitespaceBehavior.PRESERVE,
                preserveWhitespaceComponentDef.getWhitespaceBehavior());

        T optimizeWhitespaceComponentDef = define(baseTag, " whitespace='optimize'", "");
        assertEquals("Whitespace behavior was expected to be forced to be optimize.", WhitespaceBehavior.OPTIMIZE,
                optimizeWhitespaceComponentDef.getWhitespaceBehavior());

        try {
            define(baseTag, " whitespace='bogus'", "");
            fail("IllegalArgumentException should have been thrown for bad whitespace value.");
        } catch (IllegalArgumentException ex) {
        }
    }

    /**
     * Test to verify the detection logic for rendering components. Test method
     * for {@link BaseComponentDef#isLocallyRenderable()}.
     * 
     * @userStory a07B0000000EWWg
     */
    public void testIsLocallyRenderable() throws Exception {
        /**
         * Test Case 1: When component has a Javascript Renderer
         */
        T baseComponentDef = define(baseTag, "renderer='js://test.testJSRenderer'", "");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has client renderers, the component should not be serverside renderable.",
                baseComponentDef.isLocallyRenderable());
        /**
         * Test Case 2: When component has only Serverside Renderers
         */
        baseComponentDef = define(baseTag, "", "Body: Has just text. Text component has a java renderer.");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        /**
        */

        /**
         * Test Case 3: When component includes an interface as facet, the
         * interface has a Javascript provider
         */
        baseComponentDef = define(baseTag, "", "Body: Includes an interface which has a JS provider. "
                + " <test:test_JSProvider_Interface/>");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse(
                "When a component has dependency on a clienside provider, the rendering should be done clientside.",
                baseComponentDef.isLocallyRenderable());

        // Disabling this test, as currently any component that has a theme is
        // not server-renderable.
        // Since this includes aura:html, not much renders server-side at the
        // moment.
        // W-922563
        // Test Case 4: When component includes an interface as facet, the
        // interface has local
        // providers
        /**
         * Test Case 5: When component includes a Javascript controller
         */
        baseComponentDef = define(baseTag, "", "Body: Includes a component with a client controller. "
                + " <test:testJSController/>");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has dependency on a controller, the rendering should be done clientside.",
                baseComponentDef.isLocallyRenderable());

        /**
         * Test Case 6: When a component includes a Theme file W-922563
         */
        baseComponentDef = define(baseTag, "theme='css://test.testValidCSS'", "");
        assertEquals("Rendering detection logic is not on.", RenderType.AUTO, baseComponentDef.getRender());
        assertFalse("When a component has a theme, the rendering should be done clientside.",
                baseComponentDef.isLocallyRenderable());

        /**
         * TODO : W-1228861 Test Case 7: When a facet of a component has a
         * component marked for LAZY loading, the component should always be
         * rendered client side.
         */
        // addSource("lazyCmp","<aura:component> <aura:text aura:load='LAZY'/></aura:component>",
        // ComponentDef.class);
        // baseComponentDef = define(baseTag, "render='SERVER'",
        // "<string:lazyCmp/>");
        // assertEquals("Rendering detection logic is not on.",
        // RenderType.SERVER,
        // baseComponentDef.getRender());
        // //TODO : W-1228861 ComponentDefRefHandler.readSystemAttributes() is
        // not chaining up to
        // root. its only going one level up
        // assertFalse("When a component has a inner component set to lazy load, the parent should be rendered clientside.",
        // baseComponentDef.isLocallyRenderable());

        /**
         * W-1228861Test Case 7: Verify that lazy loading specification in
         * parent is reflected in child and components which use the child.
         */
        // addSource("parentLazyCmp","<aura:component extensible='true'> <aura:text aura:load='LAZY'/></aura:component>",
        // ComponentDef.class);
        // DefDescriptor<ComponentDef> childLazyCmp =
        // addSource("childLazyCmp","<aura:component extends='string:parentLazyCmp'></aura:component>",
        // ComponentDef.class);
        // assertFalse("Lazy loading information is not chained through inheritance.",
        // childLazyCmp.getDef().isLocallyRenderable());
        // baseComponentDef = define(baseTag, "render='SERVER'",
        // "<string:childLazyCmp/>");
        // assertEquals("Rendering detection logic is not on.",
        // RenderType.SERVER,
        // baseComponentDef.getRender());
        // //TODO : W-1228861 ComponentDefRefHandler.readSystemAttributes() is
        // not chaining up to
        // root. its only going one level up
        // assertFalse("Lazy loading information is not chained through inheritance.",
        // baseComponentDef.isLocallyRenderable());

    }

    /**
     * Test to verify that components are marked as having serverside
     * dependencies appropriately. Components that have server side dependencies
     * have a flag marked in its def. "hasServerDeps" is part of the component
     * def.
     */
    public void testHasLocalDependencies() throws Exception {
        // 1. Having a model
        T baseComponentDef = define(baseTag, "model='java://org.auraframework.impl.java.model.TestJavaModel'", "");
        assertTrue("When a component has a model, the component has server dependencies .",
                baseComponentDef.hasLocalDependencies());
        assertEquals(true, this.serializeAndReadAttributeFromDef(baseComponentDef, "hasServerDeps"));

        // 2. Having a Java Renderer
        baseComponentDef = define(baseTag,
                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer'", "");
        assertTrue("When a component has a server renderer only, the component has server dependencies.",
                baseComponentDef.hasLocalDependencies());
        // 3. Having a client renderer
        baseComponentDef = define(
                baseTag,
                "renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer,js://test.testJSRenderer'",
                "");
        assertFalse("When a component has a client renderer, the component does not have server dependencies.",
                baseComponentDef.hasLocalDependencies());
        assertEquals(null, this.serializeAndReadAttributeFromDef(baseComponentDef, "hasServerDeps"));
        // 4. Having a Client side provider
        assertFalse("Abstract Component with client provider should not have any server dependencies.",
                definitionService.getDefinition("test:test_JSProvider_AbstractBasic", ComponentDef.class)
                        .hasLocalDependencies());

        // 5. Having only server side provider
        assertTrue("Abstract Component with serverside providers have server dependecies.", definitionService
                .getDefinition("test:test_Provider_AbstractBasic", ComponentDef.class).hasLocalDependencies());

        // 6. Server dependency through component extension
        // Having a Parent who has server dependencies, should also make the
        // child server dependent
        String parentContent = String.format(baseTag,
                "extensible='true' model='java://org.auraframework.impl.java.model.TestJavaModel' ", "");
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(), parentContent);

        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extends='" + parent.getDescriptorName() + "'", ""));
        assertTrue(
                "When a component's parent has serverside dependency, the component should be marked as server dependent.",
                child.getDef().hasLocalDependencies());

        // 7. When component has a facet with serverside dependency, should it
        // be marked as having
        // server dependency?
        /**
         * TODO: DP? baseComponentDef = define(baseTag, "",
         * "Body: Includes an interface which has a Java provider. " +
         * "<test:test_Provider_Interface implNumber='3'/>"); assertTrue(
         * "When a component's facet has serverside dependency, should the component also be marked as server dependent?"
         * , baseComponentDef.hasLocalDependencies());
         */

    }

    public void testComponentCannotExtendItself() {
        DefDescriptor<T> extendsSelf = addSourceAutoCleanup(getDefClass(), "");
        Source<T> source = auraTestingUtil.getSource(extendsSelf);
        source.addOrUpdate(String.format(baseTag,
                "extensible='true' extends='" + extendsSelf.getDescriptorName() + "'", ""));
        DefType defType = DefType.getDefType(this.getDefClass());
        try {
            T componentDef = extendsSelf.getDef();
            componentDef.validateReferences();
            fail(defType + " should not be able to extend itself.");
        } catch (InvalidDefinitionException expected) {
            assertEquals(extendsSelf.getQualifiedName() + " cannot extend itself", expected.getMessage());
        } catch (Exception e) {
            fail("Unexpected Exception " + e);
        }
    }

    public void testIsInstanceOf() throws Exception {
        // Test cases for Abstract Component extensions
        DefDescriptor<T> grandParent = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' abstract='true'", ""));
        DefDescriptor<T> parent = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + grandParent.getDescriptorName() + "'", ""));
        DefDescriptor<T> child = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + parent.getDescriptorName() + "'", ""));

        assertTrue("Failed to assert inheritance across one level.", parent.getDef().isInstanceOf(grandParent));
        assertTrue("Failed to assert inheritance across one level.", child.getDef().isInstanceOf(parent));
        assertTrue("Failed to assert inheritance across multiple levels.", child.getDef().isInstanceOf(grandParent));

        // Test cases for Interface inheritance and implementations
        String interfaceTag = "<aura:interface %s> </aura:interface>";
        DefDescriptor<InterfaceDef> grandParentInterface = addSourceAutoCleanup(InterfaceDef.class,
                String.format(interfaceTag, ""));
        DefDescriptor<InterfaceDef> parentInterface = addSourceAutoCleanup(InterfaceDef.class,
                String.format(interfaceTag, "extends='" + grandParentInterface.getDescriptorName() + "'"));
        DefDescriptor<T> interfaceImpl = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "implements='" + parentInterface.getDescriptorName() + "'", ""));
        assertTrue("Failed to assert interface implementation one level.",
                interfaceImpl.getDef().isInstanceOf(parentInterface));
        assertTrue("Failed to assert inherface extension across one level.",
                parentInterface.getDef().isInstanceOf(grandParentInterface));
        assertTrue("Failed to assert inheritance implementation across multiple levels.", interfaceImpl.getDef()
                .isInstanceOf(grandParentInterface));

    }

    /**
     * Test to verify lazy loading of facets. facets can be lazy loaded by
     * marking them so: <aura:component> <namespace:facetName aura:load="lazy"/>
     * </aura:component>
     * 
     * There are 3 levels of load specification. DEFAULT : Does not lazy load
     * LAZY : Loading is done on client only after parent component enclosing
     * the marked component is rendered. Until that happens, a
     * placeholder(aura:placeholder) is placed in the dom. In afterRender, a
     * server action fetches the actual component and replaces the placeholder.
     * EXCLUSIVE: Everything is the same as LAZY loading just with one
     * difference. The server action to fetch the actual component is exclusive.
     * Which means it is not bundled with other actions. Aura uses a queue
     * system on the clientside to batch server actions.
     * 
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public void testLazyLoadingFacets() throws Exception {
        // 1. When a facet is marked for Lazy/Exclusive loading, parentDef has a
        // LazyComponentDefRef
        DefDescriptor<T> desc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "",
                "<aura:text aura:load='LAZY'/>" + "<aura:label />" + "<aura:text aura:load='Exclusive'/>"));

        T def = desc.getDef();
        AttributeDefRef body = getBodyAttributeFromDef(def);
        assertTrue(body.getValue() instanceof List);
        List<?> bodyCmps = (List<?>) body.getValue();
        assertEquals(3, bodyCmps.size());
        assertTrue(bodyCmps.get(0) instanceof LazyComponentDefRef);
        assertEquals("markup://aura:text", ((DefDescriptor<ComponentDef>) ((LazyComponentDefRef) bodyCmps.get(0))
                .getAttributeDefRef("refDescriptor").getValue()).getQualifiedName());

        assertTrue(bodyCmps.get(2) instanceof LazyComponentDefRef);
        assertEquals(true, ((LazyComponentDefRef) bodyCmps.get(2)).getAttributeDefRef("exclusive").getValue());
        // 2. When a facet is not marked with no load level, the DEFAULT level
        // is used.
        assertTrue(bodyCmps.get(1) instanceof ComponentDefRef);

        // 3. When a bad component is specified to be loaded Lazily
        desc = addSourceAutoCleanup(getDefClass(), String.format(baseTag, "", "<aura:fooBar999 aura:load='LAZY'/>"));
        try {
            desc.getDef();
            fail("should not be able to use a non-existing component by marking it to be lazy loaded");
        } catch (DefinitionNotFoundException e) {
            assertTrue(e.getMessage().contains("No COMPONENT named markup://aura:fooBar999"));
        }

        // 4. When a component is requested with non-existing attribute
        desc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<aura:text aura:load='LAZY' fooBar999='hoze'/>"));
        try {
            desc.getDef();
            fail("should not be able to use a non-existing attribute by marking it to be lazy loaded");
        } catch (InvalidReferenceException e) {
            assertTrue(e.getMessage().contains("Attribute fooBar999 does not exist"));
        }

        // 5. W-1300925- Required attribute validation
        /*
         * This test doesn't work because the attribute validation can't be done
         * on a def, it is done on an instance, which needs to be requested by
         * the client }
         */

        // 6. Non basic data type for attribute specification.
        DefDescriptor<ComponentDef> cmpAttr = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:attribute name='cmps' type='Aura.Component'/> </aura:component>");
        desc = addSourceAutoCleanup(
                getDefClass(),
                String.format(baseTag, "",
                        "<" + cmpAttr.getDescriptorName() + " aura:load='LAZY'>" + "<aura:set attribute='cmps'>"
                                + "<aura:text/>" + "</aura:set>" + "</" + cmpAttr.getDescriptorName() + ">"));
        try {
            desc.getDef();
            fail("should not be able to use a non-basic attribute type in lazy loaded component");
        } catch (InvalidReferenceException e) {
            assertTrue(e
                    .getMessage()
                    .contains(
                            "Lazy Component References can only have attributes of simple types passed in (cmps is not simple)"));
        }
    }

    /**
     * Components outside aura namespace cannot implement aura:rootComponent.
     * Test uses string namespace.
     */
    public void testNonAuraRootMarker() throws Exception {
        DefDescriptor<T> d = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "implements='aura:rootComponent'", ""));
        DefType defType = DefType.getDefType(getDefClass());
        try {
            d.getDef();
            fail(defType + " should not be able to extend itself.");
        } catch (InvalidDefinitionException expected) {
            assertEquals(
                    String.format(
                            "Component %s cannot implement the rootComponent interface because it is not in the aura namespace",
                            d.getQualifiedName()), expected.getMessage());
        }
    }

    /**
     * Tests to verify validateReferences() on BaseComponentDefImpl.
     */
    public void testValidateReferences() throws Exception {
        // Grand parent with BETA support
        DefDescriptor<T> grandParentDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "extensible='true' support='BETA'", ""));
        // Parent with GA support
        DefDescriptor<T> parentDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + grandParentDesc.getDescriptorName()
                        + "' support='GA'", ""));
        try {
            parentDesc.getDef().validateReferences();
            fail("A child cannot widen the support level of its parent.");
        } catch (InvalidDefinitionException e) {
            assertEquals(
                    String.format("%s cannot widen the support level to GA from %s's level of BETA",
                            parentDesc.getQualifiedName(), grandParentDesc.getQualifiedName()), e.getMessage());
        }
        // Child with GA support
        DefDescriptor<T> childDesc = addSourceAutoCleanup(
                getDefClass(),
                String.format(baseTag, "extensible='true' extends='" + parentDesc.getDescriptorName()
                        + "' support='GA'", ""));
        try {
            childDesc.getDef().validateReferences();
            fail("A child cannot widen the support level of its grand parent.");
        } catch (InvalidDefinitionException e) {
            assertEquals(
                    childDesc.getQualifiedName() + " cannot widen the support level to GA from "
                            + grandParentDesc.getQualifiedName() + "'s level of BETA", e.getMessage());
        }
        // Including a component, that violates support level restriction, as
        // facet
        DefDescriptor<ComponentDef> parentCmp = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component extensible='true' support='BETA'></aura:component>", "validateReferences_parentCmp");
        DefDescriptor<ComponentDef> childCmp = addSourceAutoCleanup(ComponentDef.class, "<aura:component extends='"
                + parentCmp.getDescriptorName() + "' support='GA'></aura:component>", "validateReferences_childCmp");
        DefDescriptor<T> testDesc = addSourceAutoCleanup(getDefClass(),
                String.format(baseTag, "", "<" + childCmp.getDescriptorName() + "/>"), "validateReferences_testCmp");
        try {
            testDesc.getDef().validateReferences();
            fail("Test component's facet has a component which tries to widen the support level of its parent.");
        } catch (InvalidDefinitionException e) {
            assertEquals(
                    String.format("%s cannot widen the support level to GA from %s's level of BETA",
                            childCmp.getQualifiedName(), parentCmp.getQualifiedName()), e.getMessage());
        }

    }

    private AttributeDefRef getBodyAttributeFromDef(T def) {
        assertNotNull(def);
        List<AttributeDefRef> facet = def.getFacets();
        assertEquals(1, facet.size());
        AttributeDefRef body = facet.get(0);
        assertEquals("body", body.getName());
        return body;
    }

    @SuppressWarnings("unchecked")
    private Object serializeAndReadAttributeFromDef(T def, String property) throws Exception {
        JsonStreamReader jsonStreamReader = new JsonStreamReader(Json.serialize(def));
        jsonStreamReader.next();
        Object temp = jsonStreamReader.getValue();
        assertTrue(temp instanceof Map);
        Map<Object, Object> cmpConfig = (HashMap<Object, Object>) temp;
        return cmpConfig.containsKey(property) ? cmpConfig.get(property) : null;
    }
}
