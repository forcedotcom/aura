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
package org.auraframework.impl.controller;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Matchers;
import org.mockito.Mockito;

public class AuraClientExceptionUtilUnitTest extends UnitTestCase {

    @Test
    public void testParseCauseDescriptorWithQualifiedNameSetsNamespaceAndName() {
        AuraClientException target = Mockito.mock(AuraClientException.class);
        String typeName = "namespace:name";
        Mockito.when(target.getCauseDescriptor()).thenReturn(typeName);

        AuraClientExceptionUtil.parseCauseDescriptor(target);

        Mockito.verify(target).setFailedComponentNamespace("namespace");
        Mockito.verify(target).setFailedComponent("name");
        Mockito.verify(target, Mockito.never()).setFailedComponentMethod(Matchers.anyString());
    }

    @Test
    public void testParseCauseDescriptorWithActionNameSetsNamespaceNameAndMethod() {
        AuraClientException target = Mockito.mock(AuraClientException.class);
        String actionName = "namespace:name$controller$method";
        Mockito.when(target.getCauseDescriptor()).thenReturn(actionName);

        AuraClientExceptionUtil.parseCauseDescriptor(target);

        Mockito.verify(target).setFailedComponentNamespace("namespace");
        Mockito.verify(target).setFailedComponent("name");
        Mockito.verify(target).setFailedComponentMethod("method");
    }

    @Test
    public void testParseStacktraceWithAuraAppSourceUrlInStacktrace() {
        AuraClientException auraClientException = Mockito.mock(AuraClientException.class);
        String jsStack = "throwErrorFromClientController()@http://localhost:9090/components/auratest/errorHandlingApp.js:42:15\n"+
                "Object.catchAndFireEvent()@http://localhost:9090/components/ui/button.js:90:33\n"+
                "press()@http://localhost:9090/components/ui/button.js:34:16";
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        ContextService contextService = Mockito.mock(ContextService.class);

        AuraClientExceptionUtil.parseStacktrace(auraClientException, jsStack, definitionService, configAdapter, contextService);

        String expected = "auratest:errorHandlingApp";
        Mockito.verify(auraClientException).setFailedComponentMethod("throwErrorFromClientController");
        Mockito.verify(auraClientException).setCauseDescriptor(expected);
        Mockito.verify(auraClientException).setFailedComponentNamespace("auratest");
        Mockito.verify(auraClientException).setFailedComponent("errorHandlingApp");
    }

    @Test
    public void testParseStacktraceWithAuraCmpSourceUrlInStacktrace() {
        AuraClientException auraClientException = Mockito.mock(AuraClientException.class);
        String jsStack = "rerender()@http://localhost:9090/components/auratest/errorHandling.js:77:19";
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        ContextService contextService = Mockito.mock(ContextService.class);

        AuraClientExceptionUtil.parseStacktrace(auraClientException, jsStack, definitionService, configAdapter, contextService);

        String expected = "auratest:errorHandling";
        Mockito.verify(auraClientException).setFailedComponentMethod("rerender");
        Mockito.verify(auraClientException).setCauseDescriptor(expected);
        Mockito.verify(auraClientException).setFailedComponentNamespace("auratest");
        Mockito.verify(auraClientException).setFailedComponent("errorHandling");
    }

    @Test
    public void testParseStacktraceWithModuleCmpSourceUrlInStacktrace() {
        AuraClientException auraClientException = Mockito.mock(AuraClientException.class);
        String jsStack = "eval()@http://pre-compiling.lightning.localhost.soma.force.com:6109/components/one-app-nav-bar-item.js:57:23";
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        ContextService contextService = Mockito.mock(ContextService.class);

        AuraClientExceptionUtil.parseStacktrace(auraClientException, jsStack, definitionService, configAdapter, contextService);
        String expected = "one:appNavBarItem";
        Mockito.verify(auraClientException).setFailedComponentMethod("eval");
        Mockito.verify(auraClientException).setCauseDescriptor(expected);
        Mockito.verify(auraClientException).setFailedComponentNamespace("one");
        Mockito.verify(auraClientException).setFailedComponent("appNavBarItem");
    }

    @Test
    public void testParseStacktraceWithAuraLibSourceUrlInStacktrace() {
        AuraClientException auraClientException = Mockito.mock(AuraClientException.class);
        String jsStack = "Object.throwAnError()@http://localhost:9090/libraries/auratest/errorHandlingLib/ErrorService.js:4:11\n"+
                "throwErrorFromLibraryCode()@http://localhost:9090/components/auratest/errorHandling.js:53:46\n"+
                "Object.catchAndFireEvent()@http://localhost:9090/components/ui/button.js:90:33";
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        ContextService contextService = Mockito.mock(ContextService.class);

        AuraClientExceptionUtil.parseStacktrace(auraClientException, jsStack, definitionService, configAdapter, contextService);
        String expected = "auratest:errorHandlingLib";
        Mockito.verify(auraClientException).setFailedComponentMethod("Object.throwAnError");
        Mockito.verify(auraClientException).setCauseDescriptor(expected);
        Mockito.verify(auraClientException).setFailedComponentNamespace("auratest");
        Mockito.verify(auraClientException).setFailedComponent("errorHandlingLib");
    }

    @Test
    public void testGetComponentSourceCodeUsesModuleDefWhenIsModuleTrue() throws DefinitionNotFoundException, QuickFixException {
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        String qualifiedName = "markup://test:moduleCmp";
        String expected = "expected";
        ModuleDef md = Mockito.mock(ModuleDef.class);
        Mockito.when(md.getCode(Matchers.any())).thenReturn(expected);
        Mockito.when(definitionService.getDefinition(qualifiedName, ModuleDef.class)).thenReturn(md);

        String actual = AuraClientExceptionUtil.getComponentSourceCode(qualifiedName, definitionService, false, true);

        assertEquals(expected, actual);
        Mockito.verify(definitionService, Mockito.never()).getDefinition(qualifiedName, ComponentDef.class);
        Mockito.verify(definitionService, Mockito.never()).getDefinition(qualifiedName, ApplicationDef.class);
    }

    @Test
    public void testGetComponentSourceCodeUsesComponentDefWhenIsModuleFalse() throws DefinitionNotFoundException, QuickFixException {
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        String qualifiedName = "markup://test:aura";
        String expected = "expected";
        ComponentDef cd = Mockito.mock(ComponentDef.class);
        Mockito.when(cd.getCode(Matchers.anyBoolean())).thenReturn(expected);
        Mockito.when(definitionService.getDefinition(qualifiedName, ComponentDef.class)).thenReturn(cd);

        String actual = AuraClientExceptionUtil.getComponentSourceCode(qualifiedName, definitionService, false, false);

        assertEquals(expected, actual);
        Mockito.verify(definitionService, Mockito.never()).getDefinition(qualifiedName, ModuleDef.class);
        Mockito.verify(definitionService, Mockito.never()).getDefinition(qualifiedName, ApplicationDef.class);
    }

    @Test
    public void testGetComponentSourceCodeUsesApplicationDefWhenComponentDefNotFound() throws DefinitionNotFoundException, QuickFixException {
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        String qualifiedName = "markup://test:auraApp";
        String expected = "expected";
        ApplicationDef appDef = Mockito.mock(ApplicationDef.class);
        Mockito.when(appDef.getCode(Matchers.anyBoolean())).thenReturn(expected);
        Mockito.when(definitionService.getDefinition(qualifiedName, ApplicationDef.class)).thenReturn(appDef);

        String actual = AuraClientExceptionUtil.getComponentSourceCode(qualifiedName, definitionService, false, false);

        assertEquals(expected, actual);
        Mockito.verify(definitionService, Mockito.never()).getDefinition(qualifiedName, ModuleDef.class);
        Mockito.verify(definitionService).getDefinition(qualifiedName, ComponentDef.class);
    }

    @Test
    public void testGetLibrarySourceCodeUsesModuleDefWhenIsModuleAndNoPart() throws DefinitionNotFoundException, QuickFixException {
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        String qualifiedName = "markup://test:moduleLib";
        String expected = "expected";
        ModuleDef md = Mockito.mock(ModuleDef.class);
        Mockito.when(md.getCode(Matchers.any())).thenReturn(expected);
        Mockito.when(definitionService.getDefinition(qualifiedName, ModuleDef.class)).thenReturn(md);

        String actual = AuraClientExceptionUtil.getLibrarySourceCode(qualifiedName, null, definitionService, false, true);

        assertEquals(expected, actual);
        Mockito.verify(definitionService, Mockito.never()).getDefinition(qualifiedName, LibraryDef.class);
    }

    @Test
    public void testGetLibrarySourceCodeUsesLibraryDefWhenIsModuleAndHasPart() throws DefinitionNotFoundException, QuickFixException {
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        String qualifiedName = "markup://test:auraLib";
        String part = "InModule";
        String expected = "expected";
        LibraryDef ld = Mockito.mock(LibraryDef.class);
        List<IncludeDefRef> includes = new ArrayList<>();
        IncludeDefRef include = Mockito.mock(IncludeDefRef.class);
        Mockito.when(include.getName()).thenReturn(part);
        Mockito.when(include.getCode(Matchers.anyBoolean())).thenReturn(expected);
        includes.add(include);
        Mockito.when(ld.getIncludes()).thenReturn(includes);
        Mockito.when(definitionService.getDefinition(qualifiedName, LibraryDef.class)).thenReturn(ld);

        String actual = AuraClientExceptionUtil.getLibrarySourceCode(qualifiedName, part, definitionService, false, true);

        assertEquals(expected, actual);
        Mockito.verify(definitionService, Mockito.never()).getDefinition(qualifiedName, ModuleDef.class);
    }

    @Test
    public void testGetLibrarySourceCodeUsesLibraryDefWhenIsModuleFalse() throws DefinitionNotFoundException, QuickFixException {
        DefinitionService definitionService = Mockito.mock(DefinitionService.class);
        String qualifiedName = "markup://test:auraLib";
        String part = "InAura";
        String expected = "expected";
        LibraryDef ld = Mockito.mock(LibraryDef.class);
        List<IncludeDefRef> includes = new ArrayList<>();
        IncludeDefRef include = Mockito.mock(IncludeDefRef.class);
        Mockito.when(include.getName()).thenReturn(part);
        Mockito.when(include.getCode(Matchers.anyBoolean())).thenReturn(expected);
        includes.add(include);
        Mockito.when(ld.getIncludes()).thenReturn(includes);
        Mockito.when(definitionService.getDefinition(qualifiedName, LibraryDef.class)).thenReturn(ld);

        String actual = AuraClientExceptionUtil.getLibrarySourceCode(qualifiedName, part, definitionService, false, false);

        assertEquals(expected, actual);
        Mockito.verify(definitionService, Mockito.never()).getDefinition(qualifiedName, ModuleDef.class);
    }

    @Test
    public void testGenerateCodeSnippet() {
        String code = 
                "(function $globalEvalIIFE$(){with(arguments[1]||{}){with(arguments[0]||{}){return (function() { $A.componentService.addModule('markup://moduleTest:simpleCmp', 'moduletest-simple-cmp', ['moduletest-text-cmp', 'engine', 'moduleTest:testLib'], function (_moduletestTextCmp, engine, moduleTest_testLib) { 'use strict';\n"+
                "class Simple extends engine.Element {\n"+
                "    handlePressEvent(e) {\n"+
                "        foo\n"+
                "        const event = new CustomEvent('press', {\n"+
                "            bubbles: true,\n"+
                "            cancelable: true,\n"+
                "            detail: { value: 'test!' }\n"+
                "        });\n"+
                "        this.dispatchEvent(event);\n"+
                "    }\n"+
                "}\n";

        String expected = 
                "    handlePressEvent(e) {\n"+
                ">>>        foo\n" +
                "        const event = new CustomEvent('press', {\n";

        String actual = AuraClientExceptionUtil.generateCodeSnippet(code, "4", "9");

        assertEquals(expected, actual);
    }
}
