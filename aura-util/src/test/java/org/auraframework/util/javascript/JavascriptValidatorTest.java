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
package org.auraframework.util.javascript;

import java.util.List;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.javascript.JavascriptProcessingError.Level;
import org.auraframework.util.validation.ValidationError;
import org.auraframework.util.validation.ValidationTestUtil;

public final class JavascriptValidatorTest extends UnitTestCase {

    public void testValidate() throws Exception {
        JavascriptValidator validator = new JavascriptValidator();
        List<JavascriptProcessingError> errors = validator.validate("input.js", "var index = 1;\nindex++\nindex += 4;",
                false, false);
        assertEquals(1, errors.size());
        ValidationError error = errors.get(0);
        assertEquals("input.js", error.getFilename());
        assertEquals(2, error.getLine());
        assertEquals(8, error.getStartColumn());
        assertEquals("jslint", error.getValidatingTool());
        assertEquals("Expected ';' and instead saw 'index'", error.getMessage());
        assertEquals("index++", error.getEvidence());
        assertEquals(Level.Error, error.getLevel());
        assertNull(error.getRule());

        // can rerun on the same validator
        errors = validator.validate("input2.js", "var i = 1\ni++\n;", false, false);
        assertEquals(1, errors.size());
        assertEquals("input2.js", errors.get(0).getFilename());
    }

    public void test2009JSLint() throws Exception {
        // UC: the new jslint reports unused variables
        JavascriptValidator validator = new JavascriptValidator();
        List<JavascriptProcessingError> errors = validator.validate("input.js", "function unused() {var index = 1}",
                false, false);
        assertEquals(2, errors.size());
        ValidationTestUtil
                .assertError("input.js [line 1, column 33] jslint: Expected ';' and instead saw '}'", errors.get(0));
        ValidationTestUtil
                .assertError("input.js [line 1, column 24] jslint: Unused 'index'", errors.get(1));

        // UC: but the 2009 one doesn't
        validator = new JavascriptValidator(true);
        errors = validator.validate("input.js", "function unused() {var index = 1}",
                false, false);
        assertEquals(1, errors.size());
        ValidationTestUtil
                .assertError("input.js [line 1, column 33] jslint2009: Missing semicolon", errors.get(0));
    }
}
