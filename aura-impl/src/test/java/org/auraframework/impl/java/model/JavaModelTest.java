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
package org.auraframework.impl.java.model;

import java.io.IOException;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ValueDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Model;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.Json;

/**
 * This class provides automation for Java models.
 * 
 * @hierarchy Aura.Unit Tests.Components.Model.Java Model
 * @priority high
 */
public class JavaModelTest extends AuraImplTestCase {

    private static final DefDescriptor<ModelDef> descriptor = new DefDescriptor<ModelDef>() {
        private static final long serialVersionUID = -2368424955441005888L;

        @Override
        public void serialize(Json json) throws IOException {
            json.writeValue(getQualifiedName());
        }

        @Override
        public String getPrefix() {
            return "java";
        }

        @Override
        public String getNamespace() {
            return TestModel.class.getPackage().getName();
        }

        @Override
        public String getName() {
            return TestModel.class.getSimpleName();
        }

        @Override
        public String getFullyQualifiedName() {
            return DefType.MODEL.getSType()+"@"+getQualifiedName();
        }

        @Override
        public String getQualifiedName() {
            return getPrefix() + "://" + TestModel.class.getName();
        }

        @Override
        public String getDescriptorName() {
            return TestModel.class.getName();
        }

        @Override
        public boolean isParameterized() {
            return false;
        }

        @Override
        public String getNameParameters() {
            return null;
        }

        @Override
        public DefType getDefType() {
            return DefType.MODEL;
        }

        @Override
        public ModelDef getDef() {
            return null;
        }

        @Override
        public boolean exists() {
            return false;
        }

        @Override
        public int compareTo(DefDescriptor<?> other) {
            return DefDescriptorImpl.compare(this, other);
        }
    };

    public JavaModelTest(String name) {
        super(name);
    }

    public void testSerializeMetadata() throws Exception {
        JavaModelDefFactory factory = new JavaModelDefFactory();
        ModelDef def = factory.getDef(descriptor);
        serializeAndGoldFile(def);
    }

    public void testSerializeData() throws Exception {
        JavaModelDefFactory factory = new JavaModelDefFactory(null);
        ModelDef def = factory.getDef(descriptor);
        Model model = def.newInstance();
        serializeAndGoldFile(model);
    }

    /**
     * Verify that class level annotation is required for a java model.
     * 
     * @userStory a07B0000000FAmj
     */
    public void testClassLevelAnnotationForJavaModel() throws Exception {
        DefDescriptor<ModelDef> javaModelDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.model.TestModel", ModelDef.class);
        assertNotNull(javaModelDefDesc.getDef());

        DefDescriptor<ModelDef> javaModelWOAnnotationDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.model.TestModelWithoutAnnotation", ModelDef.class);
        try {
            javaModelWOAnnotationDefDesc.getDef();
            fail("Expected InvalidDefinitionException");
        } catch (Exception e) {
            checkExceptionStart(e, InvalidDefinitionException.class, "@Model annotation is required on all Models.",
                    javaModelWOAnnotationDefDesc.getName());
        }
    }

    /**
     * Test subclassing.
     */
    public void testModelSubclass() throws Exception {
        DefDescriptor<ModelDef> javaModelDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.model.TestModelSubclass", ModelDef.class);
        ModelDef def = javaModelDefDesc.getDef();
        assertNotNull(def);
        Model model = def.newInstance();
        ValueDef vd = def.getMemberByName("nextThing");

        PropertyReferenceImpl refNextThing = new PropertyReferenceImpl("nextThing", new Location("test", 0));
        assertNotNull("Unable to find value def for 'nextThing'", vd);
        assertEquals("nextThing", model.getValue(refNextThing));

        vd = def.getMemberByName("firstThing");
        PropertyReferenceImpl refFirstThing = new PropertyReferenceImpl("firstThing", new Location("test", 1));
        assertNotNull("Unable to find value def for 'firstThing'", vd);
        assertEquals("firstThingDefault", model.getValue(refFirstThing));
    }

    /**
     * Verify that nice exception is thrown if model accessor is void
     */
    public void testModelMethodSignatures() throws Exception {
        String[] failModels = new String[] { "java://org.auraframework.impl.java.model.TestModelWithVoid",
                "java://org.auraframework.impl.java.model.TestModelWithStatic" };
        String[] failMessages = new String[] { "@AuraEnabled annotation found on void method getNothing",
                "@AuraEnabled annotation found on invalid method getStaticString" };

        for (int i = 0; i < failModels.length; i++) {
            try {
                Aura.getDefinitionService().getDefinition(failModels[i], ModelDef.class);
                fail("Expected InvalidDefinitionException on model " + failModels[i]);
            } catch (Exception e) {
                checkExceptionStart(e, InvalidDefinitionException.class, failMessages[i], failModels[i]);
            }
        }
    }

    /**
     * Verify that nice exception is thrown if model def doesn't exist
     */
    public void testModelNotFound() throws Exception {
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component model='java://goats'/>");
        try {
            Aura.getInstanceService().getInstance(dd);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            assertEquals(String.format("No MODEL named java://goats found : %s", dd.getQualifiedName()), e.getMessage());
        }
    }

    /**
     * Verify that accessing a non-existing property on model throws Exception.
     */
    public void testNonExistingPropertiesOnModel() throws Exception {
        DefDescriptor<ModelDef> javaModelDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.model.TestModel", ModelDef.class);
        ModelDef mDef = javaModelDefDesc.getDef();
        assertNotNull(mDef);
        Model model = mDef.newInstance();
        try {
            model.getValue(new PropertyReferenceImpl("fooBar", new Location("test", 0)));
            fail("Model should not be able to getValue of a non existing property.");
        } catch (Exception e) {
            checkExceptionStart(e, AuraExecutionException.class, "TestModel: no such property: fooBar",
                    javaModelDefDesc.getName());
        }
        try {
            model.getValue(new PropertyReferenceImpl("firstThi", new Location("test", 0)));
            fail("Model.getValue() on partial matches of property names should not be successful.");
        } catch (Exception e) {
            checkExceptionStart(e, AuraExecutionException.class, "TestModel: no such property: firstThi",
                    javaModelDefDesc.getName());
        }
    }
}
