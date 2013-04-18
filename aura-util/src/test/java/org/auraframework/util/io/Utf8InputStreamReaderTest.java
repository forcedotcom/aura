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
package org.auraframework.util.io;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.util.Arrays;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.Utf8InputStreamReader;

import com.google.common.base.Charsets;

/**
 * Test cases for the Utf8InputStreamReader
 */
public class Utf8InputStreamReaderTest extends UnitTestCase {

    public Utf8InputStreamReaderTest(String name) {
        super(name);
    }

    public void testLatinCharsOnly() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(10);
        final String testChars = "abc123_+/`";
        baos.write(testChars.getBytes(Charsets.UTF_8));
        final Reader reader = new Utf8InputStreamReader(new ByteArrayInputStream(baos.toByteArray()));
        final char[] actual = new char[10];
        try {
            assertTrue(reader.ready());
            assertEquals(8, reader.read(actual, 0, 8));
            assertFalse(reader.ready());
            assertEquals(2, reader.read(actual, 8, 8));
            assertEquals(-1, reader.read(actual, 10, 8));
            assertEquals(-1, reader.read());
            assertEquals(-1, reader.read(actual));
            assertFalse(reader.ready());

            // Ensure that we match
            assertTrue(Arrays.equals(testChars.toCharArray(), actual));
        } finally {
            reader.close();
        }
    }

    /**
     * Tests 1-byte, 2-byte, 3-byte, and 4-byte UTF-8 characters, some which
     * decode into UTF-16 surrogate pairs, using an InputStream that reads only
     * one byte at a time, just to exercise the inner bulk read in read()
     */
    public void testUTF8CharsUsingAnInputStreamThatReadsOneByteAtATime() throws Exception {
        testUTF8Chars(true);
    }

    /**
     * Tests 1-byte, 2-byte, 3-byte, and 4-byte UTF-8 characters, some which
     * decode into UTF-16 surrogate pairs
     */
    public void testUTF8Chars() throws Exception {
        testUTF8Chars(false);
    }

    private void testUTF8Chars(boolean oneByteAtATime) throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(88 /*
                                                                         * actual
                                                                         * is
                                                                         * less,
                                                                         * but
                                                                         * this
                                                                         * is an
                                                                         * upper
                                                                         * estimate
                                                                         */);
        final String testChars = "𥝱𥞩𥞴𥞴𥝱𥝱𠵅🁛🀦𐌸𐍄７辶헪ȦE§קஇ𥞴";
        baos.write(testChars.getBytes(Charsets.UTF_8));
        InputStream in = new ByteArrayInputStream(baos.toByteArray());
        if (oneByteAtATime) {
            final InputStream delegate = in;
            in = new InputStream() {
                @Override
                public int read() throws IOException {
                    return delegate.read();
                }

                @Override
                public int read(byte[] b, int off, int len) throws IOException {
                    if (len > 0) {
                        final int ch = read();
                        if (ch < 0) {
                            return -1;
                        } else {
                            b[off] = (byte) ch;
                            return 1;
                        }
                    } else {
                        return 0;
                    }
                }
            };
        }
        final Reader reader = new Utf8InputStreamReader(in);
        final char[] actual = new char[testChars.length()];
        try {
            if (!oneByteAtATime) {
                assertTrue(reader.ready());
            }
            assertEquals(testChars.length(), reader.read(actual));
            assertEquals(-1, reader.read());
            assertEquals(-1, reader.read(actual, 10, 8));
            assertEquals(-1, reader.read(actual));
            assertFalse(reader.ready());

            // Ensure that we match
            assertTrue(Arrays.equals(testChars.toCharArray(), actual));
        } finally {
            reader.close();
        }
    }

    public void testFiveAndSixByteUTF8Char() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(20);
        baos.write(0xfc); // 6-byte UTF-8 (maybe someday...)
        baos.write(0xbf);
        baos.write(0xbf);
        baos.write(0xbf);
        baos.write(0xbf);
        baos.write(0xbf);
        baos.write(0xf8); // 5-byte UTF-8 (maybe someday...)
        baos.write(0xbf);
        baos.write(0xbf);
        baos.write(0xbf);
        baos.write(0xbf);
        baos.write('h');
        baos.write(0xfe); // not valid UTF-8
        baos.write(0xff); // not valid UTF-8
        baos.write('i');
        final Reader reader = new Utf8InputStreamReader(new ByteArrayInputStream(baos.toByteArray()));
        try {
            assertTrue(reader.ready());
            assertEquals('h', reader.read());
            assertFalse(reader.ready());
            assertEquals('i', reader.read());
            assertEquals(-1, reader.read());
            assertFalse(reader.ready());
        } finally {
            reader.close();
        }
    }

    public void testInvalidUTF8() throws Exception {

        // Try an invalid UTF-8 sequence. The problem here is on the third and
        // fourth bytes.
        // We should get back 0x04, since the first byte caused the first four
        // to be read in
        // for the first character
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(5);
        baos.write(0xF0);
        baos.write(0xA0);
        baos.write(0x02);
        baos.write(0x03);
        baos.write(0x04);
        final Reader reader = new Utf8InputStreamReader(new ByteArrayInputStream(baos.toByteArray()));
        try {
            assertEquals(0x04, reader.read());
            assertEquals(-1, reader.read());
        } finally {
            reader.close();
        }
    }

    /**
     * Ensures that reading a byte that is actually in the middle of a UTF-8
     * byte sequence causes the current sequence to be skipped and the next
     * character read.
     */
    public void testMiddleOfUTF8ByteSequence() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(12);
        baos.write(0xBF); // middle of a UTF-8 sequence
        baos.write(0xE4); // 3-byte UTF-8 starts here (for ䷾)
        baos.write(0xB7);
        baos.write(0xBE);
        baos.write(0xB0); // middle of a UTF-8 sequence
        baos.write(0xB2); // middle of a UTF-8 sequence
        baos.write(0xB2); // middle of a UTF-8 sequence
        baos.write(0xB2); // middle of a UTF-8 sequence
        baos.write(0xBF); // middle of a UTF-8 sequence
        baos.write(0xB2); // middle of a UTF-8 sequence
        baos.write('H'); // 1-byte UTF-8
        final Reader reader = new Utf8InputStreamReader(new ByteArrayInputStream(baos.toByteArray()));
        try {
            assertEquals('䷾', reader.read());
            assertEquals('H', reader.read());
            assertEquals(-1, reader.read());
        } finally {
            reader.close();
        }
    }

    public void testTooShortUTF8() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(3);
        baos.write(0xF0);
        baos.write(0xA0);
        final Reader reader = new Utf8InputStreamReader(new ByteArrayInputStream(baos.toByteArray()));
        try {
            assertEquals(-1, reader.read());
        } finally {
            reader.close();
        }
    }

    /**
     * Ensure that byte order markers (BOMs) are ignored. BOMs are not relevant
     * in UTF-8, but they could be given to us by a customer's crazy software
     * anyway.
     */
    public void testBOMs() throws Exception {

        // Time to drop some BOMs
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(7);
        baos.write(0xEF); // Little endian BOM in UTF-8
        baos.write(0xBF);
        baos.write(0xBE);
        baos.write(0xEF); // Big endian BOM in UTF-8
        baos.write(0xBB);
        baos.write(0xBF);
        baos.write('H');
        baos.write(0xEF); // Little endian BOM in UTF-8
        baos.write(0xBF);
        baos.write(0xBE);
        final Reader reader = new Utf8InputStreamReader(new ByteArrayInputStream(baos.toByteArray()));
        try {
            assertEquals('H', reader.read());
            assertEquals(-1, reader.read());
        } finally {
            reader.close();
        }
    }

    /**
     * Ensures that surrogate pair codepoints that are improperly used in UTF-8
     * get ignored. These codepoints are to exist only in UTF-16 bytes as per
     * the standard. CharsetDecoder conveniently skips these for us.
     */
    public void testUTF16SurrogatePairs() throws Exception {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream(7);
        baos.write(0xED); // First high surrogate, expressed as UTF-8
        baos.write(0x9F);
        baos.write(0xC0);
        baos.write(0xEE); // Last low surrogate, expressed as UTF-8
        baos.write(0x80);
        baos.write(0x79);
        baos.write(0xEE); // Last low surrogate, expressed as UTF-8
        baos.write(0x80);
        baos.write(0x79);
        baos.write(0xED); // First high surrogate, expressed as UTF-8
        baos.write(0x9F);
        baos.write(0xC0);
        baos.write(0xED); // Last char before the first high surrogate (okay to
                          // read)
        baos.write(0x9F);
        baos.write(0xBF);
        baos.write(0xEE); // First char after the last low surrogate (okay to
                          // read)
        baos.write(0x80);
        baos.write(0x80);
        baos.write('H');
        final Reader reader = new Utf8InputStreamReader(new ByteArrayInputStream(baos.toByteArray()));
        try {
            assertEquals('퟿', reader.read());
            assertEquals('', reader.read());
            assertEquals('H', reader.read());
            assertEquals(-1, reader.read());
        } finally {
            reader.close();
        }
    }
}
