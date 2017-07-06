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
package org.auraframework.impl.adapter;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.ConcurrentModificationException;
import java.util.EmptyStackException;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpHeaders;
import org.apache.http.HttpStatus;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.clientlibrary.ClientLibraryService;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.http.ManifestUtil;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.CSPInliningService;
import org.auraframework.service.ContextService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletResponse;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class ServletUtilAdapterImplUnitTest extends UnitTestCase {
    @Test
    public void testHandleServletExceptionSetsNoCacheForOKBeforeThrowing() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        Throwable t = new IOException();
        ContextService contextService = Mockito.mock(ContextService.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        sua.setContextService(contextService);

        Mockito.when(response.getStatus()).thenReturn(HttpStatus.SC_OK);

        sua = Mockito.spy(sua);

        Throwable expected = null;
        try {
            sua.handleServletException(t, false, context, request, response, false);
        } catch (Throwable x) {
            expected = x;
        }

        Mockito.verify(sua, Mockito.times(1)).setNoCache(response);
        Mockito.verify(contextService, Mockito.times(1)).endContext();
        assertEquals(expected, t);
    }

    @Test
    public void testHandleServletExceptionDoesNotSetNoCacheBeforeThrowingWhenNoCacheThrows() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        Throwable t = new IOException();
        ContextService contextService = Mockito.mock(ContextService.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        sua.setContextService(contextService);
        sua = Mockito.spy(sua);

        Mockito.when(response.getStatus()).thenReturn(HttpStatus.SC_OK);
        Mockito.doThrow(new Error()).when(response).setHeader(Mockito.any(), Mockito.any());

        Throwable expected = null;
        try {
            sua.handleServletException(t, false, context, request, response, true);
        } catch (Throwable x) {
            expected = x;
        }

        Mockito.verify(sua, Mockito.times(1)).setNoCache(response);

        ArgumentCaptor<Integer> statusCaptor = ArgumentCaptor.forClass(Integer.class);
        Mockito.verify(response, Mockito.atLeastOnce()).setStatus(statusCaptor.capture());
        List<Integer> statuses = statusCaptor.getAllValues();
        assertEquals("Must end up with 'SERVER_ERROR'",
                Integer.valueOf(HttpStatus.SC_INTERNAL_SERVER_ERROR), statuses.get(statuses.size()-1));

        Mockito.verify(contextService, Mockito.times(1)).endContext();
        assertEquals(t, expected);
    }

    @Test
    public void testHandleServletExceptionSetsInternalServerErrorForManifestEnabledForJS() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        Throwable t = Mockito.mock(Throwable.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        ContextService contextService = Mockito.mock(ContextService.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        ManifestUtil manifestUtil = Mockito.mock(ManifestUtil.class);
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        ExceptionAdapter exceptionAdapter = Mockito.mock(ExceptionAdapter.class);
        sua.setExceptionAdapter(exceptionAdapter);
        sua.setConfigAdapter(configAdapter);
        sua.setManifestUtil(manifestUtil);
        sua.setContextService(contextService);
        sua = Mockito.spy(sua);

        Mockito.when(context.getFormat()).thenReturn(Format.JS);
        Mockito.when(manifestUtil.isManifestEnabled()).thenReturn(true);
        Mockito.when(configAdapter.isProduction()).thenReturn(true);

        sua.handleServletException(t, false, context, request, response, true);

        ArgumentCaptor<Integer> statusCaptor = ArgumentCaptor.forClass(Integer.class);
        Mockito.verify(response, Mockito.times(1)).setStatus(statusCaptor.capture());
        List<Integer> statuses = statusCaptor.getAllValues();
        assertEquals("Must end up with 'SERVER_ERROR'",
                Integer.valueOf(HttpStatus.SC_INTERNAL_SERVER_ERROR), statuses.get(0));
        Mockito.verify(contextService, Mockito.times(1)).endContext();
    }

    @Test
    public void testHandleServletExceptionSetsOKPlusNoCacheForManifestDisabledForJS() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        Throwable t = Mockito.mock(Throwable.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        ContextService contextService = Mockito.mock(ContextService.class);
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        ManifestUtil manifestUtil = Mockito.mock(ManifestUtil.class);
        InstanceStack instanceStack = Mockito.mock(InstanceStack.class);
        ExceptionAdapter exceptionAdapter = Mockito.mock(ExceptionAdapter.class);
        sua.setContextService(contextService);
        sua.setExceptionAdapter(exceptionAdapter);
        sua.setConfigAdapter(configAdapter);
        sua.setManifestUtil(manifestUtil);
        sua = Mockito.spy(sua);

        Mockito.when(context.getFormat()).thenReturn(Format.JS);
        Mockito.when(manifestUtil.isManifestEnabled()).thenReturn(false);
        Mockito.when(configAdapter.isProduction()).thenReturn(true);
        Mockito.when(context.getInstanceStack()).thenReturn(instanceStack);
        Mockito.when(instanceStack.getStackInfo()).thenReturn(Lists.newArrayList());

        sua.handleServletException(t, false, context, request, response, true);

        Mockito.verify(sua, Mockito.times(1)).setNoCache(response);

        //
        // Check the response status.
        //
        ArgumentCaptor<Integer> statusCaptor = ArgumentCaptor.forClass(Integer.class);
        Mockito.verify(response, Mockito.times(1)).setStatus(statusCaptor.capture());
        List<Integer> statuses = statusCaptor.getAllValues();
        assertEquals("Must end up with 'OK' ", Integer.valueOf(HttpStatus.SC_OK), statuses.get(0));
        Mockito.verify(contextService, Mockito.times(1)).endContext();
    }

    @Test
    public void testSend404() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        ContextService contextService = Mockito.mock(ContextService.class);
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        sua.setContextService(contextService);

        Mockito.when(response.getWriter()).thenReturn(pw);

        sua.send404(null, null, response);

        Mockito.verify(response, Mockito.times(1)).setStatus(HttpServletResponse.SC_NOT_FOUND);
        Mockito.verify(response, Mockito.times(1)).getWriter();
        Mockito.verify(contextService, Mockito.times(1)).endContext();
        Mockito.verifyNoMoreInteractions(response);
        Mockito.verifyNoMoreInteractions(contextService);

        String output = sw.getBuffer().toString();
        assertTrue("Output should start with '404 Not Found'", output.startsWith("404 Not Found"));
        assertTrue("Output should be longer than 256 bytes", output.length() > 256);
    }

    @Test
    public void testGetScriptsSafeNoIgnore() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        List<String> clientLibraries = Lists.newArrayList("cl1", "cl2");
        List<String> baseScripts = Lists.newArrayList("bs1", "bs2");
        List<String> frameworkScripts = Lists.newArrayList("fs1", "fs2");
        List<String> expected = Lists.newArrayList("cl1", "cl2", "bs1", "bs2", "fs1", "fs2");
        Map<String,Object> attributes = Maps.newHashMap();

        sua = Mockito.spy(sua);
        Mockito.doReturn(clientLibraries).when(sua).getJsClientLibraryUrls(context);
        Mockito.doReturn(baseScripts).when(sua).getBaseScripts(context, attributes);
        Mockito.doReturn(frameworkScripts).when(sua).getFrameworkScripts(context, true, false, attributes);

        List<String> result = sua.getScripts(context, true, false, attributes);

        assertEquals(expected, result);
    }

    @Test
    public void testGetScriptsNotSafeIgnore() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        List<String> clientLibraries = Lists.newArrayList("cl1", "cl2");
        List<String> baseScripts = Lists.newArrayList("bs1", "bs2");
        List<String> frameworkScripts = Lists.newArrayList("fs1", "fs2");
        List<String> expected = Lists.newArrayList("cl1", "cl2", "bs1", "bs2", "fs1", "fs2");
        ClientLibraryService clientLibraryService = Mockito.mock(ClientLibraryService.class);
        Map<String,Object> attributes = Maps.newHashMap();
        sua.setClientLibraryService(clientLibraryService);

        sua = Mockito.spy(sua);
        Mockito.doReturn(clientLibraries).when(sua).getJsClientLibraryUrls(context);
        Mockito.doReturn(baseScripts).when(sua).getBaseScripts(context, attributes);
        Mockito.doReturn(frameworkScripts).when(sua).getFrameworkScripts(context, false, true, attributes);

        List<String> result = sua.getScripts(context, false, true, attributes);

        assertEquals(expected, result);
    }

    @Test
    public void testGetStyles() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        List<String> clientLibraries = Lists.newArrayList("cl1", "cl2");
        List<String> expected = Lists.newArrayList("cl1", "cl2", "appcss");

        sua = Mockito.spy(sua);
        Mockito.doReturn(clientLibraries).when(sua).getCssClientLibraryUrls(context);
        Mockito.doReturn("appcss").when(sua).getAppCssUrl(context);

        List<String> result = sua.getStyles(context);

        assertEquals(expected, result);
    }

    @Test
    public void testGetClientLibraryUrls() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        ClientLibraryService clientLibraryService = Mockito.mock(ClientLibraryService.class);
        List<String> expected = Lists.newArrayList("cl1", "cl2");
        Set<String> returned = Sets.newLinkedHashSet(expected);
        List<String> actual;
        sua.setClientLibraryService(clientLibraryService);

        Mockito.doReturn(returned).when(clientLibraryService).getUrls(context, ClientLibraryDef.Type.CSS);

        actual = sua.getCssClientLibraryUrls(context);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetBaseScripts() throws Exception {
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        sua.setConfigAdapter(configAdapter);
        String expectedURL = "aurajs";
        List<String> expected = Lists.newArrayList(expectedURL);
        List<String> actual;

        Mockito.doReturn(expectedURL).when(configAdapter).getAuraJSURL();

        actual = sua.getBaseScripts(null, null);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetFrameworkScriptsSafeNoCache() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(context.isAppJsSplitEnabled()).thenReturn(true);
        Map<String,Object> attributes = Maps.newHashMap();
        sua = Mockito.spy(sua);
        List<String> expected = Lists.newArrayList("appcorejs", "appjs");
        List<String> actual;

        Mockito.doReturn("inline").when(sua).getInlineJsUrl(context, attributes);
        Mockito.doReturn("appcorejs").when(sua).getAppCoreJsUrl(context, null);
        Mockito.doReturn("appjs").when(sua).getAppJsUrl(context, null);
        Mockito.doReturn("bootstrap").when(sua).getBootstrapUrl(context, attributes);

        actual = sua.getFrameworkScripts(context, true, true, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetFrameworkScriptsUnSafeNoCache() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(context.isAppJsSplitEnabled()).thenReturn(true);
        Map<String,Object> attributes = Maps.newHashMap();
        sua = Mockito.spy(sua);
        List<String> expected = Lists.newArrayList("appcorejs", "appjs");
        List<String> actual;

        Mockito.doReturn("inline").when(sua).getInlineJsUrl(context, attributes);
        Mockito.doReturn("appcorejs").when(sua).getAppCoreJsUrl(context, null);
        Mockito.doReturn("appjs").when(sua).getAppJsUrl(context, null);
        Mockito.doReturn("bootstrap").when(sua).getBootstrapUrl(context, attributes);

        actual = sua.getFrameworkScripts(context, false, true, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetFrameworkScriptsUnSafeCache() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        Mockito.when(context.isAppJsSplitEnabled()).thenReturn(true);
        Map<String,Object> attributes = Maps.newHashMap();
        sua = Mockito.spy(sua);
        List<String> expected = Lists.newArrayList("appcorejs", "appjs", "bootstrap");
        List<String> actual;

        Mockito.doReturn("inline").when(sua).getInlineJsUrl(context, attributes);
        Mockito.doReturn("appcorejs").when(sua).getAppCoreJsUrl(context, null);
        Mockito.doReturn("appjs").when(sua).getAppJsUrl(context, null);
        Mockito.doReturn("bootstrap").when(sua).getBootstrapUrl(context, attributes);

        actual = sua.getFrameworkScripts(context, false, false, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetFrameworkScriptsSafeCache() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        CSPInliningService inliningService = Mockito.mock(CSPInliningService.class);
        Mockito.when(context.isAppJsSplitEnabled()).thenReturn(true);
        Map<String,Object> attributes = Maps.newHashMap();
        sua = Mockito.spy(sua);
        List<String> expected = Lists.newArrayList("inline", "appcorejs", "appjs", "bootstrap");
        List<String> actual;

        Mockito.doReturn("inline").when(sua).getInlineJsUrl(context, attributes);
        Mockito.doReturn("appcorejs").when(sua).getAppCoreJsUrl(context, null);
        Mockito.doReturn("appjs").when(sua).getAppJsUrl(context, null);
        Mockito.doReturn("bootstrap").when(sua).getBootstrapUrl(context, attributes);
        Mockito.doReturn(false).when(inliningService).isSupported();
        sua.setCspInliningService(inliningService);

        actual = sua.getFrameworkScripts(context, true, false, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetFrameworkFallbackScriptsSafe() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        Map<String,Object> attributes = Maps.newHashMap();
        sua = Mockito.spy(sua);
        List<String> expected = Lists.newArrayList();
        List<String> actual;

        Mockito.doReturn("bootstrap").when(sua).getBootstrapUrl(context, attributes);

        actual = sua.getFrameworkFallbackScripts(context, true, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetFrameworkFallbackScriptsUnSafe() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        AuraContext context = Mockito.mock(AuraContext.class);
        Map<String,Object> attributes = Maps.newHashMap();
        sua = Mockito.spy(sua);
        List<String> expected = Lists.newArrayList();
        List<String> actual;

        Mockito.doReturn("bootstrap").when(sua).getBootstrapUrl(context, attributes);

        actual = sua.getFrameworkFallbackScripts(context, false, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetJsClientLibraryUrls() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ClientLibraryService clientLibraryService = Mockito.mock(ClientLibraryService.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        sua.setClientLibraryService(clientLibraryService);
        List<String> expected = Lists.newArrayList("a", "b");
        Set<String> returned = Sets.newLinkedHashSet(expected);
        List<String> actual;

        Mockito.doReturn(returned).when(clientLibraryService).getUrls(context, ClientLibraryDef.Type.JS);

        actual = sua.getJsClientLibraryUrls(context);
        assertEquals(expected, actual);
    }

    @Test
    @Ignore("write me please")
    public void testWriteScriptUrls() throws Exception {
    }

    @Test
    public void testGetCssClientLibraryUrls() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ClientLibraryService clientLibraryService = Mockito.mock(ClientLibraryService.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        sua.setClientLibraryService(clientLibraryService);
        List<String> expected = Lists.newArrayList("a", "b");
        Set<String> returned = Sets.newLinkedHashSet(expected);
        List<String> actual;

        Mockito.doReturn(returned).when(clientLibraryService).getUrls(context, ClientLibraryDef.Type.CSS);

        actual = sua.getCssClientLibraryUrls(context);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetFrameworkUrl() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        String expected = "aurajs";
        String actual;
        sua.setConfigAdapter(configAdapter);

        Mockito.doReturn(expected).when(configAdapter).getAuraJSURL();

        actual = sua.getFrameworkUrl();
        assertEquals(expected, actual);
    }

    @Test
    public void testGetBootstrapUrl() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        Map<String,Object> attributes = Maps.newLinkedHashMap();
        String expected = "contextPath/l/nonce/bootstrap.js?aura.attributes=%7B%22first%22%3A%22fv%22%2C%22second%22%3A%22sv%22%7D&jwt=thisjwt";
        String actual;
        sua.setConfigAdapter(configAdapter);

        attributes.put("first", "fv");
        attributes.put("second", "sv");

        Mockito.doReturn("contextPath").when(context).getContextPath();
        Mockito.doReturn("nonce").when(context).getEncodedURL(AuraContext.EncodingStyle.Normal);
        Mockito.doReturn("thisjwt").when(configAdapter).generateJwtToken();

        sua.createManifestUtil(); // Post-construct step
        actual = sua.getBootstrapUrl(context, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetBootstrapUrlEmptyAttributes() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        Map<String,Object> attributes = Maps.newLinkedHashMap();
        String expected = "contextPath/l/nonce/bootstrap.js?jwt=thisjwt";
        String actual;
        sua.setConfigAdapter(configAdapter);

        Mockito.doReturn("contextPath").when(context).getContextPath();
        Mockito.doReturn("nonce").when(context).getEncodedURL(AuraContext.EncodingStyle.Normal);
        Mockito.doReturn("thisjwt").when(configAdapter).generateJwtToken();

        sua.createManifestUtil(); // Post-construct step
        actual = sua.getBootstrapUrl(context, attributes);
        assertEquals(expected, actual);
    }



    @Test
    public void testGetInlineJsUrl() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        Map<String,Object> attributes = Maps.newLinkedHashMap();
        String expected = "contextPath/l/nonce/inline.js?aura.attributes=%7B%22first%22%3A%22fv%22%2C%22second%22%3A%22sv%22%7D&jwt=thisjwt";
        String actual;
        sua.setConfigAdapter(configAdapter);

        attributes.put("first", "fv");
        attributes.put("second", "sv");

        Mockito.doReturn("contextPath").when(context).getContextPath();
        Mockito.doReturn("nonce").when(context).getEncodedURL(AuraContext.EncodingStyle.Normal);
        Mockito.doReturn("thisjwt").when(configAdapter).generateJwtToken();

        sua.createManifestUtil(); // Post-construct step
        actual = sua.getInlineJsUrl(context, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetInlineJsUrlNoAttributes() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        Map<String,Object> attributes = Maps.newLinkedHashMap();
        String expected = "contextPath/l/nonce/inline.js?jwt=thisjwt";
        String actual;
        sua.setConfigAdapter(configAdapter);

        Mockito.doReturn("contextPath").when(context).getContextPath();
        Mockito.doReturn("nonce").when(context).getEncodedURL(AuraContext.EncodingStyle.Normal);
        Mockito.doReturn("thisjwt").when(configAdapter).generateJwtToken();

        sua.createManifestUtil(); // Post-construct step
        actual = sua.getInlineJsUrl(context, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetAppJsUrl() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        Map<String,Object> attributes = Maps.newLinkedHashMap();
        String expected = "contextPath/l/nonce/app.js?aura.attributes=%7B%22first%22%3A%22fv%22%2C%22second%22%3A%22sv%22%7D";
        String actual;
        sua.setConfigAdapter(configAdapter);

        attributes.put("first", "fv");
        attributes.put("second", "sv");

        Mockito.doReturn("contextPath").when(context).getContextPath();
        Mockito.doReturn("nonce").when(context).getEncodedURL(AuraContext.EncodingStyle.AppResource);

        actual = sua.getAppJsUrl(context, attributes);
        assertEquals(expected, actual);
    }

    @Test
    public void testGetAppCssUrl() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        AuraContext context = Mockito.mock(AuraContext.class);
        Map<String,Object> attributes = Maps.newLinkedHashMap();
        String expected = "contextPath/l/nonce/app.css";
        String actual;
        sua.setConfigAdapter(configAdapter);

        attributes.put("first", "fv");
        attributes.put("second", "sv");

        Mockito.doReturn("contextPath").when(context).getContextPath();
        Mockito.doReturn("nonce").when(context).getEncodedURL(AuraContext.EncodingStyle.Css);

        actual = sua.getAppCssUrl(context);
        assertEquals(expected, actual);
    }

    @Test
    public void testSetNoCache() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        long now = System.currentTimeMillis();

        sua.setNoCache(response);

        Mockito.verify(response, Mockito.times(1)).setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-store");
        Mockito.verify(response, Mockito.times(1)).setHeader(HttpHeaders.PRAGMA, "no-cache");

        ArgumentCaptor<String> nameCaptors = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Long> dateCaptors = ArgumentCaptor.forClass(Long.class);

        Mockito.verify(response, Mockito.times(2)).setDateHeader(nameCaptors.capture(), dateCaptors.capture());

        List<String> names = nameCaptors.getAllValues();
        List<Long> dates = dateCaptors.getAllValues();

        // allow arbitrary ordering.
        int expires = 0;
        int lastModified = 1;
        if (HttpHeaders.EXPIRES.equals(names.get(1))) {
            expires = 1;
            lastModified = 0;
        }
        assertEquals("Expires header should be 'EXPIRES'", HttpHeaders.EXPIRES, names.get(expires));
        assertTrue("Expires should be in the future at least the timeout",
                dates.get(expires).longValue() < now - 60*1000);
        assertEquals("Expires header should be 'LAST_MODIFIED'", HttpHeaders.LAST_MODIFIED, names.get(lastModified));
        assertTrue("LastModified should be in the past", dates.get(lastModified).longValue() < now);

        Mockito.verifyNoMoreInteractions(response);
    }

    @Test
    public void testIsProductionModeModeProd() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();

        assertTrue(sua.isProductionMode(Mode.PROD));
    }

    @Test
    public void testIsProductionModeByConfig() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.doReturn(true).when(configAdapter).isProduction();
        sua.setConfigAdapter(configAdapter);

        assertTrue(sua.isProductionMode(Mode.DEV));
    }

    @Test
    public void testIsProductionModeIsFalse() throws Exception {
        ServletUtilAdapterImpl sua = new ServletUtilAdapterImpl();
        ConfigAdapter configAdapter = Mockito.mock(ConfigAdapter.class);
        Mockito.doReturn(false).when(configAdapter).isProduction();
        sua.setConfigAdapter(configAdapter);

        assertFalse(sua.isProductionMode(Mode.DEV));
    }

    @Test
    @Ignore("write me please")
    public void testSetCSPHeaders() throws Exception {
    }

    @Test
    public void testSetLongCache() throws Exception {
        ServletUtilAdapterImpl servletUtilAdapter = new ServletUtilAdapterImpl();
        MockHttpServletResponse response = new MockHttpServletResponse();

        servletUtilAdapter.setLongCache(response);

        String expectedVary = Arrays.asList("Accept-Encoding").toString();
        assertEquals(expectedVary, response.getHeaders(HttpHeaders.VARY).toString());
        String expectedCacheControl = Arrays.asList("max-age=3888000", "public", "immutable").toString();
        assertEquals(expectedCacheControl, response.getHeaders(HttpHeaders.CACHE_CONTROL).toString());
    }

    @Test
    public void testSetShortCache() throws Exception {
        ServletUtilAdapterImpl servletUtilAdapter = new ServletUtilAdapterImpl();
        MockHttpServletResponse response = new MockHttpServletResponse();

        servletUtilAdapter.setShortCache(response);

        String expectedVary = Arrays.asList("Accept-Encoding").toString();
        assertEquals(expectedVary, response.getHeaders(HttpHeaders.VARY).toString());
        String expectedCacheControl = Arrays.asList("max-age=86400", "public").toString();
        assertEquals(expectedCacheControl, response.getHeaders(HttpHeaders.CACHE_CONTROL).toString());
    }

    @Test
    public void testSetCacheTimeout() throws Exception {
        ServletUtilAdapterImpl servletUtilAdapter = new ServletUtilAdapterImpl();
        MockHttpServletResponse response = new MockHttpServletResponse();
        long expiration = 100000;

        // Act
        servletUtilAdapter.setCacheTimeout(response, expiration, true);

        // Assert
        String expectedVary = Arrays.asList("Accept-Encoding").toString();
        assertEquals(expectedVary, response.getHeaders(HttpHeaders.VARY).toString());
        String expectedCacheControl = Arrays.asList("max-age=100", "public", "immutable").toString();
        assertEquals(expectedCacheControl, response.getHeaders(HttpHeaders.CACHE_CONTROL).toString());

        long now = System.currentTimeMillis();
        String expires = response.getHeader(HttpHeaders.EXPIRES);
        assertTrue("Expires should be at least the expiration time", Long.parseLong(expires) >= now + expiration);

        String lastModified = response.getHeader(HttpHeaders.LAST_MODIFIED);
        assertTrue("LastModified should be in the past", Long.parseLong(lastModified) < now);
    }

    @Test
    public void testSetCacheTimeoutVeryLong() throws Exception {
        // Arrange
        ServletUtilAdapterImpl servletUtilAdapterImp = new ServletUtilAdapterImpl();
        MockHttpServletResponse response = new MockHttpServletResponse();
        long expiration = 10000000000L;

        // Act
        servletUtilAdapterImp.setCacheTimeout(response, expiration, true);

        // Assert
        String expectedVary = Arrays.asList("Accept-Encoding").toString();
        assertEquals(expectedVary, response.getHeaders(HttpHeaders.VARY).toString());
        String expectedCacheControl = Arrays.asList("max-age=10000000", "public", "immutable").toString();
        assertEquals(expectedCacheControl, response.getHeaders(HttpHeaders.CACHE_CONTROL).toString());
    }

    /**
     * Unhandled exceptions such has InterruptedException should set response status to 500 for JS (and CSS)
     * so it doesn't cache in browser, appcache, etc
     */
    @Test
    public void testHandleJSExceptionManifestEnabled() throws Exception {
        PrintWriter writer = Mockito.mock(PrintWriter.class);
        HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse mockResponse = Mockito.mock(HttpServletResponse.class);
        ContextService mockContextService = Mockito.mock(ContextService.class);
        AuraContext mockContext = Mockito.mock(AuraContext.class);
        ConfigAdapter mockConfigAdapter = Mockito.mock(ConfigAdapter.class);
        InstanceStack mockInstanceStack = Mockito.mock(InstanceStack.class);
        List<String> stack = Lists.newArrayList();
        SerializationService mockSerializationService = Mockito.mock(SerializationService.class);
        ManifestUtil mockManifestUtil = Mockito.mock(ManifestUtil.class);

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
        Mockito.verify(mockContextService, Mockito.atLeastOnce()).endContext();
    }

    @Test
    public void testHandleJSExceptionManifestDisabled() throws Exception {
        PrintWriter writer = Mockito.mock(PrintWriter.class);
        HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse mockResponse = Mockito.mock(HttpServletResponse.class);
        ContextService mockContextService = Mockito.mock(ContextService.class);
        AuraContext mockContext = Mockito.mock(AuraContext.class);
        ConfigAdapter mockConfigAdapter = Mockito.mock(ConfigAdapter.class);
        InstanceStack mockInstanceStack = Mockito.mock(InstanceStack.class);
        List<String> stack = Lists.newArrayList();
        SerializationService mockSerializationService = Mockito.mock(SerializationService.class);
        ManifestUtil mockManifestUtil = Mockito.mock(ManifestUtil.class);

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
        Mockito.verify(mockContextService, Mockito.atLeastOnce()).endContext();
    }

    /**
     * Verifies first exception within handleServletException is caught and processed
     * we throw 'EmptyStackException' when getting InstanceStack, then verify
     * exceptionAdapter.handleException(death) is called with it
     */
    @Test
    public void testHandleExceptionDeathCaught() throws Exception {
        PrintWriter writer = Mockito.mock(PrintWriter.class);
        HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse mockResponse = Mockito.mock(HttpServletResponse.class);
        ContextService mockContextService = Mockito.mock(ContextService.class);
        AuraContext mockContext = Mockito.mock(AuraContext.class);
        ConfigAdapter mockConfigAdapter = Mockito.mock(ConfigAdapter.class);
        ExceptionAdapter mockExceptionAdapter = Mockito.mock(ExceptionAdapter.class);

        Throwable firstException = new EmptyStackException();

        Mockito.when(mockResponse.getWriter()).thenReturn(writer);
        Mockito.when(mockResponse.getStatus()).thenReturn(HttpStatus.SC_OK);
        Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.JSON);
        Mockito.when(mockContext.getMode()).thenReturn(Mode.PROD);
        Mockito.when(mockConfigAdapter.isProduction()).thenReturn(true);
        Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
        Mockito.when(mockContext.getInstanceStack()).thenThrow(firstException);

        Throwable exception = new InterruptedException("opps");

        ServletUtilAdapterImpl adapter = Mockito.spy(new ServletUtilAdapterImpl());
        adapter.setContextService(mockContextService);
        adapter.setConfigAdapter(mockConfigAdapter);
        adapter.setExceptionAdapter(mockExceptionAdapter);
        adapter.handleServletException(exception, true, mockContext, mockRequest, mockResponse, true);

        ArgumentCaptor<Throwable> handledException = ArgumentCaptor.forClass(Throwable.class);
        Mockito.verify(mockExceptionAdapter, Mockito.times(2)).handleException(handledException.capture());

        assertTrue("Should handle EmptyStackException", handledException.getAllValues().get(1) instanceof EmptyStackException);

        Mockito.verify(mockResponse, Mockito.atLeastOnce()).setStatus(HttpStatus.SC_OK);
        Mockito.verify(mockContextService, Mockito.atLeastOnce()).endContext();
        Mockito.verify(adapter, Mockito.times(1)).setNoCache(mockResponse);
    }

    /**
     * Verifies second exception within handleServletException is caught and processed
     * we throw 'EmptyStackException' when getting InstanceStack, when
     * exceptionAdapter.handleException(death) handle the exception,
     * we throw second exception, then verify we printout the error message to response's writer
     */
    @Test
    public void testHandleExceptionDoubleDeathCaught() throws Exception {
        PrintWriter writer = Mockito.mock(PrintWriter.class);
        HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse mockResponse = Mockito.mock(HttpServletResponse.class);
        ContextService mockContextService = Mockito.mock(ContextService.class);
        AuraContext mockContext = Mockito.mock(AuraContext.class);
        ConfigAdapter mockConfigAdapter = Mockito.mock(ConfigAdapter.class);
        ExceptionAdapter mockExceptionAdapter = Mockito.mock(ExceptionAdapter.class);

        Throwable firstException = new EmptyStackException();
        String ccmeMsg = "double dead";
        Throwable secondException = new ConcurrentModificationException("double dead");

        Mockito.when(mockResponse.getWriter()).thenReturn(writer);
        Mockito.when(mockResponse.getStatus()).thenReturn(HttpStatus.SC_OK);
        Mockito.when(mockContext.getFormat()).thenReturn(AuraContext.Format.HTML);
        Mockito.when(mockContext.getMode()).thenReturn(Mode.DEV);
        Mockito.when(mockConfigAdapter.isProduction()).thenReturn(false);
        Mockito.when(mockContextService.getCurrentContext()).thenReturn(mockContext);
        Mockito.when(mockContext.getInstanceStack()).thenThrow(firstException);
        Mockito.when(mockExceptionAdapter.handleException(firstException)).thenThrow(secondException);

        Throwable exception = new InterruptedException("opps");

        ServletUtilAdapterImpl adapter = Mockito.spy(new ServletUtilAdapterImpl());
        adapter.setContextService(mockContextService);
        adapter.setConfigAdapter(mockConfigAdapter);
        adapter.setExceptionAdapter(mockExceptionAdapter);
        adapter.handleServletException(exception, true, mockContext, mockRequest, mockResponse, true);

        ArgumentCaptor<String> exceptionMessage = ArgumentCaptor.forClass(String.class);
        Mockito.verify(writer, Mockito.times(1)).println(exceptionMessage.capture());

        assertEquals(ccmeMsg, exceptionMessage.getValue());
        // in this case we return SC_OK, and we set non-cacheable.
        Mockito.verify(mockResponse, Mockito.atLeastOnce()).setStatus(HttpStatus.SC_OK);
        Mockito.verify(mockContextService, Mockito.atLeastOnce()).endContext();
        Mockito.verify(adapter, Mockito.atLeastOnce()).setNoCache(mockResponse);
    }
}
