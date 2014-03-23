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
package org.auraframework.impl.validation.http;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpRequestBase;
import org.auraframework.impl.validation.ValidationTestUtil;
import org.auraframework.test.AuraHttpTestCase;
import org.auraframework.util.json.Json;
import org.auraframework.util.validation.ValidationError;

import com.google.common.base.Charsets;

public final class AuraValidationServletHttpTest extends AuraHttpTestCase {

    private HttpRequestBase method;

    public AuraValidationServletHttpTest(String name) {
        super(name);
    }

    @Override
    public void tearDown() throws Exception {
        try {
            if (method != null) {
                method.releaseConnection();
                method = null;
            }
        } finally {
            super.tearDown();
        }
    }

    public void testServlet() throws Exception {
        method = obtainGetMethod("/qa/auraValidation?path=../aura-impl/src/test/components/validationTest/basic");
        HttpResponse response = perform(method);
        assertEquals(HttpServletResponse.SC_OK, response.getStatusLine().getStatusCode());
        String contentType = response.getFirstHeader(HttpHeaders.CONTENT_TYPE).getValue();
        assertTrue(contentType, contentType.contains(Json.MIME_TYPE));
        assertTrue(contentType, contentType.contains(Charsets.UTF_8.toString()));

        String content = getResponseBody(response);
        List<String> errors = ValidationError.parseErrors(content);
        assertEquals(5, errors.size());

        ValidationTestUtil
                .assertError(
                        "basic.css [line 1, column 1] cssparser: CSS selector must begin with '.validationTestBasic' or '.THIS'",
                        errors.get(0));
        ValidationTestUtil
                .assertError(
                        "basic.css [line 2, column 5] csslint @ box-sizing: The box-sizing property isn't supported in IE6 and IE7",
                        errors.get(1));
        ValidationTestUtil.assertError("basicController.js [line 5, column 1] js/custom: Starting '(' missing",
                errors.get(2));
        ValidationTestUtil.assertError("basicController.js [line 7, column 20] jslint: Missing semicolon",
                errors.get(3));
        ValidationTestUtil
                .assertError(
                        "basic.cmp [line 1, column 1] cmp/custom: Abstract component markup://validationTest:basic must be extensible",
                        errors.get(4));
    }

    /**
     * Same as testServlet(), but only uses JDK classes
     */
    public void testServletStandalone() throws Exception {
        URL url = new URL(getTestServletConfig().getBaseUrl()
                + "qa/auraValidation?path=../aura-impl/src/test/components/validationTest/basic");
        InputStream stream = url.openStream();
        List<String> errors = ValidationError.parseErrors(new InputStreamReader(stream));

        assertEquals(5, errors.size());

        ValidationTestUtil
                .assertError(
                        "basic.css [line 1, column 1] cssparser: CSS selector must begin with '.validationTestBasic' or '.THIS'",
                        errors.get(0));
        ValidationTestUtil
                .assertError(
                        "basic.css [line 2, column 5] csslint @ box-sizing: The box-sizing property isn't supported in IE6 and IE7",
                        errors.get(1));
        ValidationTestUtil.assertError("basicController.js [line 5, column 1] js/custom: Starting '(' missing",
                errors.get(2));
        ValidationTestUtil.assertError("basicController.js [line 7, column 20] jslint: Missing semicolon",
                errors.get(3));
        ValidationTestUtil
                .assertError(
                        "basic.cmp [line 1, column 1] cmp/custom: Abstract component markup://validationTest:basic must be extensible",
                        errors.get(4));
    }
}
