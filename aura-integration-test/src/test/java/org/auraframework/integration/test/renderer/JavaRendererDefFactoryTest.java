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
package org.auraframework.integration.test.renderer;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.java.JavaSourceLoader;
import org.auraframework.impl.java.renderer.JavaRendererDef;
import org.auraframework.impl.java.renderer.JavaRendererDefFactory;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Ignore;
import org.junit.Test;

/**
 * This class has automation for JavaRendererDefFactory. This factory fetches definitions of renderers defined in Java.
 */
public class JavaRendererDefFactoryTest extends AuraImplTestCase {
    JavaSourceLoader loader;

    JavaRendererDefFactory factory;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        loader = new JavaSourceLoader();
        factory = new JavaRendererDefFactory();
    }

    /**
     * Verify Generation of JavaRendererDef from JavaRendererDefFactory.
     */
    @Test
    public void testDefGeneration() throws Exception {
        DefDescriptor<RendererDef> descriptor = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer", RendererDef.class);
        RendererDef def = factory.getDefinition(descriptor, loader.getSource(descriptor));
        assertTrue("JavaRendererDefFactory should always generate JavaRendererDefs", def instanceof JavaRendererDef);
    }

    /**
     * Verify that specifying a non existent Java class returns null.
     */
    @Test
    @Ignore
    public void testClassNotFound() throws Exception {
        DefDescriptor<RendererDef> descriptor = definitionService
                .getDefDescriptor("java://ClassNotFound", RendererDef.class);
        assertNull(factory.getDefinition(descriptor, loader.getSource(descriptor)));

        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component renderer='java://ClassNotFound'></aura:component>");
        try {
            definitionService.getDefinition(cmpDesc);
            fail("Should not be able to retrieve component definition when specified renderer is invalid.");
        } catch (Exception e) {
            checkExceptionStart(e, DefinitionNotFoundException.class,
                    "No RENDERER named java://ClassNotFound found");
        }
    }

    /**
     * Verify that specifying an absrtact java class as renderer throws an Exception.
     * 
     * @throws Exception
     */
    @Test
    public void testAbstractClassAsRenderer() throws Exception {
        // 1. Renderers which extend Renderer interface
        DefDescriptor<RendererDef> descriptor = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestAbstractRenderer", RendererDef.class);
        try {
        	definitionService.getDefinition(descriptor);
        	fail("JavaRenderers that extend Renderer interface cannot be abstract.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class,
                    "Cannot instantiate org.auraframework.impl.renderer.sampleJavaRenderers.TestAbstractRenderer",
                    "org.auraframework.impl.renderer.sampleJavaRenderers.TestAbstractRenderer");
        }
    }

    /**
     * Verify that a JavaRenderer extending Renderer interface cannot hide its constructor.
     */
    @Test
    public void testRendererWithPrivateConstructor() throws Exception {
        DefDescriptor<RendererDef> descriptor = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestPrivateConstructorInRendererExtension",
                RendererDef.class);
        try {
        	definitionService.getDefinition(descriptor);
            fail("JavaRenderers that implement Renderer interface cannot hide their constructor.");
        } catch (Exception e) {
            checkExceptionFull(
                    e,
                    InvalidDefinitionException.class,
                    "Constructor is inaccessible for org.auraframework.impl.renderer.sampleJavaRenderers.TestPrivateConstructorInRendererExtension",
                    "org.auraframework.impl.renderer.sampleJavaRenderers.TestPrivateConstructorInRendererExtension");
        }
    }

    /**
     * Verify that specifying a Java class not implementing Renderer interface throws runtime exception.
     */
    @Test
    public void testClassDoesNotImplementRenderer() throws Exception {
        JavaRendererDef.Builder builder = new JavaRendererDef.Builder();
        builder.setDescriptor(definitionService.getDefDescriptor(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer", RendererDef.class));
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        JavaRendererDef def = builder.build();

        try {
            def.validateDefinition();
            fail("JavaRendererDef cannot be created if interface not implemented.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Renderer must implement the Renderer interface.");
        }
    }
}
