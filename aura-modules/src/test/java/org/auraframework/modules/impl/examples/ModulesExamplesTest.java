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
package org.auraframework.modules.impl.examples;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleExample;
import org.auraframework.def.module.ModuleExampleFile;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

public class ModulesExamplesTest extends AuraImplTestCase {
    @Inject
    DefinitionService definitionService;

    @Test
    public void testBundleWithExamplesAndDocumentation() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduletest:examplesDoc",
                ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        List<ModuleExample> examples = definition.getExamples();
        assertNotNull("Examples should not be null", examples);

        assertEquals("Examples size incorrect", 4, examples.size());

        String javascript = "import { LightningElement } from 'lwc';\n" + "import { hello } from 'e-exampleLib';\n" + "\n"
                + "export default class Example2 extends LightningElement {\n" + "    text = hello;    \n" + "}";
        String html = "<template>\n" + "    <!-- This is an example -->\n"
                + "    <moduletest-examples-doc></moduletest-examples-doc>\n"
                + "    <!-- this should output 'hello', imported from library -->\n"
                + "    <div id=\"hello\">{text}</div>\n"
                + "    <!--  this should include another example, and it should render example1 -->\n"
                + "    <e-example1></e-example1>\n" + "</template>";

        ModuleExample example2 = examples.get(0);
        ModuleExampleFile exampleHtml = getFile(example2.getContents(),".html");
        ModuleExampleFile exampleJs = getFile(example2.getContents(), ".js");

        assertEquals("/__examples__/example2/example2.html", exampleHtml.getName());
        assertEquals(html, exampleHtml.getContent());

        assertEquals("/__examples__/example2/example2.js", exampleJs.getName());
        assertEquals(javascript, exampleJs.getContent());
    }

    private ModuleExampleFile getFile(Collection<ModuleExampleFile> contents, String suffix) {
        for (Iterator<ModuleExampleFile> iterator = contents.iterator(); iterator.hasNext();) {
            ModuleExampleFile modulesExampleFile = iterator.next();
            if (modulesExampleFile.getName().endsWith(suffix))
                return modulesExampleFile;
        }
        return null;
    }

    @Test
    public void testBundleExamplesInExplicitOrder() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduletest:examplesDoc",
                ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        List<ModuleExample> examples = definition.getExamples();
        assertNotNull("Examples should not be null", examples);

        assertEquals("example2", examples.get(0).getName());
        assertEquals("example1", examples.get(1).getName());
        assertEquals("example4", examples.get(2).getName());
        assertEquals("exampleLib", examples.get(3).getName());

    }

    @Test
    public void testEmptyMetadata() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduletest:examplesEmptyMetadata",
                ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        List<ModuleExample> examples = definition.getExamples();
        assertEquals("Examples size incorrect", 1, examples.size());
    }

    @Test
    public void testNoDocumentation() throws Exception {
        DefDescriptor<ModuleDef> descriptor = definitionService.getDefDescriptor("moduletest:examplesNoDoc",
                ModuleDef.class);
        ModuleDef definition = definitionService.getDefinition(descriptor);

        List<ModuleExample> examples = definition.getExamples();
        assertEquals("Examples size incorrect", 3, examples.size());
    }

}
