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
package org.auraframework.integration.test.componentclass;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.ClientComponentClass;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.mockito.Mock;

public class ClientComponentClassTest extends AuraImplTestCase {

    public ClientComponentClassTest(String name) {
        super(name);
    }

    @Mock
    private DefDescriptor<ComponentDef> mockCmpDescriptor;

    @Override
    public void setUp() throws Exception {
        super.setUp();

        when(mockCmpDescriptor.getNamespace()).thenReturn("test");
        when(mockCmpDescriptor.getName()).thenReturn("testComponent");
        when(mockCmpDescriptor.getQualifiedName()).thenReturn("markup://test:testComponent");
    }

    public void testwriteClassForPlainComponent() throws Exception {
        DefDescriptor<ComponentDef> cmpDescriptor =
                addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");

        // Since addSourceAutoCleanup randomly assign component's name, mock cmp's descriptor
        // to make sure the gold file contents are consistent.
        ComponentDef spyCmpDef =spy(definitionService.getDefinition(cmpDescriptor));
        when(spyCmpDef.getDescriptor()).thenReturn(mockCmpDescriptor);

        StringBuilder sb = new StringBuilder();
        ClientComponentClass componentClass = new ClientComponentClass(spyCmpDef);

        componentClass.writeClass(sb);

        this.goldFileText(sb.toString());
    }

    public void testwriteClassForComponentWithClientController() throws Exception {
        DefDescriptor<ComponentDef> cmpDescriptor =
                addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        DefDescriptor<ControllerDef> controllerDescriptor =
                DefDescriptorImpl.getAssociateDescriptor(cmpDescriptor, ControllerDef.class, DefDescriptor.JAVASCRIPT_PREFIX);
        String controllerJs =
                "({\n" +
                "    funtion1: function(cmp, event, helper) {\n" +
                "        cmp.get('bla');\n" +
                "    }\n" +
                "})\n";
        addSourceAutoCleanup(controllerDescriptor, controllerJs);

        ComponentDef spyCmpDef =spy(definitionService.getDefinition(cmpDescriptor));
        when(spyCmpDef.getDescriptor()).thenReturn(mockCmpDescriptor);

        StringBuilder sb = new StringBuilder();
        ClientComponentClass componentClass = new ClientComponentClass(spyCmpDef);

        componentClass.writeClass(sb);

        this.goldFileText(sb.toString());
    }

    public void testwriteClassForComponentWithHelper() throws Exception {
        DefDescriptor<ComponentDef> cmpDescriptor =
                addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        DefDescriptor<HelperDef> helperDescriptor =
                DefDescriptorImpl.getAssociateDescriptor(cmpDescriptor, HelperDef.class, DefDescriptor.JAVASCRIPT_PREFIX);
        String helperJs =
                "({" +
                "    funtion1:function() {\n" +
                "        var a = 1;\n" +
                "    }\n" +
                "})\n";
        addSourceAutoCleanup(helperDescriptor, helperJs);

        ComponentDef spyCmpDef =spy(definitionService.getDefinition(cmpDescriptor));
        when(spyCmpDef.getDescriptor()).thenReturn(mockCmpDescriptor);

        StringBuilder sb = new StringBuilder();
        ClientComponentClass componentClass = new ClientComponentClass(spyCmpDef);

        componentClass.writeClass(sb);

        this.goldFileText(sb.toString());
    }

    public void testwriteClassForComponentWithClientProvider() throws Exception {
        DefDescriptor<ComponentDef> cmpDescriptor =
                getAuraTestingUtil().createStringSourceDescriptor(null, ComponentDef.class, null);
        DefDescriptor<?> providerDesc =
                definitionService.getDefDescriptor(cmpDescriptor, DefDescriptor.JAVASCRIPT_PREFIX, ProviderDef.class);
        String providerAttribute = String.format("provider='%s'", providerDesc.getQualifiedName());
        String cmpMarkup = String.format(baseComponentTag, providerAttribute, "");
        String providerJs =
                "({\n" +
                "    provide: function(cmp) {\n" +
                "        return 'foo';\n" +
                "    }\n" +
                "})\n";
        addSourceAutoCleanup(providerDesc, providerJs);
        addSourceAutoCleanup(cmpDescriptor, cmpMarkup);

        ComponentDef spyCmpDef = spy(definitionService.getDefinition(cmpDescriptor));
        when(spyCmpDef.getDescriptor()).thenReturn(mockCmpDescriptor);

        StringBuilder sb = new StringBuilder();
        ClientComponentClass componentClass = new ClientComponentClass(spyCmpDef);

        componentClass.writeClass(sb);

        this.goldFileText(sb.toString());
    }

    public void testwriteClassForComponentWithClientRenderer() throws Exception {
        DefDescriptor<ComponentDef> cmpDescriptor =
                addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        DefDescriptor<RendererDef> rendererDescriptor =
                DefDescriptorImpl.getAssociateDescriptor(cmpDescriptor, RendererDef.class, DefDescriptor.JAVASCRIPT_PREFIX);
        String rendererJs =
                "({\n" +
                "    render: function(cmp) {\n" +
                "        return this.superRender();\n" +
                "    }\n" +
                "})\n";
        addSourceAutoCleanup(rendererDescriptor, rendererJs);

        ComponentDef spyCmpDef =spy(definitionService.getDefinition(cmpDescriptor));
        when(spyCmpDef.getDescriptor()).thenReturn(mockCmpDescriptor);

        StringBuilder sb = new StringBuilder();
        ClientComponentClass componentClass = new ClientComponentClass(spyCmpDef);

        componentClass.writeClass(sb);

        this.goldFileText(sb.toString());
    }

    public void testwriteClassForComponentWithClientEmptyRenderer() throws Exception {
        DefDescriptor<ComponentDef> cmpDescriptor =
                addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        DefDescriptor<RendererDef> rendererDescriptor =
                DefDescriptorImpl.getAssociateDescriptor(cmpDescriptor, RendererDef.class, DefDescriptor.JAVASCRIPT_PREFIX);
        String rendererJs = "({ })";
        addSourceAutoCleanup(rendererDescriptor, rendererJs);

        ComponentDef spyCmpDef = spy(definitionService.getDefinition(cmpDescriptor));
        when(spyCmpDef.getDescriptor()).thenReturn(mockCmpDescriptor);

        StringBuilder sb = new StringBuilder();
        ClientComponentClass componentClass = new ClientComponentClass(spyCmpDef);

        componentClass.writeClass(sb);

        this.goldFileText(sb.toString());
    }

    @SuppressWarnings("unchecked")
    public void testwriteClassForComponentImportsLib() throws Exception {
        DefDescriptor<ComponentDef> cmpDescriptor =
                addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");
        DefDescriptor<LibraryDef> libraryDescriptor = mock(DefDescriptor.class);
        when(libraryDescriptor.getDescriptorName()).thenReturn("test:testLibrary");

        // so far, we only add library's meta info to component class. Mock the ImportDefs.
        List<LibraryDefRef> importDefs = new ArrayList<>();
        LibraryDefRef mockImportDef1 = mock(LibraryDefRef.class);
        when(mockImportDef1.getProperty()).thenReturn("myLib1");
        when(mockImportDef1.getReferenceDescriptor()).thenReturn(libraryDescriptor);
        importDefs.add(mockImportDef1);

        LibraryDefRef mockImportDef2 = mock(LibraryDefRef.class);
        when(mockImportDef2.getProperty()).thenReturn("myLib2");
        when(mockImportDef2.getReferenceDescriptor()).thenReturn(libraryDescriptor);
        importDefs.add(mockImportDef2);

        ComponentDef spyCmpDef =spy(definitionService.getDefinition(cmpDescriptor));
        when(spyCmpDef.getDescriptor()).thenReturn(mockCmpDescriptor);
        when(spyCmpDef.getImports()).thenReturn(importDefs);

        StringBuilder sb = new StringBuilder();
        ClientComponentClass componentClass = new ClientComponentClass(spyCmpDef);

        componentClass.writeClass(sb);

        this.goldFileText(sb.toString());
    }

    @SuppressWarnings("unchecked")
    public void testwriteClassForComponentExtendingOtherComponent() throws Exception {
        DefDescriptor<ComponentDef> cmpDescriptor =
                addSourceAutoCleanup(ComponentDef.class, "<aura:component></aura:component>");

        DefDescriptor<ComponentDef> mockSuperCmpDescriptor= mock(DefDescriptor.class);
        // mock testing component's super component def descriptor
        when(mockSuperCmpDescriptor.getQualifiedName()).thenReturn("markup://test:superComponent");

        ComponentDef spyCmpDef = spy(definitionService.getDefinition(cmpDescriptor));
        when(spyCmpDef.getDescriptor()).thenReturn(mockCmpDescriptor);
        when(spyCmpDef.getExtendsDescriptor()).thenReturn(mockSuperCmpDescriptor);

        StringBuilder sb = new StringBuilder();
        ClientComponentClass componentClass = new ClientComponentClass(spyCmpDef);

        componentClass.writeClass(sb);

        this.goldFileText(sb.toString());
    }
}
