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
package org.auraframework.integration.test.adapter;

import java.io.PrintWriter;
import java.util.ConcurrentModificationException;
import java.util.EmptyStackException;
import java.util.List;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.ManifestUtil;
import org.auraframework.impl.adapter.ServletUtilAdapterImpl;
import org.auraframework.instance.InstanceStack;
import org.auraframework.integration.test.util.IntegrationTestCase;
import org.auraframework.service.ContextService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.google.common.collect.Lists;

import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;

public class ServletUtilAdapterImplTest extends IntegrationTestCase {

    @Inject
    private ContextService contextService;

    @Inject
    private ConfigAdapter configAdapter;
    /**
     * check manifest URL when context has no preloads.
     */
    @Test
    public void testGetManifestUrlWithoutPreloads() throws Exception {
        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        DefDescriptor<ApplicationDef> desc =
                definitionService.getDefDescriptor("appCache:nopreload", ApplicationDef.class);
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);
        assertTrue("The application needs to enable appcache", new ManifestUtil(definitionService, contextService, configAdapter).isManifestEnabled());

        // @dval: Refactor this to make it readable...

        // ServletUtilAdapter servletUtilAdapter = new ServletUtilAdapterImpl();
        // String url = servletUtilAdapter.getManifestUrl(Aura.getContextService().getCurrentContext(), null);

        // assertEquals("/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22appCache%3Anopreload%22%2C%22test%22%3A%22org.auraframework.integration.test.adapter.ServletUtilAdapterImplTest.testGetManifestUrlWithoutPreloads%22" +
        //         getLockerServiceContextValue() + "%7D/app.manifest", url);
    }

    /**
     * check manifest URL when context has preloads.
     */
    @ThreadHostileTest("preload sensitive")
    @Test
    public void testGetManifestUrlWithPreloads() throws Exception {
        if (contextService.isEstablished()) {
            contextService.endContext();
        }

        DefDescriptor<ApplicationDef> desc =
                definitionService.getDefDescriptor("appCache:withpreload", ApplicationDef.class);
        contextService.startContext(Mode.PROD, Format.HTML, Authentication.AUTHENTICATED, desc);

        // ServletUtilAdapter servletUtilAdapter = new ServletUtilAdapterImpl();
        // String url = servletUtilAdapter.getManifestUrl(Aura.getContextService().getCurrentContext(), null);

        // assertEquals("/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22appCache%3Awithpreload%22%2C%22test%22%3A%22org.auraframework.integration.test.adapter.ServletUtilAdapterImplTest.testGetManifestUrlWithPreloads%22" +
        //         getLockerServiceContextValue() + "%7D/app.manifest", url);

        // @dval: Refactor this to make it readable...
    }

    /**
     * Unhandled exceptions such has InterruptedException should set response status to 500 for JS (and CSS)
     * so it doesn't cache in browser, appcache, etc
     */
    @Test
    public void testHandleJSExceptionManifestEnabled() throws Exception {
        PrintWriter writer = mock(PrintWriter.class);
        HttpServletRequest mockRequest = mock(HttpServletRequest.class);
        HttpServletResponse mockResponse = mock(HttpServletResponse.class);
        ContextService mockContextService = mock(ContextService.class);
        AuraContext mockContext = mock(AuraContext.class);
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        InstanceStack mockInstanceStack = mock(InstanceStack.class);
        List<String> stack = Lists.newArrayList();
        SerializationService mockSerializationService = mock(SerializationService.class);
        ManifestUtil mockManifestUtil = mock(ManifestUtil.class);

        Mockito.when(mockResponse.getWriter()).thenReturn(writer);
        Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.JS);
        Mockito.when(mockContext.getMode()).thenReturn(Mode.PROD);
        Mockito.when(mockContext.getInstanceStack()).thenReturn(mockInstanceStack);
        Mockito.when(mockConfigAdapter.isProduction()).thenReturn(true);
        Mockito.when(mockInstanceStack.getStackInfo()).thenReturn(stack);
        Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
        Mockito.when(mockManifestUtil.isManifestEnabled()).thenReturn(true);
        Throwable exception = new InterruptedException("opps");

        ServletUtilAdapterImpl adapter = new ServletUtilAdapterImpl();
        adapter.setContextService(mockContextService);
        adapter.setConfigAdapter(mockConfigAdapter);
        adapter.setSerializationService(mockSerializationService);
        adapter.setManifestUtil(mockManifestUtil);
        adapter.handleServletException(exception, true, mockContext, mockRequest, mockResponse, true);

        // for JS with appCache enabled, SC_INTERNAL_SERVER_ERROR
        Mockito.verify(mockResponse).setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
        Mockito.verify(mockContextService, atLeastOnce()).endContext();
    }

    @Test
    public void testHandleJSExceptionManifestDisabled() throws Exception {
        PrintWriter writer = mock(PrintWriter.class);
        HttpServletRequest mockRequest = mock(HttpServletRequest.class);
        HttpServletResponse mockResponse = mock(HttpServletResponse.class);
        ContextService mockContextService = mock(ContextService.class);
        AuraContext mockContext = mock(AuraContext.class);
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        InstanceStack mockInstanceStack = mock(InstanceStack.class);
        List<String> stack = Lists.newArrayList();
        SerializationService mockSerializationService = mock(SerializationService.class);
        ManifestUtil mockManifestUtil = mock(ManifestUtil.class);

        Mockito.when(mockResponse.getWriter()).thenReturn(writer);
        Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.JS);
        Mockito.when(mockContext.getMode()).thenReturn(Mode.PROD);
        Mockito.when(mockContext.getInstanceStack()).thenReturn(mockInstanceStack);
        Mockito.when(mockConfigAdapter.isProduction()).thenReturn(true);
        Mockito.when(mockInstanceStack.getStackInfo()).thenReturn(stack);
        Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
        Mockito.when(mockManifestUtil.isManifestEnabled()).thenReturn(false);
        Throwable exception = new InterruptedException("opps");

        ServletUtilAdapterImpl adapter = new ServletUtilAdapterImpl();
        adapter.setContextService(mockContextService);
        adapter.setConfigAdapter(mockConfigAdapter);
        adapter.setSerializationService(mockSerializationService);
        adapter.setManifestUtil(mockManifestUtil);
        adapter.handleServletException(exception, true, mockContext, mockRequest, mockResponse, true);

        // for JS with appCache disabled, SC_OK
        Mockito.verify(mockResponse).setStatus(HttpStatus.SC_OK);
        Mockito.verify(mockResponse).setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-store");
        Mockito.verify(mockContextService, atLeastOnce()).endContext();
    }

    /**
     * Verifies first exception within handleServletException is caught and processed
     * we throw 'EmptyStackException' when getting InstanceStack, then verify
     * exceptionAdapter.handleException(death) is called with it
     */
    @Test
    public void testHandleExceptionDeathCaught() throws Exception {
        PrintWriter writer = mock(PrintWriter.class);
        HttpServletRequest mockRequest = mock(HttpServletRequest.class);
        HttpServletResponse mockResponse = mock(HttpServletResponse.class);
        ContextService mockContextService = mock(ContextService.class);
        AuraContext mockContext = mock(AuraContext.class);
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        ExceptionAdapter mockExceptionAdapter = mock(ExceptionAdapter.class);

        Throwable firstException = new EmptyStackException();

        Mockito.when(mockResponse.getWriter()).thenReturn(writer);
        Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.JSON);
        Mockito.when(mockContext.getMode()).thenReturn(Mode.PROD);
        Mockito.when(mockConfigAdapter.isProduction()).thenReturn(true);
        Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
        Mockito.when(mockContext.getInstanceStack()).thenThrow(firstException);

        Throwable exception = new InterruptedException("opps");

        ServletUtilAdapterImpl adapter = new ServletUtilAdapterImpl();
        adapter.setContextService(mockContextService);
        adapter.setConfigAdapter(mockConfigAdapter);
        adapter.setExceptionAdapter(mockExceptionAdapter);
        adapter.handleServletException(exception, true, mockContext, mockRequest, mockResponse, true);

        ArgumentCaptor<Throwable> handledException = ArgumentCaptor.forClass(Throwable.class);
        Mockito.verify(mockExceptionAdapter, Mockito.times(1)).handleException(handledException.capture());

        assertTrue("Should handle EmptyStackException", handledException.getValue() instanceof EmptyStackException);

        Mockito.verify(mockResponse, atLeastOnce()).setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
        Mockito.verify(mockContextService, atLeastOnce()).endContext();
    }

    /**
     * Verifies second exception within handleServletException is caught and processed
     * we throw 'EmptyStackException' when getting InstanceStack, when
     * exceptionAdapter.handleException(death) handle the exception,
     * we throw second exception, then verify we printout the error message to response's writer
     */
    @Test
    public void testHandleExceptionDoubleDeathCaught() throws Exception {
        PrintWriter writer = mock(PrintWriter.class);
        HttpServletRequest mockRequest = mock(HttpServletRequest.class);
        HttpServletResponse mockResponse = mock(HttpServletResponse.class);
        ContextService mockContextService = mock(ContextService.class);
        AuraContext mockContext = mock(AuraContext.class);
        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        ExceptionAdapter mockExceptionAdapter = mock(ExceptionAdapter.class);

        Throwable firstException = new EmptyStackException();
        String ccmeMsg = "double dead";
        Throwable secondException = new ConcurrentModificationException("double dead");

        Mockito.when(mockResponse.getWriter()).thenReturn(writer);
        Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.HTML);
        Mockito.when(mockContext.getMode()).thenReturn(Mode.DEV);
        Mockito.when(mockConfigAdapter.isProduction()).thenReturn(false);
        Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
        Mockito.when(mockContext.getInstanceStack()).thenThrow(firstException);
        Mockito.when(mockExceptionAdapter.handleException(firstException)).thenThrow(secondException);

        Throwable exception = new InterruptedException("opps");

        ServletUtilAdapterImpl adapter = new ServletUtilAdapterImpl();
        adapter.setContextService(mockContextService);
        adapter.setConfigAdapter(mockConfigAdapter);
        adapter.setExceptionAdapter(mockExceptionAdapter);
        adapter.handleServletException(exception, true, mockContext, mockRequest, mockResponse, true);

        ArgumentCaptor<String> exceptionMessage = ArgumentCaptor.forClass(String.class);
        Mockito.verify(writer, Mockito.times(1)).println(exceptionMessage.capture());

        assertEquals(ccmeMsg, exceptionMessage.getValue());
        Mockito.verify(mockResponse, atLeastOnce()).setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
        Mockito.verify(mockContextService, atLeastOnce()).endContext();
    }

     private String getLockerServiceContextValue() {
        String cacheBuster = Aura.getConfigAdapter().getLockerServiceCacheBuster();
        return cacheBuster != null ? "%2C%22ls%22%3A%22" + cacheBuster + "%22" : "";
    }
}
