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

import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;

/**
 * A wrapper around an MD5 hash. This functions as a future, being created
 * before the hash value is actually computed.
 */
public class Hash {
    /**
     * Radix for hash bytes to string, using 0-9a-f. We might someday want to be
     * base64 to have a shorter string, but that makes the encoding marginally
     * more complex since we have to handle byte-wrap boundaries ourselves.
     */
    private static final int RADIX = 16;
    private byte[] value;

    /**
     * Creates a new, empty {@code Hash} to be filled in later with either
     * {@link #setHash(byte[])} or {@link #setHash(Reader)}.
     * 
     * This is a static factory method to keep {@code Hash} not
     * default-constructible, to avoid Java accidentally making empty promises
     * that won't be filled.
     */
    public static Hash createPromise() {
        return new Hash();
    }

    /** Creates a Hash object with given contents. */
    public Hash(byte[] input) {
        setHash(input);
    }

    /**
     * Computes the hash of a Java file, given its fully-qualified class name.
     * 
     * @param classname the name of the class file to read. It should be dotted,
     *            not slash-separated, and should NOT be an inner class or
     *            similar (if only because the entire class file participates in
     *            the hashing).
     * @throws IOException if the class file cannot be read.
     */
    public Hash(String classname) throws IOException {
        assert classname.indexOf('$') < 0;
        InputStream bytecode = Hash.class.getResourceAsStream("/" + classname.replace('.', '/') + ".class");
        if (bytecode == null) {
            value = null;
            return;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[4096];
            int read = bytecode.read(buffer);
            while (read >= 0) {
                digest.update(buffer, 0, read);
                read = bytecode.read(buffer);
            }
            value = digest.digest();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD-5 is a required hash algorithm, but isn't defined", e);
        }
    }

    /**
     * Consumes a Reader to compute the hash. This is a convenience for
     * {@link #Hash()} and {@link #setHash(Reader)}.
     * 
     * @throws IOException
     * @throws
     */
    public Hash(Reader reader) throws IOException, RuntimeException {
        this();
        try {
            setHash(reader);
        } catch (IllegalStateException e) {
            throw new RuntimeException("A brand-new Hash unknown to anything else claims it was set twice?!");
        }
    }

    protected Hash() {
        value = null;
    }

    @Override
    public String toString() {
        if (value == null) {
            return "no-hash-value";
        }
        StringBuilder builder = new StringBuilder(80);
        for (byte b : value) {
            builder.append(Character.forDigit(b >> 4, RADIX));
            builder.append(Character.forDigit(b & 0xf, RADIX));
        }
        return builder.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof Hash) {
            return Arrays.equals(value, ((Hash) o).value);
        }
        return false;
    }

    @Override
    public int hashCode() {
        if (value == null) {
            return 3; // arbitrary value, but I dislike 0 as a hash precisely
                      // because it's so normal
        }
        return Arrays.hashCode(value);
    }

    public boolean isSet() {
        return value != null;
    }

    /**
     * Assigns the hash value.
     * 
     * @param hash the new hash
     * @throws IllegalStateException if already set.
     */
    public void setHash(byte[] hash) throws IllegalStateException {
        if (value != null && !value.equals(hash)) {
            throw new IllegalStateException("Cannot set hash twice");
        }
        value = Arrays.copyOf(hash, hash.length);
    }

    /** Consumes and closes a reader to generate its contents' hash. */
    public void setHash(Reader reader) throws IOException, IllegalStateException {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            Charset utf8 = Charset.forName("UTF-8");
            CharBuffer cbuffer = CharBuffer.allocate(2048);
            while (reader.read(cbuffer) >= 0) {
                cbuffer.flip();
                ByteBuffer bytes = utf8.encode(cbuffer);
                digest.update(bytes);
                cbuffer.clear();
            }
            reader.close();
            setHash(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 is a required MessageDigest algorithm, but is not registered here.");
        }
    }
}