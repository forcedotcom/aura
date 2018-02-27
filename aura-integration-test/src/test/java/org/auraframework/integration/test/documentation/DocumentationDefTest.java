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

package org.auraframework.integration.test.documentation;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Ignore;
import org.junit.Test;

public class DocumentationDefTest extends AuraImplTestCase {

    @Test
    public void testGetDocumentationDefViaComponentDef() throws Exception{
        testLoadDocumentationDefViaRootDef("test:fakeComponent", ComponentDef.class, 2);
    }

    @Test
    public void testGetDocumentationDefViaApplicationDef() throws Exception{
        testLoadDocumentationDefViaRootDef("test:fakeApplication", ApplicationDef.class, 2);
    }

    @Ignore("W-2085286")
    @Test
    public void testGetDocumentationDefViaInterFaceDef() throws Exception {
        testLoadDocumentationDefViaRootDef("test:fakeInterface", InterfaceDef.class, 2);
    }

    @Ignore("W-2085286")
    @Test
    public void testGetDocumentationDefViaEventDef() throws Exception {
        testLoadDocumentationDefViaRootDef("test:anevent", EventDef.class, 2);
    }

    @Ignore("W-2085286")
    @Test
    public void testGetDocumentationDefViaTokensFaceDef() throws Exception {
        testLoadDocumentationDefViaRootDef("test:fakeTokens", TokensDef.class, 2);
    }

    @Test
    public void testValidComponentRefForExample() throws Exception{
        String exampleCmp = "test:fakeComponent";
        String docDefSource = "<aura:documentation>" +
                "<aura:description>random description</aura:description>" +
                "<aura:example name='example' ref='"+exampleCmp+"' label='label1'>random example</aura:example>" +
                "</aura:documentation>";

        DefDescriptor<DocumentationDef> dd= addSourceAutoCleanup(DocumentationDef.class, docDefSource);
        ComponentDef cd = definitionService.getDefinition(definitionService.getDefinition(dd).getExampleDefs().get(0).getRef());
        assertEquals("Unable to get to the ComponentDef referenced in example!", exampleCmp, cd.getDescriptor().getNamespace()+":"+cd.getName());
    }

    /** Test to track that we only validate that an example ref is valid
     * when following the ref to load the definition.
     */
    @Test
    public void testInvalidComponentRefForExample() throws Exception{
        String docDefSource = "<aura:documentation>" +
                "<aura:description>random description</aura:description>" +
                "<aura:example name='example' ref='foo:bar1' label='label1'>random example</aura:example>" +
                "</aura:documentation>";

        DefDescriptor<DocumentationDef> dd= addSourceAutoCleanup(DocumentationDef.class, docDefSource);

        try{
            definitionService.getDefinition(definitionService.getDefinition(dd).getExampleDefs().get(0).getRef());
            fail("Should have thrown DefinitionNotFoundException");
        }
        catch(DefinitionNotFoundException e){
            assertEquals("No COMPONENT named markup://foo:bar1 found", e.getMessage());
        }
    }

    private <T extends Definition> void testLoadDocumentationDefViaRootDef(String qualifiedName, Class<T> defType, int noOfDescs)
            throws DefinitionNotFoundException, QuickFixException {
        RootDefinition c = (RootDefinition) definitionService.getDefinition(qualifiedName, defType);
        DocumentationDef docDef = c.getDocumentationDef();
        assertNotNull("DocumentationDef not found!", docDef);
        assertEquals("Number DescriptionDefs don't match the expected value!", noOfDescs, docDef.getDescriptionDefs().size());
    }
    
    @Test
    public void testGetMetaDefs() throws Exception {
        String docDefSource = "<aura:documentation>" +
                "<aura:description>random description</aura:description>" +
                "<aura:meta name='foo' value='bar' />" + 
                "</aura:documentation>";

        DefDescriptor<DocumentationDef> dd = addSourceAutoCleanup(DocumentationDef.class, docDefSource);
        DocumentationDef def = definitionService.getDefinition(dd);              
        
        int expected = 1;
        int actual = def.getMetaDefsAsMap().size();
        
        assertEquals("Did not get expected number of meta defs", expected, actual);
    }
    
    @Test
    public void testValidatesMetaDefs() throws Exception {
        String docDefSource = "<aura:documentation>" +
                "<aura:description>random description</aura:description>" +
                "<aura:meta />" + 
                "</aura:documentation>";

        DefDescriptor<DocumentationDef> dd = addSourceAutoCleanup(DocumentationDef.class, docDefSource);
        
        try {
            definitionService.getDefinition(dd);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "descriptor");
        }  
    }
   
}
