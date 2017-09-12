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
package org.auraframework.util.text;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;

public class GlobMatcherTest {
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
                this.matches = new ArrayList<>();
            }
            if (fails != null) {
                this.fails = Arrays.asList(fails);
            } else {
                this.fails = new ArrayList<>();
            }
        }
    }

    @Test
    public void testAll() {
        GlobMatcher gm = new GlobMatcher("*");
        Assert.assertTrue("* should be 'all'", gm.isAll());
        Assert.assertFalse("* should not be constant", gm.isConstant());
        Assert.assertTrue("* matches null", gm.match(null));
        Assert.assertTrue("* matches everything", gm.match("abcd"));
        Assert.assertTrue("* matches everything", gm.match("AbCd"));
    }

    private static String[] ILLEGALS = new String[] { "bah@", "bah.", };

    @Test
    public void testIllegals() {
        for (String x : ILLEGALS) {
            IllegalArgumentException expected = null;

            try {
                new GlobMatcher(x);
            } catch (IllegalArgumentException iae) {
                expected = iae;
            }
            Assert.assertNotNull("Expected illegal argument exception for " + x, expected);
        }
    }

    private void matchCheck(GMTSet[] theSet) {
        for (GMTSet gmt : theSet) {
            GlobMatcher gm = new GlobMatcher(gmt.pattern);

            Assert.assertEquals("toString should give us the original", gm.toString(), gmt.pattern);
            if (gmt.constant) {
                Assert.assertTrue(gm.toString() + ": must be constant", gm.isConstant());
            } else {
                Assert.assertFalse(gm.toString() + ": must NOT be constant", gm.isConstant());
            }
            Assert.assertFalse(gm.toString() + ": must not be all", gm.isAll());
            for (String m : gmt.matches) {
                Assert.assertTrue(gm.toString() + " should match " + m, gm.match(m));
            }
            for (String m : gmt.fails) {
                Assert.assertFalse(gm.toString() + " should NOT match " + m, gm.match(m));
            }
        }
    }

    private static GMTSet[] CONSTANTS = new GMTSet[] {
            new GMTSet("bah", true, new String[] { "bah" }, new String[] { "humbug", "bah2", "ba" }),
            new GMTSet("3bah", true, new String[] { "3bah" }, new String[] { "humbug", "bah2", "ba" }), };

    @Test
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

    @Test
    public void testStar() {
        matchCheck(STARS);
    }

    private static GMTSet[] INSENSITIVE = new GMTSet[] {
            new GMTSet("bah", true, new String[] { "Bah", "BAH", "baH" }, null),
            new GMTSet("3bah", true, new String[] { "3Bah", "3BAH", "3baH" }, null),
            new GMTSet("bah*", false, new String[] { "Bah", "bAhxyz", "baHXY", "BAH*" }, null),
            new GMTSet("*bah", false, new String[] { "Bah", "xyzbAh", "XYbaH", "*BAH" }, null),
            new GMTSet("b*ah", false, new String[] { "Bah", "bXYZAh", "b@aH", "B*AH" }, null), };

    @Test
    public void testCaseInsensitive() {
        matchCheck(INSENSITIVE);
    }
}
