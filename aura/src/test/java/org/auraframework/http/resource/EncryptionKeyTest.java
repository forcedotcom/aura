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

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;

import org.auraframework.Aura;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.test.util.UnitTestCase;
import org.eclipse.jetty.io.ByteArrayBuffer;
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
    public void _testWriteAppEncryptionKey() throws Exception {
    	//Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.ENCRYPTIONKEY,
        //         AuraContext.Authentication.AUTHENTICATED);
    	HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        DummyHttpServletResponse response = new DummyHttpServletResponse() {
            ServletOutputStreamExt out = null;
            @Override 
            public ServletOutputStream getOutputStream() throws IOException {
            	if(out == null) {
            		this.out = new ServletOutputStreamExt();
            	} 
            	return this.out;
            }
            //just a outputStream we can write to
            class ServletOutputStreamExt extends ServletOutputStream {
            	private int BUFFER_SIZE = 1024;
            	protected final ByteArrayBuffer _buf = new ByteArrayBuffer(BUFFER_SIZE);
				@Override
				public void write(byte[] b) throws IOException {
					_buf.put(b);
				}
				@Override
				public void write(int b) throws IOException { } //do nothing
				@Override
				public String toString() {
					String s = "default";
					try {
						s = (new String(this._buf.array(), "utf-8")).trim();
					} catch (UnsupportedEncodingException e) {
						e.printStackTrace();
					}
					return s;
				}
            }
        };
        
        EncryptionKey encryptionKey = new EncryptionKey();
        encryptionKey.write(request, response, Aura.getContextService().getCurrentContext());
        
        String expectedKey = Aura.getConfigAdapter().getEncryptionKey();
        
        assertEquals(expectedKey, response.getOutputStream().toString());
    }

}
