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
package org.auraframework.system;

import java.io.Reader;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;

import org.auraframework.def.Definition;
import org.auraframework.impl.source.StringSource;
import org.auraframework.test.AuraTestCase;
import org.auraframework.util.text.Hash;

public class SourceTest extends AuraTestCase {
    private final static int DEFAULT_HASHCODE = 3;

    public SourceTest(String name) throws NoSuchAlgorithmException {
        super(name);
    }

    private int getHashCode(String string) throws NoSuchAlgorithmException {
        return Arrays.hashCode(MessageDigest.getInstance("MD5").digest(string.getBytes()));
    }

    private void assertHash(Hash hash, boolean isSet, int hashCode) throws Exception {
        assertEquals(isSet, hash.isSet());
        assertEquals(hashCode, hash.hashCode());
    }

    /**
     * HashingReader does not set hashCode until end of stream.
     */
    public void testHashingReaderProgress() throws Exception {
        int expectedHashCode = getHashCode("hi");

        Source<?> src = new StringSource<Definition>(null, "hi", null, null);
        Hash hash = src.getHash();

        // hash not set initially
        assertHash(hash, false, DEFAULT_HASHCODE);

        // hash still not set
        Reader reader = src.getHashingReader();
        assertHash(hash, false, DEFAULT_HASHCODE);

        // read part of source, hash still not set
        assertEquals('h', reader.read());
        assertHash(hash, false, DEFAULT_HASHCODE);

        // read more source, hash still not set
        assertEquals('i', reader.read());
        assertHash(hash, false, DEFAULT_HASHCODE);

        // nothing more to read, hash now set
        assertEquals(-1, reader.read());
        assertHash(hash, true, expectedHashCode);

        // still nothing to read, hash remains same
        assertEquals(-1, reader.read());
        assertHash(hash, true, expectedHashCode);
    }

    /**
     * Hash computed based on bytes read rather than full buffer contents.
     */
    public void testHashingReaderLargerBuffer() throws Exception {
        int expectedHashCode = getHashCode("hi");

        Source<?> src = new StringSource<Definition>(null, "hi", null, null);
        Hash hash = src.getHash();
        Reader reader = src.getHashingReader();
        char[] buffer = new char[50];
        assertEquals(2, reader.read(buffer));
        assertHash(hash, false, DEFAULT_HASHCODE);
        assertEquals("hi", new String(buffer, 0, 2));

        assertEquals(-1, reader.read(buffer));
        assertHash(hash, true, expectedHashCode);
    }

    /**
     * Hashing reader doesn't choke on null source content.
     */
    public void testHashingReaderNull() throws Exception {
        int expectedHashCode = getHashCode("");

        Source<?> src = new StringSource<Definition>(null, null, null, null);
        Hash hash = src.getHash();
        Reader reader = src.getHashingReader();
        char[] buffer = new char[50];
        assertEquals(-1, reader.read(buffer));
        assertHash(hash, true, expectedHashCode);

        assertEquals(-1, reader.read(buffer));
        assertHash(hash, true, expectedHashCode);
    }

    /**
     * Hashing reader doesn't choke on empty source content.
     */
    public void testHashingReaderEmpty() throws Exception {
        int expectedHashCode = getHashCode("");

        Source<?> src = new StringSource<Definition>(null, "", null, null);
        Hash hash = src.getHash();
        Reader reader = src.getHashingReader();
        char[] buffer = new char[50];
        assertEquals(-1, reader.read(buffer));
        assertHash(hash, true, expectedHashCode);

        assertEquals(-1, reader.read(buffer));
        assertHash(hash, true, expectedHashCode);
    }
}
