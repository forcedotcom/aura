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
package org.auraframework.test.http;

import java.util.List;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.http.ManifestUtil;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

public class ManifestUtilTest extends UnitTestCase {
    @Mock
    ConfigAdapter configAdapter;

    @Mock
    ContextService contextService;

    private long checkManifestCookieValue(String cookie, int count, long time) {
        List<String> parts = AuraTextUtil.splitSimple(":", cookie, 2);
        int ccount = Integer.parseInt(parts.get(0));
        long ctime = Long.parseLong(parts.get(1));

        assertEquals("Count mismatch for " + cookie, count, ccount);
        if (time != 0) {
            assertEquals("Time mismatch for " + cookie, time, ctime);
        } else {
            long now = System.currentTimeMillis();

            assertTrue("Too much time for " + cookie, now - ctime < 60 * 1000);
        }
        return ctime;
    }

    /**
     * Null cookie value returns "start" cookie.
     */
    @Test
    public void testUpdateManifestCookieNull() {
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);

        String value = new ManifestUtil(contextService, configAdapter).updateManifestCookieValue(null);
        checkManifestCookieValue(value, 1, 0);
    }

    /**
     * Empty cookie value returns "start" cookie.
     */
    @Test
    public void testUpdateManifestCookieEmpty() {
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);
        String value = new ManifestUtil(contextService, configAdapter).updateManifestCookieValue("");
        checkManifestCookieValue(value, 1, 0);
    }

    /**
     * Unexpected cookie format (colon-delimited) returns "start" cookie.
     */
    @Test
    public void testUpdateManifestCookieInvalidFormat() {
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);
        ManifestUtil manifestUtil = new ManifestUtil(contextService, configAdapter);
        String value = manifestUtil.updateManifestCookieValue("12345678");
        checkManifestCookieValue(value, 1, 0);

        value = manifestUtil.updateManifestCookieValue("stringy");
        checkManifestCookieValue(value, 1, 0);
    }

    /**
     * Error cookie value returns null.
     */
    @Test
    public void testUpdateManifestCookieError() {
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);
        assertNull(new ManifestUtil(contextService, configAdapter).updateManifestCookieValue("error"));
    }

    /**
     * Invalid count cookie value returns null.
     */
    @Test
    public void testUpdateManifestCookieBadCount() {
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);
        assertNull(new ManifestUtil(contextService, configAdapter).updateManifestCookieValue("one:123456789"));
    }

    /**
     * Invalid time cookie value returns null.
     */
    @Test
    public void testUpdateManifestCookieBadTime() {
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);
        assertNull(new ManifestUtil(contextService, configAdapter).updateManifestCookieValue("1:jan 6 2013"));
    }

    /**
     * Age check before count check.
     */
    @Test
    public void testUpdateManifestCookieExpired() {
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);
        String value = new ManifestUtil(contextService, configAdapter).updateManifestCookieValue("99:0");
        checkManifestCookieValue(value, 1, 0);
    }

    /**
     * Cookie count overflow.
     */
    @Test
    public void testUpdateManifestCookieOverCount() {
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(contextService.getCurrentContext()).thenReturn(context);
        ManifestUtil manifestUtil = new ManifestUtil(contextService, configAdapter);
        String value = "";
        long time = 0;
        int i;

        for (i = 1; i < 17; i++) {
            value = manifestUtil.updateManifestCookieValue(value);
            time = checkManifestCookieValue(value, i, time);
        }
        value = manifestUtil.updateManifestCookieValue(value);
        assertNull("Did not expire cookie " + value, value);
    }
}
