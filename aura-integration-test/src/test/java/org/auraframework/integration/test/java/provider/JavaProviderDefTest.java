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

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDescriptorProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Component;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
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
     * Test to ensure that a concrete component properly instantiates when a provider is specified. Note the
     * construction of this test. provider:providerC has a body with three components,
     * <ul>
     * <li>provider:providerA which should instantiate as is.
     * <li>provider:providerBase which should use the java provider class to give us providerB
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
     * * A B S T R A C T C O M P O N E N T S * *
     */
    /**
     * Abstract component's provider returns a component which extends the abstract class
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
     * Call provider for interface to get abstract component. Then call provider for abstract component to supply a
     * component.
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
     * Call provider for of abstract component, which returns the same component.
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
     * Component provided by the provider should extend the Abstract component requested.
     * 
     * @throws Exception
     */
    public void testProviderComponentExtendsAbstract() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_AbstractNoExtends", ComponentDef.class);
            fail("Should have checked that the component provided by the provider does not extend test:test_Provider_AbstractNoExtends");
        } catch (DefinitionNotFoundException e) {
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
     * Verify that class level annotation is required for a java Provider that doesn't implement a Provider-derived
     * interface.
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
        } catch (Exception e) {
            checkExceptionFull(
                    e,
                    InvalidDefinitionException.class,
                    "@Provider annotation is required on all Providers.  Not found on "
                            + javaPrvdrWOAnnotationDefDesc.getQualifiedName(),
                    javaPrvdrWOAnnotationDefDesc.getDescriptorName());
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
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "@Provider must have a provider interface.",
                    javaPrvdrDefDesc.getDescriptorName());
        }
    }

    /**
     * Verify QuickFixExceptions thrown in the provide method are not swallowed.
     */
    public void testProviderThrowsQFE() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_Provider_ThrowsQFE", ComponentDef.class);
            fail("Should have thrown exception in provider's provide() method.");
        } catch (Exception e) {
            checkExceptionFull(e, InvalidDefinitionException.class, "From TestProviderThrowsQFEDuringProvide");
        }
    }

    @Provider
    public static class DefaultBeanProviderConstructor implements ComponentDescriptorProvider {
        @Override
        public DefDescriptor<ComponentDef> provide() throws QuickFixException {
            return null;
        }
    }

    /**
     * Positive test case for bean Providers. Verify validation passes when no constructor is explicitly declared in
     * Provider.
     */
    @UnAdaptableTest("BeanAdapter might be different")
    public void testDefaultBeanProviderConstructor() {
        DefDescriptor<ProviderDef> desc = DefDescriptorImpl.getInstance(
                "java://" + DefaultBeanProviderConstructor.class.getName(),
                ProviderDef.class);
        try {
            definitionService.getDefinition(desc);
        } catch (Exception e) {
            fail("Unexpected exception creating bean provider: " + e);
        }
    }

    @Provider
    public static class BeanProviderThrowsDuringInstantiation implements ComponentDescriptorProvider {
        public BeanProviderThrowsDuringInstantiation() {
            throw new RuntimeException("that was intentional");
        }

        @Override
        public DefDescriptor<ComponentDef> provide() {
            return null;
        }
    }

    @Provider
    public abstract class AbstractBeanProvider implements ComponentDescriptorProvider {
        @Override
        public DefDescriptor<ComponentDef> provide() throws QuickFixException {
            return null;
        }
    }

    @Provider
    private static class NonPublicBeanProvider implements ComponentDescriptorProvider {
        @Override
        public DefDescriptor<ComponentDef> provide() throws QuickFixException {
            return null;
        }
    }
}
