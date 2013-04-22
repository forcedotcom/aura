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
package org.auraframework.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharsetDecoder;

import javax.annotation.concurrent.NotThreadSafe;

import com.google.common.base.Charsets;

/**
 * A minimal InputStreamReader implementation that reads only what it needs from
 * the wrapped InputStream and not a byte more. Java's built-in
 * InputStreamReader can read ahead, but that doesn't play well with use cases
 * that mix binary and text data in one stream, so this InputStreamReader
 * variant was created.<br>
 * <br>
 * Note that its original user, JsonStreamReader, reads only one character at a
 * time, so that is how this implementation is optimized. This can be updated if
 * other use cases come along. At the very least, this InputStreamReader does
 * intelligently handle the first byte in a UTF-8 character by bulk-reading the
 * remaining bytes based on the character length, which is encoded into the
 * first byte in a UTF-8 character. Another optimization is having one-byte
 * UTF-8 characters bypass the CharsetDecoder.<br>
 * <br>
 * This Reader assumes that characters in the InputStream are all UTF-8. Byte
 * order mark (BOM) characters encoded as UTF-8 are dropped, since their
 * presence is nonsensical in UTF-8 (and we don't want to potentially
 * contaminate any UTF-16 outputs). 5-byte and 6-byte UTF-8 byte sequences are
 * dropped at this time. Bytes with values 0xfe or 0xff are dropped as neither
 * are valid UTF-8 bytes.<br>
 * <br>
 * Codepoints that are represented in UTF-16 as surrogate pairs are supported by
 * this reader.
 */
@NotThreadSafe
public class Utf8InputStreamReader extends Reader {
    private final InputStream in;
    private final ByteBuffer bb = ByteBuffer.allocate(4 /*
                                                         * we don't support 5 or
                                                         * 6 byte UTF-8 because
                                                         * Java doesn't, either
                                                         */);
    private final CharBuffer cb = CharBuffer.allocate(2 /*
                                                         * support UTF-16
                                                         * surrogate pairs
                                                         */);
    private final CharsetDecoder cd;

    /**
     * Creates an InputStreamReader-like class that always uses UTF-8 and will
     * read only the number of bytes necessary to fulfill a caller's read
     * request. No read-ahead buffering occurs in this class.
     * 
     * @param in The InputStream to wrap
     */
    public Utf8InputStreamReader(InputStream in) {
        this.in = in;
        this.cd = Charsets.UTF_8.newDecoder();
        this.cb.limit(0);
    }

    @Override
    public int read() throws IOException {

        // If our previous read gave us a surrogate pair, then return the next
        // character now
        if (cb.hasRemaining()) {
            return cb.get();
        }

        // Read until we have a character or EOF
        while (true) {
            final int firstByte = in.read();
            if (firstByte < 0) {
                cb.limit(0);
                return -1;
            } else {

                // Determine how many bytes exist in this character
                // See http://en.wikipedia.org/wiki/UTF-8#Design
                final int byteCount;
                if ((firstByte & 0x80) == 0x00) {

                    // Since the character is one byte, we can just return that
                    // now, without
                    // going through the CharsetDecoder
                    cb.limit(0);
                    return (char) firstByte;
                } else if ((firstByte & 0xE0) == 0xC0) {
                    byteCount = 2;
                } else if ((firstByte & 0xF0) == 0xE0) {
                    byteCount = 3;
                } else if ((firstByte & 0xF8) == 0xF0) {
                    byteCount = 4;
                } else if ((firstByte & 0xC0) == 0x80) {

                    // We are in the middle of a UTF-8 byte sequence. We'll just
                    // continue
                    // scanning until we get to the beginning of a UTF-8 byte
                    // sequence
                    continue;
                } else {
                    if ((firstByte & 0xFC) == 0xF8) {
                        byteCount = 5;
                    } else if ((firstByte & 0xFE) == 0xFC) {
                        byteCount = 6;
                    } else {

                        // 0xFE and 0xFF are not valid in UTF-8. Skip
                        continue;
                    }

                    // Skip ahead because we have a 5-byte or 6-byte UTF-8
                    // character. We don't support
                    // those at this time
                    in.skip(byteCount - 1);
                    continue;
                }

                // Read the rest of the bytes for this character in bulk
                bb.array()[0] = (byte) firstByte;
                int bytesLeft = byteCount - 1;
                do {
                    final int bytesRead = in.read(bb.array(), byteCount - bytesLeft, bytesLeft);
                    if (bytesRead == -1) {

                        // We ran out of bytes for this character. Oh, well..
                        cb.limit(0);
                        return -1;
                    }
                    bytesLeft -= bytesRead;
                } while (bytesLeft > 0);

                // Convert into a character or two. If the CharsetDecoder could
                // not understand the current UTF-8
                // character, then we'll just drop it and move on to the next
                // one.
                bb.position(0).limit(byteCount);
                cb.position(0).limit(cb.capacity());
                cd.decode(bb, cb, true);
                if (cb.position() > 0) {
                    final char ch = cb.get(0);

                    // If this character is a byte order marker character (BOM),
                    // then skip it
                    if (ch == 0xFEFF || ch == 0xFFFE) {
                        continue;
                    }
                    cb.limit(cb.position()).position(1);
                    return ch;
                }
            }
        }
    }

    @Override
    public int read(char[] cbuf, int off, int len) throws IOException {
        for (int i = off; i < off + len; i++) {
            final int ch = read();
            if (ch >= 0) {
                cbuf[i] = (char) ch;
            } else {

                // End of stream prematurely. If we read nothing when we got -1,
                // then we return -1, too
                if (i == off) {
                    return -1;
                } else {
                    return i - off;
                }
            }
        }

        // We were able to read exactly what we had set out to read
        return len;
    }

    @Override
    public boolean ready() throws IOException {

        // If we have at least four bytes available, then we'll consider
        // ourselves ready,
        // which means that we can guarantee that a read of one character will
        // not block
        return in.available() >= 4;
    }

    @Override
    public void close() throws IOException {
        in.close();
    }
}
