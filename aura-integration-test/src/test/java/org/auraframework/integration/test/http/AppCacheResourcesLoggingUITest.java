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
package org.auraframework.integration.test.http;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.spi.LoggingEvent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.StyleDef;
import org.auraframework.integration.test.logging.AbstractLoggingUITest;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.FreshBrowserInstance;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.html5.AppCacheStatus;
import org.openqa.selenium.support.ui.ExpectedCondition;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

/**
 * Tests for AppCache functionality by watching the requests received at the server and verifying that the updated
 * content is being used by the browser.
 */
@FreshBrowserInstance
@UnAdaptableTest("AbstractLoggingUITest has tag @ThreadHostileTest which is not supported in SFDC.")
public class AppCacheResourcesLoggingUITest extends AbstractLoggingUITest {

    // flag to enable System.out logging during localhost debugging
    private final boolean debug = false;

    // haystack needle to identify changes are used by the client
    private final static String TOKEN = "@@@TOKEN@@@";

    private final static String SRC_COMPONENT =
            "<aura:component>" +
            "    <aura:attribute name='output' type='String'/>" +
            "    <div class='clickableme' onclick='{!c.cssalert}'>@@@TOKEN@@@</div>"+
            "    <div class='attroutput'>{!v.output}</div>" +
            "</aura:component>";

    private final static String SRC_CONTROLLER =
            "({ " +
            "    cssalert: function(c) {" +
            "        function getStyle(elem, style) {" +
            "            var val = '';" +
            "            if(document.defaultView && document.defaultView.getComputedStyle) {" +
            "                val = document.defaultView.getComputedStyle(elem, '').getPropertyValue(style);" +
            "            } else if(elem.currentStyle) {" +
            "                style = style.replace(/\\-(\\w)/g, function (s, ch) {" +
            "                    return ch.toUpperCase();"+
            "                });"+
            "                val = elem.currentStyle[style];" +
            "            }" +
            "            return val;" +
            "        };" +
            "        var style = getStyle(c.getElement(),'background-image');" +
            "        c.set('v.output','@@@TOKEN@@@' + style.substring(style.lastIndexOf('?')+1,style.lastIndexOf(')')-1)"+
            "            + ($A.test ? $A.test.dummyFunction() : '@@@TOKEN@@@'));" +
            "    }" +
            "})";

    public AppCacheResourcesLoggingUITest(String name) {
        super(name, "LoggingContextImpl");
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        getAuraUITestingUtil().setTimeoutInSecs(60);
    }

    private class AppDescription {
        public String appName;
        public String namespace;
        public String cmpName;
        public DefDescriptor<ComponentDef> cmpDesc;
        public DefDescriptor<ControllerDef> controllerDesc;

        public AppDescription() {
            namespace = "appCacheResourcesUITest" + getAuraTestingUtil().getNonce();
            appName = "cacheapplication";
            cmpName = "cachecomponent";

            cmpDesc = createDef(ComponentDef.class,
                    String.format("%s:%s", namespace, cmpName), SRC_COMPONENT);

            controllerDesc = createDef(ControllerDef.class, String.format("%s://%s.%s",
                    DefDescriptor.JAVASCRIPT_PREFIX, namespace, cmpName),
                    SRC_CONTROLLER);

            createDef(
                    ApplicationDef.class,
                    String.format("%s:%s", namespace, appName),
                    String.format("<aura:application useAppcache='true' render='client'>"
                            + "<%s:%s/>" + "</aura:application>", namespace, cmpDesc.getName()));
        }
    }


    /**
     * Opening cached app will only query server for the manifest.
     *
     * BrowserType.SAFARI is disabled: W-2367702
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    @Ignore("W-3320758") // expected set on reload is wrong + what browser requests appears to be wrong. this needs fixing.
    public void _testNoChanges() throws Exception {
        AppDescription app = new AppDescription();
        List<Request> logs = loadMonitorAndValidateApp(app, TOKEN, TOKEN, "", TOKEN, true);
        assertRequests(getExpectedInitialRequests(app), logs);
        assertAppCacheStatus(AppCacheStatus.IDLE);

        // only expect a fetch for the manifest and the initAsync component load
        logs = loadMonitorAndValidateApp(app, TOKEN, TOKEN, "", TOKEN, true);
        List<Request> expected = Lists.newArrayList(new Request("/auraResource", "manifest", 200));
        assertRequests(expected, logs);
        assertAppCacheStatus(AppCacheStatus.IDLE);
    }


    /**
     * Opening cached app after namespace style change will trigger cache update.
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
    @ThreadHostileTest("changing component")
    @Flapper
    @Test
    public void testComponentCssChange() throws Exception {
        AppDescription app = new AppDescription();
        String src_style = ".THIS {background-image: url('/auraFW/resources/qa/images/s.gif?@@@TOKEN@@@');}";
        DefDescriptor<StyleDef> styleDesc = createDef(StyleDef.class,
                String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, app.namespace, app.cmpName), src_style);

        List<Request> logs = loadMonitorAndValidateApp(app, TOKEN, TOKEN, TOKEN, TOKEN, true);

        Request sGif = new Request("/auraFW/resources/qa/images/s.gif", null, 200);
        List<Request> expectedInitialRequests = Lists.newArrayList(getExpectedInitialRequests(app));
        expectedInitialRequests.add(sGif);
        assertRequests(expectedInitialRequests, logs);

        assertAppCacheStatus(AppCacheStatus.IDLE);

        // update a component's css file
        String replacement = getName() + System.currentTimeMillis();
        updateStringSource(styleDesc, src_style.replace(TOKEN, replacement));

        logs = loadMonitorAndValidateApp(app, TOKEN, TOKEN, replacement, TOKEN, true);

        List<Request> expectedChangeRequests = Lists.newArrayList(getExpectedChangeRequests(app));
        expectedChangeRequests.add(sGif);
        assertRequests(expectedChangeRequests, logs);

        assertAppCacheStatus(AppCacheStatus.IDLE);
    }


    /**
     * Opening cached app after namespace controller change will trigger cache update. TODO(W-2955424) : un-comment the
     * last 4 lines, and update what we should be expecting.
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
    @ThreadHostileTest("changing component")
    @Flapper
    @Test
    public void testComponentJsChange() throws Exception {
        AppDescription app = new AppDescription();
        List<Request> logs = loadMonitorAndValidateApp(app, TOKEN, TOKEN, "", TOKEN, true);
        assertRequests(getExpectedInitialRequests(app), logs);
        assertAppCacheStatus(AppCacheStatus.IDLE);
        // update a component's js controller file
        String replacement = getName() + System.currentTimeMillis();
        updateStringSource(app.controllerDesc, SRC_CONTROLLER.replace(TOKEN, replacement));
        logs = loadMonitorAndValidateApp(app, TOKEN, replacement, "", TOKEN, true);
        assertRequests(getExpectedChangeRequests(app), logs);
        assertAppCacheStatus(AppCacheStatus.IDLE);
    }


    /**
     * Opening cached app after component markup change will trigger cache update. TODO(W-2955424) : un-comment the last
     * 4 lines, and update what we should be expecting.
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
    @ThreadHostileTest("depends on cache state")
    @Test
    public void testComponentMarkupChange() throws Exception {
        AppDescription app = new AppDescription();
        List<Request> logs = loadMonitorAndValidateApp(app, TOKEN, TOKEN, "", TOKEN, true);
        assertRequests(getExpectedInitialRequests(app), logs);
        assertAppCacheStatus(AppCacheStatus.IDLE);
        // update markup of namespaced component used by app
        String replacement = getName() + System.currentTimeMillis();
        updateStringSource(app.cmpDesc, SRC_COMPONENT.replace(TOKEN, replacement));
        logs = loadMonitorAndValidateApp(app, replacement, TOKEN, "", TOKEN, true);
        assertRequests(getExpectedChangeRequests(app), logs);
        assertAppCacheStatus(AppCacheStatus.IDLE);
    }


    /**
     * After a source change, appcache will update. This test verifies the relevant storages are cleared when that
     * happens to avoid stale data being persisted in storage.
     *
     * Persistent storage (IndexedDB) is disabled in Safari so only run in Chrome.
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME })
    @ThreadHostileTest("depends on cache state")
    @Test
    public void testStoragesClearedOnAppcacheUpdate() throws Exception {
        AppDescription app = new AppDescription();
        // Override app we load in the test with a custom one that uses a template to setup persistent storage and an
        // inner component to interact with storages.
        app.appName = "cacheapplicationStorage";
        String storageCmpName = "cachecomponentStorage";
        String templateName = "templatecomponentStorage";

        String templateMarkup =
                "<aura:component isTemplate='true' extends='aura:template'>" +
                "    <aura:set attribute='auraPreInitBlock'>" +
                "        <auraStorage:init name='actions' persistent='true' secure='false' clearStorageOnInit='false' debugLoggingEnabled='true' defaultExpiration='60' defaultAutoRefreshInterval='60'/>" +
                "        <auraStorage:init name='ComponentDefStorage' persistent='true' secure='false' clearStorageOnInit='false' debugLoggingEnabled='true' defaultExpiration='60'/>" +
                "    </aura:set>" +
                "</aura:component>";
        DefDescriptor<ComponentDef> templateDesc = createDef(ComponentDef.class,
                String.format("%s:%s", app.namespace, templateName), templateMarkup);

        String cmpMarkup =
                "<aura:component>" +
                "    <aura:attribute name='storageOutput' type='String' default='Waiting'/>" +
                "    <aura:attribute name='status' type='String' default='Pending'/>" +
                "    <ui:button label='Add to storage' class='addToStorage' press='{!c.addToStorage}'/>" +
                "    <ui:button label='Check storage' class='checkStorage' press='{!c.checkStorage}'/>" +
                "    Storage Output: <div class='storageOutput'>{!v.storageOutput}</div>" +
                "    Storage Action Status: <div class='status'>{!v.status}</div>" +
                "</aura:component>";
        DefDescriptor<ComponentDef> storageCmpDesc = createDef(ComponentDef.class,
                String.format("%s:%s", app.namespace, storageCmpName), cmpMarkup);

        String controllerJs =
                "({" +
                "    addToStorage: function(cmp) { " +
                "        cmp.set('v.status', 'Pending');" +
                "        $A.storageService.getStorage('actions').set('testkey','testvalue')" +
                "            .then(function(){" +
                "                return $A.storageService.getStorage('ComponentDefStorage').set('testkey','{2:1}');" +
                "            }).then(function() {" +
                "                cmp.set('v.storageOutput','Storage Done');" +
                "                cmp.set('v.status','Done');" +
                "            })" +
                "            ['catch'](function(err){ cmp.set('v.storageOutput','Storage Failed ' + err.toString())});" +
                "    }," +
                "    checkStorage: function(cmp) {" +
                "        cmp.set('v.status', 'Pending');" +
                "        var findKey = function(name) {" +
                "            return $A.storageService.getStorage(name).getAll()" +
                "                .then(function(items) {" +
                "                    if (!items['testkey']) {" +
                "                        return Promise.reject('Cache miss');" +
                "                    }" +
                "                });" +
                "        };" +
                "        findKey('actions')" +
                "            .then(function() {" +
                "                return findKey('ComponentDefStorage');" +
                "            })" +
                "            .then(function(){" +
                "                cmp.set('v.storageOutput', 'Cache hit');" +
                "                cmp.set('v.status', 'Done');" +
                "            })" +
                "            ['catch'](function(err) { " +
                "                cmp.set('v.storageOutput', err);" +
                "                cmp.set('v.status', 'Done');" +
                "            });" +
                "    }"+
                "})";
        createDef(ControllerDef.class, String.format("%s://%s.%s", DefDescriptor.JAVASCRIPT_PREFIX, app.namespace, storageCmpName),
                controllerJs);

        String appMarkup = String.format(
                "<aura:application useAppcache='true' render='client' template='%s:%s'>" +
                "    <%s:%s/> <%s:%s/>" +
                "</aura:application>",
                app.namespace, templateDesc.getName(),
                app.namespace, app.cmpName, app.namespace, storageCmpDesc.getName());
        createDef(ApplicationDef.class, String.format("%s:%s", app.namespace, app.appName), appMarkup);

        loadMonitorAndValidateApp(app, TOKEN, TOKEN, "", TOKEN, true);

        // Add stuff to storage
        WebElement addStorageButton = findDomElement(By.cssSelector(".addToStorage"));
        waitForStorage(addStorageButton, "Storage Done", "Failed to add items to storage");

        // Verify items actually added to storage
        WebElement checkStorageButton = findDomElement(By.cssSelector(".checkStorage"));
        waitForStorage(checkStorageButton, "Cache hit", "Item never added to actions storage");

        // Update markup of component used by app and reload
        String replacement = getName() + System.currentTimeMillis();
        updateStringSource(app.cmpDesc, SRC_COMPONENT.replace(TOKEN, replacement));
        loadMonitorAndValidateApp(app, replacement, TOKEN, "", TOKEN, true);

        // appcache update takes a while. Wait here to avoid repeatedly clicking.
        Thread.sleep(1000);
        // Verify caches cleared
        checkStorageButton = findDomElement(By.cssSelector(".checkStorage"));
        waitForStorage(checkStorageButton, "Cache miss", "Actions cache never cleared on appcache update");
    }

    private void waitForStorage(WebElement clickableElement, final String waitForText, String failMessage) {
        getAuraUITestingUtil().waitUntil(new Function<WebDriver, String>() {
            @Override
            public String apply(WebDriver input) {
                clickableElement.click();
                getAuraUITestingUtil().waitForElementText(By.cssSelector("div.status"), "Done", true);

                try {
                    String text = findDomElement(By.cssSelector("div.storageOutput")).getText();
                    if (text.equals(waitForText)) {
                        return text;
                    }
                } catch (StaleElementReferenceException e) {
                    // could happen before the click or if output is rerendering
                }
                return null;
            }
        }, failMessage);
    }

    private <T extends Definition> DefDescriptor<T> createDef(Class<T> defClass, String qualifiedName, String content) {
        DefDescriptor<T> desc = definitionService.getDefDescriptor(qualifiedName, defClass);
        addSourceAutoCleanup(desc, content);
        return desc;
    }

    private void assertAppCacheStatus(final AppCacheStatus status) {
        getAuraUITestingUtil().waitUntil(
                new Function<WebDriver, Boolean>() {
                    @Override
                    public Boolean apply(WebDriver input) {
                        String script = "return window.applicationCache.status;";
                        int appCacheStatus = Integer.parseInt(getAuraUITestingUtil().getEval(script).toString());
                        return status == AppCacheStatus.getEnum(appCacheStatus);
                    }
                },
                "applicationCache.status was not " + status.name());
    }

    /**
     * this function will check each request in actual list against expected list. fudge is the number this request
     * suppose to show up. we remove the request from expected list once it has been visited #fudge times. any missing
     * request will be added to missingRequests list.
     *
     * @param expected : list of expected request
     * @param actual : list of actual request captured by log
     * @throws Exception
     */
    private void assertRequests(List<Request> expected, List<Request> actual) throws Exception {
        boolean failed;

        List<Request> unexpectedRequests = Lists.newArrayList();
        List<Request> expectedRequests = Lists.newArrayList(expected);
        List<Request> missingRequests = Lists.newArrayList();
        for (Request r : actual) {
            int idx = expectedRequests.indexOf(r);
            if (idx != -1) {
                if (expectedRequests.get(idx).mark()) {
                    expectedRequests.remove(idx);
                }
            } else {
            	if (!r.get("URI").endsWith("/lockerservice/safeEval.html")) {
            		unexpectedRequests.add(r);
            	}
            }
        }
        for (Request r : expectedRequests) {
            if (!r.passed()) {// return fudge > 0 && count > 0;
                missingRequests.add(r);
            }
        }

        failed = unexpectedRequests.size() > 0 || missingRequests.size() > 0;

        if (debug || failed) {
            System.out.println(">>> assertRequests: ");
            System.out.println("EXPECTED:");
            for (Request r : expected) {
                System.out.println("E: " + r + ",fudge:" + r.fudge);
            }
            System.out.println("ACTUAL:");
            for (Request r : actual) {
                r.setShowExtras(failed);
                System.out.println("A: " + r);
            }
        }
        if (failed) {
            StringBuffer sb = new StringBuffer();
            String separator = "";

            if (unexpectedRequests.size() > 0) {
                sb.append("Unexpected requests:\n");
                sb.append(unexpectedRequests);
                separator = "\n";
            }
            if (missingRequests.size() > 0) {
                sb.append(separator);
                sb.append("Missing Requests:\n");
                sb.append(missingRequests);
            }
            fail(sb.toString());
        }
    }

    /**
     * Load and get all the log lines for the app load. Some sanity checks that our simple test app is functional after
     * cache resolutions.
     * <ul>
     * <li>updated markup text is rendered (markupToken)</li>
     * <li>updated client actions functional (jsToken)</li>
     * <li>updated styling applied (cssToken)</li>
     * <li>updated framework called (fwToken)</li>
     * </ul>
     *
     * @param markupToken The text to be found in the markup.
     * @param jsToken The text to be found from js
     * @param cssToken The text to be found from css.
     * @param fwToken The text to be found from the framework.
     */
    private List<Request> loadMonitorAndValidateApp(final AppDescription app, final String markupToken,
            String jsToken, String cssToken, String fwToken, boolean waitForAura) throws Exception {

        appender.clearLogs();
        // Opening a page through WebDriverTestCase adds a nonce to ensure fresh resources. In this case we want to see
        // what's cached, so build our URL and call WebDriver.get() directly.
        String url = getUrl(app);
        Map<String, String> params = new HashMap<>();
        params.put("aura.mode", getAuraModeForCurrentBrowser().toString());
        url = getAbsoluteURI(addUrlParams(url, params)).toString();

        if(waitForAura) {
            open(url);
        } else {
            getDriver().get(url);
        }

        getAuraUITestingUtil().waitUntilWithCallback(new Function<WebDriver, Integer>() {
                @Override
                public Integer apply(WebDriver input) {
                    String script = "return window.applicationCache.status;";
                    int appCacheStatus = Integer.parseInt(getAuraUITestingUtil().getEval(script).toString());
                    if (appCacheStatus != AppCacheStatus.DOWNLOADING.value() && appCacheStatus != AppCacheStatus.CHECKING.value()) {
                        return appCacheStatus;
                    } else {
                        return null;
                    }
                }
            },
            new ExpectedCondition<String>() {
                @Override
                public String apply(WebDriver d) {
                    String script = "return window.applicationCache.status;";
                    int appCacheStatus = Integer.parseInt(getAuraUITestingUtil().getEval(script).toString());

                    return "Current AppCache status is: " + AppCacheStatus.getEnum(appCacheStatus).toString();
                }
            },
            10,
            "Application cache status is stuck on Downloading or Checking.");

        getAuraUITestingUtil().waitUntil(new Function<WebDriver, WebElement>() {
                @Override
                public WebElement apply(WebDriver input) {
                    try {
                        WebElement find = findDomElement(By.cssSelector(".clickableme"));
                        if (markupToken.equals(find.getText())) {
                            return find;
                        }
                    } catch (StaleElementReferenceException e) {
                        // slight chance of happening between the findDomElement and getText
                    }
                    return null;
                }
            },
            "fail to load clickableme");
        Thread.sleep(200);
        List<Request> logs = parseLogs(appender.getLog());

        String output = getAuraUITestingUtil().waitUntil(new Function<WebDriver, String>() {
                @Override
                public String apply(WebDriver input) {
                    try {
                        WebElement find = findDomElement(By.cssSelector(".clickableme"));
                        find.click();
                        WebElement outputEl = findDomElement(By.cssSelector("div.attroutput"));
                        return outputEl.getText();
                    } catch (StaleElementReferenceException e) {
                        // could happen before the click or if output is
                        // rerendering
                    }
                    return null;
                }
            }, "fail to click on clickableme or couldn't locate output value");

        String expected = String.format("%s%s%s", jsToken, cssToken, fwToken);
        assertEquals("Unexpected alert text", expected, output);

        appender.clearLogs();
        return logs;
    }

    /**
     *
     * @return url of test app, looks like this "/appCacheResourcesUITest1456791509755/cacheapplication.app", where
     *         1456791509755 is a nonce
     */
    private String getUrl(AppDescription app) {
        return String.format("/%s/%s.app", app.namespace, app.appName);
    }

    /**
     * This is a parser function. log we get looks like this: auraRequestURI: /auraResource;auraRequestQuery:
     * aura.format=css&aura.context={"mode":"SELENIUM","app":"appCacheResourcesUITest1456791509755:cacheapplication",
     * "fwuid":"zKeYfSKoRXBpmic1IVMhXA","loaded":{
     * "APPLICATION@markup://appCacheResourcesUITest1456791509755:cacheapplication":"SzdCQENYrJ4SPJGNxpzPLQ"},
     * "styleContext":{"c":"webkit"}}&aura.type=app;cmpCount: 0;defCount: 49;requestMethod: GET;httpStatus:
     * 200;defDescriptorCount: 0; we parse it into list of Request like this: httpStatus=200, format=null,
     * URI=/appCacheResourcesUITest1456865997501/cacheapplication.app
     *
     * @param loggingEvents
     * @return
     */
    private List<Request> parseLogs(List<LoggingEvent> loggingEvents) {
        List<Request> logs = Lists.newLinkedList();

        String message;
        for (LoggingEvent le : loggingEvents) {
            message = le.getMessage().toString();
            if (message.contains("requestMethod: GET")) {
                Request toAdd;
                String auraRequestURI = "";
                String auraRequestQuery = "";
                int httpStatus = -1;
                for (String part : message.split(";")) {
                    // httpStatus: 200
                    if (part.startsWith("httpStatus")) {
                        httpStatus = Integer.parseInt(part.substring(part.indexOf(":") + 2, part.length()));
                    }
                    // auraRequestURI: /auraResource
                    if (part.startsWith("auraRequestURI")) {
                        auraRequestURI = part.substring(part.indexOf(":") + 2, part.length());
                    }
                    // auraRequestQuery:
                    // aura.format=manifest&aura.context={"mode":"SELENIUM","app":"appCacheResourcesUITest1456791509755:cacheapplication"}&aura.type=app
                    if (part.startsWith("auraRequestQuery")) {
                        auraRequestQuery = part.substring(part.indexOf(":") + 2, part.length());
                    }
                }
                if (auraRequestURI.length() > 0 && auraRequestQuery.length() > 0 && httpStatus != -1) {
                    toAdd = new Request(auraRequestURI, null, httpStatus);// create request with format=null
                    for (String qpart : auraRequestQuery.split("&")) {
                        if (qpart.startsWith("aura.format")) {// then update it with format, for example,
                                                              // aura.format=manifest
                            String[] qpartParameters = qpart.split("=", 2);
                            String v = qpartParameters[1];
                            toAdd.put("format", (v != null && !v.isEmpty()) ? v : null);
                        }
                    }
                    logs.add(toAdd);
                }
            } else {
                if (debug) {
                    // Log ignored lines so that we can monitor what happens. The line above had nulls as requestMethod,
                    // so this catches randomness.
                    System.out.println("IGNORED: " + message);
                }
                continue;
            }
        }
        return logs;
    }

    /**
     * Get the set of expected requests on change. These are the requests that we expect for filling the app cache.
     *
     * @return the list of request objects, not necessarily in order.
     */
    private List<Request> getExpectedChangeRequests(AppDescription app) {
        switch (getBrowserType()) {
            case GOOGLECHROME:
                /*
                 * For Chrome Get the set of expected requests on change. These are the requests that we expect for filling
                 * the app cache. The explanation is as follows. <ul> <li>The manifest is pulled</li> <li>The browser now
                 * gets all three components, initial, css, and js</li> <li>Finally, the browser re-fetches the manifest to
                 * check contents</li> <ul> The primary difference between this and the initial requests is that we don't
                 * get the initial page twice, and we get the manifest three times... odd that. we usually only get js and
                 * css only once, but it's not stable, do see some test get them twice sometimes.
                 */
                return ImmutableList.of(
                        new Request(2, getUrl(app), null, 200), // reload
                        new Request(5, "/auraResource", "manifest", 200),
                        new Request(2, "/auraResource", "css", 200),
                        new Request(4, "/auraResource", "js", 200));
            default:
                /*
                 * For iOS Get the set of expected requests on change. These are the requests that we expect for filling the
                 * app cache. The explanation is as follows. <ul> <li>The manifest is pulled</li> <li>The browser now gets
                 * all three components, initial, css, and js</li> <li>Finally, the browser re-fetches the manifest to check
                 * contents</li> <ul> The primary difference between this and the initial requests is that we get the
                 * initial page twice
                 */
                return ImmutableList.of(
                        new Request(getUrl(app), null, 200), // reload
                        new Request("/auraResource", "manifest", 200),
                        new Request(2, "/auraResource", "css", 200),
                        new Request(4, "/auraResource", "js", 200));
        }
    }

    /**
     * Get the set of expected requests on change. These are the requests that we expect for filling the app cache.
     *
     * @return the list of request objects, not necessarily in order.
     */
    private List<Request> getExpectedInitialRequests(AppDescription app) {
        switch (getBrowserType()) {
            case GOOGLECHROME:
                /*
                 * For Chrome Get the set of expected initial requests. These are the requests that we expect for filling
                 * the app cache. The explanation is as follows. <ul> <li>The browser requests the initial page from the
                 * server</li> <li>The manifest is pulled</li> <li>The browser now gets all three components, initial, css,
                 * and js</li> <li>Finally, the browser re-fetches the manifest to check contents</li> <ul> Note that there
                 * are two requests for the initial page, one as the first request, and one to fill the app cache (odd, but
                 * true). There are also two manifest requests.
                 */
                return ImmutableList.of(new Request(2, getUrl(app), null, 200),
                        new Request(2, "/auraResource", "manifest", 200),
                        new Request(2, "/auraResource", "css", 200),
                        new Request(4, "/auraResource", "js", 200));
            default:
                /*
                 * For iOS Get the set of expected requests on change. These are the requests that we expect for filling the
                 * app cache. The explanation is as follows. <ul> <li>The manifest is pulled</li> <li>The browser now gets
                 * all three components, initial, css, and js</li> <li>Finally, the browser re-fetches the manifest to check
                 * contents</li> <ul> Note that there are also two css and js request.
                 */
                return ImmutableList.of(new Request(1, getUrl(app), null, 200),
                        new Request(1, "/auraResource", "manifest", 200),
                        new Request(2, "/auraResource", "css", 200),
                        new Request(4, "/auraResource", "js", 200));
        }
    }

    /**
     * A request object, which can either be an 'expected' request, or an 'actual' request. Expected requests can also
     * have a fudge factor allowing multiple requests for the resource. This is very helpful for different browsers
     * doing different things with the manifest. We allow multiple fetches of both the manifest and initial page in both
     * the initial request and the requests on change of resource.
     */
    static class Request extends HashMap<String, String> {
        private static final long serialVersionUID = 4149738936658714181L;
        private static final ImmutableSet<String> validKeys = ImmutableSet.of("URI", "format", "httpStatus");

        private final int fudge;
        private int count = 0;
        private Map<String, String> extras = null;
        private boolean showExtras = false;

        Request(int fudge, String URI, String format, int status) {
            // TODO - when format=js need to add the js file actually being requested
            // eg inline.js vs bootstrap.js. these are new in 206 and need to be checked
            // for explicitly when appcache is on vs off.
            super();
            this.fudge = fudge;
            put("URI", URI);
            put("format", format);
            if (status != -1) {
                put("httpStatus", String.valueOf(status));
            }
        }

        Request(String URI, String format, int status) {
            super();
            this.fudge = 0;
            put("URI", URI);
            put("format", format);
            if (status != -1) {
                put("httpStatus", String.valueOf(status));
            }
        }

        @Override
        public String put(String k, String v) {
            if (validKeys.contains(k)) {
                return super.put(k, v);
            } else {
                if (extras == null) {
                    extras = new HashMap<>();
                }
                extras.put(k, v);
            }
            return null;
        }

        /**
         * We passed the test for this request.
         *
         * @return true if we got the request. each request from expected list must show up at least once in the actual
         *         list.
         */
        public boolean passed() {
            return fudge > 0 && count > 0;
        }

        /**
         * Mark the request as found.
         *
         * @return true if it should be removed.count > fudge: browsers don't behave consistently. better have a loose
         *         bound here. we are comparing two requests list: actual list and expected list. count start at 0, we
         *         are expecting 1,2,..,fudge, or fudge+1 request. once we have some request X that show up fudge+1 in
         *         actual list, X get removed from expected list. then if we receive another X again, it will be added
         *         to unexpected requests list and error out.
         */
        public boolean mark() {
            if (fudge == 0) {
                return true;
            } else {
                count += 1;
                return count > fudge;
            }
        }

        public void setShowExtras(boolean value) {
            this.showExtras = value;
        }

        @Override
        public String toString() {
            if (extras == null || !showExtras) {
                return super.toString();
            } else {
                return super.toString() + String.valueOf(extras);
            }
        }
    }
}