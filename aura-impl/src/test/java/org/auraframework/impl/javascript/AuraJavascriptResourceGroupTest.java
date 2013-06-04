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
package org.auraframework.impl.javascript;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

import junit.framework.TestCase;

import org.auraframework.throwable.AuraRuntimeException;

/** Test class for the from-jars-only variation of an AuraJavascriptGroup */
public class AuraJavascriptResourceGroupTest extends TestCase {

    private static class MockAJRG extends AuraJavascriptResourceGroup {
        String props;

        public MockAJRG(String hash, String lastMod) {
            StringBuilder builder = new StringBuilder("# Header text\n");
            if (hash != null) {
                builder.append(AuraJavascriptResourceGroup.UUID_PROPERTY);
                builder.append("=");
                builder.append(hash);
                builder.append("\n");
            }
            if (lastMod != null) {
                builder.append(AuraJavascriptResourceGroup.LASTMOD_PROPERTY);
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

    public void testWithRealProperties() throws Exception {
        if (this.getClass().getResource(AuraJavascriptResourceGroup.VERSION_URI) == null) {
            fail("Test run before GenerateJavascript has made " + AuraJavascriptResourceGroup.VERSION_URI);
        }

        AuraJavascriptResourceGroup ajrg = new AuraJavascriptResourceGroup();
        AuraJavascriptGroup ajg = new AuraJavascriptGroup();

        assertEquals(ajg.getGroupHash(), ajrg.getGroupHash());
        assertEquals(ajg.getLastMod(), ajrg.getLastMod());
    }

    public void testWithMockProperties() throws Exception {
        AuraJavascriptResourceGroup ajrg = new MockAJRG("aMockHashValue", "23456789");
        assertEquals("aMockHashValue", ajrg.getGroupHash().toString());
        assertEquals(23456789L, ajrg.getLastMod());
    }

    public void testThrowsWithoutProperties() throws Exception {
        try {
            AuraJavascriptResourceGroup ajrg = new AuraJavascriptResourceGroup() {
                @Override
                protected InputStream getPropertyStream() {
                    return null;
                }
            };
            fail("Should not have constructed an AJRG without properties! fwuid=" + ajrg.getGroupHash().toString());
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't find " + AuraJavascriptResourceGroup.VERSION_URI));
        }
    }

    public void testThrowsWithBadLastMod() throws Exception {
        try {
            AuraJavascriptResourceGroup ajrg = new MockAJRG("aMockHashValue", "BadNumberFormat");
            fail("Should not have constructed an AJRG without properties! lastMod=" + ajrg.getLastMod());
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't parse "));
            assertTrue(e.getMessage().contains(AuraJavascriptResourceGroup.VERSION_URI));
        }
    }

    public void testThrowsWithoutHash() throws Exception {
        try {
            AuraJavascriptResourceGroup ajrg = new MockAJRG(null, "12345");
            fail("Should not have constructed an AJRG without properties! lastMod=" + ajrg.getLastMod());
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't parse "));
            assertTrue(e.getMessage().contains(AuraJavascriptResourceGroup.VERSION_URI));
        }
        try {
            AuraJavascriptResourceGroup ajrg = new MockAJRG("", "12345");
            fail("Should not have constructed an AJRG without properties! lastMod=" + ajrg.getLastMod());
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't parse "));
            assertTrue(e.getMessage().contains(AuraJavascriptResourceGroup.VERSION_URI));
        }
    }

    public void testThrowsIOError() throws Exception {
        try {
            AuraJavascriptResourceGroup ajrg = new AuraJavascriptResourceGroup() {
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
            fail("Should not have constructed an AJRG without properties! fwuid=" + ajrg.getGroupHash().toString());
        } catch (AuraRuntimeException e) {
            assertTrue(e.getMessage().startsWith("Can't parse "));
            assertTrue(e.getMessage().contains(AuraJavascriptResourceGroup.VERSION_URI));
            assertTrue(e.getCause() instanceof IOException);
        }
    }
}
