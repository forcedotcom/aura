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

import org.apache.http.HttpStatus;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;

/**
 * Automation to verify the handling of urls by AuraRewriteFilter.
 * AuraRewriteFilter forwards requests to AuraServlet.
 * 
 * 
 * @since 0.0.125
 */
public class AuraRewriteFilterHttpTest extends AuraHttpTestCase {
    public AuraRewriteFilterHttpTest(String name) {
        super(name);
    }

    @TestLabels("auraSanity")
    public void testDoFilterOfValidURLs() throws Exception {
        assertUrlResponse("Didn't forward url with namespace and component name.", "/aura/text.cmp", HttpStatus.SC_OK);
        assertUrlResponse("Didn't forward url with namespace and application name.", "/test/fakeApplication.app",
                HttpStatus.SC_OK);

        assertUrlResponse("Didn't forward url with variables and mode specification.",
                "/aura/text.cmp?value=DUTCH&aura.mode=DEV", HttpStatus.SC_OK);
    }

    // TODO: W-1088932
    public void _testDoFilterOfMalformedURLs() throws Exception {
        assertUrlResponse("Shouldn't forward url without namespace.", "//text.cmp", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url without component name.", "/aura/.cmp?aura.mode=PROD",
                HttpStatus.SC_NOT_FOUND);

        assertUrlResponse("Shouldn't forward url without namespace.", "//text.app", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url without application name.", "/aura/.app", HttpStatus.SC_NOT_FOUND);

        assertUrlResponse("Shouldn't forward url without namespace.", "/text.cmp", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url while posting directly to servlet without component name.", "/aura/",
                HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url while posting directly to aura servlet.", "/aura",
                HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url with double suffix", "/aura/text.cmp.cmp", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url with double mixed suffix", "/aura/text.cmp.app",
                HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url with double suffix", "/aura.app/text.cmp", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url with bad suffix", "/aura/text.cmpp", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url with * for namespace", "/*/text.cmp", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url with * for component name", "/aura/*.cmp", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url with * for namespace and component name", "/*/*.cmp",
                HttpStatus.SC_NOT_FOUND);
    }
}
