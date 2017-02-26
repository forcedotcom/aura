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
package org.auraframework.integration.test.validation;

import java.util.List;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.validation.AuraValidationTestCase;
import org.auraframework.impl.validation.ValidationEngine;
import org.auraframework.util.validation.ValidationError;
import org.junit.Ignore;
import org.junit.Test;

public final class ValidationEngineTest extends AuraValidationTestCase {

    @Test
    public void testValidateDescriptorCSS() {
        if (System.getProperty("java.version").startsWith("1.6")) {
            return; // csslint doesn't work with 1.6
        }

        DefDescriptor<?> descriptor = definitionService.getDefDescriptor("css://validationTest.basic", StyleDef.class);
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

    @Test
    @Ignore("this is not a valid thing to test")
    public void testValidateCmp() {
        DefDescriptor<?> descriptor = definitionService
                .getDefDescriptor("markup://validationTest:basic", ComponentDef.class);
        List<ValidationError> errors = new ValidationEngine().validate(descriptor);
        assertEquals(1, errors.size());
        assertError(
                "/validationTest/basic/basic.cmp [line 1, column 1] cmp/custom: Abstract component markup://validationTest:basic must be extensible",
                errors.get(0));
    }
}
