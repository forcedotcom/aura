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

package org.auraframework.http.resource;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.test.util.UnitTestCase;
import org.mockito.Mockito;

public class EncryptionKeyTest extends UnitTestCase{

    public EncryptionKeyTest(String name) {
        super(name);
    }
    
    /**
     * Unit Test, Name is API!.
     */
    public void testName() {
        assertEquals("app.encryptionkey", new EncryptionKey().getName());
    }

    /**
     * Unit Test, Format is API!. notice we use HTML as format, not Format.ENCRYPTIONKEY
     */
    public void testFormat() {
        assertEquals(Format.HTML, new EncryptionKey().getFormat());
    }
    
    
    /**
     * sanity test : verify we write out encryptionKey to response 
     * Lin TODO: this needs more work
     */
    public void testWriteAppEncryptionKey() throws Exception {
        //Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.ENCRYPTIONKEY,
        //         AuraContext.Authentication.AUTHENTICATED);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        DummyHttpServletResponse response = new DummyHttpServletResponse() {
            ServletOutputStream out = null;

            @Override 
            public ServletOutputStream getOutputStream() throws IOException {
                if(out == null) {
                    this.out = new ServletOutputStreamExt();
                } 
                return this.out;
            }
            //just a outputStream we can write to
            class ServletOutputStreamExt extends ServletOutputStream {
                private ByteArrayOutputStream nested = new ByteArrayOutputStream();

                @Override
                public void close() throws IOException {
                    nested.close();
                    super.close();
                }

                @Override
                public void write(byte[] b) throws IOException {
                    nested.write(b);
                }

                @Override
                public void write(byte[] b, int off, int len) throws IOException {
                    nested.write(b, off, len);
                }

                @Override
                public void write(int b) throws IOException {
                    nested.write(b);
                }

                @Override
                public void flush() throws IOException {
                    nested.flush();
                }

                @Override
                public String toString() {
                    try {
                        return nested.toString("utf-8");
                    } catch (UnsupportedEncodingException uee) {
                        return nested.toString();
                    }
                }
            }
        };
        
        String expectedKey = "foo-fah-fum";
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        Mockito.when(configAdapter.getEncryptionKey()).thenReturn(expectedKey);
        EncryptionKey encryptionKey = new EncryptionKey();
        encryptionKey.setConfigAdapter(configAdapter);
        encryptionKey.setServletUtilAdapter(servletUtilAdapter);

        encryptionKey.write(request, response, null);
        
        assertEquals(expectedKey, response.getOutputStream().toString());
    }

}
