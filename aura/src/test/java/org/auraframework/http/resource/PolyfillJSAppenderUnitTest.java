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

import org.auraframework.http.BrowserCompatibilityService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.polyfillservice.api.components.Query;
import org.polyfillservice.api.interfaces.PolyfillService;
import org.polyfillservice.api.interfaces.UserAgent;
import org.polyfillservice.api.interfaces.UserAgentParserService;

import java.io.IOException;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class PolyfillJSAppenderUnitTest {

    @Test
    public void testPolyfillSettingsForDevMode() throws Exception {
        Query query = setupPolyfillJSAppender(Mode.DEV);
        assertTrue("Polyfill service query should be in debug for DEV mode", query.isDebugMode());
        assertFalse("Polyfill service query should not minimize for DEV Mode", query.shouldMinify());
    }

    @Test
    public void testPolyfillSettingsForProdMode() throws Exception {
        Query query = setupPolyfillJSAppender(Mode.PROD);
        assertNull("Polyfill service query debug should be null for PROD mode", query.isDebugMode());
        assertNull("Polyfill service query minimize should be null for PROD Mode", query.shouldMinify());
    }

    private Query setupPolyfillJSAppender(Mode mode) throws IOException {
        String ua = "browser user agent string";

        PolyfillService mockPolyfillService = mock(PolyfillService.class);
        UserAgentParserService mockUserAgentParserService = mock(UserAgentParserService.class);
        BrowserCompatibilityService mockBrowserCompatibilityService = mock(BrowserCompatibilityService.class);

        AuraContext mockContext = mock(AuraContext.class);
        Client mockClient = mock(Client.class);
        when(mockContext.getMode()).thenReturn(mode);
        when(mockContext.getClient()).thenReturn(mockClient);
        when(mockClient.getUserAgent()).thenReturn(ua);

        when(mockBrowserCompatibilityService.isCompatible(ua)).thenReturn(false);

        UserAgent mockUserAgent = mock(UserAgent.class);
        when(mockUserAgent.getFamily()).thenReturn("ie");
        when(mockUserAgent.getMajorVersion()).thenReturn("11");
        when(mockUserAgentParserService.parse(ua)).thenReturn(mockUserAgent);

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);

        StringBuilder appendable = new StringBuilder();
        PolyfillJSAppender polyfillJSAppender = spy(new PolyfillJSAppender());
        polyfillJSAppender.setBrowserCompatibilityService(mockBrowserCompatibilityService);
        polyfillJSAppender.setPolyfillService(mockPolyfillService);
        polyfillJSAppender.setUserAgentParserService(mockUserAgentParserService);

        when(mockPolyfillService.getPolyfillsSource(eq(ua), any(Query.class))).thenReturn("POLYFILLED!");

        polyfillJSAppender.append(null, mockContext, appendable);

        verify(mockPolyfillService, atLeastOnce()).getPolyfillsSource(eq(ua), queryCaptor.capture());

        return queryCaptor.getValue();

    }

}