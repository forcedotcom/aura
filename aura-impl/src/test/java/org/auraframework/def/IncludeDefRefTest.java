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
package org.auraframework.def;

import org.auraframework.Aura;
import org.auraframework.impl.root.library.IncludeDefRefImpl;
import org.auraframework.impl.root.library.IncludeDefRefImpl.Builder;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.Json;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.Mockito;

import com.google.common.collect.ImmutableList;

public class IncludeDefRefTest extends DefinitionTest<IncludeDefRef> {

    Builder builder = new IncludeDefRefImpl.Builder();

    @Mock(answer = Answers.RETURNS_MOCKS)
    DefDescriptor<IncludeDefRef> descriptor;

    public IncludeDefRefTest(String name) {
        super(name);
    }

    public void testValidateDefintionWithoutDescriptor() throws Exception {
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef without name not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("%s must specify a name", IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateDefintionExportIsInvalidIdentifier() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){}");
        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        builder.setExport("who/came/up/with/this");
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'export' attribute must be valid javascript identifier", IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateDefintionExportIsJs() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){}");
        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        builder.setExport("(function(){alert('boo!')})()");
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'export' attribute must be valid javascript identifier", IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateReferencesExportedCodeIsInvalid() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "this is garbage");
        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        builder.setExport("someVar");
        IncludeDefRef def = builder.build();
        try {
            def.validateReferences();
            fail("IncludeDef with invalid code not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format(": Parse error. missing ; before statement\n", IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateReferencesNonexportedCodeIsInvalid() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "this is garbage");
        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        IncludeDefRef def = builder.build();
        try {
            def.validateReferences();
            fail("IncludeDef with invalid code not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format(": Parse error. missing ; before statement\n", IncludeDefRefHandler.TAG));
        }
    }

    public void testSerializeMinimal() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("minimal",
                IncludeDef.class, libDesc);
        Mockito.doReturn(includeDesc.getName()).when(descriptor).getName();
        addSourceAutoCleanup(includeDesc, "function(){}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        IncludeDefRef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format("{\n" +
                        "function(define){define(\"%s:%s\", function(){})}\n" +
                        "}",
                        libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

    public void testSerializeWithSingleComments() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("singleComments",
                IncludeDef.class, libDesc);
        Mockito.doReturn(includeDesc.getName()).when(descriptor).getName();
        addSourceAutoCleanup(includeDesc,
                "//this doc should be helpful\nfunction(){\n//fix later\nreturn this;}//last word");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        IncludeDefRef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format("{\n" +
                        "function(define){define(\"%s:%s\", function(){return this})}\n" +
                        "}",
                        libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

    public void testSerializeWithMultiComments() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("multiComments",
                IncludeDef.class, libDesc);
        Mockito.doReturn(includeDesc.getName()).when(descriptor).getName();
        addSourceAutoCleanup(includeDesc,
                "/*this doc should be helpful*/function(){/*fix later*/return this;}/*last word*/");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        IncludeDefRef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format("{\n" +
                        "function(define){define(\"%s:%s\", function(){return this})}\n" +
                        "}",
                        libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

    public void testSerializeWithImport() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> importDesc = getAuraTestingUtil().createStringSourceDescriptor("firstimport",
                IncludeDef.class, libDesc);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImport",
                IncludeDef.class, libDesc);
        Mockito.doReturn(includeDesc.getName()).when(descriptor).getName();
        addSourceAutoCleanup(includeDesc, "function(){}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        builder.setImports(ImmutableList.of(importDesc));
        IncludeDefRef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format("{\n" +
                        "function(define){define(\"%s:%s\", \"%s\", function(){})}" +
                        "\n}",
                        libDesc.getDescriptorName(), includeDesc.getName(), importDesc.getName()), buffer.toString());
    }

    public void testSerializeWithExternalImport() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<LibraryDef> extLibDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> importDesc = getAuraTestingUtil().createStringSourceDescriptor("firstimport",
                IncludeDef.class, extLibDesc);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImport",
                IncludeDef.class, libDesc);
        Mockito.doReturn(includeDesc.getName()).when(descriptor).getName();
        addSourceAutoCleanup(includeDesc, "function(){}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        builder.setImports(ImmutableList.of(importDesc));
        IncludeDefRef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format("{\n" +
                        "function(define){define(\"%s:%s\", \"%s:%s\", function(){})}" +
                        "\n}",
                        libDesc.getDescriptorName(), includeDesc.getName(), extLibDesc.getDescriptorName(),
                        importDesc.getName()), buffer.toString());
    }

    public void testSerializeWithMultipleImports() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<LibraryDef> extLibDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> import1Desc = getAuraTestingUtil().createStringSourceDescriptor("firstimport",
                IncludeDef.class, libDesc);
        DefDescriptor<IncludeDef> import2Desc = getAuraTestingUtil().createStringSourceDescriptor("secondimport",
                IncludeDef.class, libDesc);
        DefDescriptor<IncludeDef> import3Desc = getAuraTestingUtil().createStringSourceDescriptor("thirdimport",
                IncludeDef.class, extLibDesc);

        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImports",
                IncludeDef.class, libDesc);
        Mockito.doReturn(includeDesc.getName()).when(descriptor).getName();
        addSourceAutoCleanup(includeDesc, "function(){}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        builder.setImports(ImmutableList.of(import1Desc, import2Desc, import3Desc));
        IncludeDefRef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format("{\n" +
                        "function(define){define(\"%s:%s\", \"%s\", \"%s\", \"%s:%s\", function(){})}\n" +
                        "}",
                        libDesc.getDescriptorName(), includeDesc.getName(), import1Desc.getName(),
                        import2Desc.getName(), extLibDesc.getDescriptorName(), import3Desc.getName()),
                buffer.toString());
    }

    public void testSerializeWithExports() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasExports",
                IncludeDef.class, libDesc);
        Mockito.doReturn(includeDesc.getName()).when(descriptor).getName();
        addSourceAutoCleanup(includeDesc, "var myexpt=function(){return 'something'}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        builder.setDescriptor(descriptor);
        builder.setIncludeDescriptor(includeDesc);
        builder.setExport("myexpt");
        IncludeDefRef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format("{\n" +
                        "function(define){define(\"%s:%s\", function(){var myexpt=function(){return\"something\"};\n" +
                        "return myexpt})}\n" +
                        "}",
                        libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

}
