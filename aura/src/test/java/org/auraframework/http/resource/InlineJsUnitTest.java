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

import static junit.framework.TestCase.assertEquals;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.ManifestUtil;
import org.auraframework.http.resource.AuraResourceImpl.AuraResourceException;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraResource;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Matchers;
import org.mockito.Mockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;


@RunWith(PowerMockRunner.class)
@PrepareForTest(InlineJs.class)
public class InlineJsUnitTest {

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

    /**
     * Test for client out of sync handling.
     */
    @Test
    public void testExceptionHandlingForValidate() throws Exception {
        // Arrange
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        ContextService contextService = Mockito.mock(ContextService.class);

        AuraContext auraContext = Mockito.mock(AuraContext.class);
        @SuppressWarnings("unchecked")
        DefDescriptor<ApplicationDef> appDesc = Mockito.mock(DefDescriptor.class);
        Mockito.doReturn(appDesc).when(auraContext).getLoadingApplicationDescriptor();

        ClientOutOfSyncException outOfSyncException = Mockito.mock(ClientOutOfSyncException.class);

        ExceptionAdapter exceptionAdapter = Mockito.mock(ExceptionAdapter.class);

        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.when(configAdapter.validateBootstrap(Matchers.anyString())).thenReturn(true);

        InlineJs inline = new InlineJs();
        inline.setServletUtilAdapter(servletUtilAdapter);
        inline.setContextService(contextService);
        inline.setExceptionAdapter(exceptionAdapter);
        inline.setConfigAdapter(configAdapter);
        inline.initManifest();

        Mockito.doThrow(outOfSyncException).when(servletUtilAdapter).checkFrameworkUID(Matchers.same(auraContext));

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        inline.write(request, response, auraContext);

        // Assert
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).handleServletException(outOfSyncException, false, auraContext, request, response, false);
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).checkFrameworkUID(Matchers.same(auraContext));
        Mockito.verify(exceptionAdapter, Mockito.times(1)).handleException(Matchers.any(AuraResourceException.class));

        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
        Mockito.verifyNoMoreInteractions(exceptionAdapter);
    }

    /**
     * Test for client out of sync handling.
     */
    @Test
    public void testExceptionHandlingInManifest() throws Exception {
        // Arrange
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);
        ContextService contextService = Mockito.mock(ContextService.class);

        AuraContext auraContext = Mockito.mock(AuraContext.class);
        @SuppressWarnings("unchecked")
        DefDescriptor<ApplicationDef> appDesc = Mockito.mock(DefDescriptor.class);
        Mockito.doReturn(appDesc).when(auraContext).getLoadingApplicationDescriptor();


        ExceptionAdapter exceptionAdapter = Mockito.mock(ExceptionAdapter.class);

        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.when(configAdapter.validateBootstrap(Matchers.anyString())).thenReturn(true);

        RuntimeException rte = new RuntimeException("test");
        ManifestUtil manifestUtil = Mockito.mock(ManifestUtil.class);
        Mockito.doThrow(rte).when(manifestUtil).isManifestEnabled();

        InlineJs inline = new InlineJs(manifestUtil);
        inline.setServletUtilAdapter(servletUtilAdapter);
        inline.setContextService(contextService);
        inline.setExceptionAdapter(exceptionAdapter);
        inline.setConfigAdapter(configAdapter);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        // Act
        inline.write(request, response, auraContext);

        // Assert
        Mockito.verify(servletUtilAdapter, Mockito.times(1)).handleServletException(rte, false, auraContext, request, response, false);
        Mockito.verify(exceptionAdapter, Mockito.times(1)).handleException(Matchers.any(AuraResourceException.class));

        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
        Mockito.verifyNoMoreInteractions(exceptionAdapter);
    }

    @Test
    public void testResponseWith404WhenNullDescriptor() throws Exception {
        // Arrange
        ServletUtilAdapter servletUtilAdapter = Mockito.mock(ServletUtilAdapter.class);

        ContextService contextService = Mockito.mock(ContextService.class);

        ManifestUtil manifestUtil = Mockito.mock(ManifestUtil.class);
        Mockito.doReturn(true).when(manifestUtil).isManifestEnabled();

        ExceptionAdapter exceptionAdapter = Mockito.mock(ExceptionAdapter.class);

        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);

        DefinitionService definitionService = Mockito.mock(DefinitionService.class);

        InlineJs inline = new InlineJs(manifestUtil);
        inline.setServletUtilAdapter(servletUtilAdapter);
        inline.setContextService(contextService);
        inline.setExceptionAdapter(exceptionAdapter);
        inline.setConfigAdapter(configAdapter);
        inline.setDefinitionService(definitionService);

        AuraContext context = Mockito.mock(AuraContext.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);

        //Act
        inline.write(request, response, context);

        Mockito.verify(servletUtilAdapter, Mockito.times(1)).send404(null, request, response);
        Mockito.verifyNoMoreInteractions(servletUtilAdapter);
    }
}
