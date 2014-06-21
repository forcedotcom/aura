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
import org.auraframework.def.IncludeDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.root.library.IncludeDefImpl;
import org.auraframework.impl.root.library.IncludeDefImpl.Builder;

import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.json.Json;

import com.google.common.collect.ImmutableList;

public class IncludeDefTest extends DefinitionTest<IncludeDef> {

    public IncludeDefTest(String name) {
        super(name);
    }

    public void testValidateDefintionWithoutDescriptor() throws Exception {
        Builder builder = new IncludeDefImpl.Builder();
        IncludeDef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDef without name not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    "aura:include must specify a name");
        }
    }

    public void _testValidateDefintionImportsInvalid() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){}");
        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        builder.setImports(ImmutableList.of("what/is/this"));
        IncludeDef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDef with invalid imports not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("some useful error message", includeDesc.getName()));
        }
    }

    public void _testValidateDefintionExportsInvalid() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){}");
        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        builder.setExports("who/came/up/with/this");
        IncludeDef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDef with invalid exports not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("some useful error message", includeDesc.getName()));
        }
    }

    public void testValidateDefintionWithoutSource() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("noSource",
                IncludeDef.class, libDesc);
        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        IncludeDef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDef without source not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    "aura:include must specify a js resource in the library directory.");
        }
    }

    public void testValidateDefintionSourceEmpty() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "");
        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        IncludeDef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDef with invalid source not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class, String.format(
                    "Library: %s does not represent a function, use \"exports\" to wrap third party libraries.",
                    includeDesc.getName()));
        }
    }

    public void testValidateDefintionSourceDoesntStartWithFunction() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "invalid{}");
        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        IncludeDef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDef with invalid source not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class, String.format(
                    "Library: %s does not represent a function, use \"exports\" to wrap third party libraries.",
                    includeDesc.getName()));
        }
    }

    public void testValidateDefintionSourceDoesntEndWithBrace() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){");
        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        IncludeDef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDef with invalid source not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class, String.format(
                    "Library: %s does not represent a function, use \"exports\" to wrap third party libraries.",
                    includeDesc.getName()));
        }
    }

    public void _testValidateDefintionSourceNotValidJsonOrJs() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("invalidSource",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){return garbage, oops}");
        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        IncludeDef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDef with invalid source not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("some useful error message", includeDesc.getName()));
        }
    }

    public void testSerializeMinimal() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("minimal",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        builder.setLibraryDescriptor(libDesc);
        IncludeDef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format(
                        "{\n"
                                + "  \"%s\":\n"
                                + "function(define) {define(\"%s:%s\", function() {});}\n"
                                + "}",
                        includeDesc.getName(), libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

    public void testSerializeWithSingleComments() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("singleComments",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc,
                "//this doc should be helpful\nfunction(){\n//fix later\nreturn this;}//last word");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        builder.setLibraryDescriptor(libDesc);
        IncludeDef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format(
                        "{\n"
                                + "  \"%s\":\n"
                                + "function(define) {define(\"%s:%s\", function() {\n"
                                + "\n"
                                + "return this;});}\n"
                                + "}",
                        includeDesc.getName(), libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

    public void testSerializeWithMultiComments() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("multiComments",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc,
                "/*this doc should be helpful*/function(){/*fix later*/return this;}/*last word*/");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        builder.setLibraryDescriptor(libDesc);
        IncludeDef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format(
                        "{\n"
                                + "  \"%s\":\n"
                                + "function(define) {define(\"%s:%s\", function() {\n"
                                + "return this;});}\n"
                                + "}",
                        includeDesc.getName(), libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

    public void testSerializeWithImport() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImport",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        builder.setLibraryDescriptor(libDesc);
        builder.setImports(ImmutableList.of("firstimport"));
        IncludeDef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format(
                        "{\n"
                                + "  \"%s\":\n"
                                + "function(define) {define(\"%s:%s\", \"firstimport\", function() {});}\n"
                                + "}",
                        includeDesc.getName(), libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

    public void testSerializeWithMultipleImports() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImports",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "function(){}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        builder.setLibraryDescriptor(libDesc);
        builder.setImports(ImmutableList.of("firstimport", "secondimport", "thirdimport"));
        IncludeDef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format(
                        "{\n"
                                + "  \"%s\":\n"
                                + "function(define) {define(\"%s:%s\", \"firstimport\", \"secondimport\", \"thirdimport\", function() {});}\n"
                                + "}",
                        includeDesc.getName(), libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

    public void testSerializeWithExports() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasExports",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, "var myexpt=function(){return 'something'}");

        StringBuffer buffer = new StringBuffer();
        Json json = Json.createJsonStream(buffer, Aura.getContextService().getCurrentContext()
                .getJsonSerializationContext());

        Builder builder = new IncludeDefImpl.Builder();
        builder.setDescriptor(includeDesc);
        builder.setName(includeDesc.getName());
        builder.setLibraryDescriptor(libDesc);
        builder.setExports("myexpt");
        IncludeDef def = builder.build();

        def.validateDefinition();
        json.writeMapBegin();
        def.serialize(json);
        json.writeMapEnd();
        json.close();

        assertEquals(
                String.format(
                        "{\n"
                                + "  \"%s\":\n"
                                + "function(define) {define(\"%s:%s\", \n"
                                + "function() {\n"
                                + "var myexpt=function(){return 'something'};\n"
                                + " return myexpt;\n"
                                + "});}\n"
                                + "}",
                        includeDesc.getName(), libDesc.getDescriptorName(), includeDesc.getName()), buffer.toString());
    }

}
