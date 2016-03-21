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

import org.auraframework.test.util.DummyHttpServletResponse;
import org.auraframework.util.test.util.UnitTestCase;
import org.mockito.Mockito;

import java.util.Enumeration;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.http.ManifestUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;

/**
 * Simple (non-integration) test case for {@link Manifest}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
public class ManifestTest extends UnitTestCase {

    public ManifestTest(String name) {
        super(name);
    }

    /**
     * Name is API!.
     */
    public void testName() {
        assertEquals("app.manifest", new Manifest().getName());
    }

    /**
     * Format is API!.
     */
    public void testFormat() {
        assertEquals(Format.MANIFEST, new Manifest().getFormat());
    }

    private Enumeration<String> getEmptyStringEnumeration() {
        Vector<String> vector = new Vector<>();
        return vector.elements();
    }

    /**
     * Test for manifest disabled.
     */
    public void testManifestDisallowed() throws Exception {
        ManifestUtil manifestUtil = Mockito.mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        Manifest manifest = new Manifest();
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        Mockito.when(manifestUtil.isManifestEnabled(request)).thenReturn(false);
        Mockito.when(request.getParameterNames()).thenReturn(getEmptyStringEnumeration());

        manifest.write(request, response, null);

        // This is mocked.
        Mockito.verify(manifestUtil, Mockito.times(1)).isManifestEnabled(request);

        //
        // These are the real verifications. It should not be cached, and it should be marked
        // as 'Not Found'
        //
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).setNoCache(response);
        Mockito.verify(response, Mockito.times(1)).setStatus(HttpServletResponse.SC_NOT_FOUND);


        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
        Mockito.verifyNoMoreInteractions(response);
        Mockito.verifyNoMoreInteractions(manifestUtil);
    }

    /**
     * Test for manifest enabled, but failing cookie check.
     */
    public void testManifestCookieCheck() throws Exception {
        ManifestUtil manifestUtil = Mockito.mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        Manifest manifest = new Manifest();
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        Mockito.when(manifestUtil.isManifestEnabled(request)).thenReturn(true);
        Mockito.when(manifestUtil.checkManifestCookie(request, response)).thenReturn(false);
        Mockito.when(request.getParameterNames()).thenReturn(getEmptyStringEnumeration());

        manifest.write(request, response, null);

        // This is mocked.
        Mockito.verify(manifestUtil, Mockito.times(1)).isManifestEnabled(request);
        Mockito.verify(manifestUtil, Mockito.times(1)).checkManifestCookie(request, response);

        //
        // These are the real verifications. It should not be cached checkManifestCookie sets the response
        // code, but that is not checked here.
        //
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).setNoCache(response);

        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
        Mockito.verifyNoMoreInteractions(response);
        Mockito.verifyNoMoreInteractions(manifestUtil);
    }

    /**
     * Test for manifest enabled, but failing cookie check.
     */
    public void testNoDescriptor() throws Exception {
        ManifestUtil manifestUtil = Mockito.mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        Manifest manifest = new Manifest();
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        AuraContext context = Mockito.mock(AuraContext.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        Mockito.when(manifestUtil.isManifestEnabled(request)).thenReturn(true);
        Mockito.when(manifestUtil.checkManifestCookie(request, response)).thenReturn(true);
        Mockito.when(request.getParameterNames()).thenReturn(getEmptyStringEnumeration());

        manifest.write(request, response, context);
        
        // This is mocked.
        Mockito.verify(manifestUtil, Mockito.times(1)).isManifestEnabled(request);
        Mockito.verify(manifestUtil, Mockito.times(1)).checkManifestCookie(request, response);
        Mockito.verify(context, Mockito.times(1)).getApplicationDescriptor();

        //
        // These are the real verifications. It should not be cached, and should return Not Found
        //
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).setNoCache(response);
        Mockito.verify(response, Mockito.times(1)).setStatus(HttpServletResponse.SC_NOT_FOUND);

        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
        Mockito.verifyNoMoreInteractions(response);
        Mockito.verifyNoMoreInteractions(manifestUtil);
    }
    
    /**
     * Verify that we set the correct contentType to response
     */
    public void testSetContentType() {
    	Manifest manifest = new Manifest();
    	ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
    	manifest.setServletUtilAdapter(servletUtilAdapter);
    	Mockito.when(servletUtilAdapter.getContentType(AuraContext.Format.MANIFEST))
        .thenReturn("text/cache-manifest");
    	DummyHttpServletResponse response = new DummyHttpServletResponse() {
            String contentType = "defaultType";

            @Override
            public String getContentType() {
                return this.contentType;
            }

            @Override
            public void setContentType(String contentType) {
                this.contentType = contentType;
            }
        };
    	
    	manifest.setContentType(response);
    	
    	assertEquals("text/cache-manifest", response.getContentType());
    }
}
