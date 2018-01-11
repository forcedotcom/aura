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

import org.apache.commons.codec.binary.Base64;
import org.auraframework.util.text.Hash.StringBuilder;
import org.junit.Assert;
import org.junit.Test;

import java.io.StringReader;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashTest {

    public static class ExposedHash extends Hash {
        // expose the default c'tor
        public ExposedHash() {
            super();
        }
    }

    @Test
    public void testAsPromise() {
        byte[] bytes = { 12, 34, 56, 78, 90 };
        Hash hash = new ExposedHash();
        Assert.assertFalse(hash.isSet());
        hash.setHash(bytes);
        Assert.assertTrue(hash.isSet());
        Assert.assertEquals(new Hash(bytes), hash);
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
                sb.append((int) x);
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

    @Test
    public void testToString() throws Exception {
        byte[] bytes = { 12, 34, 56, 78, 90 };
        Hash hash = new Hash(bytes);
        String val = hash.toString();

        Assert.assertTrue(val.length() > 1);
        Assert.assertEquals("Bad character in string", "", findNonPrint(val));

        hash = new Hash(new StringReader("a test for all eternity"));
        val = hash.toString();
        Assert.assertTrue(val.length() > 1);
        Assert.assertEquals("Bad character in string", "", findNonPrint(val));

        hash = new Hash(new StringReader("a different test for all eternity"));
        val = hash.toString();
        Assert.assertTrue(val.length() > 1);
        Assert.assertEquals("Bad character in string", "", findNonPrint(val));

        hash = new Hash(new StringReader("why are you looking at this anyway"));
        val = hash.toString();
        Assert.assertTrue(val.length() > 1);
        Assert.assertEquals("Bad character in string", "", findNonPrint(val));
    }

    @Test
    public void testFromBytes() {
        byte[] bytes1 = { 12, 34, 56, 78, 90 };
        byte[] bytes2 = { 12, 43, 56, 78, 90 };
        Hash hash1 = new Hash(bytes1);
        Hash hash2 = new Hash(bytes2);
        Assert.assertTrue(hash1.isSet());
        Assert.assertTrue(hash2.isSet());
        Assert.assertFalse(hash1.equals(hash2));
        Assert.assertFalse(hash2.equals(hash1));
    }

    @Test
    public void testFromBytecode() throws Exception {
        Hash hash = new Hash(HashTest.class.getName());
        Assert.assertTrue(hash.isSet());
    }

    @Test
    public void testFromReader() throws Exception {
        String text = "Some text to be read by the reader and hashed";
        Hash readerHash = new Hash(new StringReader(text));
        Assert.assertTrue(readerHash.isSet());
        Hash setHash = new ExposedHash();
        MessageDigest digest = MessageDigest.getInstance("MD5");
        digest.update(text.getBytes());
        setHash.setHash(digest.digest());
        Assert.assertEquals(readerHash, setHash);
        Assert.assertEquals(readerHash.hashCode(), setHash.hashCode());
    }

    @Test
    public void testCannotReset() throws Exception {
        byte[] bytes = { 12, 34, 56, 78, 90 };
        byte[] otherBytes = { 12};
        Hash hash = new ExposedHash();
        hash.setHash(bytes);
        IllegalStateException expected = null;

        Assert.assertTrue(hash.isSet());
        try {
            hash.setHash(otherBytes);
        } catch (IllegalStateException e) {
            expected = e;
        }
        Assert.assertNotNull("Hash shouldn't accept a second setHash() call with a different value", expected);

        expected = null;
        try {
            hash.setHash(new StringReader("foo"));
        } catch (IllegalStateException e) {
            expected = e;
        }
        Assert.assertNotNull("Hash shouldn't accept a second setHash() call", expected);
    }

    @Test
    public void testEqualsAndHashcode() {
        byte[] bytes1 = { 12, 34, 56, 78, 90 };
        byte[] bytes2 = { 12, 43, 56, 78, 90 };
        Hash hash1 = new Hash(bytes1);
        Hash hash2 = new Hash(bytes2);
        Hash hash3 = new Hash(bytes1);

        Assert.assertEquals(hash1, hash3);
        Assert.assertEquals(hash1.hashCode(), hash3.hashCode());
        Assert.assertFalse(hash1.equals(hash2));
        Assert.assertFalse(hash1.hashCode() == hash2.hashCode());
    }

    private int getHashCode(String string) throws NoSuchAlgorithmException {
        return Base64.encodeBase64URLSafeString(MessageDigest.getInstance("MD5").digest(string.getBytes())).hashCode();
    }

    private void assertHash(Hash hash, boolean isSet, int hashCode) throws Exception {
        Assert.assertEquals(isSet, hash.isSet());
        Assert.assertEquals(hashCode, hash.hashCode());
    }

    private void assertStringBuilderHash(String toHash) throws Exception {
        int expected = getHashCode(toHash);
        StringBuilder builder = new StringBuilder();
        builder.addString(toHash);
        assertHash(builder.build(), true, expected);
    }

    @Test
    public void testStringBuilderEmptyString() throws Exception {
        assertStringBuilderHash("");
    }

    @Test
    public void testStringBuilderSingleString() throws Exception {
        assertStringBuilderHash("never can say goodbye");
    }

    @Test
    public void testStringBuilderMultipleStrings() throws Exception {
        String toHash = "never can say goodbye";
        int expected = getHashCode(toHash);

        StringBuilder builder = new StringBuilder();
        // split string by word boundaries
        for (String part : toHash.split("\\b")) {
            builder.addString(part);
        }
        assertHash(builder.build(), true, expected);
    }

    @Test
    public void testStringBuilderNoStrings() throws Exception {
        int expected = nullHashCode();
        StringBuilder builder = new StringBuilder();
        assertHash(builder.build(), true, expected);
    }

    private int nullHashCode() throws NoSuchAlgorithmException {
        return Base64.encodeBase64URLSafeString(MessageDigest.getInstance("MD5").digest()).hashCode();
    }

    @Test
    public void testStringBuilderNull() throws Exception {
        int expected = nullHashCode();
        StringBuilder builder = new StringBuilder();
        builder.addString(null);
        assertHash(builder.build(), true, expected);
    }
}
