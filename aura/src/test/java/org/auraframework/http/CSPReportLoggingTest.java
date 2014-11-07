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

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.StyleDef;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.adapter.TestLoggingAdapter;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.test.controller.TestLoggingAdapterController;
import org.openqa.selenium.By;

import com.google.common.collect.Lists;

@ThreadHostileTest("TestLoggingAdapter not thread-safe")
@TargetBrowsers(BrowserType.GOOGLECHROME)
public class CSPReportLoggingTest extends WebDriverTestCase {

    private static final String STATUS_OK = "200";
    private static final String SOURCE_SUFFIX = "aura_auto.js";
    private static final String APP_SOURCE_SUFFIX = "app.js";

    public CSPReportLoggingTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        TestLoggingAdapterController.beginCapture();
    }

    @Override
    public void tearDown() throws Exception {
        try {
            TestLoggingAdapterController.endCapture();
        } finally {
            super.tearDown();
        }
    }

    public void testReportClientRenderedCSS() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "render='client'",
                        "<link href='http://www2.sfdcstatic.com/common/assets/css/min/standard-rwd-min.css' rel='stylesheet' type='text/css'/>"));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());
        String externalUri = "http://www2.sfdcstatic.com";

        open(uri);

        List<Map<String, Object>> logs = getCspReportLogs(1);
        @SuppressWarnings("unchecked")
        Map<String, Object> cspReport = (Map<String, Object>) logs.get(0).get(CSPReporterServlet.JSON_NAME);

        assertNotNull("No CSP report found", cspReport);
        assertEquals("Unexpected blocked resource", externalUri, cspReport.get(CSPReporterServlet.BLOCKED_URI));
        assertEquals("Unexpected status code", STATUS_OK, cspReport.get(CSPReporterServlet.STATUS_CODE).toString());
        assertDocumentUri(cspReport, uri);
        assertSourceFile(cspReport, SOURCE_SUFFIX);
        assertViolatedDirective(cspReport, "style-src 'self'");
    }

    public void testReportServerRenderedCSS() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "",
                        "<link href='http://www2.sfdcstatic.com/common/assets/css/min/standard-rwd-min.css' rel='stylesheet' type='text/css'/>"));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());
        String externalUri = "http://www2.sfdcstatic.com";

        openNoAura(uri);

        List<Map<String, Object>> logs = getCspReportLogs(1);
        @SuppressWarnings("unchecked")
        Map<String, Object> cspReport = (Map<String, Object>) logs.get(0).get(CSPReporterServlet.JSON_NAME);

        assertNotNull("No CSP report found", cspReport);
        assertEquals("Unexpected blocked resource", externalUri, cspReport.get(CSPReporterServlet.BLOCKED_URI));
        assertEquals("Unexpected status code", STATUS_OK, cspReport.get(CSPReporterServlet.STATUS_CODE).toString());
        assertDocumentUri(cspReport, uri);
        assertSourceFile(cspReport, null);
        assertViolatedDirective(cspReport, "style-src 'self'");
    }

    @UnAdaptableTest("The CSP filter on SFDC handles iframes differently than standalone Aura")
    public void testReportClientRenderedIframe() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "render='client'",
                        "<iframe src='http://www.salesforce.com'/>"));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());
        String frameUri = "http://www.salesforce.com";

        open(uri);

        List<Map<String, Object>> logs = getCspReportLogs(1);
        @SuppressWarnings("unchecked")
        Map<String, Object> cspReport = (Map<String, Object>) logs.get(0).get(CSPReporterServlet.JSON_NAME);

        assertNotNull("No CSP report found", cspReport);
        assertEquals("Unexpected blocked resource", frameUri, cspReport.get(CSPReporterServlet.BLOCKED_URI));
        assertEquals("Unexpected status code", STATUS_OK, cspReport.get(CSPReporterServlet.STATUS_CODE).toString());
        assertDocumentUri(cspReport, uri);
        assertSourceFile(cspReport, SOURCE_SUFFIX);
        assertViolatedDirective(cspReport, "frame-src 'self'");
    }

    @UnAdaptableTest("The CSP filter on SFDC handles iframes differently than standalone Aura")
    public void testReportServerRenderedIframe() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "",
                        "<iframe src='http://www.salesforce.com'/>"));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());
        String frameUri = "http://www.salesforce.com";

        openNoAura(uri);

        List<Map<String, Object>> logs = getCspReportLogs(1);
        @SuppressWarnings("unchecked")
        Map<String, Object> cspReport = (Map<String, Object>) logs.get(0).get(CSPReporterServlet.JSON_NAME);

        assertNotNull("No CSP report found", cspReport);
        assertEquals("Unexpected blocked resource", frameUri, cspReport.get(CSPReporterServlet.BLOCKED_URI));
        assertEquals("Unexpected status code", STATUS_OK, cspReport.get(CSPReporterServlet.STATUS_CODE).toString());
        assertDocumentUri(cspReport, uri);
        assertSourceFile(cspReport, null);
        assertViolatedDirective(cspReport, "frame-src 'self'");
    }

    /*
     * Fonts are allowed to be loaded from anywhere, so this should NOT generate a report. The test will generate
     * trigger an intentional report after load and we will check that. Any report during load should have been received
     * before it.
     */
    public void testAllowFontSrc() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        addSourceAutoCleanup(
                Aura.getDefinitionService().getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                        StyleDef.class),
                "@font-face {font-family: Gentium;src: url(http://example.com/fonts/Gentium.ttf);}");

        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());

        openNoAura(uri);

        // generate an intentional csp report
        auraUITestingUtil
                .getRawEval("var s=document.createElement('script');s.type='text/javascript';s.async=true;s.src='http://expectedreport.salesforce.com/';document.getElementsByTagName('head')[0].appendChild(s);");

        List<Map<String, Object>> logs = getCspReportLogs(1);
        @SuppressWarnings("unchecked")
        Map<String, Object> cspReport = (Map<String, Object>) logs.get(0).get(CSPReporterServlet.JSON_NAME);

        assertNotNull("Intentional CSP report not found", cspReport);
        assertEquals("Not getting the intentional report URI, probably font wasn't allowed (but should have been)",
                "http://expectedreport.salesforce.com", cspReport.get(CSPReporterServlet.BLOCKED_URI));
        assertDocumentUri(cspReport, uri);
        assertViolatedDirective(cspReport, "script-src 'self'");
    }

    public void testReportJavaScript() throws Exception {
        // This test loads script via its template, since <script> is not allowed in cmp markup.
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "isTemplate='true' extensible='true' extends='aura:template'",
                        "<aura:set attribute='extraScriptTags'>"
                                +
                                "<script src='http://www2.sfdcstatic.com/common/assets/js/min/footer-min.js'></script>"
                                +
                                "</aura:set>"));
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("render='client' template='%s'", templateDesc.getDescriptorName()), ""));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());
        String externalUri = "http://www2.sfdcstatic.com";

        open(uri);

        List<Map<String, Object>> logs = getCspReportLogs(1);
        @SuppressWarnings("unchecked")
        Map<String, Object> cspReport = (Map<String, Object>) logs.get(0).get(CSPReporterServlet.JSON_NAME);

        assertNotNull("No CSP report found", cspReport);
        assertEquals("Unexpected blocked resource", externalUri, cspReport.get(CSPReporterServlet.BLOCKED_URI));
        assertEquals("Unexpected status code", STATUS_OK, cspReport.get(CSPReporterServlet.STATUS_CODE).toString());
        assertDocumentUri(cspReport, uri);
        assertSourceFile(cspReport, null);
        assertViolatedDirective(cspReport, "script-src 'self'");
    }

    /**
     * Automation for the connect-src CSP policy. With connect-src set to 'self', a report should be generated when an
     * XHR is sent to another origin. Note that due to the Access-Control-Allow-Origin header the XHR will fail anyway,
     * but attempting the XHR will still generate the report for testing purposes.
     */
    public void testReportXHRConnect() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "",
                        "<ui:button press='{!c.post}' label='Send XHR' class='button'/>"));
        DefDescriptor<?> helperDesc = Aura.getDefinitionService()
                .getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX,
                        HelperDef.class);
        addSourceAutoCleanup(
                helperDesc,
                "{createHttpRequest: function() {\n" +
                        "    if (window.XMLHttpRequest) {\n" +
                        "        return new XMLHttpRequest();\n" +
                        "    } else if (window.ActiveXObject) {\n" +
                        "        try {\n" +
                        "            return new ActiveXObject(\"Msxml2.XMLHTTP\");\n" +
                        "        } catch (e) {\n" +
                        "            try {\n" +
                        "                return new ActiveXObject(\"Microsoft.XMLHTTP\");\n" +
                        "            } catch (ignore) {\n" +
                        "            }\n" +
                        "        }\n" +
                        "    }\n" +
                        "    return null;\n" +
                        "},\n" +
                        "request: function(url) {\n" +
                        "     var request = this.createHttpRequest();\n" +
                        "     request.open(\"GET\", url, true);\n" +
                        "     request[\"onreadystatechange\"] = function() {\n" +
                        "     if (request[\"readyState\"] == 4 && processed === false) {\n" +
                        "             processed = true;\n" +
                        "         console.log(\"from action callback\");\n" +
                        "         }\n" +
                        "     };\n" +
                        "     request.send();\n" +
                        "}}");

        DefDescriptor<?> controllerDesc = Aura.getDefinitionService()
                .getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX,
                        ControllerDef.class);
        addSourceAutoCleanup(
                controllerDesc,
                "{post:function(c,e,h){h.request(\"http://www.example.com\");}}");
        String externalUri = "http://www.example.com";

        open(cmpDesc);
        auraUITestingUtil.findDomElement(By.cssSelector(".button")).click();

        List<Map<String, Object>> logs = getCspReportLogs(1);
        @SuppressWarnings("unchecked")
        Map<String, Object> cspReport = (Map<String, Object>) logs.get(0).get(
                CSPReporterServlet.JSON_NAME);

        assertNotNull("No CSP report found", cspReport);
        assertEquals("Unexpected blocked resource", externalUri,
                cspReport.get(CSPReporterServlet.BLOCKED_URI));
        assertSourceFile(cspReport, APP_SOURCE_SUFFIX);
        assertViolatedDirective(cspReport, "connect-src 'self'");
    }

    private void assertDocumentUri(Map<String, Object> cspReport, String expectedContains) {
        Object reportedDocumentUri = cspReport.get(CSPReporterServlet.DOCUMENT_URI);
        if (!reportedDocumentUri.toString().contains(expectedContains)) {
            fail(String.format("Unexpected document URI, expected: %s, actual: %s", expectedContains,
                    reportedDocumentUri));
        }
    }

    private void assertSourceFile(Map<String, Object> cspReport, String expectedSuffix) {
        Object reportedSourceFile = cspReport.get(CSPReporterServlet.SOURCE_FILE);
        if (expectedSuffix == null) {
            assertNull(reportedSourceFile);
        } else {
            if (!reportedSourceFile.toString().endsWith(expectedSuffix)) {
                fail(String.format("Unexpected source file, expected: %s, actual: %s", expectedSuffix,
                        reportedSourceFile));
            }
        }
    }

    private void assertViolatedDirective(Map<String, Object> cspReport, String expectedContains) {
        Object reportedViolatedDirective = cspReport.get(CSPReporterServlet.VIOLATED_DIRECTIVE);
        if (!reportedViolatedDirective.toString().contains(expectedContains)) {
            fail(String.format("Unexpected violated directive, expected: %s, actual: %s", expectedContains,
                    reportedViolatedDirective));
        }
    }

    private List<Map<String, Object>> getCspReportLogs(int expectedLogs) throws InterruptedException {
        int waitTime = 30000;
        int waitedFor = 0;
        int interval = 500;

        LoggingAdapter adapter = Aura.get(LoggingAdapter.class);
        if (!(adapter instanceof TestLoggingAdapter)) {
            throw new Error("TestLoggingAdapter not configured!");
        }
        List<Map<String, Object>> cspRecords = Lists.newArrayList();

        // Log lines are published asynchronously, so we have to wait for the logs to be published.
        while (waitedFor < waitTime) {
            List<Map<String, Object>> logs = ((TestLoggingAdapter) adapter).getLogs();
            while (!logs.isEmpty()) {
                Map<String, Object> log = logs.remove(0);
                if (log.containsKey("csp-report")) {
                    cspRecords.add(log);
                    if (cspRecords.size() == expectedLogs) {
                        return cspRecords;
                    }
                }
            }
            Thread.sleep(interval);
            waitedFor += interval;
        }
        fail("Did not find expected number of log lines (expected " + expectedLogs +
                ", found " + cspRecords.size() + ").");
        return cspRecords;
    }
}