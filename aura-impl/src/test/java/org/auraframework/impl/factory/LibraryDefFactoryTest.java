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
package org.auraframework.impl.factory;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.impl.util.AuraTestingUtil.BundleEntryInfo;
import org.auraframework.service.CompilerService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import com.google.common.collect.Lists;

public class LibraryDefFactoryTest extends AuraImplTestCase {
    @Inject
    private LibraryDefFactory factory;

    @Inject
    CompilerService compilerService;

    @Test
    public void testValidateDefintionAliasIsInvalidIdentifier() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        Source<LibraryDef> source = util.buildBundleSource(util.getInternalNamespace(), LibraryDef.class,
                Lists.newArrayList(
                        new BundleEntryInfo(DefType.LIBRARY,
                                "<aura:library><aura:include name='test' aliases='who/came/up/with/this' /></aura:library>"),
                        new BundleEntryInfo(DefType.INCLUDE, "test", "function abc(){}")));

        QuickFixException expected = null;

        try {
            compilerService.compile(source.getDescriptor(), source);
        } catch (QuickFixException t) {
            expected = t;
        }
        assertNotNull("IncludeDef with invalid aliases not validated", expected);
        assertExceptionMessageEndsWith(expected, InvalidDefinitionException.class, String.format(
                "%s 'alias' attribute must contain only valid javascript identifiers", IncludeDefRefHandler.TAG));
    }

    @Test
    public void testValidateDefintionAliasesIsJs() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<LibraryDef> source = util.buildBundleSource(util.getInternalNamespace(), LibraryDef.class,
                Lists.newArrayList(
                        new BundleEntryInfo(DefType.LIBRARY,
                                "<aura:library><aura:include name='test' aliases=\"(function(){alert('boo!')})()\" /></aura:library>"),
                        new BundleEntryInfo(DefType.INCLUDE, "test", "function abc(){};")));

        QuickFixException expected = null;

        LibraryDef def = factory.getDefinition(source.getDescriptor(), source);
        try {
            def.validateDefinition();
        } catch (QuickFixException t) {
            expected = t;
        }
        assertNotNull("IncludeDefRef with invalid export not validated", expected);
        assertExceptionMessageEndsWith(expected, InvalidDefinitionException.class, String.format(
                "%s 'alias' attribute must contain only valid javascript identifiers", IncludeDefRefHandler.TAG));
    }

    @Test
    public void testValidateReferencesWithUnmatchedParens() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<LibraryDef> source = util.buildBundleSource(util.getInternalNamespace(), LibraryDef.class,
                Lists.newArrayList(
                        new BundleEntryInfo(DefType.LIBRARY,
                                "<aura:library><aura:include name='test' aliases='bah' /></aura:library>"),
                        new BundleEntryInfo(DefType.INCLUDE, "test", "function abc(){\n}}) alert('watch out')")));

        LibraryDef def = factory.getDefinition(source.getDescriptor(), source);
        QuickFixException expected = null;
        try {
            def.validateDefinition();
        } catch (QuickFixException t) {
            expected = t;
        }
        assertNotNull("Invalid breaking JS wasn't validated", expected);
        String expectedMsg = "Parse error";
        assertExceptionMessageContains(expected, InvalidDefinitionException.class, expectedMsg);
    }

    @Test
    //FIXME: do this test on the parser.
    public void testValidateReferencesWithExtraCurlyBrace() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<LibraryDef> source = util.buildBundleSource(util.getInternalNamespace(), LibraryDef.class,
                Lists.newArrayList(
                        new BundleEntryInfo(DefType.LIBRARY,
                                "<aura:library><aura:include name='test' aliases='bah' /></aura:library>"),
                        new BundleEntryInfo(DefType.INCLUDE, "test", "var a=66;\n}")));

        LibraryDef def = factory.getDefinition(source.getDescriptor(), source);
        QuickFixException expected = null;
        try {
            def.validateDefinition();
        } catch (QuickFixException t) {
            expected = t;
        }
        assertNotNull("Invalid breaking JS wasn't validated", expected);
        String expectedMsg = "Parse error";
        assertExceptionMessageContains(expected, InvalidDefinitionException.class, expectedMsg);
    }

    @Test
    public void testValidateReferencesWithUnclosedCurlyBrace() throws Exception {

        AuraTestingUtil util = getAuraTestingUtil();
        BundleSource<LibraryDef> source = util.buildBundleSource(util.getInternalNamespace(), LibraryDef.class,
                Lists.newArrayList(
                        new BundleEntryInfo(DefType.LIBRARY,
                                "<aura:library><aura:include name='test' aliases='bah' /></aura:library>"),
                        new BundleEntryInfo(DefType.INCLUDE, "test", "function(){\nreturn 66;")));

        LibraryDef def = factory.getDefinition(source.getDescriptor(), source);
        QuickFixException expected = null;
        try {
            def.validateDefinition();
        } catch (QuickFixException t) {
            expected = t;
        }
        assertNotNull("Invalid breaking JS wasn't validated", expected);
        String expectedMsg = "Parse error";
        assertExceptionMessageContains(expected, InvalidDefinitionException.class, expectedMsg);
    }

//    @Test
//    @Ignore("it is actually testing JavascriptIncludeClass, not IncludeDefRef")
//    public void testGetCodeWithMinifyIsFalse() throws Exception {
//        String source = "function test() {\n" + "    return 1\n" + "}";
//        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
//                null);
//        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
//                IncludeDef.class, libDesc);
//        addSourceAutoCleanup(includeDesc, source);
//
//        builder.setDescriptor(includeDesc);
//        IncludeDefRef includeDefRef = builder.build();
//
//        String actual = includeDefRef.getCode(false);
//
//        String expected = String.format(
//                "$A.componentService.addLibraryInclude(\"%s\",[],function test() {\n  return 1\n}\n\n);\n",
//                JavascriptIncludeClass.getClientDescriptor(includeDesc), source);
//        assertEquals(expected, actual);
//    }

//    /**
//     * Verify that when javascriptClass gets initiated in getCode(), getCode() doesn't validate Js code, even if when
//     * minify is true. Because we enforce javascriptClass not to compile Js code when javascriptClass is initiated in
//     * getCode().
//     */
//    @Test
//    @Ignore("it is actually testing JavascriptIncludeClass, not IncludeDefRef")
//    public void testGetCodeNotValidateJsCodeWhenMinifyIsTrue() throws Exception {
//        String source = "function test() {\n" + "    var k = {a:};" + "}";
//        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
//                null);
//        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
//                IncludeDef.class, libDesc);
//        addSourceAutoCleanup(includeDesc, source);
//
//        try {
//            builder.setDescriptor(includeDesc);
//            IncludeDefRef includeDefRef = builder.build();
//            includeDefRef.getCode(true);
//            fail("expected to get an exception");
//        } catch (Exception e) {
//            checkExceptionContains(e, AuraRuntimeException.class, "Parse error");
//        }
//    }

//    @Test
//    @Ignore("it is actually testing JavascriptIncludeClass, not IncludeDefRef")
//    public void testGetCodeWithMinifyIsTrue() throws Exception {
//        String source = "function test() {\n" + "    return 1\n" + "}";
//        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
//                null);
//        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
//                IncludeDef.class, libDesc);
//        addSourceAutoCleanup(includeDesc, source);
//
//        builder.setDescriptor(includeDesc);
//        IncludeDefRef includeDefRef = builder.build();
//
//        String actual = includeDefRef.getCode(true);
//
//        String expected = String.format(
//                "$A.componentService.addLibraryInclude(\"%s\",[],function test() {\n  return 1\n}\n\n);\n",
//                JavascriptIncludeClass.getClientDescriptor(includeDesc));
//        assertEquals(expected, actual);
//    }

//    @Test
//    @Ignore("includeDef.validateReferences no longer instantiates a JavascriptIncludeClass")
//    public void testGetCodeWithTrueMinifyWhenJavascriptClassWithTrueMinify() throws Exception {
//        String source = "function test() {\n" + "    return 1;\n" + "}";
//        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
//                null);
//        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
//                IncludeDef.class, libDesc);
//        addSourceAutoCleanup(includeDesc, source);
//
//        builder.setDescriptor(includeDesc);
//        IncludeDefRef includeDefRef = builder.build();
//
//        // validateReferences initiates a JavascriptIncludeClass with true minify
//        includeDefRef.validateReferences(true);
//        // getCode uses the existed JavascriptIncludeClass
//        String actual = includeDefRef.getCode(true);
//        actual = actual.replaceFirst("//# sourceURL=libraries/string/thing[0-9]+/dummy[0-9]+\\.js\n", "");
//        // since minified code doesn't exist, we expect non-minified code
//        String expected = String.format("$A.componentService.addLibraryInclude(\"%s\",[],%s);",
//                JavascriptIncludeClass.getClientDescriptor(includeDesc), "function(){return 1}");
//        assertEquals(expected, actual);
//    }
}


