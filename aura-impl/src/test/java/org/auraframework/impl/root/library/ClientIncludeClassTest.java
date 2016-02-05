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
package org.auraframework.impl.root.library;

import java.util.Arrays;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.def.DefinitionTest;
import org.auraframework.impl.root.library.IncludeDefRefImpl;
import org.auraframework.impl.root.library.IncludeDefRefImpl.Builder;
import org.mockito.Answers;
import org.mockito.Mock;

public class ClientIncludeClassTest extends DefinitionTest<IncludeDef> {

    Builder builder = new IncludeDefRefImpl.Builder();

    @Mock(answer = Answers.RETURNS_MOCKS)
    DefDescriptor<IncludeDef> descriptor;

    public ClientIncludeClassTest(String name) {
        super(name);
    }

    public void testSerializeMinimal() throws Exception {
		String source = "function(){}";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, 
        		LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("minimal",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        IncludeDefRef def = builder.build();

        ClientIncludeClass clientIncludeClass = new ClientIncludeClass(def);
        StringBuffer buffer = new StringBuffer();
        clientIncludeClass.writeClass(buffer);

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[],%s);\n",
                		ClientIncludeClass.getClientDescriptor(def.getReferenceDescriptor()), source), buffer.toString());
    }

    public void testSerializeWithSingleComments() throws Exception {
        String source = "//this doc should be helpful\nfunction(){\n//fix later\nreturn this;}//last word";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, 
        		LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("singleComments",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        IncludeDefRef def = builder.build();

        ClientIncludeClass clientIncludeClass = new ClientIncludeClass(def);
        StringBuffer buffer = new StringBuffer();
        clientIncludeClass.writeClass(buffer);

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[],%s);\n",
                		ClientIncludeClass.getClientDescriptor(def.getReferenceDescriptor()), source), buffer.toString());
    }

    public void testSerializeWithMultiComments() throws Exception {
        String source = "/*this doc should be helpful*/function(){/*fix later*/return this;}/*last word*/";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("multiComments",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        IncludeDefRef def = builder.build();

        ClientIncludeClass clientIncludeClass = new ClientIncludeClass(def);
        StringBuffer buffer = new StringBuffer();
        clientIncludeClass.writeClass(buffer);

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[],%s);\n",
                		ClientIncludeClass.getClientDescriptor(def.getReferenceDescriptor()), source), buffer.toString());
    }

    public void testSerializeWithImport() throws Exception {
    	String source = "function(){}";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImport",
                IncludeDef.class, libDesc);
        DefDescriptor<IncludeDef> importDesc = getAuraTestingUtil().createStringSourceDescriptor("firstimport",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        builder.setImports(Arrays.asList(importDesc));
        IncludeDefRef def = builder.build();

        ClientIncludeClass clientIncludeClass = new ClientIncludeClass(def);
        StringBuffer buffer = new StringBuffer();
        clientIncludeClass.writeClass(buffer);

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[\"%s\"],%s);\n",
                		ClientIncludeClass.getClientDescriptor(def.getReferenceDescriptor()), 
                		ClientIncludeClass.getClientDescriptor(importDesc), source), buffer.toString());
    }

    public void testSerializeWithExternalImport() throws Exception {
    	String source = "function(){}";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImport",
                IncludeDef.class, libDesc);

        DefDescriptor<LibraryDef> extLibDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> extIncludeDesc = getAuraTestingUtil().createStringSourceDescriptor("firstimport",
                IncludeDef.class, extLibDesc);

        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        builder.setImports(Arrays.asList(extIncludeDesc));
        IncludeDefRef def = builder.build();

        ClientIncludeClass clientIncludeClass = new ClientIncludeClass(def);
        StringBuffer buffer = new StringBuffer();
        clientIncludeClass.writeClass(buffer);

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[\"%s\"],%s);\n",
                		ClientIncludeClass.getClientDescriptor(def.getReferenceDescriptor()), 
                		ClientIncludeClass.getClientDescriptor(extIncludeDesc), source), buffer.toString());
    }

    public void testSerializeWithMultipleImports() throws Exception {
    	String source = "function(){}";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, 
        		LibraryDef.class, null);
        DefDescriptor<IncludeDef> import1Desc = getAuraTestingUtil().createStringSourceDescriptor("firstimport",
                IncludeDef.class, libDesc);
        DefDescriptor<IncludeDef> import2Desc = getAuraTestingUtil().createStringSourceDescriptor("secondimport",
                IncludeDef.class, libDesc);

        DefDescriptor<LibraryDef> extLibDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> extImportDesc = getAuraTestingUtil().createStringSourceDescriptor("thirdimport",
                IncludeDef.class, extLibDesc);
        
        addSourceAutoCleanup(import1Desc, source);

        builder.setDescriptor(import1Desc.getDef().getDescriptor());
        builder.setImports(Arrays.asList(import2Desc, extImportDesc));
        IncludeDefRef def = builder.build();

        ClientIncludeClass clientIncludeClass = new ClientIncludeClass(def);
        StringBuffer buffer = new StringBuffer();
        clientIncludeClass.writeClass(buffer);

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[\"%s\",\"%s\"],%s);\n",
                		ClientIncludeClass.getClientDescriptor(def.getReferenceDescriptor()), 
                		ClientIncludeClass.getClientDescriptor(import2Desc),
                		ClientIncludeClass.getClientDescriptor(extImportDesc), source), buffer.toString());
    }

    public void testSerializeWithExports() throws Exception {
    	String source = "var myexpt=function(){return 'something'}";
        String export = "myexpt";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasExports",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
		builder.setExport(export);
        IncludeDefRef def = builder.build();

        ClientIncludeClass clientIncludeClass = new ClientIncludeClass(def);
        StringBuffer buffer = new StringBuffer();
        clientIncludeClass.writeClass(buffer);

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[],function lib(){\n%s;\nreturn %s;\n});\n",
                		ClientIncludeClass.getClientDescriptor(def.getReferenceDescriptor()), source, export), buffer.toString());
    }
}
