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
import java.io.IOException;
import java.io.InputStream;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.LimitedLengthInputStream;
import org.auraframework.util.LimitedLengthInputStream.StreamFinishedListener;

/**
 * Tests for the LimitedLengthInputStream
 */
public class LimitedLengthInputStreamTest extends UnitTestCase {
    private boolean callbackCalled;
    private InputStream wrappedStream;

    public LimitedLengthInputStreamTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        callbackCalled = false;
    }

    private class TestStreamFinishedListener implements StreamFinishedListener {
        @Override
        public void streamFinished(InputStream is) throws IOException {
            assertEquals("Stream didn't match what we expected", LimitedLengthInputStreamTest.this.wrappedStream, is);
            callbackCalled = true;
        }
    }

    private InputStream createTestStream(int byteCount) {
        final byte[] bytes = new byte[byteCount];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) i;
        }
        return wrappedStream = new ByteArrayInputStream(bytes);
    }

    public void testLimitOfZero() throws Exception {

        // We get the callback upon construction in this case
        LimitedLengthInputStream in = new LimitedLengthInputStream(createTestStream(10), 0,
                new TestStreamFinishedListener());
        try {
            assertEquals(0, in.getLength());
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read());
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
            assertEquals(-1, in.read(new byte[5]));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
            assertEquals(-1, in.read(new byte[5], 0, 5));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
            assertEquals(0, in.skip(1));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }
    }

    public void testLimitOfOne() throws Exception {
        createTestStream(10);
        final StreamFinishedListener listener = new TestStreamFinishedListener();
        final byte[] array = new byte[5];

        // Try it with a regular read
        LimitedLengthInputStream in = new LimitedLengthInputStream(wrappedStream, 1, listener);
        try {
            assertEquals(1, in.getLength());
            assertFalse(callbackCalled);
            assertEquals(1, in.available());
            assertEquals(0, in.read());
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read());
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with the array read
        in = new LimitedLengthInputStream(wrappedStream, 1, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(1, in.available());
            assertEquals(1, in.read(array));
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read(array));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with the array+pos+length read
        in = new LimitedLengthInputStream(wrappedStream, 1, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(1, in.available());
            assertEquals(1, in.read(array, 0, array.length));
            assertEquals(2, array[0]);
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read(array, 0, array.length));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with skip
        in = new LimitedLengthInputStream(wrappedStream, 1, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(1, in.available());
            assertEquals(1, in.skip(1));
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(0, in.skip(1));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }
    }

    /**
     * Ensures that a limit that is greater than the underlying stream and also
     * smaller than Integer.MAX_VALUE works properly
     */
    public void testLimitGreaterThanStream() throws Exception {
        testLimitGreaterThanStream(6);
    }

    /**
     * Ensures that a limit that is greater than Integer.MAX_VALUE works
     * properly
     */
    public void testVeryLargeLimit() throws Exception {
        testLimitGreaterThanStream(Long.MAX_VALUE);
    }

    private void testLimitGreaterThanStream(long limit) throws Exception {
        createTestStream(5);
        final StreamFinishedListener listener = new TestStreamFinishedListener();
        byte[] array = new byte[5];

        // Try it with a regular read
        LimitedLengthInputStream in = new LimitedLengthInputStream(wrappedStream, limit, listener);
        try {
            assertEquals(limit, in.getLength());
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            for (int i = 0; i < 5; i++) {
                assertEquals(i, in.read());
                assertFalse(callbackCalled);
                assertEquals(4 - i, in.available());
            }
            assertEquals(-1, in.read());
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read());
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
            assertEquals(limit, in.getLength());
        } finally {
            in.close();
        }

        // Try it with the array read
        createTestStream(5);
        in = new LimitedLengthInputStream(wrappedStream, limit, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            assertEquals(5, in.read(array));
            for (int i = 0; i < 5; i++) {
                assertEquals(i, array[i]);
            }
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
            assertEquals(-1, in.read(array));
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read(array));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with the array+pos+length read (aligned with actual underlying
        // bytes)
        createTestStream(5);
        in = new LimitedLengthInputStream(wrappedStream, limit, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            assertEquals(5, in.read(array, 0, array.length));
            for (int i = 0; i < 5; i++) {
                assertEquals(i, array[i]);
            }
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
            assertEquals(-1, in.read(array, 0, array.length));
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read(array, 0, array.length));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with the array+pos+length read (not aligned with actual
        // underlying bytes)
        array = new byte[10];
        createTestStream(5);
        in = new LimitedLengthInputStream(wrappedStream, limit, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            assertEquals(5, in.read(array, 0, array.length));
            for (int i = 0; i < 5; i++) {
                assertEquals(i, array[i]);
            }
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
            assertEquals(-1, in.read(array, 0, array.length));
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read(array, 0, array.length));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with skip
        createTestStream(5);
        in = new LimitedLengthInputStream(wrappedStream, limit, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            assertEquals(5, in.skip(5));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
            assertEquals(0, in.skip(1));
            assertFalse(callbackCalled); // The contract of skip() doesn't let
                                         // us definitively say that we're at
                                         // the EOF, so the callback won't get
                                         // called until we read
            assertEquals(-1, in.read());
            assertEquals(0, in.available());
            assertTrue(callbackCalled);
            callbackCalled = false;
            assertEquals(0, in.skip(1));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }
    }

    public void testLimitEqualToStream() throws Exception {
        createTestStream(5);
        final StreamFinishedListener listener = new TestStreamFinishedListener();
        byte[] array = new byte[5];

        // Try it with a regular read
        InputStream in = new LimitedLengthInputStream(wrappedStream, 5, listener);
        try {
            assertEquals(5, in.available());
            for (int i = 0; i < 5; i++) {
                assertFalse(callbackCalled);
                assertEquals(i, in.read());
                assertEquals(4 - i, in.available());
            }
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read());
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with the array read
        createTestStream(5);
        in = new LimitedLengthInputStream(wrappedStream, 5, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            assertEquals(5, in.read(array));
            for (int i = 0; i < 5; i++) {
                assertEquals(i, array[i]);
            }
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read(array));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with the array+pos+length read (aligned with actual underlying
        // bytes)
        createTestStream(5);
        in = new LimitedLengthInputStream(wrappedStream, 5, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            assertEquals(5, in.read(array, 0, array.length));
            for (int i = 0; i < 5; i++) {
                assertEquals(i, array[i]);
            }
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read(array, 0, array.length));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with the array+pos+length read (not aligned with actual
        // underlying bytes)
        array = new byte[10];
        createTestStream(5);
        in = new LimitedLengthInputStream(wrappedStream, 5, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            assertEquals(5, in.read(array, 0, array.length));
            for (int i = 0; i < 5; i++) {
                assertEquals(i, array[i]);
            }
            assertTrue(callbackCalled);
            assertEquals(0, in.available());
            callbackCalled = false;
            assertEquals(-1, in.read(array, 0, array.length));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }

        // Try it with skip
        createTestStream(5);
        in = new LimitedLengthInputStream(wrappedStream, 5, listener);
        try {
            assertFalse(callbackCalled);
            assertEquals(5, in.available());
            assertEquals(5, in.skip(5));
            assertTrue(callbackCalled);
            callbackCalled = false;
            assertEquals(0, in.skip(1));
            assertFalse(callbackCalled);
            assertEquals(0, in.available());
        } finally {
            in.close();
        }
    }

    public void testClose() throws Exception {
        createTestStream(5);
        final StreamFinishedListener listener = new TestStreamFinishedListener();
        byte[] array = new byte[5];

        // Close the stream, which should put us ahead three bytes
        InputStream in = new LimitedLengthInputStream(wrappedStream, 3, listener);
        in.close();

        // Ensure that none of the methods work
        assertEquals(-1, in.read());
        assertEquals(-1, in.read(array));
        assertEquals(-1, in.read(array, 0, array.length));
        assertEquals(0, in.available());
        assertEquals(0, in.skip(1));

        // Try close() again. Nothing should happen
        in.close();

        // Ensure that our wrapped stream has two bytes left in it
        assertEquals(3, wrappedStream.read());
        assertEquals(4, wrappedStream.read());
        assertEquals(-1, wrappedStream.read());
    }

    public void testMarkingUnsupported() throws Exception {
        InputStream in = new LimitedLengthInputStream(createTestStream(10), 5, new TestStreamFinishedListener());
        try {
            // Nothing should happen
            in.mark(3);
            in.mark(0);
            in.mark(Integer.MIN_VALUE);
            in.mark(Integer.MAX_VALUE);

            // Ensure that mark is unsupported (apologies to anyone named Mark)
            assertFalse(in.markSupported());

            // Reset isn't supported
            try {
                in.reset();
                fail("reset should have failed");
            } catch (IOException e) {
                assertTrue(e.getMessage().contains("mark not supported"));
            }
        } finally {
            in.close();
        }
    }

    public void testBadConstruction() throws Exception {
        try {
            new LimitedLengthInputStream(null, 1, null);
            fail();
        } catch (IllegalArgumentException e) {
            // Expected
        }
        try {
            new LimitedLengthInputStream(new ByteArrayInputStream(new byte[] { 1 }), -1, null);
            fail();
        } catch (IllegalArgumentException e) {
            // Expected
        }
        try {
            new LimitedLengthInputStream(null, -1, null);
            fail();
        } catch (IllegalArgumentException e) {
            // Expected
        }
    }

}
