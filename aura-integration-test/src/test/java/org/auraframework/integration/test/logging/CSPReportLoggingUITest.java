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
package org.auraframework.integration.test.logging;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertThat;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.spi.LoggingEvent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.StyleDef;
import org.auraframework.http.CSPReporterServlet;
import org.auraframework.impl.test.util.LoggingTestAppender;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;

@TargetBrowsers(BrowserType.GOOGLECHROME)
@UnAdaptableTest("AbstractLoggingUITest has tag @ThreadHostileTest which is not supported in SFDC.")
public class CSPReportLoggingUITest extends AbstractLoggingUITest {
	//Account for feature detection checks in aura:template -> initLocker() to decide if safeEvalWorker is needed
	private static int EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION = 1;

    public CSPReportLoggingUITest(String name) {
        super(name, "LoggingContextImpl");
    }

    @Test
    public void testReportCSPViolationForClientRenderedCSS() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "render='client'",
                        "<link href='http://www2.sfdcstatic.com/common/assets/css/min/standard-rwd-min.css' rel='stylesheet' type='text/css'/>"));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());

        open(uri);
        List<String> logs = getCspReportLogs(appender, 1 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);
        String cspReport = logs.get(0 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);

        String expectedDocumentUri = String.format("%s=%s", CSPReporterServlet.DOCUMENT_URI, getAbsoluteURI(uri));
        assertThat("Could not find expected violated directive", cspReport, containsString(expectedDocumentUri));
        String externalUri = "http://www2.sfdcstatic.com";
        String expectedBlockedUri = String.format("%s=%s", CSPReporterServlet.BLOCKED_URI, externalUri);
        assertThat("Could not find expected blocked URI", cspReport, containsString(expectedBlockedUri));
        String exptectedViolatedDirective = String.format("%s=%s", CSPReporterServlet.VIOLATED_DIRECTIVE, "style-src");
        assertThat("Could not find expected violated directive", cspReport, containsString(exptectedViolatedDirective));
    }

    @Test
    public void testReportCSPViolationForServerRenderedCSS() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseApplicationTag, "render='server'",
                "<link href='http://www2.sfdcstatic.com/common/assets/css/min/standard-rwd-min.css' rel='stylesheet' type='text/css'/>"
                        +
                "<script src='/auraFW/resources/codemirror/lib/codemirror.js'></script>"));
        String uri = String.format("/%s/%s.app", appDesc.getNamespace(), appDesc.getName());

        openNoAura(uri);
        List<String> logs = getCspReportLogs(appender, 1);
        String cspReport = logs.get(0);

        String expectedDocumentUri = String.format("%s=%s", CSPReporterServlet.DOCUMENT_URI, getAbsoluteURI(uri));
        assertThat("Could not find expected violated directive", cspReport, containsString(expectedDocumentUri));
        String externalUri = "http://www2.sfdcstatic.com";
        String expectedBlockedUri = String.format("%s=%s", CSPReporterServlet.BLOCKED_URI, externalUri);
        assertThat("Could not find expected blocked URI", cspReport, containsString(expectedBlockedUri));
        String exptectedViolatedDirective = String.format("%s=%s", CSPReporterServlet.VIOLATED_DIRECTIVE, "style-src");
        assertThat("Could not find expected violated directive", cspReport, containsString(exptectedViolatedDirective));
    }

    @UnAdaptableTest("The CSP filter on SFDC handles iframes differently than standalone Aura")
    @Test
    public void testReportCSPViolationForClientRenderedIframe() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "render='client'",
                        "<iframe src='http://www.salesforce.com'/>"));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());

        open(uri);
        List<String> logs = getCspReportLogs(appender, 1 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);
        String cspReport = logs.get(0 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);

        String expectedDocumentUri = String.format("%s=%s", CSPReporterServlet.DOCUMENT_URI, getAbsoluteURI(uri));
        assertThat("Could not find expected violated directive", cspReport, containsString(expectedDocumentUri));
        String frameUri = "http://www.salesforce.com";
        String expectedBlockedUri = String.format("%s=%s", CSPReporterServlet.BLOCKED_URI, frameUri);
        assertThat("Could not find expected blocked URI", cspReport, containsString(expectedBlockedUri));
        String exptectedViolatedDirective = String.format("%s=%s", CSPReporterServlet.VIOLATED_DIRECTIVE, "frame-src");
        assertThat("Could not find expected violated directive", cspReport, containsString(exptectedViolatedDirective));
    }

    @UnAdaptableTest("The CSP filter on SFDC handles iframes differently than standalone Aura")
    @Test
    public void testReportServerRenderedIframe() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "", "<iframe src='http://www.salesforce.com'/>"));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());

        openNoAura(uri);
        List<String> logs = getCspReportLogs(appender, 1);
        String cspReport = logs.get(0);

        String expectedDocumentUri = String.format("%s=%s", CSPReporterServlet.DOCUMENT_URI, getAbsoluteURI(uri));
        assertThat("Could not find expected violated directive", cspReport, containsString(expectedDocumentUri));
        String frameUri = "http://www.salesforce.com";
        String expectedBlockedUri = String.format("%s=%s", CSPReporterServlet.BLOCKED_URI, frameUri);
        assertThat("Could not find expected blocked URI", cspReport, containsString(expectedBlockedUri));
        String exptectedViolatedDirective = String.format("%s=%s", CSPReporterServlet.VIOLATED_DIRECTIVE, "frame-src");
        assertThat("Could not find expected violated directive", cspReport, containsString(exptectedViolatedDirective));
    }

    /*
     * Fonts are allowed to be loaded from anywhere, so this should NOT generate a report. The test will generate
     * trigger an intentional report after load and we will check that. If there is any report during load should
     * have been received before it.
     */
    @UnAdaptableTest("The font policy on Aura OSS is different with on SFDC")
    @Test
    public void testAllowFontSrc() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", ""));
        addSourceAutoCleanup(
                definitionService.getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                        StyleDef.class),
                "@font-face {font-family: Gentium;src: url(http://example.com/fonts/Gentium.ttf);}");
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());

        open(uri);
        // trigger script violation to generate CSP logs.
        getAuraUITestingUtil().getRawEval("var s=document.createElement('script');s.type='text/javascript';s.async=true;s.src='http://expectedreport.salesforce.com/';document.getElementsByTagName('head')[0].appendChild(s);");

        List<String> logs = getCspReportLogs(appender, 1 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);
        // only grab the first CSP log line. if hitting fonts violation,
        // the log line will only contains fonts violation rather than script violation
        String cspReport = logs.get(0 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);

        String expectedDocumentUri = String.format("%s=%s", CSPReporterServlet.DOCUMENT_URI, getAbsoluteURI(uri));
        assertThat("Could not find expected violated directive", cspReport, containsString(expectedDocumentUri));
        String scriptUri = "http://expectedreport.salesforce.com";
        String expectedBlockedUri = String.format("%s=%s", CSPReporterServlet.BLOCKED_URI, scriptUri);
        assertThat("Could not find expected blocked URI", cspReport, containsString(expectedBlockedUri));
        String exptectedViolatedDirective = String.format("%s=%s", CSPReporterServlet.VIOLATED_DIRECTIVE, "script-src");
        assertThat("Could not find expected violated directive, perhaps fonts wasn't allowed", cspReport, containsString(exptectedViolatedDirective));
    }

    // TODO(W-2903378): re-enable when we are able to inject TestLoggingAdapter.
    @UnAdaptableTest
    @Test
    public void testReportJavaScript() throws Exception {
        // This test loads script via its template, since <script> is not allowed in component markup
        DefDescriptor<ComponentDef> templateDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        "isTemplate='true' extensible='true' extends='aura:template'",
                        "<aura:set attribute='extraScriptTags'>" +
                        "    <script src='http://www2.sfdcstatic.com/common/assets/js/min/footer-min.js'></script>"+
                        "</aura:set>"));
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("render='client' template='%s'", templateDesc.getDescriptorName()), ""));
        String uri = String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName());
        String externalUri = "http://www2.sfdcstatic.com";

        open(uri);
        List<String> logs = getCspReportLogs(appender, 1 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);
        String cspReport = logs.get(0 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);

        String expectedDocumentUri = String.format("%s=%s", CSPReporterServlet.DOCUMENT_URI, getAbsoluteURI(uri));
        assertThat("Could not find expected violated directive", cspReport, containsString(expectedDocumentUri));
        String expectedBlockedUri = String.format("%s=%s", CSPReporterServlet.BLOCKED_URI, externalUri);
        assertThat("Could not find expected blocked URI", cspReport, containsString(expectedBlockedUri));
        String exptectedViolatedDirective = String.format("%s=%s", CSPReporterServlet.VIOLATED_DIRECTIVE, "script-src");
        assertThat("Could not find expected violated directive", cspReport, containsString(exptectedViolatedDirective));
        String exptectedEffectiveDirective = String.format("%s=%s", CSPReporterServlet.EFFECTIVE_DIRECTIVE, "script-src");
        assertThat("Could not find expected violated directive", cspReport, containsString(exptectedEffectiveDirective));
    }

    /**
     * Automation for the connect-src CSP policy. With connect-src set to 'self' and http://invalid.salesforce.com,
     * a report should be generated when an XHR is sent to invalid origin.
     */
    @UnAdaptableTest
    @Test
    public void testReportXHRConnect() throws Exception {
        String externalUri = "http://www.example.com";
        String externalUriString = String.format("'%s'",externalUri);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "","<ui:button press='{!c.post}' label='Send XHR' class='button'/>"));
        DefDescriptor<HelperDef> helperDesc = definitionService.getDefDescriptor(
                cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX, HelperDef.class);
        addSourceAutoCleanup(helperDesc,
                "({\n" +
                "    request: function(url) {\n" +
                "        var request = new XMLHttpRequest();\n" +
                "        request.open(\"GET\", url, true);\n" +
                "        request[\"onreadystatechange\"] = function() {\n" +
                "            if (request[\"readyState\"] == 4) {\n" +
                "                console.log(\"from action callback\");\n" +
                "            }\n" +
                "        };\n" +
                "        request.send();\n" +
                "    }\n" +
                "})");

        DefDescriptor<?> controllerDesc = definitionService.getDefDescriptor(
                cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);
        addSourceAutoCleanup(controllerDesc,"{post:function(c,e,h){h.request("+externalUriString+");}}");
        String uri = getUrl(cmpDesc);

        open(uri);
        getAuraUITestingUtil().findDomElement(By.cssSelector(".button")).click();

        List<String> logs = getCspReportLogs(appender, 1 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);
        String cspReport = logs.get(0 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);

        String expectedDocumentUri = String.format("%s=%s", CSPReporterServlet.DOCUMENT_URI, getAbsoluteURI(uri));
        assertThat("Could not find expected violated directive", cspReport, containsString(expectedDocumentUri));
        String expectedBlockedUri = String.format("%s=%s", CSPReporterServlet.BLOCKED_URI, externalUri);
        assertThat("Could not find expected blocked URI", cspReport, containsString(expectedBlockedUri));
        String exptectedViolatedDirective = String.format("%s=%s", CSPReporterServlet.VIOLATED_DIRECTIVE, "connect-src");
        assertThat("Could not find expected violated directive", cspReport, containsString(exptectedViolatedDirective));
        String exptectedEffectiveDirective = String.format("%s=%s", CSPReporterServlet.EFFECTIVE_DIRECTIVE, "connect-src");
        assertThat("Could not find expected violated directive", cspReport, containsString(exptectedEffectiveDirective));
    }


    /**
     * This is a positive test (and the only positive test in this file).
     * Automation for the connect-src CSP policy.
     * http://invalid.salesforce.com is white-listed, getting it via XHR shouldn't give us CSP error
     */
    @Test
    public void testReportXHRConnectWhitelistedUrl() throws Exception {
        String urlString = "\"http://invalid.salesforce.com\"";
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "",
                        "<ui:button press='{!c.post}' label='Send XHR' class='button'/>"));
        DefDescriptor<?> helperDesc = definitionService.getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX,
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

        DefDescriptor<?> controllerDesc = definitionService.getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX,
                ControllerDef.class);
        addSourceAutoCleanup(
                controllerDesc,
                "{post:function(c,e,h){h.request(" + urlString + ");}}");
        //'http://www.example.com' \"http://www.example.com\"

        appender.clearLogs();
        open(cmpDesc);
        getAuraUITestingUtil().findDomElement(By.cssSelector(".button")).click();

        List<String> cspLogs = getCspReportLogs(appender, 0 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION);
        if(cspLogs.size() != 0 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION) {
            System.out.println("get these logs:");
            for(LoggingEvent le : appender.getLog()) {
                System.out.println(le.getMessage().toString());
            }
        }
        assertEquals("we shouldn't get any csp report, but we get "+cspLogs, 0 + EXPECTED_VIOLATIONS_FOR_SAFE_EVAL_WORKER_FEATURE_DETECTION, cspLogs.size());
    }

    /**
     * check if we get the number of logs we are expecting.
     * @param appender
     * @param expectedLogsSize : needs to be bigger than 0
     * @return
     * @throws InterruptedException
     */
    private List<String> getCspReportLogs(LoggingTestAppender appender, int expectedLogsSize) throws InterruptedException {
        List<String> cspRecords = new ArrayList<>();
        if(expectedLogsSize == 0 ) {
            List<LoggingEvent> logs = appender.getLog();
                while (!logs.isEmpty()) {
                    LoggingEvent log = logs.remove(0);
                    if (log.getMessage().toString().contains(CSPReporterServlet.JSON_NAME)) {
                        cspRecords.add(log.getMessage().toString());
                    }
                }
        } else {
            getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
                    List<LoggingEvent> logs = appender.getLog();
                            while (!logs.isEmpty()) {
                                LoggingEvent log = logs.remove(0);
                                if (log.getMessage().toString().contains(CSPReporterServlet.JSON_NAME)) {
                                    cspRecords.add(log.getMessage().toString());
                                    return cspRecords.size() == expectedLogsSize;
                                }
                        }
                        return false;
                    }
            },
            10,
            "Did not find expected number of log lines (expected " + expectedLogsSize + ", found " + cspRecords.size() + ").");
        }

        return cspRecords;
    }
    
}

