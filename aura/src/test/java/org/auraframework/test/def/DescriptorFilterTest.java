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
package org.auraframework.test.def;

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.junit.Assert;
import org.junit.Test;

public class DescriptorFilterTest {
    private String getLabel(DescriptorFilter dm, boolean expected, String what, String value) {
        String match;

        if (expected) {
            match = "Failed to match ";
        } else {
            match = "Matched ";
        }
        return dm.toString() + ": " + match + " " + what + ": " + value;
    }

    private void checkPrefix(DescriptorFilter dm, String prefix, boolean value) {
        Assert.assertEquals(getLabel(dm, value, "prefix", prefix), value, dm.matchPrefix(prefix));
    }

    private void checkNamespace(DescriptorFilter dm, String namespace, boolean value) {
        Assert.assertEquals(getLabel(dm, value, "namespace", namespace), value, dm.matchNamespace(namespace));
    }

    private void checkName(DescriptorFilter dm, String name, boolean value) {
        Assert.assertEquals(getLabel(dm, value, "name", name), value, dm.matchName(name));
    }

    private void checkType(DescriptorFilter dm, DefType type, boolean value) {
        Assert.assertEquals(getLabel(dm, value, "type", type.toString()), value, dm.matchType(type));
    }

    @Test
    public void testInvalidPrefix() throws Exception {
        IllegalArgumentException expected = null;
        try {
            new DescriptorFilter("bah.humbug://a:b");
        } catch (IllegalArgumentException e) {
            expected = e;
        }
        Assert.assertNotNull("should have gotten an exception", expected);
        Assert.assertTrue("Unexpected exception message: "+expected.getMessage(),
                expected.getMessage().startsWith("Invalid prefix"));
    }

    @Test
    public void testInvalidNamespace() throws Exception {
        IllegalArgumentException expected = null;
        try {
            new DescriptorFilter("a://bah.humbug:b");
        } catch (IllegalArgumentException e) {
            expected = e;
        }
        Assert.assertNotNull("should have gotten an exception", expected);
        Assert.assertTrue("Unexpected exception message: "+expected.getMessage(),
                expected.getMessage().startsWith("Invalid namespace"));
    }

    @Test
    public void testInvalidName() throws Exception {
        IllegalArgumentException expected = null;
        try {
            new DescriptorFilter("a://b:bah.humbug");
        } catch (IllegalArgumentException e) {
            expected = e;
        }
        Assert.assertNotNull("should have gotten an exception", expected);
        Assert.assertTrue("Unexpected exception message: "+expected.getMessage(),
                expected.getMessage().startsWith("Invalid name"));
    }

    @Test
    public void testInvalidType() throws Exception {
        IllegalArgumentException expected = null;
        try {
            new DescriptorFilter("a://b:c", "bah.humbug");
        } catch (IllegalArgumentException e) {
            expected = e;
        }
        Assert.assertNotNull("should have gotten an exception", expected);
        Assert.assertTrue("Unexpected exception message: "+expected.getMessage(),
                expected.getMessage().startsWith("Invalid type"));
    }

    @Test
    public void testPrefixOnly() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("notfound://");
        checkPrefix(dm, "hi", false);
        checkPrefix(dm, "css", false);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", true);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testPrefixPlusNamespace() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("notfound://hi");
        checkPrefix(dm, "hi", false);
        checkPrefix(dm, "css", false);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", false);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testNamespaceOnly() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("hi");
        checkPrefix(dm, "hi", true);
        checkPrefix(dm, "css", true);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", false);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testNamespaceAndName() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("hi:ho");
        checkPrefix(dm, "hi", true);
        checkPrefix(dm, "css", true);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", false);
        checkName(dm, "ho", true);
        checkName(dm, "hi", false);
        checkName(dm, "css", false);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testFullWildcardMatcher() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("*://*:*");
        checkPrefix(dm, "hi", true);
        checkPrefix(dm, "css", true);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", true);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testNoprefixWildcardMatcher() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("notfound://*:*");
        checkPrefix(dm, "hi", false);
        checkPrefix(dm, "css", false);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", true);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testNonamespaceWildcardMatcher() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("*://notfound:*");
        checkPrefix(dm, "hi", true);
        checkPrefix(dm, "css", true);
        checkNamespace(dm, "hi", false);
        checkNamespace(dm, "css", false);
        checkName(dm, "hi", true);
        checkName(dm, "css", true);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testNonameWildcardMatcher() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("*://*:notfound");
        checkPrefix(dm, "hi", true);
        checkPrefix(dm, "css", true);
        checkNamespace(dm, "hi", true);
        checkNamespace(dm, "css", true);
        checkName(dm, "hi", false);
        checkName(dm, "css", false);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testExactMatcher() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("exactprefix://exactnamespace:exactname");

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
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testAlmostMatcher() throws Exception {
        DescriptorFilter dm;

        dm = new DescriptorFilter("almostprefix*://almostnamespace*:almostname*");

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
        checkName(dm, "almostnamespace", true); // note that this is true....
        checkName(dm, "almostname", true);
        for (DefType type : DefType.values()) {
            checkType(dm, type, true);
        }
    }

    @Test
    public void testTypeMatcher() throws Exception {
        for (DefType type : DefType.values()) {
            DescriptorFilter dm = new DescriptorFilter("exactprefix://exactnamespace:exactname", type.toString());

            checkType(dm, type, true);
            for (DefType otype : DefType.values()) {
                if (!otype.equals(type)) {
                    checkType(dm, otype, false);
                }
            }
        }
    }

    @SuppressWarnings("serial")
    private static class FakeDefDescriptor implements DefDescriptor<Definition> {
        private final String name;
        private final String prefix;
        private final String namespace;
        private final DefType defType;

        public FakeDefDescriptor(String prefix, String namespace, String name, DefType defType) {
            this.prefix = prefix;
            this.namespace = namespace;
            this.name = name;
            this.defType = defType;
        }

        @Override
        public void serialize(Json json) throws IOException {
            throw new IOException("ook");
        }

        @Override
        public String getName() {
            return this.name;
        }

        @Override
        public String getQualifiedName() {
            return null;
        }

        @Override
        public String getDescriptorName() {
            return null;
        }

        @Override
        public String getPrefix() {
            return this.prefix;
        }

        @Override
        public String getNamespace() {
            return this.namespace;
        }

        @Override
        public String getNameParameters() {
            return null;
        }

        @Override
        public boolean isParameterized() {
            return false;
        }

        @Override
        public DefType getDefType() {
            return this.defType;
        }

        @Override
        public Definition getDef() throws QuickFixException {
            return null;
        }

        @Override
        public boolean exists() {
            return true;
        }

        @Override
        public String toString() {
            return this.prefix + "://" + this.namespace + ":" + this.name + "(" + this.defType.toString() + ")";
        }

        @Override
        public int compareTo(DefDescriptor<?> other) {
            // Can't use the helper on DefDescriptorImpl in this non-impl test
            // package...
            return getQualifiedName().compareToIgnoreCase(other.getQualifiedName());
        }

        @Override
        public DefDescriptor<? extends Definition> getBundle() {
            return null;
        }
    }

    @Test
    public void testExactMatchDescriptor() {
        DescriptorFilter dm;
        FakeDefDescriptor dd;

        dm = new DescriptorFilter("exactprefix://exactnamespace:exactname", "APPLICATION");
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.APPLICATION);
        Assert.assertEquals(getLabel(dm, true, "dd", dd.toString()), true, dm.matchDescriptor(dd));
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.COMPONENT);
        Assert.assertEquals(getLabel(dm, false, "dd", dd.toString()), false, dm.matchDescriptor(dd));
    }

    @Test
    public void testExactMatchDescriptorTwoTypes() {
        DescriptorFilter dm;
        FakeDefDescriptor dd;

        dm = new DescriptorFilter("exactprefix://exactnamespace:exactname", "APPLICATION,COMPONENT");
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.APPLICATION);
        Assert.assertEquals(getLabel(dm, true, "dd", dd.toString()), true, dm.matchDescriptor(dd));
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.COMPONENT);
        Assert.assertEquals(getLabel(dm, true, "dd", dd.toString()), true, dm.matchDescriptor(dd));
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.STYLE);
        Assert.assertEquals(getLabel(dm, false, "dd", dd.toString()), false, dm.matchDescriptor(dd));
    }

    @Test
    public void testExactMatchDescriptorAllTypes() {
        DescriptorFilter dm;
        FakeDefDescriptor dd;

        dm = new DescriptorFilter("exactprefix://exactnamespace:exactname", "*");
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.APPLICATION);
        Assert.assertEquals(getLabel(dm, true, "dd", dd.toString()), true, dm.matchDescriptor(dd));
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.COMPONENT);
        Assert.assertEquals(getLabel(dm, true, "dd", dd.toString()), true, dm.matchDescriptor(dd));
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.STYLE);
        Assert.assertEquals(getLabel(dm, true, "dd", dd.toString()), true, dm.matchDescriptor(dd));
    }

    @Test
    public void testExactMatchDescriptorDefaultTypes() {
        DescriptorFilter dm;
        FakeDefDescriptor dd;

        dm = new DescriptorFilter("exactprefix://exactnamespace:exactname", (String)null);
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.APPLICATION);
        Assert.assertEquals(getLabel(dm, false, "dd", dd.toString()), false, dm.matchDescriptor(dd));
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.COMPONENT);
        Assert.assertEquals(getLabel(dm, true, "dd", dd.toString()), true, dm.matchDescriptor(dd));
        dd = new FakeDefDescriptor("exactprefix", "exactnamespace", "exactname", DefType.STYLE);
        Assert.assertEquals(getLabel(dm, false, "dd", dd.toString()), false, dm.matchDescriptor(dd));
    }
}
