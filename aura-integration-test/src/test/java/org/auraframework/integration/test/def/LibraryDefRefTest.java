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
package org.auraframework.integration.test.def;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.parser.handler.LibraryDefRefHandler;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class LibraryDefRefTest extends AuraImplTestCase {

    public LibraryDefRefTest(String name) {
        super(name);
    }

    /**
     * Test to ensure that the property attribute must be specified.
     */
    public void testNoProperty() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:import library='dummy'/>"));
        try {
            definitionService.getDefinition(cmpDesc);
            fail("Import tag requires a Property attribute.");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessage(t, InvalidDefinitionException.class,
                    String.format("%s missing property attribute", LibraryDefRefHandler.TAG));
        }
    }

    /**
     * Test to ensure that the property must be a valid javascript identifier name.
     */
    public void testInvalidProperty() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "",
                        "<aura:import library='dummy' property='not just anything you want'/>"));
        try {
            definitionService.getDefinition(cmpDesc);
            fail("Import tag requires a Property attribute with a valid javascript identifier.");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessage(t, InvalidDefinitionException.class,
                    String.format("%s 'property' attribute must be valid javascript identifier", LibraryDefRefHandler.TAG));
        }
    }

    /**
     * Test that referenced library is validated to exist.
     */
    public void testLibraryReferenceInvalid() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:import library='not:here' property='p'/>"));
        try {
            definitionService.getDefinition(cmpDesc);
            fail("Import tag requires a Library attribute that references an existing library.");
        } catch (DefinitionNotFoundException t) {
            assertExceptionMessage(t, DefinitionNotFoundException.class,
                    String.format("No LIBRARY named markup://not:here found : [%s]", cmpDesc.getQualifiedName()));
        }
    }

    /**
     * Test that referenced library is validated.
     */
    public void testLibraryIsInvalid() throws Exception {
        DefDescriptor<LibraryDef> libraryDesc = addSourceAutoCleanup(LibraryDef.class, "<aura:library/>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "",
                        String.format("<aura:import library='%s' property='p'/>", libraryDesc.getDescriptorName())));
        try {
            definitionService.getDefinition(cmpDesc);
            fail("Import tag requires a Library attribute that must be validated.");
        } catch (InvalidDefinitionException t) {
            assertExceptionMessage(t, InvalidDefinitionException.class,
                    "aura:library must contain at least one aura:include attribute");
        }
    }
}
