/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.util;

import java.util.Arrays;
import java.util.List;

import org.auraframework.test.UnitTestCase;

public class AuraTextUtilTest extends UnitTestCase {
    /**
     * A simple input/expected pair for testing.
     */
    private static class StringPair {
        public final String input;
        public final String expected;

        /**
         * The full constructor.
         *
         * @param input the input string to the method.
         * @param expected the expected output string.
         */
        public StringPair(String input, String expected) {
            this.input = input;
            this.expected = expected;
        }

        /**
         * A constructor for unchanged values.
         *
         * @param input the input string to the method, this will be used as the expected value.
         */
        public StringPair(String input) {
            this.input = input;
            this.expected = input;
        }
    }

    private final static StringPair [] INIT_LOWER_CASE_PAIRS = new StringPair [] {
        new StringPair(null, null),
        new StringPair("", ""),
        new StringPair("A", "a"),
        new StringPair("a", "a"),
        new StringPair("Apple", "apple"),
        new StringPair("apple", "apple"),
        new StringPair("1", "1"),
        new StringPair("=", "="),
        new StringPair(" A", " A"),
        new StringPair("Ñ", "ñ"),
    };

    public void testInitLowerCase() {
        for (StringPair p : INIT_LOWER_CASE_PAIRS) {
            assertEquals(p.expected, AuraTextUtil.initLowerCase(p.input));
        }
    }

    public void testArrayToStringNulls() {
        assertEquals(null, AuraTextUtil.arrayToString(null, ",", 1, true, true));
        try {
            AuraTextUtil.arrayToString(new String [] {}, null, 1, true, true);
            fail("expected illegal argument exception on null delimiter");
        } catch (IllegalArgumentException expected) {
            // ignore
        }
    }

    public void testArrayToStringEmpty() {
        assertEquals("", AuraTextUtil.arrayToString(new String [] {}, ",", 1, false, false));
        assertEquals("[]", AuraTextUtil.arrayToString(new String [] {}, ",", 1, true, false));
    }

    public void testArrayToStringSingle() {
        assertEquals("1", AuraTextUtil.arrayToString(new String [] {"1"}, ",", 1, false, false));
        assertEquals("[1]", AuraTextUtil.arrayToString(new String [] {"1"}, ",", 1, true, false));
        assertEquals("1", AuraTextUtil.arrayToString(new String [] {"1"}, ",", 1, false, true));
        assertEquals("[1]", AuraTextUtil.arrayToString(new String [] {"1"}, ",", 1, true, true));
    }

    public void testArrayToStringTwoEntry() {
        assertEquals("1,2", AuraTextUtil.arrayToString(new String [] {"1", "2"}, ",", 2, false, false));
        assertEquals("[1,2]", AuraTextUtil.arrayToString(new String [] {"1", "2"}, ",", 2, true, false));
        assertEquals("1,2", AuraTextUtil.arrayToString(new String [] {"1", "2"}, ",", 2, false, true));
        assertEquals("[1,2]", AuraTextUtil.arrayToString(new String [] {"1", "2"}, ",", 2, true, true));

        assertEquals("1xxx2", AuraTextUtil.arrayToString(new String [] {"1", "2"}, "xxx", 2, false, false));
        assertEquals("[1xxx2]", AuraTextUtil.arrayToString(new String [] {"1", "2"}, "xxx", 2, true, false));
        assertEquals("1xxx2", AuraTextUtil.arrayToString(new String [] {"1", "2"}, "xxx", 2, false, true));
        assertEquals("[1xxx2]", AuraTextUtil.arrayToString(new String [] {"1", "2"}, "xxx", 2, true, true));
    }

    public void testArrayToStringTwoEntryLimit() {
        assertEquals("1,2", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, ",", 2, false, false));
        assertEquals("[1,2]", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, ",", 2, true, false));
        assertEquals("1,2...", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, ",", 2, false, true));
        assertEquals("[1,2...]", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, ",", 2, true, true));

        // the other call case...
        assertEquals("1,2...", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, ",", 2, false));
        assertEquals("[1,2...]", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, ",", 2, true));

        assertEquals("1xxx2", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, "xxx", 2, false, false));
        assertEquals("[1xxx2]", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, "xxx", 2, true, false));
        assertEquals("1xxx2...", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, "xxx", 2, false, true));
        assertEquals("[1xxx2...]", AuraTextUtil.arrayToString(new String [] {"1", "2", "3"}, "xxx", 2, true, true));
    }

    public void testArrayToStringTwoEntryHasNull() {
        assertEquals("1,null", AuraTextUtil.arrayToString(new String [] {"1", null}, ",", 2, false, false));
    }

    public void testArrayToStringManyEntry() {
        assertEquals("1,2,3,4", AuraTextUtil.arrayToString(new String [] {"1","2","3","4"}, ",", -1, false, false));
    }

    public void testIsNullEmptyOrWhitespace() {
        assertEquals(true, AuraTextUtil.isNullEmptyOrWhitespace(null));
        assertEquals(true, AuraTextUtil.isNullEmptyOrWhitespace(""));
        assertEquals(false, AuraTextUtil.isNullEmptyOrWhitespace("a"));
        assertEquals(true, AuraTextUtil.isNullEmptyOrWhitespace(" "));
        assertEquals(true, AuraTextUtil.isNullEmptyOrWhitespace("\t"));
        assertEquals(true, AuraTextUtil.isNullEmptyOrWhitespace("\t\n "));
        assertEquals(true, AuraTextUtil.isNullEmptyOrWhitespace("\r\n "));
        assertEquals(true, AuraTextUtil.isNullEmptyOrWhitespace("\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u0010\u0011 "));
        assertEquals(false, AuraTextUtil.isNullEmptyOrWhitespace("\t\n a"));
    }

    public void testIsNullOrEmpty() {
        assertEquals(true, AuraTextUtil.isNullOrEmpty(null));
        assertEquals(true, AuraTextUtil.isNullOrEmpty(""));
        assertEquals(false, AuraTextUtil.isNullOrEmpty("a"));
        assertEquals(false, AuraTextUtil.isNullOrEmpty(" "));
        assertEquals(false, AuraTextUtil.isNullOrEmpty("\t"));
        assertEquals(false, AuraTextUtil.isNullOrEmpty("\t\n "));
        assertEquals(false, AuraTextUtil.isNullOrEmpty("\r\n "));
        assertEquals(false, AuraTextUtil.isNullOrEmpty("\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u0010\u0011 "));
        assertEquals(false, AuraTextUtil.isNullOrEmpty("\t\n a"));
    }

    public void testIsEmptyOrWhitespace() {
        assertEquals(false, AuraTextUtil.isEmptyOrWhitespace(null));
        assertEquals(true, AuraTextUtil.isEmptyOrWhitespace(""));
        assertEquals(false, AuraTextUtil.isEmptyOrWhitespace("a"));
        assertEquals(true, AuraTextUtil.isEmptyOrWhitespace(" "));
        assertEquals(true, AuraTextUtil.isEmptyOrWhitespace("\t"));
        assertEquals(true, AuraTextUtil.isEmptyOrWhitespace("\t\n "));
        assertEquals(true, AuraTextUtil.isEmptyOrWhitespace("\r\n "));
        assertEquals(true, AuraTextUtil.isEmptyOrWhitespace("\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u0010\u0011 "));
        assertEquals(false, AuraTextUtil.isEmptyOrWhitespace("\t\n a"));
        assertEquals(false, AuraTextUtil.isEmptyOrWhitespace("\ufffe"));
    }

    /**
     * JS replacement strings.
     */
    private static StringPair [] JS_STRING_PAIRS = new StringPair [] {
        new StringPair("'", "\\'"),
        new StringPair("\r", "\\r"),
        new StringPair("\n", "\\n"),
        new StringPair("\u2028", "\\n"),
        new StringPair("'abc'", "\\'abc\\'"),
        new StringPair("<!--", "\\u003C\\u0021--"),
        new StringPair("-->", "--\\u003E"),
        new StringPair("\"", "\\\""),
        new StringPair("\\", "\\\\"),
        new StringPair("\u0000", ""),
        new StringPair("0123456789/!@#$%^&*()-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    };

    public void testEscapeForJavascriptString() {
        for (StringPair p : JS_STRING_PAIRS) {
            assertEquals(p.expected, AuraTextUtil.escapeForJavascriptString(p.input));
        }
    }

    /**
     * JSON replacement strings.
     */
    private static StringPair [] JSON_STRING_PAIRS = new StringPair [] {
        new StringPair("\r", "\\r"),
        new StringPair("\n", "\\n"),
        new StringPair("\u2028", "\\n"),
        new StringPair("'abc'", "'abc'"),
        new StringPair("<!--", "\\u003C\\u0021--"),
        new StringPair("-->", "--\\u003E"),
        new StringPair("\"", "\\\""),
        new StringPair("\\", "\\\\"),
        new StringPair("\u0000", ""),
        new StringPair("0123456789/!@#$%^&*()-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    };

    public void testEscapeForJSONString() {
        for (StringPair p : JSON_STRING_PAIRS) {
            assertEquals(p.expected, AuraTextUtil.escapeForJSONString(p.input));
        }
    }

    private static class SplitMatch {
        public final String input;
        public final String delimiter;
        public final int expectedSize;
        public final List<String> result;

        public SplitMatch(String input, String delimiter, int expectedSize, String [] result) {
            this.input = input;
            this.delimiter = delimiter;
            this.expectedSize = expectedSize;
            this.result = Arrays.asList(result);
        }

        @Override
        public String toString() {
            return "split('"+this.delimiter+"','"+this.input+"','"+this.expectedSize+")";
        }

        public void checkResult(List<String> actual) {
            String label = toString();
            int i;

            assertEquals(label+" size mismatch", this.result.size(), actual.size());
            for (i = 0; i < this.result.size(); i += 1) {
                assertEquals(label+" item mismatch at "+i, this.result.get(i), actual.get(i));
            }
        }
    };

    private static final SplitMatch [] splitTests = new SplitMatch [] {
        new SplitMatch("a", ",", 1, new String [] { "a" }),
        new SplitMatch("a,b", ",", 1, new String [] { "a", "b" }),
        new SplitMatch("axxxb", "xxx", 1, new String [] { "a", "b" }),
        new SplitMatch("axxxb", "xxx", 0, new String [] { "a", "b" }),
        new SplitMatch("a, b", ",", 2, new String [] { "a", " b" }),
        new SplitMatch("a,b ", ",", 2, new String [] { "a", "b " }),
        new SplitMatch("a,b,", ",", 2, new String [] { "a", "b", "" }),
    };

    public void testSplitSimple2() {
        for (SplitMatch sm : splitTests) {
            sm.checkResult(AuraTextUtil.splitSimple(sm.delimiter, sm.input));
        }
    }

    public void testSplitSimple3() {
        for (SplitMatch sm : splitTests) {
            sm.checkResult(AuraTextUtil.splitSimple(sm.delimiter, sm.input, sm.expectedSize));
        }
    }

    private static final SplitMatch [] splitTrimTests = new SplitMatch [] {
        new SplitMatch("a", ",", 1, new String [] { "a" }),
        new SplitMatch("a,b", ",", 1, new String [] { "a", "b" }),
        new SplitMatch("axxxb", "xxx", 1, new String [] { "a", "b" }),
        new SplitMatch("axxxb", "xxx", 0, new String [] { "a", "b" }),
        new SplitMatch("a, b", ",", 2, new String [] { "a", "b" }),
        new SplitMatch("a,b ", ",", 2, new String [] { "a", "b" }),
        new SplitMatch("a,b,", ",", 2, new String [] { "a", "b", "" }),
        new SplitMatch("a,b,  ", ",", 2, new String [] { "a", "b", "" }),
    };

    public void testSplitSimpleAndTrim() {
        for (SplitMatch sm : splitTrimTests) {
            sm.checkResult(AuraTextUtil.splitSimpleAndTrim(sm.input, sm.delimiter, sm.expectedSize));
        }
    }

    private static final SplitMatch [] splitLimitTests = new SplitMatch [] {
        new SplitMatch("a", ",", 1, new String [] { "a" }),
        new SplitMatch("a,b", ",", 1, new String [] { "a,b" }),
        new SplitMatch("axxxb", "xxx", 1, new String [] { "axxxb" }),
        new SplitMatch("axxxb", "xxx", 2, new String [] { "a", "b" }),
        new SplitMatch("axxxbxxxc", "xxx", 2, new String [] { "a", "bxxxc" }),
        new SplitMatch("a,b,", ",", 2, new String [] { "a", "b," }),
        new SplitMatch("a,b,", ",", 10, new String [] { "a", "b", "" }),
    };

    public void testSplitSimpleLimit() {
        for (SplitMatch sm : splitLimitTests) {
            sm.checkResult(AuraTextUtil.splitSimpleLimit(sm.input, sm.delimiter, sm.expectedSize));
        }
    }

    private static final SplitMatch [] splitLimitTrimTests = new SplitMatch [] {
        new SplitMatch("a   ", ",", 1, new String [] { "a" }),
        new SplitMatch("a , b", ",", 1, new String [] { "a , b" }),
        new SplitMatch("axxx b", "xxx", 1, new String [] { "axxx b" }),
        new SplitMatch("axxx b", "xxx", 2, new String [] { "a", "b" }),
        new SplitMatch("axxxbxxx c", "xxx", 2, new String [] { "a", "bxxx c" }),
        new SplitMatch("a,b,   ", ",", 2, new String [] { "a", "b," }),
        new SplitMatch("a,b,   ", ",", 10, new String [] { "a", "b", "" }),
    };

    public void testSplitSimpleLimitTrim() {
        for (SplitMatch sm : splitLimitTrimTests) {
            sm.checkResult(AuraTextUtil.splitSimpleLimitAndTrim(sm.input, sm.delimiter, sm.expectedSize));
        }
    }

    private final static StringPair [] INIT_CAP_PAIRS = new StringPair [] {
        new StringPair(null, null),
        new StringPair("", ""),
        new StringPair("A", "A"),
        new StringPair("a", "A"),
        new StringPair("Apple", "Apple"),
        new StringPair("apple", "Apple"),
        new StringPair("1", "1"),
        new StringPair("=", "="),
        new StringPair(" a", " a"),
        new StringPair("ñ", "Ñ"),
    };

    public void testInitCap() {
        for (StringPair p : INIT_CAP_PAIRS) {
            assertEquals(p.expected, AuraTextUtil.initCap(p.input));
        }
    }

    private final static StringPair [] URL_DECODE_PAIRS = new StringPair [] {
        new StringPair("", ""),
    };

    public void testURLDecodeNull() {
        try {
            AuraTextUtil.urldecode(null);
        } catch (NullPointerException expected) {}
    }

    public void testURLDecode() {
        for (StringPair p : URL_DECODE_PAIRS) {
            assertEquals(p.expected, AuraTextUtil.urldecode(p.input));
        }
    }

    private final static StringPair [] URL_ENCODE_PAIRS = new StringPair [] {
        new StringPair("", ""),
    };

    public void testURLEncodeNull() {
        try {
            AuraTextUtil.urlencode(null);
        } catch (NullPointerException expected) {}
    }

    public void testURLEncode() {
        for (StringPair p : URL_ENCODE_PAIRS) {
            assertEquals(p.expected, AuraTextUtil.urlencode(p.input));
        }
    }
}
