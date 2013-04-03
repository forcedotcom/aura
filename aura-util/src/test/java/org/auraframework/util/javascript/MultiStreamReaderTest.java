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
package org.auraframework.util.javascript;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLStreamHandler;
import java.util.Arrays;
import java.util.Collection;

import org.apache.commons.lang.StringUtils;
import org.auraframework.test.UnitTestCase;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

public class MultiStreamReaderTest extends UnitTestCase {

    public void testConstructNullArray() throws Exception {
        URL[] urls = null;
        MultiStreamReader reader = new MultiStreamReader(urls);
        assertEquals(-1, reader.read());
        reader.close();
    }

    public void testConstructNullCollection() throws Exception {
        Collection<URL> urls = null;
        MultiStreamReader reader = new MultiStreamReader(urls);
        assertEquals(-1, reader.read());
        reader.close();
    }

    public void testConstructEmptyArray() throws Exception {
        URL[] urls = new URL[0];
        MultiStreamReader reader = new MultiStreamReader(urls);
        assertEquals(-1, reader.read());
        reader.close();
    }

    public void testConstructEmptyCollection() throws Exception {
        Collection<URL> urls = ImmutableSet.of();
        MultiStreamReader reader = new MultiStreamReader(urls);
        assertEquals(-1, reader.read());
        reader.close();
    }

    public void testReadSingleStream() throws Exception {
        assertReadingMultipleStreams(1, "something");
    }

    public void testReadSingleStreamInChunks() throws Exception {
        assertReadingMultipleStreams(3, "something");
    }

    public void testReadSingleEmptyStream() throws Exception {
        assertReadingMultipleStreams(1, "");
    }

    public void testReadMultipleShortStreams() throws Exception {
        assertReadingMultipleStreams(1, "a", "b", "c");
    }

    public void testReadMultipleEmptyStreams() throws Exception {
        assertReadingMultipleStreams(1, "", "", "");
    }

    public void testReadMultipleStreamsWithFirstBeingLonger() throws Exception {
        assertReadingMultipleStreams(1, StringUtils.repeat("a", 100), "b", "c");
    }

    public void testReadMultipleStreamsInChunksWithFirstBeingLonger() throws Exception {
        assertReadingMultipleStreams(3, StringUtils.repeat("a", 100), "b", "c");
    }

    public void testReadMultipleStreamsWithSecondBeingLonger() throws Exception {
        assertReadingMultipleStreams(1, "a", StringUtils.repeat("b", 100), "c");
    }

    public void testReadMultipleStreamsInChunksWithSecondBeingLonger() throws Exception {
        assertReadingMultipleStreams(3, "a", StringUtils.repeat("b", 100), "c");
    }

    public void testReadMultipleStreamsWithThirdBeingLonger() throws Exception {
        assertReadingMultipleStreams(1, "a", "b", StringUtils.repeat("c", 100));
    }

    public void testReadMultipleStreamsInChunksWithThirdBeingLonger() throws Exception {
        assertReadingMultipleStreams(3, "a", "b", StringUtils.repeat("c", 100));
    }

    private void assertReadingMultipleStreams(int numChunks, String... content) throws Exception {
        Collection<URL> urls = Lists.newLinkedList();
        StringBuffer result = new StringBuffer();
        for (String conString : content) {
            urls.add(getStringStreamURL(conString));
            result.append(conString);
        }
        MultiStreamReader reader = new MultiStreamReader(urls);
        int chunkLength = (result.length() / numChunks) + 1;

        for (int i = 0; i < numChunks; i++) {
            int expectedReadCount;
            String expectedString;
            if (result.length() == 0) {
                expectedReadCount = -1;
                expectedString = "";
            } else if (i < (numChunks - 1)) {
                expectedReadCount = chunkLength;
                expectedString = result.substring(i * chunkLength, i * chunkLength + expectedReadCount);
            } else {
                expectedReadCount = result.length() - i * chunkLength;
                expectedString = result.substring(i * chunkLength, i * chunkLength + expectedReadCount);
            }
            char[] array = new char[chunkLength];
            assertEquals("Unexpected number of characters read from streams for chunk " + i, expectedReadCount,
                    reader.read(array));
            if (expectedReadCount > 0) {
                assertEquals("Unexpected concatenated set of characters read from streams for chunk " + i,
                        expectedString, new String(Arrays.copyOf(array, expectedReadCount)));
            }
        }
        reader.close();
    }

    private URL getStringStreamURL(final String content) throws MalformedURLException {
        return new URL("string", null, 0, "" + System.nanoTime(), new URLStreamHandler() {
            @Override
            protected URLConnection openConnection(URL u) throws IOException {
                return new StringStreamURLConnection(u, content);
            }
        });
    }

    public class StringStreamURLConnection extends URLConnection {
        private final String content;

        protected StringStreamURLConnection(URL url, String content) {
            super(url);
            this.content = content == null ? "" : content;
        }

        @Override
        public void connect() throws IOException {
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(content.getBytes("UTF-8"));
        }
    }
}
