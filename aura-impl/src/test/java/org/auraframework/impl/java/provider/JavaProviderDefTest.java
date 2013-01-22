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
package org.auraframework.impl.java.provider;

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Component;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Ignore;

import com.google.common.collect.Maps;

/**
 * @hierarchy Aura.Components.Interface.Providers
 * @priority high
 * @userStory a07B0000000DTcr
 */
public class JavaProviderDefTest extends AuraImplTestCase {

    /**
     * @param name
     */
    public JavaProviderDefTest(String name) {
        super(name);
    }

    /**
     * Positive test Case 1: Simple case of Interface implementation. This is a
     * case with a simple interface. The interface has a provider written in
     * JAVA. The interface is implemented by two components. When the provider
     * creates these components, the attributes are passed on from the interface
     * to the components.
     */
    public void testBasicProviderScenario() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("implNumber", "3");
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_Interface", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the interface.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_providerImpl3");

        // Verify that the attributes passed off to the interface were inherited
        // by the component provided by the
        // provider
        assertEquals("Failed to initialize attributes on the component",
                component.getAttributes().getExpression("implNumber"), "3");
        assertEquals("Failed to pass of arguments and its values from the interface to the provided component",
                component.getAttributes().getExpression("defaultAttr"), "meh");
        this.serializeAndGoldFile(component, "_providerImpl3");

        attributes.put("implNumber", "1");
        component = Aura.getInstanceService().getInstance("test:test_Provider_Interface", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the interface.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_providerImpl1");
        // Verify that the attributes passed off to the interface were inherited
        // by the component provided by the
        // provider
        assertEquals("Failed to initialize attributes on the component",
                component.getAttributes().getExpression("implNumber"), "1");

        assertEquals("Implementing component does not have its attributes",
                component.getAttributes().getExpression("ComponentSpecificAttr"), "iammine");
        this.serializeAndGoldFile(component, "_providerImpl1");

        // Request a component which is using the interface
        // test:test_Provider_Interface
        component = Aura.getInstanceService().getInstance("test:test_Provider_Component", ComponentDef.class, null);
        assertEquals("Java Provider: Failed to retrieve the component using the test interface.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_Component");
        this.serializeAndGoldFile(component, "_component");
    }

    public void testConcreteProviderInjection() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("whatToDo", "replace");
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the interface.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_Concrete_Sub");
    }

    public void testConcreteProviderNull() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("whatToDo", "label");
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the interface.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_Concrete");
    }

    public void testConcreteProviderNotComponent() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("whatToDo", "replaceBad");
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_Concrete", ComponentDef.class, attributes);
            fail("expected exception for bad provider return");
        } catch (Exception e) {
            checkExceptionFull(e, AuraRuntimeException.class,
                    "java://org.auraframework.impl.java.provider.ConcreteProvider did not provide a valid component",
                    null);
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
                    "java://org.auraframework.impl.java.provider.ConcreteProvider did not provide a valid component",
                    null);
        }
    }

    /**
     * Negative test Case: Request for an interface which does not have a valid
     * provider defined.
     */
    public void testInterfaceWithNoProvider() throws Exception {
        String markupSkeleton = "<aura:interface %s>"
                + "<aura:attribute name=\"defaultAttr\" type=\"String\" default=\"meh\"/>" + "</aura:interface>";
        String markupTestCase;
        String[] runtimeTestCases = { "provider=\"\"", // Blank provider
        };
        String[] markupTestCases = { "", // No Provider
                // TODO W-775818 - no validation for Java providers
                // No provide method in the Java Provider
                "provider=\"java://org.auraframework.impl.java.provider.TestProviderWithNoProvideMethod\"",
                // Non static provide method in the Java Provider
                "provider=\"java://org.auraframework.impl.java.provider.TestProviderWithNonStaticMethod\"",
        // Javascript provider
        // "provider=\"js://org.auraframework.impl.java.provider.TestComponentDescriptorProvider\"",
        // Non existing provider
        // "provider=\"java://org.auraframework.impl.java.provider.meh\"",
        // Bad return type, basically forcing a class cast exception
        // "provider=\"java://org.auraframework.impl.java.provider.TestProviderWithBadReturnType\"",
        // Provider returns null
        // "provider=\"java://org.auraframework.impl.java.provider.TestProvideReturnNull\"",
        // Return a component which does not exist
        // "provider=\"java://org.auraframework.impl.java.provider.TestProvideNonExistingComponent\""
        };
        for (String testcase : runtimeTestCases) {
            markupTestCase = String.format(markupSkeleton, testcase);
            DefDescriptor<InterfaceDef> desc = addSourceAutoCleanup(InterfaceDef.class, markupTestCase);
            try {
                Aura.getInstanceService().getInstance(desc.getQualifiedName(), ComponentDef.class);
                fail("Invalid provider defined: Should have failed to provide a component implementing this interface.");
            } catch (AuraRuntimeException expected) {

            }
        }
        for (String testcase : markupTestCases) {
            markupTestCase = String.format(markupSkeleton, testcase);
            DefDescriptor<InterfaceDef> desc = addSourceAutoCleanup(InterfaceDef.class, markupTestCase);
            try {
                Aura.getInstanceService().getInstance(desc.getQualifiedName(), ComponentDef.class);
                fail("Invalid provider defined: Should have failed to provide a component implementing this interface.");
            } catch (InvalidDefinitionException expected) {

            }
        }
    }

    /**
     * Negative test Case: Is there a check to verify that a component provided
     * by a provider implements the right interface. Have a
     * interface(test:test_Provider_InterfaceNoImplementation) with one
     * attribute. The provider (TestProviderNoImplementation.java) provides a
     * component (test:test_Provider_NoImpl) which does not implement this
     * interface. So the getComponent method should throw an exception because
     * the attribute values cannot be passed along to the component.
     */
    @Ignore("W-775818 - no validation for Java providers")
    public void testComponentProviderImplementsInterface() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_InterfaceNoImplementation", ComponentDef.class);
            fail("Should have checked that the component provided by the provider does not implement test:test_Provider_InterfaceNoImplementation");
        } catch (AuraRuntimeException expected) {
        }
    }

    /**
     * Positive test case: Check what happens when a provided component has an
     * attribute value which is the same as the attribute on the interface. When
     * a component has an attribute which is the same as the attribute of an
     * interface that it is implementing, the attribute provided through the
     * interface should take precedence.
     */
    public void testOverrideInterfaceAttributes() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();

        attributes.put("implNumber", "OverrideAttr");
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_Interface", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the interface.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_providerImplOverrideAttr");
        // Verify that the attributes passed off to the interface were inherited
        // by the component provided by the
        // provider
        assertEquals("Attribute values of implementing component were overriden by values defined for interface",
                component.getAttributes().getExpression("implNumber"), "OverrideAttr");
        assertEquals("Failed to initialize attributes on the component",
                component.getAttributes().getExpression("defaultAttr"), "meh");
    }

    /*
     * An interface provider should not return the same interface.
     * @throws Exception
     */
    public void testInterfaceProviderProvidesItself() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_InterfaceSelf", ComponentDef.class);
        } catch (AuraRuntimeException e) {
            // Expected
        } catch (Throwable e) {
            fail("Provider should not be providing the same interface: " + e.toString());
        }
    }

    /**
     * Test to ensure that a concrete component properly instantiates when a
     * provider is specified. Note the construction of this test.
     * provider:providerC has a body with three components,
     * <ul>
     * <li>provider:providerA which should instantiate as is.
     * <li>provider:providerBase which should use the java provider class to
     * give us providerB
     * <li>provider:providerB which should instantiate as is.
     * </ul>
     */
    @SuppressWarnings("unchecked")
    public void testConcreteWithProvider() throws Exception {
        Component component = Aura.getInstanceService().getInstance("provider:providerC", ComponentDef.class);
        List<? extends Component> body = (List<? extends Component>) component.getSuper().getAttributes()
                .getValue("body");
        assertEquals("First element must be concrete provider A", "markup://provider:providerA", body.get(0)
                .getDescriptor().getQualifiedName());
        assertEquals("Second element must be concrete provider B", "markup://provider:providerB", body.get(1)
                .getDescriptor().getQualifiedName());
        assertEquals("Third element must be concrete provider B", "markup://provider:providerB", body.get(2)
                .getDescriptor().getQualifiedName());
    }

    /**
     * An interface provider should not return an interface. Note: The
     * testInterfaceProviderProvidesItself() test above might seem redundant
     * with this test's existence. But we are not allowing providers to provide
     * interface only for now. We might open up multiple levels of providing
     * later. So its good to have both the tests.
     * 
     * @throws Exception
     */
    @Ignore("W-777620 - don't allow prividing abstract cmp or interface w/no provider")
    public void testInterfaceProviderProvidesInterface() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_InterfaceChain", ComponentDef.class);
            fail("Interface providers should only provide concrete components");
        } catch (AuraRuntimeException e) {
            // Expected
        }
        /*
         * Eventually this test should work. Component component =
         * instanceService.getComponent("test:test_Provider_InterfaceChain");
         * assertEquals(
         * "Java Provider: Failed to retrieve the right implementation for the interface."
         * , component.getDescriptor().getQualifiedName(),
         * "test:test_Provider_InterfaceChainComponent");
         */
    }

    /**
     * A cyclic injection using Interfaces. This test would also check cyclic
     * injection of components.
     * 
     * @throws Exception
     */
    @Ignore("W-777675 - cyclic injection causes stack overflow")
    public void testCyclicInjection() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_InterfaceCyclicComponentA", ComponentDef.class);
            fail("Cyclic injection should have been detected");
        } catch (AuraRuntimeException e) {
            // Expected
        } catch (StackOverflowError e) {
            fail("Cyclic injection hosed aura");
        }
    }

    /**
     * * A B S T R A C T C O M P O N E N T S * *
     */
    /**
     * Abstract component's provider returns a component which extends the
     * abstract class
     * 
     * @throws Exception
     */
    public void testProviderAbstractBasic() throws Exception {
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_AbstractBasic",
                ComponentDef.class);
        assertEquals("Java Provider: Failed to retrieve the component extending abstract component.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_AbstractBasicExtends");
    }

    /**
     * Call provider for interface to get abstract component. Then call provider
     * for abstract component to supply a component.
     * 
     * @TestLabels("ignore")
     * @throws Exception
     */
    @Ignore("W-777620")
    public void testProviderForAbstractComponent() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("implNumber", "4");
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_Interface", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the interface.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_providerImpl4");

        component = Aura.getInstanceService().getInstance(component.getDescriptor().getQualifiedName(),
                ComponentDef.class, attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the abstract component.",
                component.getDescriptor().getQualifiedName(), "markup://test:test_Provider_Abstract4");

    }

    /**
     * Call provider for interface to get abstract component. Then call provider
     * for abstract component to supply a component.
     * 
     * @TestLabels("ignore")
     * @throws Exception
     */
    // TODO W-777620
    public void testNoProviderForNonAbstractComponent() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_NoProvider_NonAbstract_Component", ComponentDef.class);
            fail("Should have thrown QuickFixException");
        } catch (QuickFixException expected) {
        } catch (Throwable t) {
            fail("Should have thrown QuickFixException");
        }
    }

    /**
     * Call provider for of abstract component, which returns the same
     * component.
     * 
     * @TestLabels("ignore")
     * @throws Exception
     */
    @Ignore("W-777620")
    public void testProviderForCyclicReference() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_AbstractCyclic", ComponentDef.class);
            fail("Should have thrown AuraRuntimeException for infinite recursion from component referencing itself");
        } catch (AuraRuntimeException expected) {
        } catch (Throwable t) {
            fail("Should have thrown AuraRuntimeException");
        }
    }

    /**
     * Provider for abstract component supplies another abstract component.
     * 
     * @TestLabels("ignore")
     * @throws Exception
     */
    @Ignore("W-777620")
    public void testProviderForAbstractComponentProvidesAbstractComponent() throws Exception {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("implNumber", "2");
        Component component = Aura.getInstanceService().getInstance("test:test_Provider_Abstract1", ComponentDef.class,
                attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the abstract component.",
                component.getDescriptor().getQualifiedName(), "markup://test:test_Provider_Abstract2");

        attributes.put("implNumber", "3");
        component = Aura.getInstanceService().getInstance(component.getDescriptor().getQualifiedName(),
                ComponentDef.class, attributes);
        assertEquals("Java Provider: Failed to retrieve the right implementation for the component.", component
                .getDescriptor().getQualifiedName(), "markup://test:test_Provider_Abstract3");

    }

    /**
     * Component provided by the provider should extend the Abstract component
     * requested.
     * 
     * @TestLabels("ignore")
     * @throws Exception
     */
    @Ignore("W-775818 - no validation for Java providers")
    public void testProviderComponentExtendsAbstract() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_AbstractNoExtends", ComponentDef.class);
            fail("Should have checked that the component provided by the provider does not extend test:test_Provider_AbstractNoExtends");
        } catch (AuraRuntimeException e) {
        }
    }

    /**
     * Test to ensure providers can use provideAttributes() to set attributes.
     * 
     * @throws Exception
     */
    private void _testProviderSettingAttributes(String compName) throws Exception {

        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("a1", "a1");
        attributes.put("a2", "a2");
        attributes.put("value", "aura");
        Component component = Aura.getInstanceService().getInstance(compName, ComponentDef.class, attributes);
        assertEquals("a1 should have been updated by provider", "a1Provider", component.getAttributes().getValue("a1"));
        assertEquals("b1 should have been set by provider", "b1Provider", component.getAttributes().getValue("b1"));

        assertNull("a2 should have been updated by provider to null", component.getAttributes().getValue("a2"));
        assertNull("b2 should not have been set", component.getAttributes().getValue("b2"));

        attributes.clear();
        attributes.put("a3", "a3");
        attributes.put("value", "aura");
        component = Aura.getInstanceService().getInstance(compName, ComponentDef.class, attributes);
        assertEquals("b2 should have been set by provider", "b2Provider", component.getAttributes().getValue("b2"));

        attributes.clear();
        try {
            component = Aura.getInstanceService().getInstance(compName, ComponentDef.class, attributes);
            fail("'value' is required on the underlying concrete component. This should have thrown an exception as provider also didn't set it.");
        } catch (AuraValidationException e) {
            assertEquals(MissingRequiredAttributeException.getMessage(component.getDescriptor(), "value"),
                    e.getMessage());
        }
    }

    public void testProviderSettingAttributesViaProvideAttributes() throws Exception {
        _testProviderSettingAttributes("test:testJavaProviderSettingAttributeValues");
    }

    public void testProviderSettingAttributesViaComponentConfig() throws Exception {
        _testProviderSettingAttributes("test:testJavaProviderSettingAttributeValuesViaComponentConfig");
    }

    /**
     * Verify that class level annotation is required for a java Provider that
     * doesn't implement a Provider-derived interface.
     * 
     * @userStory a07B0000000FAmj
     */
    public void testClassLevelAnnotationForJavaProvider() throws Exception {
        DefDescriptor<ProviderDef> javaPrvdrDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.provider.TestComponentDescriptorProvider", ProviderDef.class);
        assertNotNull(javaPrvdrDefDesc.getDef());

        DefDescriptor<ProviderDef> javaPrvdrDefDesc2 = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.provider.TestComponentConfigProvider", ProviderDef.class);
        assertNotNull(javaPrvdrDefDesc2.getDef());

        DefDescriptor<ProviderDef> javaPrvdrWOAnnotationDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.provider.TestProviderWithoutAnnotation", ProviderDef.class);
        try {
            javaPrvdrWOAnnotationDefDesc.getDef();
            fail("Expected a InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            assertTrue("Expected to see an error message pointing to missing annotation in provider", e.getMessage()
                    .startsWith("@Provider annotation is required on all Providers."));
        }
    }

    /**
     * Provider implementing only Provider interface is not acceptable.
     */
    public void testProviderInterfaceOnly() throws Exception {
        DefDescriptor<ProviderDef> javaPrvdrDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.provider.TestProvider", ProviderDef.class);
        try {
            javaPrvdrDefDesc.getDef();
            fail("Expected a InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            assertEquals("@Provider must have a provider interface.", e.getMessage());
        }
    }

    /**
     * Provider with inaccessible constructor throws a AuraRuntimeException.
     */
    public void testProviderWithPrivateConstructor() throws Exception {
        DefDescriptor<ProviderDef> javaPrvdrDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.provider.TestProviderWithPrivateConstructor", ProviderDef.class);
        try {
            javaPrvdrDefDesc.getDef();
            fail("Expected a InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            assertEquals(
                    "Constructor is inaccessible for org.auraframework.impl.java.provider.TestProviderWithPrivateConstructor",
                    e.getMessage());
        }
    }

    /**
     * Provider without no-arg constructor throws a AuraRuntimeException.
     */
    public void testProviderWithoutNoArgConstructor() throws Exception {
        DefDescriptor<ProviderDef> javaPrvdrDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.provider.TestProviderWithoutNoArgConstructor", ProviderDef.class);
        try {
            javaPrvdrDefDesc.getDef();
            fail("Expected a InvalidDefinitionException");
        } catch (InvalidDefinitionException e) {
            assertEquals("Cannot instantiate org.auraframework.impl.java.provider.TestProviderWithoutNoArgConstructor",
                    e.getMessage());
        }
    }

    /**
     * Exception thrown during provider instantiation should ...(be wrapped in a
     * AuraRuntimeException?).
     */
    public void testProviderThrowsDuringInstantiation() throws Exception {
        DefDescriptor<ProviderDef> javaPrvdrDefDesc = DefDescriptorImpl.getInstance(
                "java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation", ProviderDef.class);
        try {
            javaPrvdrDefDesc.getDef();
            fail("Expected an intentional error");
        } catch (Throwable e) {
            assertEquals("that was intentional", e.getMessage());
        }
    }
}
