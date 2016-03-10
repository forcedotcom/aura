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
package org.auraframework.integration.test.java.provider;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

import com.google.common.collect.Maps;

/**
 * Integration tests for Java provider
 */
public class JavaProviderIntegrationTest extends AuraImplTestCase {


    public JavaProviderIntegrationTest(String name) {
        super(name);
    }

    public void testConcreteProviderInjection() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("whatToDo", "replace");
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the interface.",
                component.getDescriptor().getQualifiedName(), "markup://test:test_Provider_Concrete_Sub");
    }

    public void testConcreteProviderNull() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("whatToDo", "label");
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the interface.",
                component.getDescriptor().getQualifiedName(), "markup://test:test_Provider_Concrete");
    }

    public void testConcreteProviderNotComponent() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("whatToDo", "replaceBad");
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class, attributes);
            fail("expected exception for bad provider return");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class, "markup://test:fakeApplication is not a component");
        }
    }

    public void testConcreteProviderComponentNotFound() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("whatToDo", "replaceNotFound");
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class, attributes);
            fail("expected exception for bad provider return");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class,
                    "java://org.auraframework.impl.java.provider.ConcreteProvider did not provide a valid component");
        }
    }

    /**
     * Verify that abstract component's provider returns a component which extends the abstract class
     */
    public void testJavaProviderProvidesExtentingCmpWhenAbstractCmpGetsInstantiated() throws Exception {
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_AbstractBasic",
                ComponentDef.class);
        String actual = component.getDescriptor().getQualifiedName();
        assertEquals("Java Provider: Failed to retrieve the component extending abstract component.",
                "markup://test:test_Provider_AbstractBasicExtends", actual);
    }

    public void testComponentConfigProvider() throws Exception{
        String targetProvider = "java://org.auraframework.impl.java.provider.TestComponentConfigProvider";
        DefDescriptor<ProviderDef> javaProviderDefDesc = definitionService.getDefDescriptor(targetProvider, ProviderDef.class);
        ProviderDef actual = javaProviderDefDesc.getDef();
        assertNotNull(actual);
        assertEquals(targetProvider, actual.getDescriptor().getQualifiedName());
    }

    public void testComponentDescriptorProvider() throws Exception{
        String targetProvider = "java://org.auraframework.impl.java.provider.TestComponentDescriptorProvider";
        DefDescriptor<ProviderDef> javaProviderDefDesc = definitionService.getDefDescriptor(targetProvider, ProviderDef.class);
        ProviderDef actual = javaProviderDefDesc.getDef();
        assertNotNull(actual);
        assertEquals(targetProvider, actual.getDescriptor().getQualifiedName());
    }

    /**
     * Verify InvalidDefinitionException is thrown when Java provider doesn't use Provider annotation.
     */
    public void testExceptionIsThrownWhenJavaProviderWithoutAnnotation() throws Exception {
        DefDescriptor<ProviderDef> javaPrvdrDefDesc = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.java.provider.TestProviderWithoutAnnotation", ProviderDef.class);
        try {
            javaPrvdrDefDesc.getDef();
            fail("Expected a InvalidDefinitionException when Java provider doesn't use Provider annotation");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "@Provider annotation is required on all Providers.");
        }
    }

    /**
     * Verify InvalidDefinitionException is thrown when Java provider doesn't implement Provider interface.
     */
    public void testExceptionIsThrownWhenJavaProviderWithoutImplementingInterface() throws Exception {
        String targetProvider = "java://org.auraframework.impl.java.provider.TestProviderWithoutImplementingInterface";
        DefDescriptor<ProviderDef> javaProviderDefDesc = definitionService.getDefDescriptor(targetProvider, ProviderDef.class);
        try {
            javaProviderDefDesc.getDef();
            fail("Expected a InvalidDefinitionException when Java provider doesn't implement Provider interface.");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "@Provider must have a provider interface.");
        }
    }

    /**
     * Verify the original exception from provide() method is thrown out.
     */
    public void testExceptionFromProvideIsThrownOut() throws Exception {
        String resourceSource = "<aura:component provider='java://org.auraframework.impl.java.provider.TestProviderThrowsExceptionDuringProvide'></aura:component>";
        DefDescriptor<ComponentDef> cmpDefDesc = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, resourceSource);
        try {
            Aura.getInstanceService().getInstance(cmpDefDesc.getDescriptorName(), ComponentDef.class);
            fail("Should have thrown exception in provider's provide() method.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "Exception from TestProviderThrowsExceptionDuringProvide");
        }
    }
}
