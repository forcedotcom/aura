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
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.times;

import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.resource.AuraResourceImpl.AuraResourceException;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.Writer;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Simple (non-integration) test case for {@link AppCss}, most useful for exercising hard-to-reach error
 * conditions. I would like this test to be in the "aura" module (vice "aura-impl"), but the configuration there isn't
 * friendly to getting a context service, and I think changing that may impact other tests, so I'm leaving it at least
 * for now.
 */
public class AppCssTest extends UnitTestCase {
    /**
     * Name is API!.
     */
    @Test
    public void testName() {
        assertEquals("app.css", new AppCss().getName());
    }

    /**
     * Format is API!.
     */
    @Test
    public void testFormat() {
        assertEquals(Format.CSS, new AppCss().getFormat());
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

        AppCss appCss = new AppCss();
        appCss.setServletUtilAdapter(servletUtilAdapter);
        appCss.setServerService(serverService);
        appCss.setExceptionAdapter(exceptionAdapter);

        Set<DefDescriptor<?>> dependencies = new HashSet<>();
        when(servletUtilAdapter.verifyTopLevel(any(HttpServletRequest.class), any(HttpServletResponse.class), any(AuraContext.class)))
                .thenReturn(dependencies);

        Throwable t = new RuntimeException();
        doThrow(t).when(serverService).writeAppCss(eq(dependencies), any(Writer.class));

        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        appCss.write(null, response, null);

        // Assert
        // Knock off the known calls. These are mocked above, and are internal implementation dependent.
        verify(servletUtilAdapter, times(1)).verifyTopLevel(any(HttpServletRequest.class),
                any(HttpServletResponse.class), any(AuraContext.class));
        verify(serverService, times(1)).writeAppCss(eq(dependencies), any(Writer.class));

        // And this is the expected call. This must stay.
        verify(servletUtilAdapter, times(1)).handleServletException(eq(t), eq(false),
                any(AuraContext.class), any(HttpServletRequest.class),
                any(HttpServletResponse.class), anyBoolean());
        verify(exceptionAdapter, times(1)).handleException(any(AuraResourceException.class));

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
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        ServerService serverService = Mockito.mock(ServerService.class);
        AppCss appCss = new AppCss();
        appCss.setServletUtilAdapter(servletUtilAdapter);
        appCss.setServerService(serverService);
        Mockito.when(servletUtilAdapter.verifyTopLevel(Mockito.any(HttpServletRequest.class),
                    Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class)))
            .thenReturn(null);

        appCss.write(null, null, null);

        //
        // This is the known call to get the null.
        // 
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).verifyTopLevel(Mockito.any(HttpServletRequest.class),
                    Mockito.any(HttpServletResponse.class), Mockito.any(AuraContext.class));

        //
        // Nothing else should happen.
        //
        Mockito.verifyNoMoreInteractions(serverService);
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }
    
    /**
     * Verify that we set the correct contentType to response
     */
    @Test
    public void testSetContentType() {
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        when(servletUtilAdapter.getContentType(AuraContext.Format.CSS)) .thenReturn("text/css");

        AppCss appCss = new AppCss();
        appCss.setServletUtilAdapter(servletUtilAdapter);

        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        appCss.setContentType(response);

        // Assert
        assertEquals("text/css", response.getContentType());
    }
}
