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
package org.auraframework.impl.validation;

import java.io.File;
import java.util.List;
import java.util.Set;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef;

public final class ValidationUtilTest extends AuraValidationTestCase {

    public ValidationUtilTest(String name) {
        super(name);
    }

    public void testGetAllDescriptorsIn() throws Exception {
        if (skipTestIfNotRunningWithAuraSource()) {
            return;
        }

        Set<DefDescriptor<?>> descriptors = ValidationUtil.getAllDescriptorsIn("src/test/components/validationTest");
        assertEquals(3, descriptors.size());
        assertTrue(descriptors.contains(definitionService.getDefDescriptor("validationTest:basic", ComponentDef.class)));
        assertTrue(descriptors.contains(definitionService.getDefDescriptor("validationTest.basic", StyleDef.class)));
    }

    public void testFindComponentSourceDirs() {
        if (skipTestIfNotRunningWithAuraSource()) {
            return;
        }

        File path = new File("src/test/components/validationTest/basic/basicController.js");
        List<File> roots = ValidationUtil.findComponentSourceDirs(path);
        assertEquals(1, roots.size());
        assertEquals(new File("src/test/components"), roots.get(0));

        path = new File("src/test/components/validationTest/basic/basicController.js");
        roots = ValidationUtil.findComponentSourceDirs(path);
        assertEquals(1, roots.size());
        assertEquals(new File("src/test/components"), roots.get(0));

        path = new File("src/test/components/validationTest/basic");
        roots = ValidationUtil.findComponentSourceDirs(path);
        assertEquals(1, roots.size());
        assertEquals(new File("src/test/components"), roots.get(0));
    }

    public void testFindDefinitions() throws Exception {
        DefDescriptor<StyleDef> styleDesc = definitionService.getDefDescriptor("ui.button", StyleDef.class);
        assertEquals("css://ui.button", styleDesc.toString());

        StyleDef styleDef = styleDesc.getDef();
        assertEquals("css://ui.button", styleDef.toString());

        DefDescriptor<ComponentDef> cmpDesc = definitionService.getDefDescriptor("ui:button", ComponentDef.class);
        assertEquals("markup://ui:button", cmpDesc.toString());
        ComponentDef componentDef = cmpDesc.getDef();
        assertEquals("markup://ui:button", componentDef.toString());

        // we can get all definitions the button depends on
        List<DefDescriptor<ControllerDef>> controllerDescs = componentDef.getControllerDefDescriptors();
        assertEquals(1, controllerDescs.size());
        DefDescriptor<ControllerDef> controllerDesc = controllerDescs.get(0);
        assertEquals("js://ui.button", controllerDesc.toString());
        JavascriptControllerDef controllerDef = (JavascriptControllerDef) controllerDesc.getDef();
        String controllerDefFileName = controllerDef.getLocation().getFileName();
        assertTrue(controllerDefFileName, controllerDefFileName.endsWith("/ui/button/buttonController.js"));
        // we can use getBundle to get all descriptors in the bundle
        List<DefDescriptor<?>> bundleDescs = componentDef.getBundle();
        assertEquals(3, bundleDescs.size());
        assertTrue(bundleDescs.contains(controllerDesc));

        // finding java definitions
        DefDescriptor<TypeDef> javaDescriptor = definitionService.getDefDescriptor(
                "java://org.auraframework.impl.java.controller.TestController", TypeDef.class);
        TypeDef javaDef = javaDescriptor.getDef();
        assertEquals("TestController", javaDef.getName());
    }
}
