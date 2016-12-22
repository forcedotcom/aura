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
import static org.mockito.Matchers.same;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.http.resource.AuraResourceImpl.AuraResourceException;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraResource;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

public class InlineJsUnitTest extends UnitTestCase {

    @Test
    public void testGetName() {
        AuraResource resource = new InlineJs();
        String name = resource.getName();
        assertEquals("inline.js", name);
    }

    @Test
    public void testGetFormat() {
        AuraResource resource = new InlineJs();
        Format format = resource.getFormat();
        assertEquals(Format.JS, format);
    }

    @Test
    public void testSetContentType() {
        String expected = "text/javascript";
        AuraResource resource = new InlineJs();
        // mocking ServletUtilAdapterImpl.getContentType
        ServletUtilAdapter mockServletUtil = Mockito.mock(ServletUtilAdapter.class);
        Mockito.when(mockServletUtil.getContentType(Format.JS)).thenReturn(expected);
        ((AuraResourceImpl)resource).setServletUtilAdapter(mockServletUtil);

        HttpServletResponse mockResponse = Mockito.mock(HttpServletResponse.class);
        resource.setContentType(mockResponse);
        Mockito.verify(mockResponse, Mockito.times(1)).setContentType(expected);
    }

    @Test
    public void testExceptionHandling() throws Exception {
        // Arrange
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        ContextService contextService = Mockito.mock(ContextService.class);
        AuraContext auraContext = Mockito.mock(AuraContext.class);
        ClientOutOfSyncException outOfSyncException = Mockito.mock(ClientOutOfSyncException.class);
        ExceptionAdapter exceptionAdapter = mock(ExceptionAdapter.class);

        InlineJs inline = new InlineJs();
        inline.setServletUtilAdapter(servletUtilAdapter);
        inline.setContextService(contextService);
        inline.setExceptionAdapter(exceptionAdapter);

        doThrow(outOfSyncException).when(servletUtilAdapter).checkFrameworkUID(same(auraContext));

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        inline.write(request, response, auraContext);

        // Assert
        verify(servletUtilAdapter, times(1)).handleServletException(outOfSyncException, false, auraContext, request, response, false);
        verify(servletUtilAdapter, times(1)).checkFrameworkUID(same(auraContext));
        verify(exceptionAdapter, times(1)).handleException(any(AuraResourceException.class));

        verifyNoMoreInteractions(servletUtilAdapter);
        verifyNoMoreInteractions(exceptionAdapter);
    }
}
