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
package org.auraframework.util;

import java.io.IOException;
import java.io.InputStream;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.annotation.concurrent.NotThreadSafe;

/**
 * InputStream that limits the length of the stream to a construction-specified
 * value. Note that calls to close() on this InputStream do not close the
 * wrapped InputStream.<br>
 * <br>
 * The main use case for this class is creating a child InputStream on a main
 * InputStream that can then be passed to an InputStream reader that fully
 * consumes it.
 */
@NotThreadSafe
public class LimitedLengthInputStream extends InputStream {
    @Nonnull
    private final InputStream in;
    private long pos;
    private final long length;
    @Nullable
    private StreamFinishedListener listener;

    /**
     * Listener that gets called once the stream has been consumed. This gets
     * called only once
     */
    public static interface StreamFinishedListener {

        /**
         * Notifies listeners that the LimitedLengthInputStream has been fully
         * consumed
         * 
         * @param wrappedStream The underlying stream that the
         *            LimitedLengthInputStream was constructed with
         */
        public void streamFinished(InputStream wrappedStream) throws IOException;
    }

    /**
     * Wraps the given InputStream with a LimitedLengthInputStream instance that
     * restricts the number of read bytes to the given length. An optional
     * StreamFinishedListener can be passed in to get notified when the stream
     * has been consumed
     */
    public LimitedLengthInputStream(@Nonnull InputStream in, long length, @Nullable StreamFinishedListener listener)
            throws IOException {
        if (in == null || length < 0) {
            throw new IllegalArgumentException("in must not be null, and length must be >= 0");
        }
        this.in = in;
        this.length = length;
        this.listener = listener;

        // If we have a zero length, then we're already at the end
        if (length == 0) {
            endOfStreamReached();
        }
    }

    private void endOfStreamReached() throws IOException {
        if (listener != null) {
            listener.streamFinished(in);
            listener = null;
        }
    }

    @Override
    public int read() throws IOException {
        if (pos >= length) {
            endOfStreamReached();
            return -1;
        } else {
            final int byteRead = this.in.read();
            if (byteRead >= 0) {
                pos++;
                if (pos >= length) {
                    endOfStreamReached();
                }
            } else if (byteRead == -1) {
                endOfStreamReached();
            }
            return byteRead;
        }
    }

    @Override
    public int read(byte[] b) throws IOException {
        return read(b, 0, b.length);
    }

    @Override
    public int read(byte[] b, int off, int len) throws IOException {

        // Copied from InputStream.read(byte[],int,int)
        if (b == null) {
            throw new NullPointerException();
        } else if (off < 0 || len < 0 || len > b.length - off) {
            throw new IndexOutOfBoundsException();
        } else if (len == 0) {
            return 0;
        }

        // Read within our bounds
        if (pos >= length) {
            endOfStreamReached();
            return -1;
        }
        final long remaining = length - pos;
        if (remaining <= Integer.MAX_VALUE) {
            len = Math.min(len, (int) remaining);
        }
        final int bytesRead = this.in.read(b, off, len);
        if (bytesRead == -1) {
            endOfStreamReached();
        } else {
            pos += bytesRead;
            if (pos >= length) {
                endOfStreamReached();
            }
        }
        return bytesRead;
    }

    @Override
    public long skip(long n) throws IOException {
        if (n <= 0 || pos >= length) {
            return 0;
        }
        n = Math.min(n, length - pos);
        final long bytesSkipped = this.in.skip(n);
        pos += bytesSkipped;
        if (pos >= length) {
            endOfStreamReached();
        }
        return bytesSkipped;
    }

    @Override
    public int available() throws IOException {
        if (pos >= length) {
            return 0;
        } else {
            final long remaining = length - pos;
            if (remaining <= Integer.MAX_VALUE) {
                return Math.min((int) remaining, in.available());
            } else {
                return in.available();
            }
        }
    }

    @Override
    public void close() throws IOException {

        // Don't close the underlying stream, but we'll instead skip ahead to
        // the end
        if (pos < length) {
            final long remaining = length - pos;
            in.skip(remaining); // if we reach EOF before getting to remaining,
                                // then that's okay, since we're still at the
                                // end
            pos += remaining;
            endOfStreamReached();
        }
    }

    @Override
    public void mark(int readlimit) {
        // Do nothing, as the contract requires when markSupported is false
    }

    @Override
    public void reset() throws IOException {
        throw new IOException("mark not supported");
    }

    @Override
    public boolean markSupported() {
        return false;
    }

    /**
     * Returns the total number of bytes that this LimitedLengthInputStream is
     * limited to
     */
    public long getLength() {
        return length;
    }
}
