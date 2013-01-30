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

import java.io.StringReader;

import org.auraframework.test.UnitTestCase;

public class HashTest extends UnitTestCase {

    public static class ExposedHash extends Hash {
        // expose the default c'tor
        public ExposedHash() {
            super();
        }
    }

    public void testAsPromise() {
        byte[] bytes = { 12, 34, 56, 78, 90 };
        Hash hash = new ExposedHash();
        assertFalse(hash.isSet());
        hash.setHash(bytes);
        assertTrue(hash.isSet());
        assertEquals(new Hash(bytes), hash);
    }

    private String findNonPrint(String val) {
        StringBuffer sb = new StringBuffer();
        boolean error = false;
        int i;

        for (i = 0; i < val.length(); i++) {
            char x = val.charAt(i);

            if (x < 128 && x >= 32) {
                sb.append(x);
            } else {
                sb.append("[[[");
                sb.append((int)x);
                sb.append("]]]");
                error = true;
            }
        }
        if (error) {
            return sb.toString();
        } else {
            return "";
        }
    }

    public void testToString() throws Exception {
        byte[] bytes = { 12, 34, 56, 78, 90 };
        Hash hash = new Hash(bytes);
        String val = hash.toString();

        assertTrue(val.length() > 1);
        assertEquals("Bad character in string", "", findNonPrint(val));

        hash = new Hash(new StringReader("a test for all eternity"));
        val = hash.toString();
        assertTrue(val.length() > 1);
        assertEquals("Bad character in string", "", findNonPrint(val));

        hash = new Hash(new StringReader("a different test for all eternity"));
        val = hash.toString();
        assertTrue(val.length() > 1);
        assertEquals("Bad character in string", "", findNonPrint(val));
        
        hash = new Hash(new StringReader("why are you looking at this anyway"));
        val = hash.toString();
        assertTrue(val.length() > 1);
        assertEquals("Bad character in string", "", findNonPrint(val));
    }


    public void testFromBytes() {
        byte[] bytes1 = { 12, 34, 56, 78, 90 };
        byte[] bytes2 = { 12, 43, 56, 78, 90 };
        Hash hash1 = new Hash(bytes1);
        Hash hash2 = new Hash(bytes2);
        assertTrue(hash1.isSet());
        assertTrue(hash2.isSet());
        assertFalse(hash1.equals(hash2));
        assertFalse(hash2.equals(hash1));
    }

    public void testFromBytecode() throws Exception {
        Hash hash = new Hash(HashTest.class.getName());
        assertTrue(hash.isSet());
    }

    public void testFromReader() throws Exception {
        String text = "Some text to be read by the reader and hashed";
        Hash readerHash = new Hash(new StringReader(text));
        assertTrue(readerHash.isSet());
        Hash setHash = new ExposedHash();
        setHash.setHash(new StringReader(text));
        assertEquals(readerHash, setHash);
        assertEquals(readerHash.hashCode(), setHash.hashCode());
    }

    public void testCannotReset() throws Exception {
        byte[] bytes = { 12, 34, 56, 78, 90 };
        Hash hash = new ExposedHash();
        hash.setHash(bytes);
        assertTrue(hash.isSet());
        try {
            hash.setHash(bytes);
            fail("Hash shouldn't accept a second setHash() call");
        } catch (IllegalStateException e) {
            // expected.
        }
        try {
            hash.setHash(new StringReader("foo"));
            fail("Hash shouldn't accept a second setHash() call");
        } catch (IllegalStateException e) {
            // expected.
        }
    }

    public void testEqualsAndHashcode() {
        byte[] bytes1 = { 12, 34, 56, 78, 90 };
        byte[] bytes2 = { 12, 43, 56, 78, 90 };
        Hash hash1 = new Hash(bytes1);
        Hash hash2 = new Hash(bytes2);
        Hash hash3 = new Hash(bytes1);

        assertEquals(hash1, hash3);
        assertEquals(hash1.hashCode(), hash3.hashCode());
        assertFalse(hash1.equals(hash2));
        assertFalse(hash1.hashCode() == hash2.hashCode());
    }
}
