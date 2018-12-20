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
package org.auraframework.impl.test.util.matcher;

import org.hamcrest.BaseMatcher;
import org.hamcrest.Description;

/**
 * Tests if a string is equal to another string, ignoring any ALL whitespace.
 * 
 * This is different from {@link org.hamcrest.text.IsEqualIgnoringWhiteSpace} in that will ignore all of the white, not
 * just truncate it to a single space character.
 * 
 * @see org.hamcrest.text.IsEqualIgnoringWhiteSpace
 */
public class IsEqualIgnoringAllWhiteSpace extends BaseMatcher<String> {
    final String expected;
    private final String describeText;

    /**
     * Creates a matcher of {@link String} that matches when the examined string is equal to the specified
     * expectedString, when whitespace differences are ignored. To be exact, the following whitespace rules are applied:
     * For example:
     *     {@code assertThat("   my\tfoo  bar ", equalToIgnoringAllWhiteSpace("myfoobar")) //return true}
     * 
     * @param expectedString the expected value of matched strings
     */
    public final static IsEqualIgnoringAllWhiteSpace equalToIgnoringAllWhiteSpace(final String expectedString) {
        return new IsEqualIgnoringAllWhiteSpace(expectedString, "the given String should match '%s' without whitespaces");
    }
    
    static final String removeWhitespace(final String value) {
        return value.replaceAll("\\s+", "");
    }

    /**
     * @param expected the expected value of matched strings
     * @param describeText Generates a description of the object.
     */
    IsEqualIgnoringAllWhiteSpace(final String expected, final String describeText) {
        this.expected = removeWhitespace(expected);
        this.describeText = describeText;
    }

    @Override
    public boolean matches(Object actual) {
        return expected.equals((actual == null) ? null : removeWhitespace(actual.toString()));
    }

    @Override
    public void describeTo(final Description description) {
        description.appendText(String.format(describeText, expected));
    }
}
