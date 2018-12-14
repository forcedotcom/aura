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
package org.auraframework.impl.system;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.EventDef;
import org.auraframework.def.FlavorBundleDef;
import org.auraframework.def.FlavorDefaultDef;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.MethodDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokenDescriptorProviderDef;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.def.TokensDef;
import org.auraframework.def.TokensImportDef;
import org.auraframework.def.TypeDef;
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignTemplateDef;
import org.auraframework.def.design.DesignTemplateRegionDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.json.Json;
import org.hamcrest.Matchers;
import org.junit.Test;
import org.mockito.Mockito;

public class DefDescriptorImplTest {
    @Test
    public void testControllerDescriptorParts() {
        DefDescriptor<ControllerDef> descriptor = new DefDescriptorImpl<>("a", "b", "c", ControllerDef.class);
        assertEquals("a", descriptor.getPrefix());
        assertEquals("b", descriptor.getNamespace());
        assertEquals("c", descriptor.getName());
        assertEquals("b.c", descriptor.getDescriptorName());
        assertEquals("a://b.c", descriptor.getQualifiedName());
        assertEquals("a://b.c", descriptor.toString());
    }

    @Test
    public void testComponentDescriptorParts() {
        DefDescriptor<ComponentDef> descriptor = new DefDescriptorImpl<>("markup", "b", "c", ComponentDef.class);
        assertEquals("markup", descriptor.getPrefix());
        assertEquals("b", descriptor.getNamespace());
        assertEquals("c", descriptor.getName());
        assertEquals("b:c", descriptor.getDescriptorName());
        assertEquals("markup://b:c", descriptor.getQualifiedName());
        assertEquals("markup://b:c", descriptor.toString());
    }
    
    @Test
    public void testDefTypes() {
        DefDescriptor<?> descriptor;
        
        descriptor = new DefDescriptorImpl<>("a", "b", "c", ApplicationDef.class);
        assertEquals(DefType.APPLICATION, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", ComponentDef.class);
        assertEquals(DefType.COMPONENT, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", EventDef.class);
        assertEquals(DefType.EVENT, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", InterfaceDef.class);
        assertEquals(DefType.INTERFACE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", LibraryDef.class);
        assertEquals(DefType.LIBRARY, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", ModuleDef.class);
        assertEquals(DefType.MODULE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", TokensDef.class);
        assertEquals(DefType.TOKENS, descriptor.getDefType());

        // FIXME: DELETE TYPES BELOW
        descriptor = new DefDescriptorImpl<>("a", "b", "c", AttributeDef.class);
        assertEquals(DefType.ATTRIBUTE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", HelperDef.class);
        assertEquals(DefType.HELPER, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", ControllerDef.class);
        assertEquals(DefType.CONTROLLER, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", MethodDef.class);
        assertEquals(DefType.METHOD, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", ModelDef.class);
        assertEquals(DefType.MODEL, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", IncludeDef.class);
        assertEquals(DefType.INCLUDE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", IncludeDefRef.class);
        assertEquals(DefType.INCLUDE_REF, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", RendererDef.class);
        assertEquals(DefType.RENDERER, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", ActionDef.class);
        assertEquals(DefType.ACTION, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", TypeDef.class);
        assertEquals(DefType.TYPE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", StyleDef.class);
        assertEquals(DefType.STYLE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", FlavoredStyleDef.class);
        assertEquals(DefType.FLAVORED_STYLE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", FlavorsDef.class);
        assertEquals(DefType.FLAVORS, descriptor.getDefType()); 
        descriptor = new DefDescriptorImpl<>("a", "b", "c", FlavorDefaultDef.class);
        assertEquals(DefType.FLAVOR_DEFAULT, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", FlavorIncludeDef.class);
        assertEquals(DefType.FLAVOR_INCLUDE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", FlavorBundleDef.class);
        assertEquals(DefType.FLAVOR_BUNDLE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", TokenDef.class);
        assertEquals(DefType.TOKEN, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", TokensImportDef.class);
        assertEquals(DefType.TOKENS_IMPORT, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", TokenDescriptorProviderDef.class);
        assertEquals(DefType.TOKEN_DESCRIPTOR_PROVIDER, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", TokenMapProviderDef.class);
        assertEquals(DefType.TOKEN_MAP_PROVIDER, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", DocumentationDef.class);
        assertEquals(DefType.DOCUMENTATION, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", TestSuiteDef.class);
        assertEquals(DefType.TESTSUITE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", TestCaseDef.class);
        assertEquals(DefType.TESTCASE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", ProviderDef.class);
        assertEquals(DefType.PROVIDER, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", RequiredVersionDef.class);
        assertEquals(DefType.REQUIRED_VERSION, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", DesignDef.class);
        assertEquals(DefType.DESIGN, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", DesignAttributeDef.class);
        assertEquals(DefType.ATTRIBUTE_DESIGN, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", DesignTemplateDef.class);
        assertEquals(DefType.DESIGN_TEMPLATE, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", DesignTemplateRegionDef.class);
        assertEquals(DefType.DESIGN_TEMPLATE_REGION, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", SVGDef.class);
        assertEquals(DefType.SVG, descriptor.getDefType());
        descriptor = new DefDescriptorImpl<>("a", "b", "c", RegisterEventDef.class);
        assertEquals(DefType.REGISTEREVENT, descriptor.getDefType());
    }

    @Test
    @Deprecated
    public void testControllerDescriptorParsedWithPrefix() {
        DefDescriptor<ControllerDef> descriptor = new DefDescriptorImpl<>("java://foo.Bar", ControllerDef.class, null, null);
        assertEquals("java", descriptor.getPrefix());
        assertEquals("Bar", descriptor.getName());
        assertEquals("foo", descriptor.getNamespace());
        assertEquals("java://foo.Bar", descriptor.getQualifiedName());
    }

    @Test
    @Deprecated
    public void testControllerDescriptorDifferentPrefix() {
        DefDescriptor<ControllerDef> descriptor = new DefDescriptorImpl<>("frap://foo.Bar", ControllerDef.class, null, null);
        assertEquals("frap", descriptor.getPrefix());
        assertEquals("Bar", descriptor.getName());
        assertEquals("foo", descriptor.getNamespace());
        assertEquals("frap://foo.Bar", descriptor.getQualifiedName());
    }

    @Test
    @Deprecated
    public void testBadNameChars() {
        DefDescriptor<ComponentDef> descriptor = null;
        
        try {
            descriptor = new DefDescriptorImpl<>("markup://foo.1A+/", ComponentDef.class, null, null);
        } catch (Exception expected) {
            //FIXME: better checking
            assertNotNull(expected);
            return;
        }
        assertThat(descriptor, Matchers.is(null));
    }

    @Test
    @Deprecated
    public void testSerialize() throws Exception {
        DefDescriptor<ControllerDef> descriptor = new DefDescriptorImpl<>("java://foo.Bar", ControllerDef.class, null, null);
        Json json = Mockito.mock(Json.class);
        descriptor.serialize(json);
        Mockito.verify(json).writeValue("java://foo.Bar");
    }

    @Test
    @Deprecated
    public void testGetDefType() throws Exception {
        DefDescriptor<ComponentDef> testDescriptor = new DefDescriptorImpl<>("markup://aura:text", ComponentDef.class,null,  null);
        assertEquals(testDescriptor.getDefType(), DefType.COMPONENT);
    }

    @Test
    @Deprecated
    public void testComparisonCaseInsensitiveName() throws Exception {
        DefDescriptor<ControllerDef> descriptor1 = new DefDescriptorImpl<>("java://foo.bar", ControllerDef.class, null, null);
        DefDescriptor<ControllerDef> descriptor2 = new DefDescriptorImpl<>("java://foo.Bar", ControllerDef.class, null, null);
        assertTrue(descriptor1.equals(descriptor2));
        assertTrue(descriptor2.equals(descriptor1));
        assertEquals(0, descriptor2.compareTo(descriptor1));
        assertEquals(0, descriptor1.compareTo(descriptor2));
    }

    @Test
    @Deprecated
    public void testComparisonCaseInsensitiveNamespace() throws Exception {
        DefDescriptor<ControllerDef> descriptor1 = new DefDescriptorImpl<>("java://Foo.Bar", ControllerDef.class, null, null);
        DefDescriptor<ControllerDef> descriptor2 = new DefDescriptorImpl<>("java://foo.Bar", ControllerDef.class, null, null);
        assertTrue(descriptor1.equals(descriptor2));
        assertTrue(descriptor2.equals(descriptor1));
        assertEquals(0, descriptor2.compareTo(descriptor1));
        assertEquals(0, descriptor1.compareTo(descriptor2));
    }

    @Test
    public void testEqualsWithEquivalentBundle() throws Exception {
        DefDescriptor<ComponentDef> bundle1 = new DefDescriptorImpl<>("a", "b", "c", ComponentDef.class);
        DefDescriptor<ComponentDef> bundle2 = new DefDescriptorImpl<>("A", "b", "c", ComponentDef.class);
        DefDescriptor<ControllerDef> descriptor1 = new DefDescriptorImpl<>("a", "b", "c", ControllerDef.class, bundle1);
        DefDescriptor<ControllerDef> descriptor2 = new DefDescriptorImpl<>("a", "b", "c", ControllerDef.class, bundle2);
        assertTrue(descriptor1.equals(descriptor2));
        assertTrue(descriptor2.equals(descriptor1));
        assertEquals(0, descriptor2.compareTo(descriptor1));
        assertEquals(0, descriptor1.compareTo(descriptor2));
    }

    @Test
    public void testEqualsWithDifferentBundle() throws Exception {
        DefDescriptor<ComponentDef> bundle1 = new DefDescriptorImpl<>("a", "b", "c", ComponentDef.class);
        DefDescriptor<ComponentDef> bundle2 = new DefDescriptorImpl<>("c", "b", "c", ComponentDef.class);
        DefDescriptor<ControllerDef> descriptor1 = new DefDescriptorImpl<>("a", "b", "c", ControllerDef.class, bundle1);
        DefDescriptor<ControllerDef> descriptor2 = new DefDescriptorImpl<>("a", "b", "c", ControllerDef.class, bundle2);
        assertFalse(descriptor1.equals(descriptor2));
        assertFalse(descriptor2.equals(descriptor1));
        assertNotEquals(0, descriptor2.compareTo(descriptor1));
        assertNotEquals(0, descriptor1.compareTo(descriptor2));
    }

    @Test
    public void testEqualsWithBundleNull() throws Exception {
        DefDescriptor<ComponentDef> bundle = new DefDescriptorImpl<>("a", "b", "c", ComponentDef.class);
        DefDescriptor<ControllerDef> descriptor1 = new DefDescriptorImpl<>("a", "b", "c", ControllerDef.class, bundle);
        DefDescriptor<ControllerDef> descriptor2 = new DefDescriptorImpl<>("a", "b", "c", ControllerDef.class, null);
        assertFalse(descriptor1.equals(descriptor2));
        assertFalse(descriptor2.equals(descriptor1));
        assertNotEquals(0, descriptor2.compareTo(descriptor1));
        assertNotEquals(0, descriptor1.compareTo(descriptor2));
    }

    @Test
    @Deprecated
    public void testFunkyDescriptor() {
        DefDescriptor<ComponentDef> descriptor = new DefDescriptorImpl<>("layout://rl-Case-EDIT-FULL-----_1-0-6c5936744658364d59726d6c6a4d7a31654d697872673d3d.c", ComponentDef.class, null, null);
        assertNotNull(descriptor);
    }

    @Test
    @Deprecated
    public void testHyphenInNameThrows() throws Exception {
        DefDescriptor<ModuleDef> descriptor = null;
        try {
            descriptor = new DefDescriptorImpl<>("markup://test:hyphened-underscored_name-component", ModuleDef.class, null, null);
        } catch (AuraRuntimeException are) {
            assertThat(are.getMessage(), Matchers.containsString("Invalid Descriptor Format"));
            return;
        }
        assertThat(descriptor, Matchers.is(null));
    }
}
