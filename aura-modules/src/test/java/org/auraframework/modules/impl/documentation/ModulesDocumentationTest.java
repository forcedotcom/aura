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
package org.auraframework.modules.impl.documentation;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DocumentationDef;
import org.auraframework.def.MetaDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.junit.Test;

public class ModulesDocumentationTest extends AuraImplTestCase {
    @Inject
    DefinitionService definitionService;

    @Test
    public void testModuleDescription() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduleTest:documentedCmp", ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        String expected = "This component is documented.";
        String actual = definition.getDescription();
        assertEquals("moduledef did not have expected description", expected, actual);
    }

    @Test
    public void testPublicPropDescription() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduleTest:documentedCmp", ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        AttributeDef attr = definition.getAttributeDef("enabled");

        String expected = "Whether this thing is enabled.";
        String actual = attr.getDescription();
        assertEquals("attribute 'enabled' did not have expected description", expected, actual);
    }

    @Test
    public void testPublicAccessorPropDescription() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduleTest:documentedCmp", ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        AttributeDef attr = definition.getAttributeDef("something");

        String expected = "Fear is the mind-killer.";
        String actual = attr.getDescription();
        assertEquals("attribute 'something' did not have expected description", expected, actual);
    }

    @Test
    public void testBundleWithMarkdownDocumentation() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduleTest:documentedCmp", ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        DocumentationDef documentationDef = definition.getDocumentationDef();
        assertNotNull("documentation def should NOT be null", documentationDef);

        Map<String, MetaDef> metaDefs = documentationDef.getMetaDefsAsMap();

        int expectedSize = 6;
        int actualSize = metaDefs.size();
        assertEquals("did not get expected number of meta entries", expectedSize, actualSize);

        String expectedValue = "Test";
        String actualValue = metaDefs.get("category").getEscapedValue();
        assertEquals("did not get expected meta value for 'category'", expectedValue, actualValue);

        expectedValue = "Base";
        actualValue = metaDefs.get("type").getEscapedValue();
        assertEquals("did not get expected meta value for 'type'", expectedValue, actualValue);

        expectedValue = "1";
        actualValue = metaDefs.get("number").getEscapedValue();
        assertEquals("did not get expected meta value for 'number'", expectedValue, actualValue);

        expectedValue = "true";
        actualValue = metaDefs.get("boolean").getEscapedValue();
        assertEquals("did not get expected meta value for 'boolean'", expectedValue, actualValue);

        expectedValue = "one,two";
        actualValue = metaDefs.get("list").getEscapedValue();
        assertEquals("did not get expected meta value for 'list'", expectedValue, actualValue);

        expectedValue = "a=a,b=b";
        actualValue = metaDefs.get("map").getEscapedValue();
        assertEquals("did not get expected meta value for 'map'", expectedValue, actualValue);

        List<String> descriptions = documentationDef.getDescriptions();

        String expectedDescription = "<p>This is a <em>documented</em> component.</p>\n" +
                "<p>Component documentation includes:</p>\n" +
                "<ul>\n" +
                "<li>yaml front matter</li>\n" +
                "<li>markdown to describe usage in LWC</li>\n" +
                "<li>JSDoc annotations in the source</li>\n" +
                "</ul>\n" +
                "<p>Code examples:</p>\n" +
                "<pre><code class=\"language-html\">&lt;moduletest-documented-cmp&gt;&lt;/moduletest-documented-cmp&gt;\n" +
                "</code></pre>";

        String actualDescription = descriptions.get(0);
        assertEquals("documentation value did not match", expectedDescription, actualDescription);
    }

    @Test
    public void testBundleWithAuradoc() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduleTest:documentedCmp", ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        DocumentationDef documentationDef = definition.getAuraDocumentationDef();
        assertNotNull("documentation def should NOT be null", documentationDef);

        List<String> descriptions = documentationDef.getDescriptions();

        String expectedDescription = "<p>Usage in <code>Aura</code>.</p>";

        String actualDescription = descriptions.get(0);
        assertEquals("documentation value did not match", expectedDescription, actualDescription);
    }
}
