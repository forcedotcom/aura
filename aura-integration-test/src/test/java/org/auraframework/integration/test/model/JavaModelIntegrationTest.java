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
package org.auraframework.integration.test.model;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ValueDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Model;
import org.auraframework.system.Location;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * Integration tests for Java Model
 */
public class JavaModelIntegrationTest extends AuraImplTestCase {
    public JavaModelIntegrationTest(String name) {
        super(name);
    }

    /**
     * Verify that class level annotation is required for a java model.
     */
    public void testClassLevelAnnotationForJavaModel() throws Exception {
        DefDescriptor<ModelDef> javaModelDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.model.TestModel", ModelDef.class);

        ModelDef actual = definitionService.getDefinition(javaModelDefDesc);
        assertNotNull(actual);
    }

    /**
     * Verify that InvalidDefinitionException is thrown when getting definition of a Java model without Model annotation.
     */
    public void testExceptionIsThrownWhenModelWithoutAnnotation() {
        DefDescriptor<ModelDef> javaModelDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.model.TestModelWithoutAnnotation", ModelDef.class);
        try {
            definitionService.getDefinition(javaModelDefDesc);
            fail("Expected InvalidDefinitionException");
        } catch (Exception e) {
            checkExceptionStart(e, InvalidDefinitionException.class, "@Model annotation is required on all Models.",
                    javaModelDefDesc.getName());
        }
    }


    /**
     * Verify that a Java model can extend another Java model.
     */
    public void testJavaModelInheritance() throws Exception {
        DefDescriptor<ModelDef> javaModelDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.components.test.java.model.TestModelSubclass", ModelDef.class);
        ModelDef def = definitionService.getDefinition(javaModelDefDesc);
        assertNotNull(def);
        Model model = def.newInstance();

        ValueDef valueDef = def.getMemberByName("nextThing");
        assertNotNull("Unable to find value def for 'nextThing'", valueDef);

        PropertyReferenceImpl refNextThing = new PropertyReferenceImpl("nextThing", new Location("test", 0));
        assertEquals("nextThing", model.getValue(refNextThing));

        ValueDef valueDefFromSuper = def.getMemberByName("firstThing");
        assertNotNull("Unable to find value def for 'firstThing'", valueDefFromSuper);

        PropertyReferenceImpl refFirstThing = new PropertyReferenceImpl("firstThing", new Location("test", 1));
        assertEquals("firstThingDefault", model.getValue(refFirstThing));
    }

    public void testExceptionIsThrownWhenModelMethodReturnsVoid() {
        String targetModel = "java://org.auraframework.impl.java.model.TestModelWithVoid";
        try {
            definitionService.getDefinition(targetModel, ModelDef.class);
            fail("Expected InvalidDefinitionException when Java model method's return type is void.");
        } catch (Exception e) {
            String expectedMessage = "@AuraEnabled annotation found on void method getNothing";
            checkExceptionStart(e, InvalidDefinitionException.class, expectedMessage, targetModel);
        }
    }

    public void testExceptionIsThrownWhenModelMethodIsStatic() throws Exception {
        String targetModel = "java://org.auraframework.impl.java.model.TestModelWithStatic";
        try {
            definitionService.getDefinition(targetModel, ModelDef.class);
            fail("Expected InvalidDefinitionException when Java model method is static");
        } catch (Exception e) {
            String expectedMessage = "@AuraEnabled annotation found on invalid method getStaticString";
            checkExceptionStart(e, InvalidDefinitionException.class, expectedMessage, targetModel);
        }
    }

    /**
     * Verify that DefinitionNotFoundException is thrown if model doesn't exist
     */
    public void testExceptionIsThrownWhenModelNotFound() throws Exception {
        DefDescriptor<ComponentDef> javaModelDefDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component model='java://DoesNotExist'/>");
        try {
            definitionService.getDefinition(javaModelDefDesc);
            fail("Expected DefinitionNotFoundException when Java model doest not exist.");
        } catch (Exception e) {
            String expectedMessage = "No MODEL named java://DoesNotExist found";
            checkExceptionContains(e, DefinitionNotFoundException.class, expectedMessage);
        }
    }

    /**
     * Verify Java model can be accessed in privileged (system) namespace
     */
    public void testModelInPrivilegedNamespace() throws Exception {
        String resourceSource = "<aura:component model='java://org.auraframework.impl.java.model.TestModel'>Hello World!</aura:component>";
        DefDescriptor<ComponentDef> cmpDefDesc = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, resourceSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testComponent", true);

        ComponentDef actual = definitionService.getDefinition(cmpDefDesc);
        assertNotNull(actual);
    }

    /**
     * Verify model can NOT be accessed in non-privileged (custom) namespace
     */
    public void testExceptionIsThrownWhenUsingJavaModelInNonPriviledgedNamespace() throws Exception {
        String resourceSource = "<aura:component model='java://org.auraframework.impl.java.model.TestModel'>Hello World!</aura:component>";
        DefDescriptor<ComponentDef> cmpDefDesc = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, resourceSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testComponent", false);

        try {
            definitionService.getDefinition(cmpDefDesc);
            fail("Expected NoAccessException when using Java model in non-privileged namespace.");
        } catch (Exception e) {
            String errorMessage = String.format("Access to model 'org.auraframework.impl.java.model:TestModel' from namespace '%s' in '%s(COMPONENT)'",
                    StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE, cmpDefDesc.getQualifiedName());
           checkExceptionContains(e, NoAccessException.class, errorMessage);
        }
    }

    /**
     * Verify AuraExecutionException is thrown when accessing value of a non existing property from Java model.
     */
    public void testNonExistingPropertiesOnModel() throws Exception {
        DefDescriptor<ModelDef> javaModelDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.model.TestModel", ModelDef.class);
        ModelDef mDef = definitionService.getDefinition(javaModelDefDesc);
        assertNotNull(mDef);
        Model model = mDef.newInstance();
        try {
            model.getValue(new PropertyReferenceImpl("DoesNotExist", new Location("test", 0)));
            fail("Expected AuraExecutionException when getting value of a non existing property from Java model.");
        } catch (Exception e) {
            checkExceptionStart(e, AuraExecutionException.class, "TestModel: no such property: DoesNotExist",
                    javaModelDefDesc.getName());
        }
    }
}
