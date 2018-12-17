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

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import java.util.Enumeration;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.http.ManifestUtil;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.junit.Assert;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * Simple (non-integration) test case for {@link Manifest}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
public class ManifestUnitTest {

    /**
     * Name is API!.
     */
    @Test
    public void testName() {
        Assert.assertEquals("app.manifest", new Manifest().getName());
    }

    /**
     * Format is API!.
     */
    @Test
    public void testFormat() {
        Assert.assertEquals(Format.MANIFEST, new Manifest().getFormat());
    }

    private static Enumeration<String> getEmptyStringEnumeration() {
        Vector<String> vector = new Vector<>();
        return vector.elements();
    }

    /**
     * Test for manifest disabled.
     */
    @Test
    public void testManifestDisallowed() throws Exception {
        ManifestUtil manifestUtil = mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        Manifest manifest = new Manifest();
        HttpServletResponse response = mock(HttpServletResponse.class);
        HttpServletRequest request = mock(HttpServletRequest.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        doReturn(FALSE).when(manifestUtil).isManifestEnabled();
        doReturn(getEmptyStringEnumeration()).when(request).getParameterNames();

        manifest.write(request, response, null);

        // This is mocked.
        verify(manifestUtil, times(1)).isManifestEnabled();

        //
        // These are the real verifications. It should not be cached, and it should be marked
        // as 'Not Found'
        //
        verify(servletUtilAdapter, times(1)).setNoCache(response);
        verify(response, times(1)).setStatus(HttpServletResponse.SC_NOT_FOUND);


        verifyNoMoreInteractions(servletUtilAdapter);
        verifyNoMoreInteractions(response);
        verifyNoMoreInteractions(manifestUtil);
    }

    /**
     * Test for manifest enabled, but failing cookie check.
     */
    @Test
    public void testManifestCookieCheck() throws Exception {
        ManifestUtil manifestUtil = mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        Manifest manifest = new Manifest();
        HttpServletResponse response = mock(HttpServletResponse.class);
        HttpServletRequest request = mock(HttpServletRequest.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        doReturn(TRUE).when(manifestUtil).isManifestEnabled();
        doReturn(FALSE).when(manifestUtil).checkManifestCookie(request, response);
        doReturn(getEmptyStringEnumeration()).when(request).getParameterNames();

        manifest.write(request, response, null);

        // This is mocked.
        verify(manifestUtil, times(1)).isManifestEnabled();
        verify(manifestUtil, times(1)).checkManifestCookie(request, response);

        //
        // These are the real verifications. It should not be cached checkManifestCookie sets the response
        // code, but that is not checked here.
        //
        verify(servletUtilAdapter, times(1)).setNoCache(response);

        verifyNoMoreInteractions(servletUtilAdapter);
        verifyNoMoreInteractions(response);
        verifyNoMoreInteractions(manifestUtil);
    }

    /**
     * Test for manifest enabled, but failing cookie check.
     */
    @Test
    public void testNoDescriptor() throws Exception {
        ManifestUtil manifestUtil = mock(ManifestUtil.class);
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        Manifest manifest = new Manifest();
        HttpServletResponse response = mock(HttpServletResponse.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        AuraContext context = mock(AuraContext.class);

        manifest.setManifestUtil(manifestUtil);
        manifest.setServletUtilAdapter(servletUtilAdapter);

        doReturn(TRUE).when(manifestUtil).isManifestEnabled();
        doReturn(TRUE).when(manifestUtil).checkManifestCookie(request, response);
        doReturn(getEmptyStringEnumeration()).when(request).getParameterNames();

        manifest.write(request, response, context);

        // This is mocked.
        verify(manifestUtil, times(1)).isManifestEnabled();
        verify(manifestUtil, times(1)).checkManifestCookie(request, response);
        verify(context, times(1)).getApplicationDescriptor();

        //
        // These are the real verifications. It should not be cached, and should return Not Found
        //
        verify(servletUtilAdapter, times(1)).setNoCache(response);
        verify(response, times(1)).setStatus(HttpServletResponse.SC_NOT_FOUND);

        verifyNoMoreInteractions(servletUtilAdapter);
        verifyNoMoreInteractions(response);
        verifyNoMoreInteractions(manifestUtil);
    }

    /**
     * Verify that we set the correct contentType to response
     */
    @Test
    public void testSetContentType() {
        Manifest manifest = new Manifest();
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        manifest.setServletUtilAdapter(servletUtilAdapter);
        doReturn("text/cache-manifest").when(servletUtilAdapter).getContentType(AuraContext.Format.MANIFEST);
        HttpServletResponse response = new MockHttpServletResponse() {
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

        Assert.assertEquals("text/cache-manifest", response.getContentType());
    }
}
