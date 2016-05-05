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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.root.library.IncludeDefRefImpl;
import org.auraframework.impl.root.library.IncludeDefRefImpl.Builder;
import org.auraframework.impl.root.library.JavascriptIncludeClass;
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.mockito.Answers;
import org.mockito.Mock;

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

    public void testValidateDefintionAliasIsInvalidIdentifier() throws Exception {
        String name = "invalidSource";
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().addSourceAutoCleanup(IncludeDef.class,
                "function(){}", name);
        builder.setDescriptor(includeDesc);
        builder.setAliases(ImmutableList.of("who/came/up/with/this"));
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid aliases not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'alias' attribute must contain only valid javascript identifiers",
                            IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateDefintionAliasesIsJs() throws Exception {
        String name = "invalidSource";
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().addSourceAutoCleanup(IncludeDef.class,
                "function(){}", name);
        builder.setDescriptor(includeDesc);
        builder.setAliases(ImmutableList.of("(function(){alert('boo!')})()"));
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'alias' attribute must contain only valid javascript identifiers",
                            IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateDefintionExportIsInvalidIdentifier() throws Exception {
        String name = "invalidSource";
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().addSourceAutoCleanup(IncludeDef.class,
                "function(){}", name);
        builder.setDescriptor(includeDesc);
        builder.setExport("who/came/up/with/this");
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'export' attribute must be a valid javascript identifier",
                            IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateDefintionExportIsJs() throws Exception {
        String name = "invalidSource";
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().addSourceAutoCleanup(IncludeDef.class,
                "function(){}", name);
        builder.setDescriptor(includeDesc);
        builder.setExport("(function(){alert('boo!')})()");
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'export' attribute must be a valid javascript identifier",
                            IncludeDefRefHandler.TAG));
        }
    }

    public void testInvalidTryToBreakOut() throws Exception {
        String source = "function(){\n}}) alert('watch out')";

        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        IncludeDefRef def = builder.build();

        try {
            def.validateReferences();
            fail("Invalid breaking JS wasn't validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageContains(t, InvalidDefinitionException.class,
                    String.format(
                            "JS Processing Error: %s (line 2, char 1) : %s:2: ERROR - Parse error. missing ) after argument list\n",
                            includeDesc, includeDesc));
        }
    }

    public void testExtraCurlyBrace() throws Exception {
        String source = "var a=66;\n}";

        // source will have an extra curly brace at the end
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        IncludeDefRef def = builder.build();

        try {
            def.validateReferences();
            fail("Invalid unclosed JS wasn't validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageContains(t, InvalidDefinitionException.class,
                    String.format(
                            "JS Processing Error: %s (line 2, char 0) : %s:2: ERROR - Parse error. syntax error\n",
                            includeDesc, includeDesc));
        }
    }

    public void testUnClosed() throws Exception {
        // Put the error online to to avoid running into fluctuation in client descriptor length.
        // During hrh course of the test, several "dummy" descriptors are created an not cleaned.
        String source = "function(){\nreturn 66;";

        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        IncludeDefRef def = builder.build();

        try {
            def.validateReferences();
            fail("Invalid unclosed JS wasn't validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageContains(t, InvalidDefinitionException.class,
                    String.format(
                            "JS Processing Error: %s (line 3, char 2) : %s:3: ERROR - Parse error. missing } after function body\n",
                            includeDesc, includeDesc));
        }
    }

    public void testWarningIgnoredForNonStandardJsDoc() throws Exception {
        String source = "function(){return 'x'}\n/*!\n * @version 1\n */";

        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        DefDescriptor<IncludeDef> includeDesc = getAuraTestingUtil().createStringSourceDescriptor("dummy",
                IncludeDef.class, libDesc);
        addSourceAutoCleanup(includeDesc, source);

        builder.setDescriptor(includeDesc.getDef().getDescriptor());
        IncludeDefRef def = builder.build();

        def.validateReferences();
        assertEquals(String.format("$A.componentService.addLibraryInclude(\"%s\",[],%s\n);\n",
                JavascriptIncludeClass.getClientDescriptor(includeDesc), source), def.getCode(false));
    }
}
