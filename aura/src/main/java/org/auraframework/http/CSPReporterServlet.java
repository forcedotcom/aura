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
import java.io.IOException;
import java.util.Map;

import javax.inject.Inject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.service.LoggingService;
import org.auraframework.util.json.JsonReader;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

import com.google.common.net.HttpHeaders;

/**
 * Endpoint for reporting Content Security Policy violations,
 * per the <a href="http://www.w3.org/TR/CSP2/">W3C Content Security
 * Policy 2.0 spec</a>.
 */
@SuppressWarnings("serial")
public class CSPReporterServlet extends HttpServlet {

    // KEEP THIS URL IN SYNC WITH THE SERVLET'S URL-MAPPING ENTRY IN WEB.XML!
    // (or find a way to do it programmatically.)
    public static final String URL = "/_/csp";

    public static final String PATH = "/_/ContentDomainCSP";
    public static final String PATH_NO_AUTH = "/_/ContentDomainCSPNoAuth";
    public static final String JSON_NAME = "csp-report";
    public static final String TYPE = "type";
    public static final String REPORT_TYPE = "lightning";

    public static final String BLOCKED_URI = "blocked-uri";
    public static final String COLUMN_NUMBER = "column-number";
    public static final String DOCUMENT_URI = "document-uri";
    public static final String LINE_NUMBER = "line-number";
    public static final String ORIGINAL_POLICY = "original-policy";
    public static final String REFERRER = "referrer";
    public static final String SCRIPT_SAMPLE = "script-sample";
    public static final String SOURCE_FILE = "source-file";
    public static final String STATUS_CODE = "status-code";
    public static final String VIOLATED_DIRECTIVE = "violated-directive";
    public static final String EFFECTIVE_DIRECTIVE = "effective-directive";

    private LoggingService loggingService;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        processInjection(config);
    }

    public void processInjection(ServletConfig config) {
        SpringBeanAutowiringSupport.processInjectionBasedOnServletContext(this, config.getServletContext());
    }

    @SuppressWarnings("unchecked")
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Map<String, Object> report = null;

        try {
            BufferedReader reader = req.getReader();
            report = (Map<String, Object>)new JsonReader().read(reader);
        } catch (Exception e) {
            /* TODO: report an error*/
        }

        // make sure we actually received a csp-report
        if (report != null&& report.containsKey(JSON_NAME)) {
            report.put(HttpHeaders.USER_AGENT, req.getHeader(HttpHeaders.USER_AGENT));

            loggingService.establish();
            try {
                loggingService.logCSPReport(report);
            } finally {
                loggingService.release();
            }
        }
    }

    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }
}
