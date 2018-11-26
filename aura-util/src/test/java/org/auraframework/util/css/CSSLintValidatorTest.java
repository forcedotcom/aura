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

import java.util.List;

import org.auraframework.util.javascript.JavascriptProcessingError.Level;
import org.auraframework.util.validation.ValidationError;
import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class CSSLintValidatorTest {

    @Test
    public void testValidate() throws Exception {
        CSSLintValidator validator = new CSSLintValidator();
        List<ValidationError> errors = validator.validate("input.css",
                ".mybox {\n\tborder: 1px solid black;\n\tpadding: 5px;\n\twidth: 100px;}", Boolean.FALSE);
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
                ".mybox {\n\tborder: 2px solid black;\n\tpadding: 5px;\n\twidth: 100px;}", Boolean.FALSE);
        assertEquals(2, errors.size());
        assertEquals("input2.css", errors.get(0).getFilename());
    }

    private static final String CSS_WITH_WARNINGS = 
         ".THIS .uiButton.default:disabled,\n" 
        +".THIS .uiButton.default {\n"
        +"    background: #EDEDED;\n"
        +"}\n"
        +"\n"
        +"/* @ie7hover remove */\n"
        +".THIS .uiButton.default[disabled]:focus {\n"
        +"    background: #EDEDED;\n"
        +"    background: linear-gradient(#FEFEFE,#EDEDED);\n"
        +"}\n"
        +"\n"
        +".THIS.headerBar {\n"
        +"    box-sizing: border-box;\n"
        +"    height: 60px;\n"
        +"}\n";

    @Test
    public void testDoesntReportBogusErrorsForAuraCSS() throws Exception {
        CSSLintValidator validator = new CSSLintValidator();
        List<ValidationError> errors = validator.validate("test.css", CSS_WITH_WARNINGS, Boolean.TRUE);
        assertEquals(2, errors.size());
        assertEquals(
                "test.css [line 7, column 7] csslint @ unqualified-attributes: Unqualified attribute selectors are known to be slow",
                errors.get(0).toCommonFormat());
        assertEquals(
                "test.css [line 13, column 5] csslint @ box-sizing: The box-sizing property isn't supported in IE6 and IE7",
                errors.get(1).toCommonFormat());
    }
}
