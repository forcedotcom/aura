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
package org.auraframework.impl.renderer;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

import org.auraframework.def.*;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.java.renderer.JavaRendererDef;
import org.auraframework.impl.java.renderer.JavaRendererDefFactory;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * This class has automation for JavaRendererDefFactory. This factory fetches definitions of renderers defined in Java.
 *
 * @hierarchy Aura.Components.Renderer
 * @priority high
 * @userStory a07B0000000Doob
 */
public class JavaRendererDefFactoryTest extends AuraImplTestCase {
    JavaRendererDefFactory factory;

    public JavaRendererDefFactoryTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        factory = new JavaRendererDefFactory();
    }

    /**
     * Verify Generation of JavaRendererDef from JavaRendererDefFactory.
     */
    public void testDefGeneration() throws Exception {
        DefDescriptor<RendererDef> descriptor = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer", RendererDef.class);
        RendererDef def = factory.getDef(descriptor);
        assertTrue("JavaRendererDefFactory should always generate JavaRendererDefs", def instanceof JavaRendererDef);
    }

    /**
     * Verify that specifying a non existent Java class returns null.
     */
    public void testClassNotFound() throws Exception {
        DefDescriptor<RendererDef> descriptor = DefDescriptorImpl
                .getInstance("java://ClassNotFound", RendererDef.class);
        assertNull(factory.getDef(descriptor));

        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class, "<aura:component renderer='java://ClassNotFound'></aura:component>");
        try {
            cmpDesc.getDef();
            fail("Should not be able to retrieve component definition when specified renderer is invalid.");
        } catch (DefinitionNotFoundException e) {
            assertTrue(e.getMessage().contains("No RENDERER named java://ClassNotFound found"));
        }
    }

    /**
     * Verify that Renderer interface declares method with correct properties. Renderer interface will be implemented by
     * all Renderers.
     *
     * @throws Exception
     */
    public void testRendererInterfaceProperties() throws Exception {
        try {
            Method renderMethod = Renderer.class.getMethod("render", BaseComponent.class, Appendable.class);
            assertTrue("render method on Renderer interface should be declared public.",
                    Modifier.isPublic(renderMethod.getModifiers()));
        } catch (NoSuchMethodException e) {
            // The interface org.auraframework.def.Renderer should declare a render method to be overriden by Java
            // renderers.
            fail("Renderer interface does not declare a render method.");
        }
    }

    /**
     * Verify that specifying an absrtact java class as renderer throws an Exception.
     *
     * @throws Exception
     */
    public void testAbstractClassAsRenderer() throws Exception {
        // 1. Renderers which extend Renderer interface
        DefDescriptor<RendererDef> descriptor = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestAbstractRenderer", RendererDef.class);
        try {
            descriptor.getDef();
            fail("JavaRenderers that extend Renderer interface cannot be abstract.");
        } catch (InvalidDefinitionException e) {
            assertTrue(e.getMessage().contains(
                    "Cannot instantiate org.auraframework.impl.renderer.sampleJavaRenderers.TestAbstractRenderer"));
        }
    }

    /**
     * Verify that a JavaRenderer extending Renderer interface cannot hide its constructor.
     */
    public void testRendererWithPrivateConstructor() throws Exception {
        DefDescriptor<RendererDef> descriptor = DefDescriptorImpl
                .getInstance(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestPrivateConstructorInRendererExtension",
                RendererDef.class);
        try {
            descriptor.getDef();
            fail("JavaRenderers that implement Renderer interface cannot hide their constructor.");
        } catch (InvalidDefinitionException e) {
            assertTrue(e
                    .getMessage()
                    .contains(
                            "Constructor is inaccessible for org.auraframework.impl.renderer.sampleJavaRenderers.TestPrivateConstructorInRendererExtension"));
        }
    }

    /**
     * Verify that specifying a Java class not implementing Renderer interface throws runtime exception.
     */
    public void testClassDoesNotImplementRenderer() throws Exception {
        JavaRendererDef.Builder builder = new JavaRendererDef.Builder();
        builder.setDescriptor(DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer", RendererDef.class));
        JavaRendererDef def = builder.build();

        try {
            def.validateDefinition();
            fail("JavaRendererDef cannot be created if interface not implemented.");
        } catch (InvalidDefinitionException e) {
            assertTrue(e.getMessage().contains("Renderer must implement the Renderer interface."));
        }
    }
}
