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

package org.auraframework.http;

import java.io.BufferedReader;
import java.io.StringReader;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.service.LoggingService;
import org.junit.Before;
import org.junit.Test;
import org.mockito.*;

/**
 * Simple (non-integration) test case for {@link CSPReporterServlet}.
 */
public class CSPReporterServletUnitTest {

    @Mock
    HttpServletRequest request;

    @Mock
    HttpServletResponse response;

    @Mock
    LoggingService loggingService;

    @Before
    public void initMocks() {
        MockitoAnnotations.initMocks(this);
    }

    @SuppressWarnings("serial")
    private static class CSPReporterServletExtender extends CSPReporterServlet {
        public void testDoPost(HttpServletRequest request, HttpServletResponse response) throws Exception {
            doPost(request, response);
        }
    }

    @Test
    public void testPostCallsLoggingServiceWithValidJSON() throws Exception {
        String json = "{'csp-report':'data'}";
        CSPReporterServletExtender servlet = new CSPReporterServletExtender();
        servlet.setLoggingService(loggingService);
        Mockito.when(request.getReader()).thenReturn(new BufferedReader(new StringReader(json)));

        servlet.testDoPost(request, response);

        Mockito.verify(loggingService, Mockito.times(1)).establish();
        Mockito.verify(loggingService, Mockito.times(1)).logCSPReport(Matchers.any());
        Mockito.verify(loggingService, Mockito.times(1)).release();
    }

    @Test
    public void testPostOkWithJSONNotHavingKey() throws Exception {
        String json = "{}";
        CSPReporterServletExtender servlet = new CSPReporterServletExtender();
        servlet.setLoggingService(loggingService);
        Mockito.when(request.getReader()).thenReturn(new BufferedReader(new StringReader(json)));

        servlet.testDoPost(request, response);

        Mockito.verify(loggingService, Mockito.times(0)).logCSPReport(Matchers.any());
    }

    @Test
    public void testPostOkWithInvalidJSON() throws Exception {
        String json = "}[]";
        CSPReporterServletExtender servlet = new CSPReporterServletExtender();
        servlet.setLoggingService(loggingService);
        Mockito.when(request.getReader()).thenReturn(new BufferedReader(new StringReader(json)));

        servlet.testDoPost(request, response);

        Mockito.verify(loggingService, Mockito.times(0)).logCSPReport(Matchers.any());
    }

    @Test
    public void testPostOkWithNothing() throws Exception {
        String json = "";
        CSPReporterServletExtender servlet = new CSPReporterServletExtender();
        servlet.setLoggingService(loggingService);
        Mockito.when(request.getReader()).thenReturn(new BufferedReader(new StringReader(json)));

        servlet.testDoPost(request, response);

        Mockito.verify(loggingService, Mockito.times(0)).logCSPReport(Matchers.any());
    }
}
