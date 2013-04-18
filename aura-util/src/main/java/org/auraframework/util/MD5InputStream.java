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

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.apache.commons.codec.binary.Base64;

/**
 * @since 0.0.85
 */
public class MD5InputStream extends FilterInputStream {

    private final MessageDigest md5;

    public MD5InputStream(InputStream in) {
        super(in);
        try {
            this.md5 = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public int read() throws IOException {
        int b = super.read();
        if (b != -1) {
            md5.update((byte) b);
        }
        return b;
    }

    @Override
    public int read(byte[] b, int off, int len) throws IOException {
        int ret = in.read(b, off, len);
        if (ret != -1) {
            md5.update(b, off, len);
        }
        return ret;
    }

    public byte[] getHash() {
        return md5.digest();
    }

    public String getBase64Hash() {
        return new String(Base64.encodeBase64(getHash()));
    }

    public void consumeAll() throws IOException {
        byte[] b = new byte[1024];
        while (read(b) != -1) {
        }
    }

}
