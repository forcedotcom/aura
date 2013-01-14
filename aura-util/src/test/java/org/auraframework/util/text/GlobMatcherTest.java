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
package org.auraframework.util.text;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.auraframework.test.UnitTestCase;

public class GlobMatcherTest extends UnitTestCase {
    private static class GMTSet {
        public final String pattern;
        public final boolean constant;
        public final List<String> matches;
        public final List<String> fails;

        public GMTSet(String pattern, boolean constant, String[] matches, String[] fails) {
            this.pattern = pattern;
            this.constant = constant;
            if (matches != null) {
                this.matches = Arrays.asList(matches);
            } else {
                this.matches = new ArrayList<String>();
            }
            if (fails != null) {
                this.fails = Arrays.asList(fails);
            } else {
                this.fails = new ArrayList<String>();
            }
        }
    }

    public void testAll() {
        GlobMatcher gm = new GlobMatcher("*");
        assertTrue("* should be 'all'", gm.isAll());
        assertFalse("* should not be constant", gm.isConstant());
        assertTrue("* matches null", gm.match(null));
        assertTrue("* matches everything", gm.match("abcd"));
        assertTrue("* matches everything", gm.match("AbCd"));
    }

    private static String[] ILLEGALS = new String[] { "bah@", "bah.", };

    public void testIllegals() {
        for (String x : ILLEGALS) {
            try {
                new GlobMatcher(x);
                fail("Expected illegal argument exception for " + x);
            } catch (IllegalArgumentException iae) {
                // expected, don't worry about text.
            }
        }
    }

    private void matchCheck(GMTSet[] theSet) {
        for (GMTSet gmt : theSet) {
            GlobMatcher gm = new GlobMatcher(gmt.pattern);

            assertEquals("toString should give us the original", gm.toString(), gmt.pattern);
            if (gmt.constant) {
                assertTrue(gm.toString() + ": must be constant", gm.isConstant());
            } else {
                assertFalse(gm.toString() + ": must NOT be constant", gm.isConstant());
            }
            assertFalse(gm.toString() + ": must not be all", gm.isAll());
            for (String m : gmt.matches) {
                assertTrue(gm.toString() + " should match " + m, gm.match(m));
            }
            for (String m : gmt.fails) {
                assertFalse(gm.toString() + " should NOT match " + m, gm.match(m));
            }
        }
    }

    private static GMTSet[] CONSTANTS = new GMTSet[] {
            new GMTSet("bah", true, new String[] { "bah" }, new String[] { "humbug", "bah2", "ba" }),
            new GMTSet("3bah", true, new String[] { "3bah" }, new String[] { "humbug", "bah2", "ba" }), };

    public void testConstant() {
        matchCheck(CONSTANTS);
    }

    private static GMTSet[] STARS = new GMTSet[] {
            new GMTSet("bah*", false, new String[] { "bah", "bahxyz", "bahXY", "bah*" }, new String[] { "humbug", "ba",
                    "xyzbah" }),
            new GMTSet("*bah", false, new String[] { "bah", "xyzbah", "XYbah", "*bah" }, new String[] { "humbug",
                    "bah2", "ba" }),
            new GMTSet("b*ah", false, new String[] { "bah", "bXYZah", "b@ah", "b*ah" }, new String[] { "humbug",
                    "bah2", "ba" }), };

    public void testStar() {
        matchCheck(STARS);
    }

    private static GMTSet[] INSENSITIVE = new GMTSet[] {
            new GMTSet("bah", true, new String[] { "Bah", "BAH", "baH" }, null),
            new GMTSet("3bah", true, new String[] { "3Bah", "3BAH", "3baH" }, null),
            new GMTSet("bah*", false, new String[] { "Bah", "bAhxyz", "baHXY", "BAH*" }, null),
            new GMTSet("*bah", false, new String[] { "Bah", "xyzbAh", "XYbaH", "*BAH" }, null),
            new GMTSet("b*ah", false, new String[] { "Bah", "bXYZAh", "b@aH", "B*AH" }, null), };

    public void testCaseInsensitive() {
        matchCheck(INSENSITIVE);
    }
}
