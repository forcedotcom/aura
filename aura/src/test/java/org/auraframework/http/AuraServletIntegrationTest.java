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

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.IntegrationTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;

/**
 * Tests for AuraServlet.
 * 
 * @since 0.0.2.48
 */
public class AuraServletIntegrationTest extends IntegrationTestCase {
    public AuraServletIntegrationTest(String name) {
        super(name);
    }

    private void assertBustedUrl(String expectedFormat, String initialValue) throws Exception {
        ContextService contextService = Aura.getContextService();
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        contextService.startContext(Mode.DEV, Format.HTML, Authentication.AUTHENTICATED);
        String buster = "" + Aura.getConfigAdapter().getBuildTimestamp();
        String expected = String.format(expectedFormat, buster);
        String actual = AuraBaseServlet.addCacheBuster(initialValue);
        assertEquals(expected, actual);
    }

    /**
     * Null input returns null
     */
    public void testAddCacheBusterToNull() throws Exception {
        ContextService contextService = Aura.getContextService();
        if (contextService.isEstablished()) {
            contextService.endContext();
        }
        contextService.startContext(Mode.DEV, Format.HTML, Authentication.AUTHENTICATED);
        assertNull(AuraBaseServlet.addCacheBuster(null));
    }

    /**
     * Empty URL string should still have the buster returned.
     */
    public void testAddCacheBusterToEmptyString() throws Exception {
        assertBustedUrl("?aura.cb=%s", "");
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

    /**
     * No manifest URL when context has no preloads.
     */
    public void testGetManifestWithoutPreloads() throws Exception {
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService().getDefDescriptor(
                "appCache:nopreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);
        assertTrue(ManifestUtil.isManifestEnabled());
    }

    /**
     * Get a URL when context has preloads.
     */
    @ThreadHostileTest("preload sensitive")
    public void testGetManifestWithPreloads() throws Exception {
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService().getDefDescriptor(
                "appCache:nopreload", ApplicationDef.class);
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);
        String url = ManifestUtil.getManifestUrl();
        assertEquals(
                "/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22appCache%3Anopreload%22" +
                        "%2C%22test%22%3A%22org.auraframework.http.AuraServletIntegrationTest." +
                        "testGetManifestWithPreloads%22%7D/app.manifest",
                url);
    }
}
