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
package org.auraframework.system;

import org.auraframework.test.UnitTestCase;

public class DescriptorMatcherTest extends UnitTestCase {
    public DescriptorMatcherTest(String name) {
        super(name);
    }

    private String getLabel(DescriptorMatcher dm, boolean expected, String what, String value) {
        String match;

        if (expected) {
            match = "Failed to match ";
        } else {
            match = "Matched ";
        }
        return dm.toString()+": "+match+" "+what+": "+value;
    }

    private void checkPrefix(DescriptorMatcher dm, String prefix, boolean value) {
        assertEquals(getLabel(dm, value, "prefix", prefix), value, dm.matchPrefix(prefix));
    }

    private void checkNamespace(DescriptorMatcher dm, String namespace, boolean value) {
        assertEquals(getLabel(dm, value, "namespace", namespace), value, dm.matchNamespace(namespace));
    }

    private void checkName(DescriptorMatcher dm, String name, boolean value) {
        assertEquals(getLabel(dm, value, "name", name), value, dm.matchName(name));
    }

    public void testFullWildcardMatcher() throws Exception {
        DescriptorMatcher dm;
       
        dm = new DescriptorMatcher("*://*:*");
        checkPrefix(dm, "hi", true);
        checkPrefix(dm, "css", true);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", true);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
    }

    public void testNoprefixWildcardMatcher() throws Exception {
        DescriptorMatcher dm;
       
        dm = new DescriptorMatcher("notfound://*:*");
        checkPrefix(dm, "hi", false);
        checkPrefix(dm, "css", false);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", true);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
    }

    public void testNonamespaceWildcardMatcher() throws Exception {
        DescriptorMatcher dm;
       
        dm = new DescriptorMatcher("*://notfound:*");
        checkPrefix(dm, "hi", true);
        checkPrefix(dm, "css", true);
        checkNamespace(dm, "hi", false);
        checkNamespace(dm, "css", false);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
    }

    public void testNonameWildcardMatcher() throws Exception {
        DescriptorMatcher dm;
       
        dm = new DescriptorMatcher("*://*:notfound");
        checkPrefix(dm, "hi", true);
        checkPrefix(dm, "css", true);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", true);
        checkName(dm, "hi", false);
        checkName(dm, "css", false);
    }

    public void testExactMatcher() throws Exception {
        DescriptorMatcher dm;
       
        dm = new DescriptorMatcher("exactprefix://exactnamespace:exactname");

        checkPrefix(dm, "exactprefix1", false);
        checkPrefix(dm, "1exactprefix", false);
        checkPrefix(dm, "exactnamespace", false);
        checkPrefix(dm, "exactname", false);
        checkPrefix(dm, "exactprefix", true);

        checkNamespace(dm, "exactnamespace1", false);
        checkNamespace(dm, "1exactnamespace", false);
        checkNamespace(dm, "exactprefix", false);
        checkNamespace(dm, "exactname", false);
        checkNamespace(dm, "exactnamespace", true);

        checkName(dm, "exactname1", false);
        checkName(dm, "1exactname", false);
        checkName(dm, "exactprefix", false);
        checkName(dm, "exactnamespace", false);
        checkName(dm, "exactname", true);
    }

    public void testAlmostMatcher() throws Exception {
        DescriptorMatcher dm;
       
        dm = new DescriptorMatcher("almostprefix*://almostnamespace*:almostname*");

        checkPrefix(dm, "almostprefix1", true);
        checkPrefix(dm, "1almostprefix", false);
        checkPrefix(dm, "almostnamespace", false);
        checkPrefix(dm, "almostname", false);
        checkPrefix(dm, "almostprefix", true);

        checkNamespace(dm, "almostnamespace1", true);
        checkNamespace(dm, "1almostnamespace", false);
        checkNamespace(dm, "almostprefix", false);
        checkNamespace(dm, "almostname", false);
        checkNamespace(dm, "almostnamespace", true);

        checkName(dm, "almostname1", true);
        checkName(dm, "1almostname", false);
        checkName(dm, "almostprefix", false);
        checkName(dm, "almostnamespace", true);          // note that this is true....
        checkName(dm, "almostname", true);
    }
}
