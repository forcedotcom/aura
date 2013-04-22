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

import java.io.IOException;
import java.io.Reader;
import java.io.Serializable;
import java.io.Writer;
import java.net.URL;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser.Format;
import org.auraframework.util.text.Hash;

/**
 * Abstract base class for providing access to source code, and metadata about
 * that source code, including systemId(URL or filename), the format, and
 * timestamp. Implemented as abstract so that implementations can create readers
 * on demand rather than holding them open earlier than necessary.
 */
public abstract class Source<D extends Definition> implements Serializable {

    private static final long serialVersionUID = -1359253157810260816L;

    private final String systemId;
    private final Format format;
    private final DefDescriptor<D> descriptor;
    private final Hash hash;

    /**
     * A {@link Reader} that, on completion will update the containing
     * {@link Source} with {@link ChangeInfo}. This provides a read-once
     * method to both parse and hash the contents.
     */
    public class HashingReader extends Reader {

        private final Reader reader;
        private MessageDigest digest;
        private final Charset utf8;
        private boolean hadError;

        public HashingReader(Reader reader) {
            this.reader = reader;
            try {
                digest = MessageDigest.getInstance("MD5");
            } catch (NoSuchAlgorithmException e) {
                throw new RuntimeException("MD5 is a required MessageDigest algorithm, but is not registered here.");
            }
            utf8 = Charset.forName("UTF-8");
        }

        @Override
        public void close() throws IOException {
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

    protected Source(DefDescriptor<D> descriptor, String systemId, Format format) {
        this.systemId = systemId;
        this.format = format;
        this.descriptor = descriptor;
        this.hash = Hash.createPromise();
    }

    /**
     * Gets the system ID of this source, which is a semi-arbitrary string to
     * name this source. In practice, it is typically a filename relative to one
     * of the classpath roots (
     * {@link org.auraframework.impl.source.ResourceSource} ) or the working
     * directory ({@link org.auraframework.impl.source.FileSource}), but it can
     * be something else (e.g. for
     * {@link org.auraframework.impl.source.StringSource}).
     * 
     * @return the system id.
     */
    public String getSystemId() {
        return systemId;
    }

    public Format getFormat() {
        return format;
    }

    /**
     * Gets a {@link Reader} for this source, typically as the underlying reader
     * to {@link #getHashingReader()}. Most callers want that method instead,
     * which ensures that characters are used to construct a fingerprint as they
     * are read; this should someday become protected.
     * 
     * @return
     */
    // FIXME(fabbott): make moving this to protected not break SFDC, then move
    // it to protected.
    public abstract Reader getReader();

    public abstract Writer getWriter();

    public Hash getHash() {
        return hash;
    }

    public final Reader getHashingReader() {
        if (hash.isSet()) {
            // We don't need to re-hash after we've set our source. Actually,
            // we should never need to re-read, but today we do.
            return getReader();
        }
        return new HashingReader(getReader());
    }

    /**
     * Gets an absolute URL to the given source, typically with one of
     * {@code file://}, {@code jar://}, or the non-standard {@code string://}
     * protocols.
     * 
     * Subclasses <em>SHOULD</em> override this, but existing legacy ones will
     * not, so we have a lame concrete implementation here.
     * 
     * @return String-format absolute representing this source. This might not
     *         be valid to {@link java.net.URL}, for example for the
     *         {@code string://} protocol.
     */
    public String getUrl() {
        return null;
    }

    /**
     * Returns either {@code null}, or the URL to a cached copy of this source,
     * if such a thing exists. In most cases it will not, so the implementation
     * here always returns {@code null}.
     * 
     * @return {@code null}, or in subclasses a URL to a cache copy.
     */
    public URL getCacheUrl() {
        return null;
    }

    public abstract boolean addOrUpdate(CharSequence newContents);

    public abstract String getContents();

    public abstract long getLastModified();

    public abstract boolean exists();

    /**
     * Due to case insensitivity, the best descriptor for this source may not be
     * what was requested. The one returned by this method is "best"
     */
    public DefDescriptor<D> getDescriptor() {
        return descriptor;
    }

    /**
     * Some Source types might want to clear their content before adding or
     * updating the source. For example StringSource.
     */
    public void clearContents() {
        // Do nothing.
    }
}
