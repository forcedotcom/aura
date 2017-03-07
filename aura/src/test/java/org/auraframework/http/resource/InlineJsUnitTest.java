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
import static junit.framework.TestCase.assertTrue;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Matchers.same;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.http.resource.AuraResourceImpl.AuraResourceException;
import org.auraframework.javascript.PreInitJavascript;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.RenderingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraResource;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
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

    @Test
    public void testExceptionHandling() throws Exception {
        // Arrange
        ServletUtilAdapter servletUtilAdapter = mock(ServletUtilAdapter.class);
        ContextService contextService = Mockito.mock(ContextService.class);
        AuraContext auraContext = Mockito.mock(AuraContext.class);
        ClientOutOfSyncException outOfSyncException = Mockito.mock(ClientOutOfSyncException.class);
        ExceptionAdapter exceptionAdapter = mock(ExceptionAdapter.class);
        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        Mockito.when(configAdapter.validateBootstrap(Mockito.anyString())).thenReturn(true);

        InlineJs inline = new InlineJs();
        inline.setServletUtilAdapter(servletUtilAdapter);
        inline.setContextService(contextService);
        inline.setExceptionAdapter(exceptionAdapter);
        inline.setConfigAdapter(configAdapter);
        inline.initManifest();

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

    @Test
    public void testProgrammaticPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = PowerMockito.mock(AuraContext.class);
        PowerMockito.when(auraContext.getLoadingApplicationDescriptor()).thenReturn(null);
        PowerMockito.when(auraContext.isTestMode()).thenReturn(true);

        String expectedCode = "console.log('WOOHOO!');";
        PreInitJavascript javascript = PowerMockito.mock(PreInitJavascript.class);
        PowerMockito.when(javascript.shouldInsert(any(), any())).thenReturn(true);
        PowerMockito.when(javascript.getJavascriptCode(any(), any())).thenReturn(expectedCode);

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        InlineJs inlineJs = setupMockInlineJsForPreInit();
        inlineJs.setPreInitJavascripts(preInitJavascripts);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        inlineJs.write(request, response, auraContext);

        String content = response.getContentAsString();

        assertTrue("Aura global javascript object needs to be checked", content.contains("window.Aura = window.Aura || {};"));
        assertTrue("Aura.beforeFrameworkInit array needs to be checked", content.contains("window.Aura.beforeFrameworkInit = Aura.beforeFrameworkInit || [];"));
        assertTrue("Response does not contain inserted javascript", content.contains(expectedCode));
    }

    @Test
    public void testNoInsertPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = PowerMockito.mock(AuraContext.class);
        PowerMockito.when(auraContext.getLoadingApplicationDescriptor()).thenReturn(null);
        PowerMockito.when(auraContext.isTestMode()).thenReturn(true);

        String expectedCode = "console.log('WOOHOO!');";
        PreInitJavascript javascript = PowerMockito.mock(PreInitJavascript.class);
        PowerMockito.when(javascript.shouldInsert(any(), any())).thenReturn(false);

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        InlineJs inlineJs = setupMockInlineJsForPreInit();
        inlineJs.setPreInitJavascripts(preInitJavascripts);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        inlineJs.write(request, response, auraContext);

        String content = response.getContentAsString();
        assertTrue("Response should not contain javascript", !content.contains(expectedCode));
    }

    @Test
    public void testEmptyPreInitJavascriptInsertion() throws Exception {
        AuraContext auraContext = PowerMockito.mock(AuraContext.class);
        PowerMockito.when(auraContext.getLoadingApplicationDescriptor()).thenReturn(null);
        PowerMockito.when(auraContext.isTestMode()).thenReturn(true);

        PreInitJavascript javascript = PowerMockito.mock(PreInitJavascript.class);
        PowerMockito.when(javascript.shouldInsert(any(), any())).thenReturn(true);
        PowerMockito.when(javascript.getJavascriptCode(any(), any())).thenReturn("");

        List<PreInitJavascript> preInitJavascripts = new ArrayList<>();
        preInitJavascripts.add(javascript);

        InlineJs inlineJs = setupMockInlineJsForPreInit();
        inlineJs.setPreInitJavascripts(preInitJavascripts);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        inlineJs.write(request, response, auraContext);

        String content = response.getContentAsString();
        assertTrue("Response should not contain beforeFrameworkInit", !content.contains("beforeFrameworkInit"));
    }

    private InlineJs setupMockInlineJsForPreInit() throws Exception {
        ServletUtilAdapter servletUtilAdapter = PowerMockito.mock(ServletUtilAdapter.class);
        ContextService contextService = PowerMockito.mock(ContextService.class);

        DefinitionService definitionService = PowerMockito.mock(DefinitionService.class);
        ServerService serverService = PowerMockito.mock(ServerService.class);
        RenderingService renderingService = PowerMockito.mock(RenderingService.class);
        LocalizationAdapter localizationAdapter = PowerMockito.mock(LocalizationAdapter.class);

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        Mockito.when(configAdapter.validateBootstrap(Mockito.anyString())).thenReturn(true);

        InlineJs inline = new InlineJs();
        inline.setServletUtilAdapter(servletUtilAdapter);
        inline.setContextService(contextService);
        inline.setDefinitionService(definitionService);
        inline.setServerService(serverService);
        inline.setRenderingService(renderingService);
        inline.setConfigAdapter(configAdapter);
        inline.setLocalizationAdapter(localizationAdapter);

        InlineJs inlineSpy = PowerMockito.spy(inline);
        PowerMockito.doReturn(false).when(inlineSpy, "shouldCacheHTMLTemplate", anyObject(), anyObject(), anyObject());
        PowerMockito.doNothing().when(inlineSpy, "appendLocaleDataJavascripts", anyObject());
        inlineSpy.initManifest();

        return inlineSpy;
    }
}
