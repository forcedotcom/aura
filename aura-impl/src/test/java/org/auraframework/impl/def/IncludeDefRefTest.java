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
import org.auraframework.impl.root.parser.handler.IncludeDefRefHandler;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
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
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        String name = "invalidSource";
        builder.setDescriptor(SubDefDescriptorImpl.getInstance(name, libDesc, IncludeDef.class));
        builder.setAliases(ImmutableList.of("who/came/up/with/this"));
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid aliases not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'alias' attribute must contain only valid javascript identifiers", IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateDefintionAliasesIsJs() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        String name = "invalidSource";
        builder.setDescriptor(DefDescriptorImpl.getInstance(name, IncludeDef.class, libDesc));
        builder.setAliases(ImmutableList.of("(function(){alert('boo!')})()"));
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'alias' attribute must contain only valid javascript identifiers", IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateDefintionExportIsInvalidIdentifier() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        String name = "invalidSource";
        builder.setDescriptor(SubDefDescriptorImpl.getInstance(name, libDesc, IncludeDef.class));
        builder.setExport("who/came/up/with/this");
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'export' attribute must be a valid javascript identifier", IncludeDefRefHandler.TAG));
        }
    }

    public void testValidateDefintionExportIsJs() throws Exception {
        DefDescriptor<LibraryDef> libDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class,
                null);
        String name = "invalidSource";
        builder.setDescriptor(SubDefDescriptorImpl.getInstance(name, libDesc, IncludeDef.class));
        builder.setExport("(function(){alert('boo!')})()");
        IncludeDefRef def = builder.build();

        try {
            def.validateDefinition();
            fail("IncludeDefRef with invalid export not validated");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessageEndsWith(
                    t,
                    InvalidDefinitionException.class,
                    String.format("%s 'export' attribute must be a valid javascript identifier", IncludeDefRefHandler.TAG));
        }
    }
}
