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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Assert;

/**
 * Misc helper methods for validation tests.
 */
public final class ValidationTestUtil {

    public static void assertError(String expectedMessage, ValidationError error) {
        assertContains(expectedMessage, Arrays.asList(error.toCommonFormat()));
    }

    public static void assertContains(String expected, List<String> errors) {
        boolean contains = false;
        for(String error:errors){
            contains=error.endsWith(expected);
            if(contains) {
                break;
            }
        }
        if(!contains){
            System.out.println("expected: " + expected);
        }
        Assert.assertTrue(expected, contains);

    }

    public static void showErrors(List<ValidationError> errors) {
        for (ValidationError error : errors)
            System.out.println(error.toCommonFormat());
    }

    public static void verifyValidationTestBasicErrors(List<String> errors) {
        // csslint doesn't work when running with 1.6
        boolean cssLintErrorsReported = !System.getProperty("java.version").startsWith("1.6");

        Assert.assertEquals(cssLintErrorsReported ? 2 : 0, errors.size());
        ArrayList<String> expectedErrors = new ArrayList<>();
        if(cssLintErrorsReported){
            expectedErrors.add("basic.css [line 1, column 1] cssparser: CSS selector must begin with '.validationTestBasic' or '.THIS'");
            expectedErrors.add("basic.css [line 2, column 5] csslint @ box-sizing: The box-sizing property isn't supported in IE6 and IE7");
        }

        for(String expected:expectedErrors){
            assertContains(expected,errors);
        }
    }
}
