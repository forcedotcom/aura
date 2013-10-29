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
/*
 * Copyright, 2013, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.util.resource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

import org.auraframework.test.UnitTestCase;

/** Test class for the from-jars-only variation of an AuraJavascriptGroup */
public class CompiledGroupTest extends UnitTestCase {

    public static final String GROUP_NAME = "test-group";
    public static final String SAVE_FILE = "test-group.properties";

    private static class MockAJRG extends CompiledGroup {
        String props;

        public MockAJRG(String name, String saveFileName, String hash, String lastMod) {

            super(name, saveFileName);

            StringBuilder builder = new StringBuilder("# Header text\n");
            if (hash != null) {
                builder.append(CompiledGroup.UUID_PROPERTY);
                builder.append("=");
                builder.append(hash);
                builder.append("\n");
            }
            if (lastMod != null) {
                builder.append(CompiledGroup.LASTMOD_PROPERTY);
                builder.append("=");
                builder.append(lastMod);
                builder.append("\n");
            }
            props = builder.toString();
        }

        @Override
        protected InputStream getPropertyStream() {
            try {
                return new ByteArrayInputStream(props.getBytes(VERSION_CHARSET));
            } catch (UnsupportedEncodingException e) {
                throw new UnsupportedOperationException(VERSION_CHARSET + " should be supported!", e);
            }
        }
    }

    public void testWithMockProperties() throws Exception {
        CompiledGroup ajrg = new MockAJRG(GROUP_NAME, SAVE_FILE, "aMockHashValue", "23456789");
        assertEquals("aMockHashValue", ajrg.getGroupHash().toString());
        assertEquals(23456789L, ajrg.getLastMod());
    }

    public void testThrowsWithoutProperties() throws Exception {
        try {
            CompiledGroup compiled = new CompiledGroup(GROUP_NAME, SAVE_FILE) {
                @Override
                protected InputStream getPropertyStream() {
                    return null;
                }
            };

            compiled.getGroupHash();

            fail("Exception expected for null file stream");
        } catch (RuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't find"));
            assertTrue(e.getMessage().contains(SAVE_FILE));
        }
    }

    public void testThrowsWithBadLastMod() throws Exception {
        try {
            CompiledGroup compiled = new MockAJRG(GROUP_NAME, SAVE_FILE, "aMockHashValue", "BadNumberFormat");
            compiled.getLastMod();
            fail("Should have exception for bad number format");
        } catch (NumberFormatException e) {
            assertTrue(e.getMessage().contains("BadNumberFormat"));
        }
    }

    public void testThrowsWithoutHash() throws Exception {
        try {
            CompiledGroup compiled = new MockAJRG(GROUP_NAME, SAVE_FILE, null, "12345");
            compiled.getGroupHash();
            fail("Exception expected for null hash");
        } catch (RuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't parse "));
            assertTrue(e.getMessage().contains(SAVE_FILE));
        }
        try {
            CompiledGroup compiled = new MockAJRG(GROUP_NAME, SAVE_FILE, "", "12345");
            compiled.getGroupHash();
            fail("Exception expected for empty hash string");
        } catch (RuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't parse "));
            assertTrue(e.getMessage().contains(SAVE_FILE));
        }
    }

    public void testThrowsIOError() throws Exception {
        try {
            CompiledGroup compiled = new CompiledGroup(GROUP_NAME, SAVE_FILE) {
                @Override
                protected InputStream getPropertyStream() {
                    return new InputStream() {
                        @Override
                        public int read() throws IOException {
                            throw new IOException("expected simulated read error");
                        }
                    };
                }
            };
            compiled.getGroupHash();
            fail("IOException expected");
        } catch (RuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't parse "));
            assertTrue(e.getMessage().contains(SAVE_FILE));
            assertTrue(e.getCause() instanceof IOException);
        }
    }
}
