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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;

public class EncryptionKeyJsTest extends UnitTestCase { 
    @Test
    public void testName() {
        assertEquals("app.encryptionkey.js", new EncryptionKeyJs().getName());
    }

    @Test
    public void testFormat() {
        assertEquals(Format.JS, new EncryptionKeyJs().getFormat());
    }

    @Test
    public void testSendErrorWhenEncryptionKeyValidationFails() throws Exception {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);

        class DummyResponse extends DummyHttpServletResponse {
            private int error;

            @Override
            public void sendError(int sc) {
                error = sc;
            }

            public int getError() {
                return error;
            }
        };

        DummyResponse response = new DummyResponse();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.when(configAdapter.validateGetEncryptionKey(Mockito.anyString())).thenReturn(false);
        EncryptionKeyJs encryptionKey = new EncryptionKeyJs();
        encryptionKey.setConfigAdapter(configAdapter);

        encryptionKey.write(request, response, null);

        assertEquals("Expected 403 error code to be sent when encryption key validation fails",
                HttpServletResponse.SC_FORBIDDEN, response.getError());
    }
}
