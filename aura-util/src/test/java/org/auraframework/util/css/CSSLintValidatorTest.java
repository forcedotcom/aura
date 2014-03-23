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
package org.auraframework.util.css;

import java.io.File;
import java.util.List;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.javascript.JavascriptProcessingError.Level;
import org.auraframework.util.validation.ValidationError;

import com.google.common.base.Charsets;
import com.google.common.io.Files;

public final class CSSLintValidatorTest extends UnitTestCase {

    public void testValidate() throws Exception {
        if (System.getProperty("java.version").startsWith("1.6")) {
            return; // csslint doesn't work with 1.6
        }

        CSSLintValidator validator = new CSSLintValidator();
        List<ValidationError> errors = validator.validate("input.css",
                ".mybox {\n\tborder: 1px solid black;\n\tpadding: 5px;\n\twidth: 100px;}", false);
        assertEquals(2, errors.size());
        ValidationError error = errors.get(0);
        assertEquals("input.css", error.getFilename());
        assertEquals(2, error.getLine());
        assertEquals(2, error.getStartColumn());
        assertEquals("csslint", error.getValidatingTool());
        assertEquals("Using width with border can sometimes make elements larger than you expect", error.getMessage());
        assertEquals("\tborder: 1px solid black;", error.getEvidence());
        assertEquals(Level.Warning, error.getLevel());
        assertEquals("box-model", error.getRule());

        // can rerun on the same validator
        errors = validator.validate("input2.css",
                ".mybox {\n\tborder: 2px solid black;\n\tpadding: 5px;\n\twidth: 100px;}", false);
        assertEquals(2, errors.size());
        assertEquals("input2.css", errors.get(0).getFilename());
    }

    public void testDoesntReportBogusErrorsForAuraCSS() throws Exception {
        if (System.getProperty("java.version").startsWith("1.6")) {
            return; // csslint doesn't work with 1.6
        }

        File cssFile = getResourceFile("/testdata/css/aura1.css");
        CSSLintValidator validator = new CSSLintValidator();
        List<ValidationError> errors = validator.validate(cssFile.getName(), Files.toString(cssFile, Charsets.UTF_8),
                true);
        assertEquals(2, errors.size());
        assertEquals(
                "aura1.css [line 7, column 7] csslint @ unqualified-attributes: Unqualified attribute selectors are known to be slow",
                errors.get(0).toCommonFormat());
        assertEquals(
                "aura1.css [line 13, column 5] csslint @ box-sizing: The box-sizing property isn't supported in IE6 and IE7",
                errors.get(1).toCommonFormat());
    }
}
