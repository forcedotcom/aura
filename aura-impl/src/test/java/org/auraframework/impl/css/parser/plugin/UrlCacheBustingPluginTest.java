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
package org.auraframework.impl.css.parser.plugin;

import org.auraframework.Aura;
import org.auraframework.impl.AuraImplTestCase;

import com.salesforce.omakase.ast.declaration.UrlFunctionValue;

public class UrlCacheBustingPluginTest extends AuraImplTestCase {

    public UrlCacheBustingPluginTest(String name) {
        super(name);
    }

    private void assertBustedUrl(String expectedFormat, String initialValue) throws Exception {
        UrlCacheBustingPlugin acb = new UrlCacheBustingPlugin(true);
        UrlFunctionValue ufv = new UrlFunctionValue(initialValue);
        String buster = "" + Aura.getConfigAdapter().getBuildTimestamp();
        String expected = String.format(expectedFormat, buster);

        acb.rework(ufv);
        String actual = ufv.url();
        assertEquals(expected, actual);

        //
        // And check that we don't change it when disabled.
        //
        acb = new UrlCacheBustingPlugin(false);
        ufv = new UrlFunctionValue(initialValue);
        acb.rework(ufv);
        actual = ufv.url();
        assertEquals(initialValue, actual);
    }

    /**
     * [FAILING] Test that aura.cb can be in a URL.
     */
    public void _testAddCacheBusterToAuracb() throws Exception {
        assertBustedUrl("/aura.cb?aura.cb=%s", "/aura.cb");
    }

    /**
     * Empty URL string should still have the buster returned.
     */
    public void testAddCacheBusterToEmptyString() throws Exception {
        assertBustedUrl("/?aura.cb=%s", "/");
    }

    /**
     * Basic URL, without query or hash, has buster simply appended as query.
     */
    public void testAddCacheBusterWithoutQueryOrHash() throws Exception {
        assertBustedUrl("/something?aura.cb=%s", "/something");
    }

    /**
     * URL with query will have buster appended to query.
     */
    public void testAddCacheBusterWithQuery() throws Exception {
        assertBustedUrl("/something?is=fishy&aura.cb=%s", "/something?is=fishy");
    }

    /**
     * URL with hash will have buster appended as query (before the hash).
     */
    public void testAddCacheBusterWithHash() throws Exception {
        assertBustedUrl("/something?aura.cb=%s#toremember", "/something#toremember");
    }

    /**
     * URL with hash with query will have buster appended as query (before the hash).
     */
    public void testAddCacheBusterWithHashQuery() throws Exception {
        assertBustedUrl("/something?aura.cb=%s#layout?option=value", "/something#layout?option=value");
    }

    /**
     * URL with query and hash will have buster appended to query (before the hash).
     */
    public void testAddCacheBusterWithQueryAndHash() throws Exception {
        assertBustedUrl("/something?is=fishy&aura.cb=%s#inside", "/something?is=fishy#inside");
    }

    /**
     * URL with query and hash with query will have buster appended to query (before the hash).
     */
    public void testAddCacheBusterWithQueryAndHashQuery() throws Exception {
        assertBustedUrl("/something?is=fishy&aura.cb=%s#inside?where=fridge", "/something?is=fishy#inside?where=fridge");
    }
}
