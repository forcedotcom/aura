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

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.NamespaceDef;
import org.auraframework.def.StyleDef;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Source;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.annotation.FreshBrowserInstance;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.controller.TestLoggingAdapterController;
import org.auraframework.util.AuraTextUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

/**
 * Tests for AppCache functionality by watching the requests received at the server and verifying that the updated
 * content is being used by the browser. AppCache only works for WebKit browsers.
 * 
 * @since 0.0.224
 */
@FreshBrowserInstance
@ThreadHostileTest("TestLoggingAdapter not thread-safe")
public class AppCacheResourcesUITest extends WebDriverTestCase {

    private final static String COOKIE_NAME = "%s_%s_%s_lm";
    private final static String TOKEN = "@@@TOKEN@@@";

    private static final String AURA = "aura";

    private enum Status {
        UNCACHED, IDLE, CHECKING, DOWNLOADING, UPDATEREADY, OBSOLETE;
    }

    private String appName;
    private String namespace;
    private String cmpName;

    public AppCacheResourcesUITest(String name) {
        super(name);
        timeoutInSecs = 60;
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        namespace = "appCacheResourcesUITest" + getAuraTestingUtil().getNonce();
        appName = "cacheapplication";
        cmpName = "cachecomponent";

        DefDescriptor<ComponentDef> cmpDesc = createDef(ComponentDef.class, String.format("%s:%s", namespace, cmpName),
                "<aura:component>" 
                		+ "<aura:attribute name='output' type='String'/>"
                        + "<div class='clickableme' onclick='{!c.cssalert}'>@@@TOKEN@@@</div>"
                        + "<div class='attroutput'>{!v.output}</div>" 
        		+"</aura:component>");

        createDef(
                ControllerDef.class, String.format("%s://%s.%s", DefDescriptor.JAVASCRIPT_PREFIX, namespace, cmpName),
                "{ cssalert:function(c){"
                        + "function getStyle(elem, style){"
                        + "var val = '';"
                        + "if(document.defaultView && document.defaultView.getComputedStyle){"
                        + "val = document.defaultView.getComputedStyle(elem, '').getPropertyValue(style);"
                        + "} else if(elem.currentStyle){"
                        + "style = style.replace(/\\-(\\w)/g, function (s, ch){"
                        + "return ch.toUpperCase();"
                        + "});"
                        + "val = elem.currentStyle[style];"
                        + "}"
                        + "return val;"
                        + "};"
                        + "var style = getStyle(c.getElement(),'background-image');"
                        + "c.getValue('v.output').setValue('@@@TOKEN@@@'"
                        + "+ style.substring(style.lastIndexOf('?')+1,style.lastIndexOf(')'))"
                        + "+ ($A.test ? $A.test.dummyFunction() : '@@@TOKEN@@@'));"
                        + "}}");

        createDef(
                ApplicationDef.class,
                String.format("%s:%s", namespace, appName),
                String.format("<aura:application useAppcache='true' render='client' preload='%s'"
                        + " securityProvider='java://org.auraframework.java.securityProvider.LaxSecurityProvider'>"
                        + "<%s:%s/>" + "</aura:application>", namespace, namespace, cmpDesc.getName()));
    }

    /**
     * Opening cached app will only query server for the manifest and the component load.
     */
    @TargetBrowsers({  BrowserType.GOOGLECHROME,  BrowserType.SAFARI,   BrowserType.IPAD, BrowserType.IPHONE })
    @TestLabels("auraSanity")
    public void testNoChanges() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        // only expect a fetch for the manifest and the initAsync component load
        logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        List<Request> expected = Lists.newArrayList(new Request(
                "/auraResource", null, null, "manifest", 200));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    /**
     * Opening cached app that had a prior cache error will reload the app.
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI,  BrowserType.IPAD, BrowserType.IPHONE })
    @TestLabels("auraSanity")
    public void testCacheError() throws Exception {
    	//debug for flapper:
    	System.out.println("testCacheError,loadMonitorAndValidateApp, TS:"+System.currentTimeMillis());
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);
        Date expiry = new Date(System.currentTimeMillis() + 60000);
        String cookieName = getManifestCookieName();
        getDriver().manage().addCookie(
                new Cookie(cookieName, "error", null, "/", expiry));
        //debug for flapper:
        System.out.println("testCacheError,add error cookie, loadMonitorAndValidateApp again, TS:"+System.currentTimeMillis());
        logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        List<Request> expectedChange = Lists.newArrayList();
        expectedChange.add(new Request("/auraResource", null, null, "manifest", 404)); // reset
        expectedChange.add(new Request("/aura", namespace + ":" + appName, null, "HTML", 302)); // hard refresh
        switch (getBrowserType()) {
        case GOOGLECHROME:
            expectedChange.add(new Request(3, "/auraResource", null, null, "manifest", 200));
            expectedChange.add(new Request(2, "/aura", namespace + ":" + appName, null, "HTML", 200));
            break;
        case SAFARI:
        case IPAD:
        case IPHONE:
        default:
            expectedChange.add(new Request("/auraResource", null, null, "manifest", 200));
            expectedChange.add(new Request("/aura", namespace + ":" + appName, null, "HTML", 200));
            expectedChange.add(new Request("/auraResource", null, null, "css", 200));
            expectedChange.add(new Request("/auraResource", null, null, "js", 200));
        }
        assertRequests(expectedChange, logs);
        assertAppCacheStatus(Status.IDLE);
        // There may be a varying number of requests, depending on when the
        // initial manifest response is received.
        Cookie cookie = getDriver().manage().getCookieNamed(cookieName);
        assertFalse("Manifest cookie was not changed " + cookie.getValue(), "error".equals(cookie.getValue()));
    }
    /**
     * for Chrome and Safari/IPAD/IPHONE Opening uncached app that had a prior cache error will have limited caching
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI,  BrowserType.IPAD, BrowserType.IPHONE })
    public void testCacheErrorWithEmptyCache() throws Exception {
    	//debug for flapper:
    	System.out.println("testCacheErrorWithEmptyCache,open aura/application.app, TS:"+System.currentTimeMillis());
        openNoAura("/aura/application.app"); // just need a domain page to set cookie from
        Date expiry = new Date(System.currentTimeMillis() + 60000);
        String cookieName = getManifestCookieName();
        getDriver().manage().addCookie(
                new Cookie(cookieName, "error", null, "/", expiry));
        //debug for flapper:
        System.out.println("testCacheErrorWithEmptyCache,loadMonitorAndValidateApp,TS:"+System.currentTimeMillis());
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        List<Request> expectedChange = Lists.newArrayList();
        expectedChange.add(new Request("/auraResource", null, null, "manifest", 404)); // reset
        expectedChange.add(new Request("/aura", namespace + ":" + appName, null, "HTML", 200));
        expectedChange.add(new Request("/auraResource", null, null, "css", 200));
        expectedChange.add(new Request("/auraResource", null, null, "js", 200));
        assertRequests(expectedChange, logs);
        assertAppCacheStatus(Status.UNCACHED);
        // There may be a varying number of requests, depending on when the
        // initial manifest response is received.
        Cookie cookie = getDriver().manage().getCookieNamed(cookieName);
        assertNull("No manifest cookie should be present", cookie);
    }

    /**
     * Manifest request limit exceeded for the time period should result in reset.
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI,  BrowserType.IPAD, BrowserType.IPHONE })
    public void testManifestRequestLimitExceeded() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        Date expiry = new Date(System.currentTimeMillis() + 60000);
        String cookieName = getManifestCookieName();
        Cookie cookie = getDriver().manage().getCookieNamed(cookieName);
        String timeVal = cookie.getValue().split(":")[1];
        getDriver().manage().addCookie(new Cookie(cookieName, "8:" + timeVal, null, "/", expiry));
        logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        List<Request> expectedChange = Lists.newArrayList();

        expectedChange.add(new Request("/auraResource", null, null, "manifest", 404)); // reset
        expectedChange.add(new Request("/aura", namespace + ":" + appName, null, "HTML", 302)); // hard refresh
        switch (getBrowserType()) {
        case GOOGLECHROME:
            expectedChange.add(new Request(3, "/auraResource", null, null, "manifest", 200));
            expectedChange.add(new Request(2, "/aura", namespace + ":" + appName, null, "HTML", 200));
            break;
        case SAFARI:
        case IPAD:
        case IPHONE:
        default:
            expectedChange.add(new Request("/auraResource", null, null, "manifest", 200));
            expectedChange.add(new Request("/aura", namespace + ":" + appName, null, "HTML", 200));
            expectedChange.add(new Request("/auraResource", null, null, "css", 200));
            expectedChange.add(new Request("/auraResource", null, null, "js", 200));
        }
        assertRequests(expectedChange, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    /**
     * Opening cached app after namespace style change will trigger cache update.
     */
    @ThreadHostileTest("NamespaceDef modification affects namespace")
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
    public void testComponentCssChange() throws Exception {
    	//debug for flapper:
    	System.out.println("testComponentCssChange begins TS:"+System.currentTimeMillis());
        createDef(NamespaceDef.class, String.format("%s://%s", DefDescriptor.MARKUP_PREFIX, namespace),
                "<aura:namespace></aura:namespace>");

        createDef(StyleDef.class, String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, namespace, cmpName),
                ".THIS {background-image: url(/auraFW/resources/qa/images/s.gif?@@@TOKEN@@@);}");

        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        // update a component's css file
        String replacement = getName() + System.currentTimeMillis();
      
        replaceToken(getTargetComponent().getStyleDescriptor(), replacement);
      
        //debug for flapper:
        System.out.println("testComponentCssChange load app again, TS:"+System.currentTimeMillis());
        logs = loadMonitorAndValidateApp(TOKEN, TOKEN, replacement, TOKEN);
        
        assertRequests(getExpectedChangeRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        logs = loadMonitorAndValidateApp(TOKEN, TOKEN, replacement, TOKEN);
        List<Request> expected = Lists.newArrayList(new Request("/auraResource", null, null, "manifest", 200));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    /**
     * Opening cached app after namespace controller change will trigger cache update.
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
    public void testComponentJsChange() throws Exception {
    	System.out.println("++++++testComponentJsChange begins,TS:"+System.currentTimeMillis());
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);
        // update a component's js controller file
        String replacement = getName() + System.currentTimeMillis();
        DefDescriptor<?> desc = null;
        for (DefDescriptor<?> cd : getTargetComponent().getControllerDefDescriptors()) {
            System.out.println("is " + cd.toString() + " a js descriptor?");
            if ("js".equals(cd.getPrefix())) {
                desc = cd;
                break;
            }
        }
      //debug for flapper:
        System.out.println("++++++testComponentJsChange replace token,TS:"+System.currentTimeMillis());
        replaceToken(desc, replacement);
      //debug for flapper:
        System.out.println("++++++testComponentJsChange loadMonitorAndValidateApp,TS:"+System.currentTimeMillis());
        logs = loadMonitorAndValidateApp(TOKEN, replacement, "", TOKEN);
        //debug for flapper:
        System.out.println("++++++we did hard refresh without appending url with 'nochache':"
        +auraUITestingUtil.getBooleanEval("return !!document._hardRefreshWOUrlAppendFlag"));
        assertRequests(getExpectedChangeRequests(), logs);
        assertAppCacheStatus(Status.IDLE);
        logs = loadMonitorAndValidateApp(TOKEN, replacement, "", TOKEN);
        List<Request> expected = Lists.newArrayList(new Request("/auraResource", null, null, "manifest", 200));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    /**
     * Opening cached app after component markup change will trigger cache update.
     */
    @TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.SAFARI,  BrowserType.IPAD, BrowserType.IPHONE })
    public void testComponentMarkupChange() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, "", TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);
        // update markup of namespaced component used by app
        String replacement = getName() + System.currentTimeMillis();
        //debug for flapper:
        System.out.println("testComponentMarkupChange replace token,TS:"+System.currentTimeMillis());
        replaceToken(getTargetComponent().getDescriptor(), replacement);
        //debug for flapper:
        System.out.println("testComponentMarkupChange  reload app,TS:"+System.currentTimeMillis());
        logs = loadMonitorAndValidateApp(replacement, TOKEN, "", TOKEN);
        //debug for flapper:
        System.out.println("++++++++we did hard refresh without appending url with 'nochache':"
        +auraUITestingUtil.getBooleanEval("return !!document._hardRefreshWOUrlAppendFlag"));
        assertRequests(getExpectedChangeRequests(), logs);
        assertAppCacheStatus(Status.IDLE);
        logs = loadMonitorAndValidateApp(replacement, TOKEN, "", TOKEN);
        List<Request> expected = Lists.newArrayList(new Request("/auraResource", null, null, "manifest", 200));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    private <T extends Definition> DefDescriptor<T> createDef(Class<T> defClass, String qualifiedName, String content) {
        DefDescriptor<T> desc = Aura.getDefinitionService().getDefDescriptor(qualifiedName, defClass);
        addSourceAutoCleanup(desc, content);
        return desc;
    }

    private String getManifestCookieName() {
        return String.format(COOKIE_NAME, getAuraModeForCurrentBrowser().toString(), namespace, appName);
    }

    private void assertAppCacheStatus(Status status) {
        Status actual = Status.values()[Integer.parseInt(auraUITestingUtil.getEval(
                "return window.applicationCache.status;").toString())];
        assertEquals("Unexpected status", status.name(), actual.name());
    }

    // provide a test component with TOKENs for replacement to trigger lastMod updates
    private ComponentDef getTargetComponent() throws Exception {
        ContextService service = Aura.getContextService();
        AuraContext context = service.getCurrentContext();
        if (context == null) {
            context = service.startContext(Mode.SELENIUM, Format.HTML, Access.AUTHENTICATED);
        }
        return Aura.getDefinitionService().getDefinition(
                String.format("%s:%s", namespace, cmpName), ComponentDef.class);
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
                unexpectedRequests.add(r);
            }
        }
        for (Request r : expectedRequests) {
            if (!r.passed()) {// return fudge > 0 && count > 0;
                missingRequests.add(r);
            }
        }

        failed = unexpectedRequests.size() > 0 || missingRequests.size() > 0;
        
        
        System.out.println(">>> assertRequests: ");
        System.out.println("EXPECTED:");
        for (Request r : expected) {
            System.out.println("E: " + r + ",fudge:"+r.fudge);
        }
        System.out.println("ACTUAL:");
        for (Request r : actual) {
            r.setShowExtras(failed);
            System.out.println("A: " + r);
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
     * @param Token The text to be found from the framework.
     */
    private List<Request> loadMonitorAndValidateApp(final String markupToken, String jsToken, String cssToken,
            String fwToken) throws Exception {
    	System.out.println("loadMonitorAndValidateApp,logging adapter start capturing,"
    			+"open "+namespace+"/"+appName+", TS:"+System.currentTimeMillis());
        TestLoggingAdapterController.beginCapture();
        open(String.format("/%s/%s.app", namespace, appName));
        
        WebElement elem = auraUITestingUtil
                .waitUntil(new Function<WebDriver, WebElement>() {
                    @Override
                    public WebElement apply(WebDriver input) {
                        WebElement find = findDomElement(By
                                .cssSelector(".clickableme"));
                        if (markupToken.equals(find.getText())) {
                            return find;
                        }
                        return null;
                    }
                });
        List<Request> logs = endMonitoring();
        
        elem.click();
        WebElement output = findDomElement(By.cssSelector("div.attroutput"));
        assertEquals("Unexpected alert text",
                String.format("%s%s%s", jsToken, cssToken, fwToken),
                output.getText());
        
        return logs;
    }

    // replaces TOKEN found in the source file with the provided replacement
    private void replaceToken(DefDescriptor<?> descriptor, String replacement) throws Exception {
        assertNotNull("Missing descriptor for source replacement!", descriptor);
        ContextService service = Aura.getContextService();
        AuraContext context = service.getCurrentContext();
        if (context == null) {
            context = service.startContext(Mode.SELENIUM, Format.HTML,
                    Access.AUTHENTICATED);
        }
        Source<?> source = context.getDefRegistry().getSource(descriptor);
        String originalContent = source.getContents();
        assert originalContent.contains(TOKEN);
        source.addOrUpdate(originalContent.replace(TOKEN, replacement));
    }

    private List<Request> endMonitoring() {
        List<Request> logs = Lists.newLinkedList();
        for (Map<String, Object> log : TestLoggingAdapterController
                .endCapture()) {
            if (!"GET".equals(log.get("requestMethod"))) {
                // Log ignored lines so that we can monitor what happens. The line above had nulls as requestMethod, so
                // this catches randomness.
                System.out.println("IGNORED: " + log);
                continue;
            }
            int status = -1;

            if (log.get("httpStatus") != null) {
                try {
                    status = Integer.parseInt((String) log.get("httpStatus"));
                } catch (NumberFormatException nfe) {
                }
            }
            Request toAdd = new Request(log.get("auraRequestURI").toString(),
                    null, null, null, status);
            for (String part : AuraTextUtil.urldecode(
                    log.get("auraRequestQuery").toString()).split("&")) {
                String[] parts = part.split("=", 2);
                String key = parts[0].substring(AURA.length() + 1);
                String v = parts[1];
                toAdd.put(key, (v != null && !v.isEmpty()) ? v : null);
            }
            logs.add(toAdd);
        }
        return logs;
    }

    /**
     * Get the set of expected requests on change. These are the requests that we expect for filling the app cache.
     * 
     * @return the list of request objects, not necessarily in order.
     */
    private List<Request> getExpectedChangeRequests() {
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
                    new Request("/aura", namespace + ":" + appName, null, "HTML", 302), // hard refresh
                    new Request("/auraResource", null, null, "manifest", 404), // manifest out of date
                    new Request(3, "/auraResource", null, null, "manifest", 200),
                    new Request(2, "/aura", namespace + ":" + appName, null, "HTML", 200), // rest are cache updates
                    new Request(2, "/auraResource", null, null, "css", 200),
                    new Request(2, "/auraResource", null, null, "js", 200));
        case SAFARI:
        case IPHONE:
        case IPAD:
        default:
            /*
             * For iOS Get the set of expected requests on change. These are the requests that we expect for filling the
             * app cache. The explanation is as follows. <ul> <li>The manifest is pulled</li> <li>The browser now gets
             * all three components, initial, css, and js</li> <li>Finally, the browser re-fetches the manifest to check
             * contents</li> <ul> The primary difference between this and the initial requests is that we get the
             * initial page twice
             */
            return ImmutableList.of(
                    new Request("/aura", namespace + ":" + appName, null, "HTML", 302), // hard refresh
                    new Request("/auraResource", null, null, "manifest", 404), // manifest out of date
                    new Request("/auraResource", null, null, "manifest", 200),
                    new Request(2, "/aura", namespace + ":" + appName, null, "HTML", 200), // rest are cache updates
                    new Request(2, "/auraResource", null, null, "css", 200),
                    new Request(2, "/auraResource", null, null, "js", 200));
        }
    }

    /**
     * Get the set of expected requests on change. These are the requests that we expect for filling the app cache.
     * 
     * @return the list of request objects, not necessarily in order.
     */
    private List<Request> getExpectedInitialRequests() {
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
            return ImmutableList.of(new Request(2, "/aura", namespace + ":" + appName, null, "HTML", 200), new Request(
                    2, "/auraResource", null, null, "manifest", 200), new Request("/auraResource", null, null, "css",
                    200), new Request(2,"/auraResource", null, null, "js", 200));
        case SAFARI:
        case IPHONE:
        case IPAD:
        default:
            /*
             * For iOS Get the set of expected requests on change. These are the requests that we expect for filling the
             * app cache. The explanation is as follows. <ul> <li>The manifest is pulled</li> <li>The browser now gets
             * all three components, initial, css, and js</li> <li>Finally, the browser re-fetches the manifest to check
             * contents</li> <ul> Note that there are also two css and js request.
             */
            return ImmutableList.of(new Request(1, "/aura", namespace + ":" + appName, null, "HTML", 200), new Request(
                    1, "/auraResource", null, null, "manifest", 200), new Request(2, "/auraResource", null, null,
                    "css", 200), new Request(2, "/auraResource", null, null, "js", 200));
        }
    }

    /**
     * A request object, which can either be an 'expected' request, or an 'actual' request. Expected requests can also
     * have a fudge factor allowing multiple requests for the resource. This is very helpful for different browsers
     * doing diferent things with the manifest. We allow multiple fetches of both the manifest and initial page in both
     * the initial request and the requests on change of resource.
     */
    static class Request extends HashMap<String, String> {
        private static final long serialVersionUID = 4149738936658714181L;
        private static final ImmutableSet<String> validKeys = ImmutableSet.of("URI", "tag", "namespaces", "format",
                "httpStatus");

        private final int fudge;
        private int count = 0;
        private Map<String, String> extras = null;
        private boolean showExtras = false;

        Request(int fudge, String URI, String tag, String namespaces, String format, int status) {
            super();
            this.fudge = fudge;
            put("URI", URI);
            put("tag", tag);
            put("namespaces", namespaces);
            put("format", format);
            if (status != -1) {
                put("httpStatus", String.valueOf(status));
            }
        }

        Request(String URI, String tag, String namespaces, String format, int status) {
            super();
            this.fudge = 0;
            put("URI", URI);
            put("tag", tag);
            put("namespaces", namespaces);
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
                    extras = new HashMap<String, String>();
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
         *         to unexpected requestes list and error out.
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

    @Override
    protected Mode getAuraModeForCurrentBrowser() {
        return Mode.SELENIUM;
    }

}
