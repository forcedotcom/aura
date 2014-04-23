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
package org.auraframework.util.validation;

import java.util.List;

import junit.framework.Assert;

import org.auraframework.util.validation.ValidationError;

/**
 * Misc helper methods for validation tests.
 */
public final class ValidationTestUtil {

    public static void assertError(String expectedMessage, ValidationError error) {
        assertError(expectedMessage, error.toCommonFormat());
    }

    public static void assertError(String expected, String error) {
        boolean passed = error.endsWith(expected);
        if (!passed) {
            System.out.println("expected: " + expected);
            System.out.println("actual  : " + error);
        }
        Assert.assertTrue(error, passed);
    }

    public static void showErrors(List<ValidationError> errors) {
        for (ValidationError error : errors)
            System.out.println(error.toCommonFormat());
    }

    public static void verifyValidationTestBasicErrors(List<String> errors) {
        // csslint doesn't work when running with 1.6
        boolean cssLintErrorsReported = !System.getProperty("java.version").startsWith("1.6");

        Assert.assertEquals(cssLintErrorsReported ? 5 : 3, errors.size());

        int errorNum = 0;
        if (cssLintErrorsReported) {
            assertError(
                    "basic.css [line 1, column 1] cssparser: CSS selector must begin with '.validationTestBasic' or '.THIS'",
                    errors.get(errorNum++));
            assertError(
                    "basic.css [line 2, column 5] csslint @ box-sizing: The box-sizing property isn't supported in IE6 and IE7",
                    errors.get(errorNum++));
        }
        assertError("basicController.js [line 5, column 1] js/custom: Starting '(' missing",
                errors.get(errorNum++));
        assertError("basicController.js [line 7, column 20] jslint: Expected ';' and instead saw '}'",
                errors.get(errorNum++));
        assertError(
                "basic.cmp [line 1, column 1] cmp/custom: Abstract component markup://validationTest:basic must be extensible",
                errors.get(errorNum++));
    }
}
