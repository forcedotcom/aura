/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import org.apache.commons.httpclient.HttpStatus;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.test.annotation.TestLabels;

/**
 * Tests for ResourceRewriteFilter handling. The tests don't validate the
 * response content, but just whether the request is forwarded to the
 * AuraResourceServlet.
 * 
 * 
 * @since 0.0.92
 */
public class AuraResourceRewriteFilterHttpTest extends AuraHttpTestCase {
    public AuraResourceRewriteFilterHttpTest(String name) {
        super(name);
    }

    /**
     * URLs should be forwarded to AuraResourceServlet only if they appear to
     * have the required format. We expect 404 for all other URLs, as they
     * shouldn't get handled by the servlet.
     */
    // TODO: W-1069590 https://gus.soma.salesforce.com/a07B0000000G71N
    @TestLabels("auraSanity")
    public void testDoFilterWithMissingParams() throws Exception {
        assertUrlResponse("Shouldn't forward url with only context", "/l/{'mode':'DEV'}", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward url without context", "/l/app.js", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward /l/", "/l/", HttpStatus.SC_NOT_FOUND);
        assertUrlResponse("Shouldn't forward /l", "/l", HttpStatus.SC_NOT_FOUND);
    }
}
