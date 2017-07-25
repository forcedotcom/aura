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

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.def.DefinitionTest;
import org.auraframework.impl.javascript.BaseJavascriptClass;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Answers;
import org.mockito.Mock;

public class JavascriptIncludeClassTest extends DefinitionTest<IncludeDef> {

    IncludeDefRefImpl.Builder builder = new IncludeDefRefImpl.Builder();

    @Mock(answer = Answers.RETURNS_MOCKS)
    DefDescriptor<IncludeDef> descriptor;

    @Inject
    private DefinitionService definitionService;

    @Test
    @Ignore("IncludeDefRef.validateReferences should not create a JavascriptIncludeClass")
    public void testSerializeMinimal() throws Exception {
        String code = "function a() {}";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("minimal",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, code);

        builder.setDescriptor(includeDesc);
        IncludeDefRef def = builder.build();
        def.validateReferences();

        String expected = String.format("$A.componentService.addLibraryInclude(\"%s\",[],function a() {\n}\n\n);\n",
                JavascriptIncludeClass.getClientDescriptor(includeDesc));
        assertEquals(expected, def.getCode(false));
    }

    @Test
    @Ignore("IncludeDefRef.validateReferences should not create a JavascriptIncludeClass")
    public void testSerializeWithSingleComments() throws Exception {
        String code = "//this doc should be helpful\nfunction a(){\n//fix later\nreturn this;}//last word";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("singleComments",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, code);

        builder.setDescriptor(includeDesc);
        IncludeDefRef def = builder.build();
        def.validateReferences();

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[],function a() {\n  return this\n}\n\n);\n",
                        JavascriptIncludeClass.getClientDescriptor(includeDesc), code), def.getCode(false));
    }

    @Test
    @Ignore("IncludeDefRef.validateReferences should not create a JavascriptIncludeClass")
    public void testSerializeWithMultiComments() throws Exception {
        String code = "function a(){/*fix later*/return this;}/*last word*/";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("multiComments",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, code);

        builder.setDescriptor(includeDesc);
        IncludeDefRef def = builder.build();
        def.validateReferences();

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[],function a() {\n  return this\n}\n\n);\n",
                        JavascriptIncludeClass.getClientDescriptor(includeDesc)), def.getCode(false));
    }

    @Test
    @Ignore("IncludeDefRef.validateReferences should not create a JavascriptIncludeClass")
    public void testSerializeWithImport() throws Exception {
        String code = "function a(){}";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImport",
                IncludeDef.class, libDesc);
        DefDescriptor<IncludeDef> importDesc = getAuraTestingUtil().createStringSourceDescriptor("firstimport",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, code);
        addSourceAutoCleanup(importDesc, code);

        builder.setDescriptor(includeDesc);
        builder.setImports(Arrays.asList(importDesc));
        IncludeDefRef def = builder.build();
        def.validateReferences();

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[\"%s\"],function a() {\n}\n\n);\n",
                        JavascriptIncludeClass.getClientDescriptor(includeDesc),
                        JavascriptIncludeClass.getClientDescriptor(importDesc), code), def.getCode(false));
    }

    @Test
    @Ignore("IncludeDefRef.validateReferences should not create a JavascriptIncludeClass")
    public void testSerializeWithExternalImport() throws Exception {
        String code = "function a(){}";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("hasImport",
                IncludeDef.class, libDesc);

        DefDescriptor<LibraryDef> extLibDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                LibraryDef.class, null);
        DefDescriptor<IncludeDef> extIncludeDesc = getAuraTestingUtil().createStringSourceDescriptor("firstimport",
                IncludeDef.class, extLibDesc);

        addSourceAutoCleanup(includeDesc, code);
        addSourceAutoCleanup(extIncludeDesc, code);

        builder.setDescriptor(includeDesc);
        builder.setImports(Arrays.asList(extIncludeDesc));
        IncludeDefRef def = builder.build();
        def.validateReferences();

        assertEquals(
                String.format("$A.componentService.addLibraryInclude(\"%s\",[\"%s\"],function a() {\n}\n\n);\n",
                        JavascriptIncludeClass.getClientDescriptor(includeDesc),
                        JavascriptIncludeClass.getClientDescriptor(extIncludeDesc), code), def.getCode(false));
    }

    @Test
    @Ignore("IncludeDefRef.validateReferences should not create a JavascriptIncludeClass")
    public void testSerializeWithMultipleImports() throws Exception {
        String code = "function a(){}";
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

        addSourceAutoCleanup(import1Desc, code);
        addSourceAutoCleanup(import2Desc, code);
        addSourceAutoCleanup(extImportDesc, code);

        builder.setDescriptor(import1Desc);
        builder.setImports(Arrays.asList(import2Desc, extImportDesc));
        IncludeDefRef def = builder.build();
        def.validateReferences();

        String expected = String.format("$A.componentService.addLibraryInclude(\"%s\",[\"%s\", \"%s\"],function a() {\n}\n\n);\n",
                JavascriptIncludeClass.getClientDescriptor(import1Desc),
                JavascriptIncludeClass.getClientDescriptor(import2Desc),
                JavascriptIncludeClass.getClientDescriptor(extImportDesc),
                code);
        assertEquals(expected, def.getCode(false));
    }

    @Test
    public void testGetMinifiedCodeWhenMinifyIsTrue() throws Exception {
        String code = "function test() {\n" +
                "    var a = 'bla';\n" +
                "}\n";
      DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(
              null, LibraryDef.class, null);
      DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor(
              "test", IncludeDef.class, libDesc);
      addSourceAutoCleanup(includeDesc, code);
      builder.setDescriptor(includeDesc);
        BaseJavascriptClass javascriptClass = new JavascriptIncludeClass.Builder()
                .setDefinition(builder, definitionService.getDefinition(includeDesc)).setMinify(true).build();

      String minifiedCode = javascriptClass.getMinifiedCode();

      minifiedCode = minifiedCode.replaceFirst("//# sourceURL=libraries/string/thing[0-9]+/test[0-9]+\\.js\n", "");

      String expected = String.format("$A.componentService.addLibraryInclude(\"%s\",[],%s);",
              JavascriptIncludeClass.getClientDescriptor(includeDesc), "function(){}");
      assertEquals(expected, minifiedCode);
    }

    /**
     * Verify minified code is not generated when minify is set as false.
     *
     * Ideally, it would be nice to be able to verify if the code get validated or not, but for now,
     * since validateCodeErrors() is private, we assume only the code which needs to be minified
     * will get validated.
     */
    @Test
    public void testGetMinifiedCodeWhenMinifyIsFalse() throws Exception {
        String code = "function test() {\n" +
                      "    var a = 'bla';\n" +
                      "}\n";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(
                null, LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor(
                "test", IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, code);
        builder.setDescriptor(includeDesc);
        BaseJavascriptClass javascriptClass = new JavascriptIncludeClass.Builder()
                .setDefinition(builder, definitionService.getDefinition(includeDesc)).setMinify(false).build();

        String minifiedCode = javascriptClass.getMinifiedCode();
        assertNull(minifiedCode);
    }

    @Test
    public void testBuildValidateJSCodeWhenBuiderWithTrueMinify() throws Exception {
        String code = "function test() {\n" +
                      "    var a = 'bla';\n";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(
                null, LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor(
                "test", IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, code);
        builder.setDescriptor(includeDesc);
        BaseJavascriptClass.Builder jsIncludeBuilder = new JavascriptIncludeClass.Builder()
                .setDefinition(builder, definitionService.getDefinition(includeDesc)).setMinify(true);

        try{
            jsIncludeBuilder.build();
            fail("Expecting a InvalidDefinitionException.");
        } catch (Exception e) {
            String expectedMsg = "Parse error";
            this.assertExceptionMessageContains(e, InvalidDefinitionException.class, expectedMsg);
        }
    }

    @Test
    public void testBuildNotValidateJSCodeWhenBuiderWithFalseMinify() throws Exception {
        String code = "function test() {\n" +
                      "    var a = 'bla';\n";
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(
                null, LibraryDef.class, null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor(
                "test", IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, code);
        builder.setDescriptor(includeDesc);
        BaseJavascriptClass.Builder jsIncludeBuilder = new JavascriptIncludeClass.Builder()
                .setDefinition(builder, definitionService.getDefinition(includeDesc)).setMinify(false);
        try {
            jsIncludeBuilder.build();
            fail("expected exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Parse error");
        }
    }
}
