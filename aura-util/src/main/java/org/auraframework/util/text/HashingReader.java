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

import java.io.IOException;
import java.io.Reader;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * This provides a read-once method to both parse and hash the contents.
 */
public class HashingReader extends Reader {

    private final Reader reader;
    private MessageDigest digest;
    private final Charset utf8;
    private boolean hadError;
    private boolean closed;
    private Hash hash;

    public HashingReader(Reader reader, Hash hash) {
        this.reader = reader;
        this.hash = hash;
        try {
            digest = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 is a required MessageDigest algorithm, but is not registered here.");
        }
        utf8 = Charset.forName("UTF-8");
    }

    @Override
    public void close() throws IOException {
        if (closed) {
            return;
        }
        closed = true;
        if (reader.read() != -1) {
            //
            // If someone didn't finish reading the file, we want to yell at them
            // and make sure the code is fixed. If we let it fall through, we may end
            // up with a null hash, which no-one will notice.
            //
            throw new IllegalStateException("Closed a hashing file without reading the entire thing");
        }
        if (digest != null) {
            setChangeInfo();
        }
        reader.close();
    }

    @Override
    public int read(char[] cbuf, int off, int len) throws IOException {
        try {
            int result = reader.read(cbuf, off, len);
            if (digest != null) {
                if (result > 0) {
                    ByteBuffer bytes = utf8.encode(CharBuffer.wrap(cbuf, off, result));
                    digest.update(bytes);
                } else if (result < 0) {
                    setChangeInfo();
                }
            }
            return result;
        } catch (IOException e) {
            // Ensure we don't make a (probably wrong) hash from bad content.
            // We'll probably be running away anyway, but it's easy to be sure.
            hadError = true;
            throw e;
        }
    }

    private void setChangeInfo() {
        if (!hadError && digest != null) {
            synchronized (hash) {
                // Multi-threading guard: if we have multiple readers for a
                // single Source, only one needs to set the hash. Note that
                // the parallel reads is probably a bad idea anyway, but it
                // shouldn't be a fatal one!
                if (!hash.isSet()) {
                    hash.setHash(digest.digest());
                }
            }
            digest = null; // We're done; ensure we can't try to set it again.
        }
    }
}

