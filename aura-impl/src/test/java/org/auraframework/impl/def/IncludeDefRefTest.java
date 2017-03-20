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
package org.auraframework.impl.def;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.root.library.IncludeDefRefImpl;
import org.auraframework.impl.root.library.IncludeDefRefImpl.Builder;
import org.auraframework.impl.root.library.JavascriptIncludeClass;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.service.CompilerService;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Answers;
import org.mockito.Mock;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

public class IncludeDefRefTest extends DefinitionTest<IncludeDefRef> {
    @Mock(answer = Answers.RETURNS_MOCKS)
    DefDescriptor<IncludeDefRef> descriptor;

    @Inject
    CompilerService compilerService;

    @Test
    public void testValidateDefintionWithoutDescriptor() throws Exception {
        Builder builder = new IncludeDefRefImpl.Builder();
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef without name not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class,
                    String.format("%s must specify a name", IncludeDefRefHandler.TAG));
        }
    }

    @Test
    public void testValidateDefintionAliasIsInvalidIdentifier() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<LibraryDef> source = util.buildBundleSource(util.getInternalNamespace(), LibraryDef.class,
                Lists.newArrayList(
                        new BundleEntryInfo(DefType.LIBRARY,
                                "<aura:library><aura:include name='test.js' aliases='who/came/up/with/this' /></aura:library>"),
                        new BundleEntryInfo(DefType.INCLUDE, "test", "function(){}")));

        InvalidDefinitionException expected = null;

        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (InvalidDefinitionException t) {
            expected = t;

            assertNotNull("IncludeDef with invalid aliases not validated", expected);
            assertExceptionMessageEndsWith(expected, InvalidDefinitionException.class, String.format(
                    "%s 'alias' attribute must contain only valid javascript identifiers", IncludeDefRefHandler.TAG));
        }
    }

    @Test
    public void testValidateDefintionAliasesIsJs() throws Exception {
        String source = "function(){}";
        Builder builder = new IncludeDefRefImpl.Builder();

        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);
        builder.setDescriptor(includeDesc);
        builder.setAliases(ImmutableList.of("(function(){alert('boo!')})()"));
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class, String.format(
                    "%s 'alias' attribute must contain only valid javascript identifiers", IncludeDefRefHandler.TAG));
        }
    }

    @Test
    public void testValidateDefintionExportIsInvalidIdentifier() throws Exception {
        String source = "function(){}";

        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);
        builder.setDescriptor(includeDesc);
        builder.setExport("who/came/up/with/this");
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class, String
                    .format("%s 'export' attribute must be a valid javascript identifier", IncludeDefRefHandler.TAG));
        }
    }

    @Test
    public void testValidateDefintionExportIsJs() throws Exception {
        String source = "function(){}";

        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);
        builder.setDescriptor(includeDesc);
        builder.setExport("(function(){alert('boo!')})()");
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (Exception t) {
            String expectedMsg = String.format("%s 'export' attribute must be a valid javascript identifier",
                    IncludeDefRefHandler.TAG);
            assertExceptionMessageEndsWith(t, InvalidDefinitionException.class, expectedMsg);
        }
    }

    @Test
    @Ignore("the validation is now done in the parser.")
    public void testValidateReferencesWithUnmatchedParens() throws Exception {
        String source = "function(){\n}}) alert('watch out')";

        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);
        builder.setDescriptor(includeDesc);
        IncludeDefRef def = builder.build();

        try {
            def.validateReferences();
            fail("Invalid breaking JS wasn't validated");
        } catch (Exception t) {
            String expectedMsg = "Parse error";
            assertExceptionMessageContains(t, AuraRuntimeException.class, expectedMsg);
        }
    }

    @Test
    @Ignore("the validation is now done in the parser.")
    public void testValidateReferencesWithExtraCurlyBrace() throws Exception {
        String source = "var a=66;\n}";

        // source will have an extra curly brace at the end
        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);
        builder.setDescriptor(includeDesc);
        IncludeDefRef includeDefRef = builder.build();

        try {
            includeDefRef.validateReferences();
            fail("Invalid unclosed JS wasn't validated");
        } catch (Exception t) {
            String expectedMsg = "Parse error";
            assertExceptionMessageContains(t, AuraRuntimeException.class, expectedMsg);

        }
    }

    @Test
    @Ignore("the validation is now done in the parser.")
    public void testValidateReferencesWithUnclosedCurlyBrace() throws Exception {
        // Put the error online to to avoid running into fluctuation in client descriptor length.
        // During hrh course of the test, several "dummy" descriptors are created an not cleaned.
        String source = "function(){\nreturn 66;";

        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = this.getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc);
        IncludeDefRef def = builder.build();

        try {
            def.validateReferences();
            fail("Invalid unclosed JS wasn't validated");
        } catch (Exception t) {
            String expectedMsg = "Parse error";
            assertExceptionMessageContains(t, AuraRuntimeException.class, expectedMsg);
        }
    }

    @Test
    @Ignore("IncludeDefRef.validateReferences should not create a JavascriptIncludeClass")
    public void testWarningIgnoredForNonStandardJsDoc() throws Exception {
        String source = "function a(){return 1}\n/*!\n * @version 1\n */";

        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc);
        IncludeDefRef def = builder.build();

        def.validateReferences();
        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[],function a() {\n  return 1\n}\n\n);\n",
                        JavascriptIncludeClass.getClientDescriptor(includeDesc)),
                def.getCode(false));
    }

    @Test
    @Ignore("it is actually testing JavascriptIncludeClass, not IncludeDefRef")
    public void testGetCodeWithMinifyIsFalse() throws Exception {
        String source = "function test() {\n" + "    return 1\n" + "}";
        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc);
        IncludeDefRef includeDefRef = builder.build();

        String actual = includeDefRef.getCode(false);

        String expected = String.format(
                "$A.componentService.addLibraryInclude(\"%s\",[],function test() {\n  return 1\n}\n\n);\n",
                JavascriptIncludeClass.getClientDescriptor(includeDesc), source);
        assertEquals(expected, actual);
    }

    /**
     * Verify that when javascriptClass gets initiated in getCode(), getCode() doesn't validate Js code, even if when
     * minify is true. Because we enforce javascriptClass not to compile Js code when javascriptClass is initiated in
     * getCode().
     */
    @Test
    @Ignore("it is actually testing JavascriptIncludeClass, not IncludeDefRef")
    public void testGetCodeNotValidateJsCodeWhenMinifyIsTrue() throws Exception {
        String source = "function test() {\n" + "    var k = {a:};" + "}";
        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        try {
            builder.setDescriptor(includeDesc);
            IncludeDefRef includeDefRef = builder.build();
            includeDefRef.getCode(true);
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "Parse error");
        }
    }

    @Test
    @Ignore("it is actually testing JavascriptIncludeClass, not IncludeDefRef")
    public void testGetCodeWithMinifyIsTrue() throws Exception {
        String source = "function test() {\n" + "    return 1\n" + "}";
        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc);
        IncludeDefRef includeDefRef = builder.build();

        String actual = includeDefRef.getCode(true);

        String expected = String.format(
                "$A.componentService.addLibraryInclude(\"%s\",[],function test() {\n  return 1\n}\n\n);\n",
                JavascriptIncludeClass.getClientDescriptor(includeDesc));
        assertEquals(expected, actual);
    }

    @Test
    @Ignore("includeDef.validateReferences no longer instantiates a JavascriptIncludeClass")
    public void testGetCodeWithTrueMinifyWhenJavascriptClassWithTrueMinify() throws Exception {
        String source = "function test() {\n" + "    return 1;\n" + "}";
        Builder builder = new IncludeDefRefImpl.Builder();
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc);
        IncludeDefRef includeDefRef = builder.build();

        // validateReferences initiates a JavascriptIncludeClass with true minify
        includeDefRef.validateReferences();
        // getCode uses the existed JavascriptIncludeClass
        String actual = includeDefRef.getCode(true);
        actual = actual.replaceFirst("//# sourceURL=libraries/string/thing[0-9]+/dummy[0-9]+\\.js\n", "");
        // since minified code doesn't exist, we expect non-minified code
        String expected = String.format("$A.componentService.addLibraryInclude(\"%s\",[],%s);",
                JavascriptIncludeClass.getClientDescriptor(includeDesc), "function(){return 1}");
        assertEquals(expected, actual);
    }
}
