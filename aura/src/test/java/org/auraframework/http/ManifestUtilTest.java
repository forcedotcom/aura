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
package org.auraframework.http;

import java.util.List;

import org.auraframework.test.UnitTestCase;

import org.auraframework.util.AuraTextUtil;

public class ManifestUtilTest extends UnitTestCase {

    public ManifestUtilTest(String name) {
        super(name);
    }

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
    public void testUpdateManifestCookieNull() {
        String value = ManifestUtil.updateManifestCookieValue(null);
        checkManifestCookieValue(value, 1, 0);
    }

    /**
     * Empty cookie value returns "start" cookie.
     */
    public void testUpdateManifestCookieEmpty() {
        String value = ManifestUtil.updateManifestCookieValue("");
        checkManifestCookieValue(value, 1, 0);
    }

    /**
     * Unexpected cookie format (colon-delimited) returns "start" cookie.
     */
    public void testUpdateManifestCookieInvalidFormat() {
        String value = ManifestUtil.updateManifestCookieValue("12345678");
        checkManifestCookieValue(value, 1, 0);

        value = ManifestUtil.updateManifestCookieValue("stringy");
        checkManifestCookieValue(value, 1, 0);
    }

    /**
     * Error cookie value returns null.
     */
    public void testUpdateManifestCookieError() {
        assertNull(ManifestUtil.updateManifestCookieValue("error"));
    }

    /**
     * Invalid count cookie value returns null.
     */
    public void testUpdateManifestCookieBadCount() {
        assertNull(ManifestUtil.updateManifestCookieValue("one:123456789"));
    }

    /**
     * Invalid time cookie value returns null.
     */
    public void testUpdateManifestCookieBadTime() {
        assertNull(ManifestUtil.updateManifestCookieValue("1:jan 6 2013"));
    }

    /**
     * Age check before count check.
     */
    public void testUpdateManifestCookieExpired() {
        String value = ManifestUtil.updateManifestCookieValue("99:0");
        checkManifestCookieValue(value, 1, 0);
    }

    /**
     * Cookie count overflow.
     */
    public void testUpdateManifestCookieOverCount() {
        String value;
        long time;

        value = ManifestUtil.updateManifestCookieValue("");
        time = checkManifestCookieValue(value, 1, 0);
        value = ManifestUtil.updateManifestCookieValue(value);
        time = checkManifestCookieValue(value, 2, time);
        value = ManifestUtil.updateManifestCookieValue(value);
        time = checkManifestCookieValue(value, 3, time);
        value = ManifestUtil.updateManifestCookieValue(value);
        time = checkManifestCookieValue(value, 4, time);
        value = ManifestUtil.updateManifestCookieValue(value);
        time = checkManifestCookieValue(value, 5, time);
        value = ManifestUtil.updateManifestCookieValue(value);
        time = checkManifestCookieValue(value, 6, time);
        value = ManifestUtil.updateManifestCookieValue(value);
        time = checkManifestCookieValue(value, 7, time);
        value = ManifestUtil.updateManifestCookieValue(value);
        time = checkManifestCookieValue(value, 8, time);
        value = ManifestUtil.updateManifestCookieValue(value);
        assertNull("Did not expire cookie " + value, value);
    }
}
