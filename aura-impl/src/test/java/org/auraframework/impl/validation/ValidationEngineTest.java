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

import java.util.List;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.util.validation.ValidationError;

public final class ValidationEngineTest extends AuraValidationTestCase {

    public ValidationEngineTest(String name) {
        super(name);
    }

    public void testValidateDescriptorJavaScript() throws Exception {
        DefDescriptor<?> descriptor = DefDescriptorImpl.getInstance("js://validationTest.basic", ControllerDef.class);
        List<ValidationError> errors = new ValidationEngine().validate(descriptor);
        assertEquals(2, errors.size());

        // custom: missing (
        ValidationError error = errors.get(0);
        String filename = error.getFilename();
        assertEquals("js/custom", error.getValidatingTool());
        assertEquals("Starting '(' missing", error.getMessage());
        assertTrue(filename, filename.endsWith("/validationTest/basic/basicController.js"));
        assertEquals(5, error.getLine());
        assertEquals(1, error.getStartColumn());

        // jslint: missing ;
        error = errors.get(1);
        filename = error.getFilename();
        assertEquals("jslint", error.getValidatingTool());
        assertEquals("Expected ';' and instead saw '}'", error.getMessage());
        assertTrue(filename, filename.endsWith("/validationTest/basic/basicController.js"));
        assertEquals(7, error.getLine());
        assertEquals(20, error.getStartColumn());
    }

    public void testValidateDescriptorCSS() {
        if (System.getProperty("java.version").startsWith("1.6")) {
            return; // csslint doesn't work with 1.6
        }

        DefDescriptor<?> descriptor = DefDescriptorImpl.getInstance("css://validationTest.basic", StyleDef.class);
        List<ValidationError> errors = new ValidationEngine().validate(descriptor);
        assertEquals(2, errors.size());

        // reports StyleParser errors
        ValidationError parserError = errors.get(0);
        String filename = parserError.getFilename();
        assertEquals("CSS selector must begin with '.validationTestBasic' or '.THIS'", parserError.getMessage());
        assertTrue(filename, filename.endsWith("/validationTest/basic/basic.css"));
        assertEquals(1, parserError.getLine());
        assertEquals(1, parserError.getStartColumn());

        // reports csslint errors
        ValidationError csslintError = errors.get(1);
        filename = csslintError.getFilename();
        assertEquals("The box-sizing property isn't supported in IE6 and IE7", csslintError.getMessage());
        assertTrue(filename, filename.endsWith("/validationTest/basic/basic.css"));
        assertEquals(2, csslintError.getLine());
        assertEquals(5, csslintError.getStartColumn());
    }

    public void testValidateCmp() {
        DefDescriptor<?> descriptor = DefDescriptorImpl
                .getInstance("markup://validationTest:basic", ComponentDef.class);
        List<ValidationError> errors = new ValidationEngine().validate(descriptor);
        assertEquals(1, errors.size());
        assertError(
                "/validationTest/basic/basic.cmp [line 1, column 1] cmp/custom: Abstract component markup://validationTest:basic must be extensible",
                errors.get(0));
    }
}
