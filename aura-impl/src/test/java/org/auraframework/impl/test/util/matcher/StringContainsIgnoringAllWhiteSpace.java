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

/**
 * Tests if the argument is a string that contains a substring, ignoring ALL whitespace.
 * 
 * @see org.hamcrest.core.StringContains
 */
public class StringContainsIgnoringAllWhiteSpace extends IsEqualIgnoringAllWhiteSpace {

    /**
     * Creates a matcher that matches if the examined {@link String} contains the specified {@link String} anywhere,
     * when whitespace differences are ignored.
     * For example:
     *     {assertThat("   my\tfoo  bar string ", stringContainsIgnoringAllWhiteSpace("myfoobar")) //return true}
     * 
     * @param substring
     *     the substring that the returned matcher will expect to find within any examined string
     * 
     */
    public final static StringContainsIgnoringAllWhiteSpace containsStringIgnoringAllWhiteSpace(final String expectedString) {
        return new StringContainsIgnoringAllWhiteSpace(expectedString, "the given String should contain '%s' without whitespaces");
    }
    
    private StringContainsIgnoringAllWhiteSpace(final String expected, final String describeText) {
        super(expected, describeText);
    }

    @Override
    public boolean matches(Object actual) {
        return (actual == null) ? false : removeWhitespace(actual.toString()).contains(expected);
    }
}
