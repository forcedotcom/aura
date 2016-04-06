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
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.JavascriptComponentClass;
import org.auraframework.impl.root.component.ComponentDefImpl.Builder;
import org.mockito.Mock;
import org.mockito.Mockito;

public class JavascriptComponentClassTest extends AuraImplTestCase {

	private Builder builder;

    public JavascriptComponentClassTest(String name) {
        super(name);
    }
    
    @Mock
    private DefDescriptor<ComponentDef> descriptor;

    @Override
    public void setUp() throws Exception {
        super.setUp();

        Mockito.doReturn("test").when(descriptor).getNamespace();
        Mockito.doReturn("testComponent").when(descriptor).getName();
        Mockito.doReturn("markup://test:testComponent").when(descriptor).getQualifiedName();

    	builder = new Builder();
        builder.setDescriptor(descriptor);
    }

    public void testwriteClassForPlainComponent() throws Exception {
        ComponentDef componentDef = builder.build();
        JavascriptComponentClass javascriptClass = new JavascriptComponentClass.Builder().setDefinition(componentDef).build();
    	this.goldFileText(javascriptClass.getCode());
    }

    public void testwriteClassForComponentWithClientController() throws Exception {
        String controllerCode =
                "({\n" +
                "    funtion1: function(cmp, event, helper) {\n" +
                "        cmp.get('bla');\n" +
                "    }\n" +
                "})\n";
        DefDescriptor<ControllerDef> controllerDescriptor = addSourceAutoCleanup(ControllerDef.class, controllerCode);

        builder.addControllerDef(controllerDescriptor.getDef());
        ComponentDef componentDef = builder.build();
        JavascriptComponentClass javascriptClass = new JavascriptComponentClass.Builder().setDefinition(componentDef).build();
    	this.goldFileText(javascriptClass.getCode());
    }

    public void testwriteClassForComponentWithHelper() throws Exception {
        String helperCode =
                "({" +
                "    funtion1:function() {\n" +
                "        var a = 1;\n" +
                "    }\n" +
                "})\n";
        DefDescriptor<HelperDef> helperDescriptor = addSourceAutoCleanup(HelperDef.class, helperCode);

        builder.addHelper(helperDescriptor.getQualifiedName());
        ComponentDef componentDef = builder.build();
        JavascriptComponentClass javascriptClass = new JavascriptComponentClass.Builder().setDefinition(componentDef).build();
    	this.goldFileText(javascriptClass.getCode());
    }

    public void testwriteClassForComponentWithClientProvider() throws Exception {
        
        String providerCode =
                "({\n" +
                "    provide: function(cmp) {\n" +
                "        return 'foo';\n" +
                "    }\n" +
                "})\n";
        DefDescriptor<ProviderDef> providerDescriptor = addSourceAutoCleanup(ProviderDef.class, providerCode);
        
    	builder.addProvider(providerDescriptor.getQualifiedName());
        ComponentDef componentDef = builder.build();
        JavascriptComponentClass javascriptClass = new JavascriptComponentClass.Builder().setDefinition(componentDef).build();
    	this.goldFileText(javascriptClass.getCode());
    }

    public void testwriteClassForComponentWithClientRenderer() throws Exception {
        String rendererCode =
                "({\n" +
                "    render: function(cmp) {\n" +
                "        return this.superRender();\n" +
                "    }\n" +
                "})\n";
        DefDescriptor<RendererDef> rendererDescriptor = addSourceAutoCleanup(RendererDef.class, rendererCode);

        builder.addRendererDef(rendererDescriptor.getDef());
        ComponentDef componentDef = builder.build();
        JavascriptComponentClass javascriptClass = new JavascriptComponentClass.Builder().setDefinition(componentDef).build();
    	this.goldFileText(javascriptClass.getCode());
    }

    public void testwriteClassForComponentWithClientEmptyRenderer() throws Exception {
        String rendererCode = "({ })";
        DefDescriptor<RendererDef> rendererDescriptor = addSourceAutoCleanup(RendererDef.class, rendererCode);

        builder.addRendererDef(rendererDescriptor.getDef());
        ComponentDef componentDef = builder.build();
        JavascriptComponentClass javascriptClass = new JavascriptComponentClass.Builder().setDefinition(componentDef).build();
    	this.goldFileText(javascriptClass.getCode());
    }

    @SuppressWarnings("unchecked")
    public void testwriteClassForComponentImportsLib() throws Exception {

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

        builder.imports = importDefs;
        ComponentDef componentDef = builder.build();
        JavascriptComponentClass javascriptClass = new JavascriptComponentClass.Builder().setDefinition(componentDef).build();
    	this.goldFileText(javascriptClass.getCode());
    }

    @SuppressWarnings("unchecked")
    public void testwriteClassForComponentExtendingOtherComponent() throws Exception {
        
        // mock testing component's super component def descriptor
        DefDescriptor<ComponentDef> mockParentDescriptor = mock(DefDescriptor.class);
        when(mockParentDescriptor.getQualifiedName()).thenReturn("markup://test:superComponent");
        
        builder.extendsDescriptor = mockParentDescriptor;
        ComponentDef componentDef = builder.build();
        JavascriptComponentClass javascriptClass = new JavascriptComponentClass.Builder().setDefinition(componentDef).build();
    	this.goldFileText(javascriptClass.getCode());
    }
}
