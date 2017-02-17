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
package org.auraframework.impl.root.parser.handler;

import org.auraframework.def.DescriptionDef;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.ExampleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.DocumentationXMLParser;
import org.auraframework.impl.source.StringSource;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

import javax.inject.Inject;
import java.util.List;
import java.util.Map;

public class DocumentationDefHandlerTest extends AuraImplTestCase {
    @Inject
    private DocumentationXMLParser documentationXMLParser;

    @Test
    public void testDocDefWithDescription() throws Exception {
        String description = "testing <code>DocumentationDef</code> &lt;ui:inputText/&gt;";
        String name = "sample Description";
        String docDefSource = "<aura:documentation><aura:description name='" + name + "'>" + description + "</aura:description></aura:documentation>";

        DocumentationDef dd = parse(docDefSource);
        dd.validateDefinition();

        List<DescriptionDef> descDefs = dd.getDescriptionDefs();
        assertEquals(1, descDefs.size());
        assertEquals(name, descDefs.get(0).getName());
        assertEquals(description, descDefs.get(0).getDescription());
    }

    @Test
    public void testMultipleDescriptions() throws Exception {
        String[] descriptions = {"d1", "d2"};
        String docDefSource = "<aura:documentation>" +
                "<aura:description>" + descriptions[0] + "</aura:description>" +
                "<aura:description>" + descriptions[1] + "</aura:description>" +
                "</aura:documentation>";

        DocumentationDef dd = parse(docDefSource);
        dd.validateDefinition();

        List<String> descs = dd.getDescriptions();
        assertEquals(2, descs.size());

        for (String d : descriptions) {
            assertTrue(descs.contains(d));
        }
    }

    @Test
    public void testMultipleDescriptionsWithSameName() throws Exception {

        String docDefSource = "<aura:documentation>" +
                "<aura:description name='sameName'>foo</aura:description>" +
                "<aura:description name='sameName'>bar</aura:description>" +
                "</aura:documentation>";

        DocumentationDef dd = parse(docDefSource);
        List<DescriptionDef> descDefs = dd.getDescriptionDefs();

        //for now we overwrite descriptions if they have same name
        dd.validateDefinition();
        assertEquals(1, descDefs.size());

        /* We want to make this a validation error in future
        QuickFixException expected = null;
        try{
            dd.validateDefinition();
        }
        catch(QuickFixException qfe){
            expected = qfe;
        }
        assertNotNull("Validation should have failed as 2 example can't have same name", expected);
        assertEquals("Expected Message", expected.getMessage());
        */

    }

    @Test
    public void testInvalidMarkup() throws Exception {
        String[][] invalidMarkupsWithExpectedErrorMessages = {
                //empty
                {"",
                        "Premature end of file." },
                //no description
                {"<aura:documentation/>",
                        "<aura:documentation> must contain at least one <aura:description>"},
                //no closing tag
                {"<aura:documentation>",
                        // sjsxp: "XML document structures must start and end within the same entity"
                        // woodstox: "was expecting a close tag for element <aura:documentation>"
                        // no common parser error message. using " " to verify that qfe is occuring
                        " "},
                //disallowed markup which isn't escaped
                {"<aura:documentation><aura:description><ui:inputText/></aura:description></aura:documentation>",
                        "Found invalid tag <ui:inputText>"},
                //no name of example
                {"<aura:documentation><aura:description/><aura:example label='eLabel' ref='he:er'/></aura:documentation>",
                        "Attribute 'name' is required on <aura:example>"},
                //no ref on example
                {"<aura:documentation><aura:description/><aura:example name='eName' label='eLabel'/></aura:documentation>",
                        "Attribute 'ref' is required on <aura:example>"},
                //no label on example
                {"<aura:documentation><aura:description/><aura:example ref='he:er' name='eName'/></aura:documentation>",
                        "Attribute 'label' is required on <aura:example>"}
        };

        for (String[] invalidMarkupWithExpectedErrorMessage : invalidMarkupsWithExpectedErrorMessages) {
            DocumentationDef dd = parse(invalidMarkupWithExpectedErrorMessage[0]);

            QuickFixException expected = null;

            try {
                dd.validateDefinition();
            } catch (QuickFixException qfe) {
                expected = qfe;
            }
            assertNotNull("Validation should have failed as markup is not valid", expected);
            String actualMessage = expected.getMessage();
            assertNotNull(actualMessage);
            assertTrue("'" + actualMessage + "' doesn't contain '" + invalidMarkupWithExpectedErrorMessage[1] + "'",
                    actualMessage.contains(invalidMarkupWithExpectedErrorMessage[1]));
        }
    }

    @Test
    public void testDocDefWithExample() throws Exception {
        String description = "myDescription";
        String exampleName = "myExample";
        String exampleLabel = "my Label";
        String exampleRef = "hello:world";
        String exampleDesc = "example description";
        String example = "<aura:example name='" + exampleName + "' ref='" + exampleRef + "' label='" + exampleLabel + "'>" + exampleDesc + "</aura:example>";
        String docDefSource = "<aura:documentation><aura:description>" + description + "</aura:description>" + example + "</aura:documentation>";

        DocumentationDef dd = parse(docDefSource);
        dd.validateDefinition();

        List<ExampleDef> descDefs = dd.getExampleDefs();
        assertEquals(1, descDefs.size());
        ExampleDef ed = descDefs.get(0);
        assertEquals(exampleLabel, ed.getLabel());
        assertEquals(exampleName, ed.getName());
        assertEquals(exampleRef, ed.getRef().getNamespace() + ":" + ed.getRef().getName());
        assertEquals(exampleDesc, ed.getDescription());

    }

    @Test
    public void testMultipleExamplesWithSameName() throws Exception {

        String docDefSource = "<aura:documentation>" +
                "<aura:description>random description</aura:description>" +
                "<aura:example name='sameName' ref='foo:bar1' label='label1'>random example</aura:example>" +
                "<aura:example name='sameName' ref='foo:bar2' label='label2'>random example</aura:example>" +
                "</aura:documentation>";

        DocumentationDef dd = parse(docDefSource);
        List<ExampleDef> exDefs = dd.getExampleDefs();

        //for now we overwrite examples if they have same name
        dd.validateDefinition();
        assertEquals(1, exDefs.size());

        /* We want to make this a validation error in future
        QuickFixException expected = null;
        try{
            dd.validateDefinition();
        }
        catch(QuickFixException qfe){
            expected = qfe;
        }
        assertNotNull("Validation should have failed as 2 example can't have same name", expected);
        assertEquals("Expected Message", expected.getMessage());
        */

    }

    @Test
    public void testMultipleExamples() throws Exception {
        String[] examples = {"e1", "e2"};
        String docDefSource = "<aura:documentation>" +
                "<aura:description>random description</aura:description>" +
                "<aura:example name='" + examples[0] + "' ref='foo:bar1' label='" + examples[0] + "'>" + examples[0] + "</aura:example>" +
                "<aura:example name='" + examples[1] + "' ref='foo:bar2' label='" + examples[1] + "'>" + examples[1] + "</aura:example>" +
                "</aura:documentation>";

        DocumentationDef dd = parse(docDefSource);
        dd.validateDefinition();

        Map<String, ExampleDef> exDefs = dd.getExampleDefsAsMap();
        assertEquals(2, exDefs.size());

        for (String d : examples) {
            ExampleDef ex = exDefs.get(d);
            assertNotNull(ex);
            assertEquals(d, ex.getLabel());
            assertEquals(d, ex.getDescription());
        }

    }

    private DocumentationDef parse(String markup) throws QuickFixException {
        StringSource<DocumentationDef> source = new StringSource<>(vendor.getDocumentationDefDescriptor(), markup, "myID", Format.XML);

        return documentationXMLParser.getDefinition(vendor.getDocumentationDefDescriptor(), source);
    }
}
