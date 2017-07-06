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

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyBoolean;
import static org.mockito.Matchers.eq;
import static org.mockito.Matchers.same;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.AppJsUtilAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.resource.AuraResourceImpl.AuraResourceException;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * Simple (non-integration) test case for {@link AppCoreJs}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
public class AppCoreJsTest extends UnitTestCase {
    /**
     * Name is API!.
     */
    @Test
    public void testName() {
        assertEquals("appcore.js", new AppCoreJs().getName());
    }

    /**
     * Format is API!.
     */
    @Test
    public void testFormat() {
        assertEquals(Format.JS, new AppCoreJs().getFormat());
    }

    /**
     * Check for an exception being caught and routed to the exception handler.
     *
     * Most of this is internal, but we want to make sure that we call handleServletException if there
     * is an exception in the writing of the CSS.
     */
    @Test
    public void testExceptionInWrite() throws Exception {
        // Arrange
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        ServerService serverService = mock(ServerService.class);
        ExceptionAdapter exceptionAdapter = mock(ExceptionAdapter.class);
        AppJsUtilAdapter appJsUtiAdapter = mock(AppJsUtilAdapter.class);
        AppCoreJs appCoreJs = new AppCoreJs();
        appCoreJs.setServletUtilAdapter(servletUtilAdapter);
        appCoreJs.setServerService(serverService);
        appCoreJs.setExceptionAdapter(exceptionAdapter);
        appCoreJs.setAppJsUtilAdapter(appJsUtiAdapter);
        Set<DefDescriptor<?>> dependencies = new HashSet<>();
        when(appJsUtiAdapter.getPartDependencies(
                any(HttpServletRequest.class),
                any(HttpServletResponse.class),
                any(AuraContext.class),
                eq(0)))
            .thenReturn(dependencies);

        Throwable expectedException = new RuntimeException();
        doThrow(expectedException).when(serverService).writeDefinitions(eq(dependencies), any(PrintWriter.class), eq(true), eq(0));

        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        appCoreJs.write(null, response, null);

        // Assert
        // Verify the exception first. Because we catch all exceptions and generate gacks,
        // make sure the expected code path is exercised.
        verify(servletUtilAdapter, times(1)).handleServletException(eq(expectedException),
                eq(false), any(AuraContext.class), any(HttpServletRequest.class),
                any(HttpServletResponse.class), anyBoolean());
        verify(exceptionAdapter, times(1)).handleException(any(AuraResourceException.class));

        // Knock off the known calls. These are mocked above, and are internal implementation dependent.
        verify(serverService, times(1)).writeDefinitions(same(dependencies), any(PrintWriter.class), eq(true), eq(0));

        // Make sure nothing else happens.
        verifyNoMoreInteractions(serverService);
        verifyNoMoreInteractions(servletUtilAdapter);
        verifyNoMoreInteractions(exceptionAdapter);
    }

    /**
     * Check that null dependencies doesn't call anything.
     *
     * This test will need to change if the internals change, but null should mean that nothing gets called.
     */
    @Test
    public void testNullDependencies() throws Exception {
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        AppJsUtilAdapter appJsUtiAdapter = mock(AppJsUtilAdapter.class);
        AppCoreJs appCoreJs = new AppCoreJs();
        appCoreJs.setServletUtilAdapter(servletUtilAdapter);
        appCoreJs.setAppJsUtilAdapter(appJsUtiAdapter);
        when(appJsUtiAdapter.getPartDependencies(
                any(HttpServletRequest.class),
                any(HttpServletResponse.class),
                any(AuraContext.class),
                eq(0)))
            .thenReturn(null);

        appCoreJs.write(null, null, null);

        // Verify the exception first. Because we catch all exceptions and generate gacks,
        // make sure the expected code path is exercised.
        verify(servletUtilAdapter, never()).handleServletException(any(Throwable.class),
                eq(false), any(AuraContext.class), any(HttpServletRequest.class),
                any(HttpServletResponse.class), anyBoolean());

        //
        // Nothing else should happen.
        //
        verifyNoMoreInteractions(servletUtilAdapter);
    }

    /**
     * Verify that we set the correct contentType to response
     */
    @Test
    public void testSetContentType() {
        AppCoreJs appCoreJs = new AppCoreJs();
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        appCoreJs.setServletUtilAdapter(servletUtilAdapter);
        when(servletUtilAdapter.getContentType(AuraContext.Format.JS)).thenReturn("text/javascript");
        HttpServletResponse response = new MockHttpServletResponse();

        appCoreJs.setContentType(response);

        assertEquals("text/javascript", response.getContentType());
    }
}
