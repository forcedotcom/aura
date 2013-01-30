/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.io.File;
import java.util.Date;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.controller.java.ServletConfigController;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.ThemeDef;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Source;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.annotation.FreshBrowserInstance;
import org.auraframework.test.annotation.TestLabels;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.test.controller.TestLoggingAdapterController;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.IOUtil;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.DirectiveTypes;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.junit.Ignore;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Tests for AppCache functionality by watching the requests received at the
 * server and verifying that the updated content is being used by the browser.
 * 
 * @since 0.0.224
 */
// FF pops a dialog for appCache
// IE < 10 don't support appCache
@ExcludeBrowsers({ BrowserType.FIREFOX, BrowserType.IE7, BrowserType.IE8, BrowserType.IE9, BrowserType.IE10})
@FreshBrowserInstance
@ThreadHostileTest
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
    private Boolean originalAppCacheConfig;
    private Source<?> source;
    private String originalContent;

    public AppCacheResourcesUITest(String name) {
        super(name);
        timeoutInSecs = 60;
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        originalAppCacheConfig = ServletConfigController.setAppCacheDisabled(false);
        namespace = "appCacheResourcesUITest" + auraTestingUtil.getNonce();
        appName = "cacheapplication";
        cmpName = "cachecomponent";

        DefDescriptor<ComponentDef> cmpDesc = createDef(ComponentDef.class, String.format("%s:%s", namespace, cmpName),
                "<aura:component>" + "<aura:attribute name='output' type='String'/>"
                + "<div class='clickableme' onclick='{!c.cssalert}'>@@@TOKEN@@@</div>"
                + "<div class='attroutput'>{!v.output}</div>" + "</aura:component>");

        createDef(ThemeDef.class, String.format("%s://%s.%s", DefDescriptor.CSS_PREFIX, namespace, cmpName),
        ".THIS {background-image: url(/auraFW/resources/qa/images/s.gif?@@@TOKEN@@@);}");

        createDef(ControllerDef.class,
                String.format("%s://%s.%s", DefDescriptor.JAVASCRIPT_PREFIX, namespace, cmpName),
                "{ cssalert:function(c){" + "function getStyle(elem, style){" + "var val = '';"
                + "if(document.defaultView && document.defaultView.getComputedStyle){"
                + "val = document.defaultView.getComputedStyle(elem, '').getPropertyValue(style);"
                + "} else if(elem.currentStyle){" + "style = style.replace(/\\-(\\w)/g, function (s, ch){"
                + "return ch.toUpperCase();" + "});" + "val = elem.currentStyle[style];" + "}" + "return val;"
                + "};" + "var style = getStyle(c.getElement(),'background-image');"
                + "c.getValue('v.output').setValue('@@@TOKEN@@@'"
                + "+ style.substring(style.lastIndexOf('?')+1,style.lastIndexOf(')'))"
                + "+ ($A.test ? $A.test.dummyFunction() : '@@@TOKEN@@@'));" + "}}");

        createDef(ApplicationDef.class, String.format("%s:%s", namespace, appName), String.format(
                "<aura:application useAppcache='true' render='client' preload='%s'"
                + " securityProvider='java://org.auraframework.java.securityProvider.LaxSecurityProvider'>"
                + "<%s:%s/>" + "</aura:application>", namespace, namespace, cmpDesc.getName()));
    }

    @Override
    public void tearDown() throws Exception {
        // restore any modified definitions
        if (source != null && originalContent != null) {
            source.addOrUpdate(originalContent);
        }
        ServletConfigController.setAppCacheDisabled(originalAppCacheConfig);
        super.tearDown();
    }

    /**
     * Opening cached app will only query server for the manifest and the
     * component load.
     */
    @TestLabels("auraSanity")
    public void testNoChanges() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);
        // Cookie cookie = getDriver().manage().getCookieNamed(COOKIE_NAME);
        // assertEquals("Unexpected manifest cookie value", "" +
        // getLastMod(Mode.SELENIUM), cookie.getValue());

        // only expect a fetch for the manifest and the initAsync component load
        logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        List<Request> expected = Lists.newArrayList(new Request("/auraResource", null, null, "manifest"), new Request(
                "/aura", namespace + ":" + appName, null, null));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    /**
     * Opening cached app that had a prior cache error will reload the app.
     */
    @TestLabels("auraSanity")
    public void testCacheError() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);

        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        Date expiry = new Date(System.currentTimeMillis() + 60000);
        String cookieName = getManifestCookieName();
        getDriver().manage().addCookie(new Cookie(cookieName, "error", null, "/", expiry));
        loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        assertAppCacheStatus(Status.IDLE);

        // There may be a varying number of requests, depending on when the
        // initial manifest response is received.
        Cookie cookie = getDriver().manage().getCookieNamed(cookieName);
        assertFalse("Manifest cookie was not changed "+cookie.getValue(), "error".equals(cookie.getValue()));
    }

    /**
     * Opening uncached app that had a prior cache error will have limited
     * caching.
     */
    public void testCacheErrorWithEmptyCache() throws Exception {
        openNoAura("/aura/application.app"); // just need a domain page to set
        // cookie from
        Date expiry = new Date(System.currentTimeMillis() + 60000);
        String cookieName = getManifestCookieName();
        getDriver().manage().addCookie(new Cookie(cookieName, "error", null, "/", expiry));

        loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        assertAppCacheStatus(Status.UNCACHED);

        // There may be a varying number of requests, depending on when the
        // initial manifest response is received.
        Cookie cookie = getDriver().manage().getCookieNamed(cookieName);
        assertNull("No manifest cookie should be present", cookie);
    }

    /**
     * Opening cached app after namespace style change will trigger cache
     * update.
     */
    // Can't run on iOS because PROD modes will just cache components so changes
    // are not picked up
    @TargetBrowsers({ BrowserType.GOOGLECHROME })
    public void testComponentCssChange() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        // update a component's css file
        String replacement = getName() + System.currentTimeMillis();
        replaceToken(getTargetComponent().getThemeDescriptor(), replacement);

        logs = loadMonitorAndValidateApp(TOKEN, TOKEN, replacement, TOKEN);
        List<Request> expected = Lists.newArrayList(new Request("/aura", namespace + ":" + appName, null, null),
                new Request("/aura", namespace + ":" + appName, null, "HTML"), new Request("/auraResource", null, null,
                "css"), new Request("/auraResource", null, null, "js"), new Request("/auraResource", null,
                        null, "manifest"));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);

        logs = loadMonitorAndValidateApp(TOKEN, TOKEN, replacement, TOKEN);
        expected = Lists.newArrayList(new Request("/auraResource", null, null, "manifest"), new Request("/aura",
                namespace + ":" + appName, null, null));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    /**
     * Opening cached app after namespace controller change will trigger cache
     * update.
     */
    // Can't run on iOS because PROD modes will just cache components so changes
    // are not picked up
    @TargetBrowsers({ BrowserType.GOOGLECHROME })
    public void testComponentJsChange() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        // update a component's js controller file
        String replacement = getName() + System.currentTimeMillis();
        DefDescriptor<?> desc = null;
        for (DefDescriptor<?> cd : getTargetComponent().getControllerDefDescriptors()) {
            if ("js".equals(cd.getPrefix())) {
                desc = cd;
                break;
            }
        }
        replaceToken(desc, replacement);

        logs = loadMonitorAndValidateApp(TOKEN, replacement, TOKEN, TOKEN);
        List<Request> expected = Lists.newArrayList(
                new Request("/aura", namespace + ":" + appName, null, null), // initAsync
                // (cached)
                new Request("/aura", namespace + ":" + appName, null, "HTML"), // rest
                // are
                // cache
                // updates
                new Request("/auraResource", null, null, "css"), new Request("/auraResource", null, null, "js"),
                new Request("/auraResource", null, null, "manifest"));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);

        logs = loadMonitorAndValidateApp(TOKEN, replacement, TOKEN, TOKEN);
        expected = Lists.newArrayList(new Request("/auraResource", null, null, "manifest"), new Request("/aura",
                namespace + ":" + appName, null, null));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    /**
     * Opening cached app after component markup change will trigger cache
     * update.
     */
    // Can't run on iOS because PROD modes will just cache components so changes
    // are not picked up
    @TargetBrowsers({ BrowserType.GOOGLECHROME })
    public void testComponentMarkupChange() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        // update markup of namespaced component used by app
        String replacement = getName() + System.currentTimeMillis();
        replaceToken(getTargetComponent().getDescriptor(), replacement);

        logs = loadMonitorAndValidateApp(replacement, TOKEN, TOKEN, TOKEN);
        List<Request> expected = Lists.newArrayList(
                new Request("/aura", namespace + ":" + appName, null, null), // initAsync
                // (cached)
                new Request("/aura", namespace + ":" + appName, null, "HTML"), // rest
                // are
                // cache
                // updates
                new Request("/auraResource", null, null, "css"), new Request("/auraResource", null, null, "js"),
                new Request("/auraResource", null, null, "manifest"));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);

        logs = loadMonitorAndValidateApp(replacement, TOKEN, TOKEN, TOKEN);
        expected = Lists.newArrayList(new Request("/auraResource", null, null, "manifest"), new Request("/aura",
                namespace + ":" + appName, null, null));
        assertRequests(expected, logs);
        assertAppCacheStatus(Status.IDLE);
    }

    /**
     * Opening cached app after framework javascript change will trigger cache
     * update.
     */
    // Can't run on iOS because PROD modes will just cache components so changes
    // are not picked up
    @TargetBrowsers({ BrowserType.GOOGLECHROME })
    @UnAdaptableTest
    @Ignore("Not valid when running from jars, which is most times, because framework js timestamp never changes then")
    public void testFrameworkJsChange() throws Exception {
        List<Request> logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, TOKEN);
        assertRequests(getExpectedInitialRequests(), logs);
        assertAppCacheStatus(Status.IDLE);

        // update a framework js file
        String replacement = getName() + System.currentTimeMillis();
        DirectiveBasedJavascriptGroup jsGroup = new DirectiveBasedJavascriptGroup(AURA,
                auraTestingUtil.getAuraJavascriptSourceDirectory(), "aura.test/Test.js", DirectiveTypes.DEFAULT_TYPES,
                EnumSet.of(JavascriptGeneratorMode.TESTING, JavascriptGeneratorMode.AUTOTESTING,
                        JavascriptGeneratorMode.TESTINGDEBUG, JavascriptGeneratorMode.AUTOTESTINGDEBUG));
        File testJs = null;
        String originalContent = null;
        for (File jsFile : jsGroup.getFiles()) {
            if ("Test.js".equals(jsFile.getName())) {
                testJs = jsFile;
                break;
            }
        }
        try {
            originalContent = IOUtil.readTextFile(testJs);
            Aura.getSourceControlAdapter().writeIfDifferent(
                    new StringBuilder(originalContent.replace(TOKEN, replacement)), testJs);
            testJs.setLastModified(System.currentTimeMillis());

            logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, replacement);
            List<Request> expected = Lists.newArrayList(
                    new Request("/aura", namespace + ":" + appName, null, null), // initAsync
                    // (cached)
                    new Request("/aura", namespace + ":" + appName, null, "HTML"), // rest
                    // are
                    // cache
                    // updates
                    new Request("/auraResource", null, null, "css"), new Request("/auraResource", null, null, "js"),
                    new Request("/auraResource", null, null, "manifest"));
            assertRequests(expected, logs);
            assertAppCacheStatus(Status.IDLE);

            logs = loadMonitorAndValidateApp(TOKEN, TOKEN, TOKEN, replacement);
            expected = Lists.newArrayList(new Request("/auraResource", null, null, "manifest"), new Request("/aura",
                    namespace + ":" + appName, null, null));
            assertRequests(expected, logs);
            assertAppCacheStatus(Status.IDLE);
        } finally {
            if (testJs != null) {
                Aura.getSourceControlAdapter().writeIfDifferent(new StringBuilder(originalContent), testJs);
                testJs.setLastModified(System.currentTimeMillis());
            }
        }
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

    // provide a test component with TOKENs for replacement to trigger lastMod
    // updates
    private ComponentDef getTargetComponent() throws Exception {
        ContextService service = Aura.getContextService();
        AuraContext context = service.getCurrentContext();
        if (context == null) {
            context = service.startContext(Mode.SELENIUM, Format.HTML, Access.AUTHENTICATED);
        }
        return Aura.getDefinitionService()
        .getDefinition(String.format("%s:%s", namespace, cmpName), ComponentDef.class);
    }

    private void assertRequests(List<Request> expected, List<Request> actual) throws Exception {
        System.out.println(">>> assertRequests: ");
        System.out.println("EXPECTED:");
        for (Request r : expected) {
            System.out.println("E: " + r);
        }
        System.out.println("ACTUAL:");
        for (Request r : actual) {
            System.out.println("A: " + r);
        }

        Set<Request> actualCopy = Sets.newHashSet(actual);
        for (Request r : expected) {
            actualCopy.remove(r);
        }
        if (actualCopy.size() > 0) {
            fail("Unexpected requests:\n" + actualCopy);
        }
        List<Request> expectedCopy = Lists.newArrayList(expected);
        for (Request l : actual) {
            expectedCopy.remove(l);
        }
        if (expectedCopy.size() > 0) {
            fail("Missing requests:\n" + expectedCopy);
        }
    }

    // Some sanity checks that our simple test app is functional after cache
    // resolutions.
    // - updated markup text is rendered (markupToken)
    // - updated client actions functional (jsToken)
    // - updated styling applied (cssToken)
    // - updated framework called (fwToken)
    private List<Request> loadMonitorAndValidateApp(final String markupToken, String jsToken, String cssToken,
            String fwToken) throws Exception {
        TestLoggingAdapterController.beginCapture();
        open(String.format("/%s/%s.app", namespace, appName));
        waitForAppCacheReady();
        WebElement elem = waitUntil(new Function<WebDriver, WebElement>() {
            @Override
            public WebElement apply(WebDriver input) {
                WebElement find = findDomElement(By.cssSelector(".clickableme"));
                if (markupToken.equals(find.getText())) {
                    return find;
                }
                return null;
            }
        });
        List<Request> logs = endMonitoring();
        elem.click();
        WebElement output = findDomElement(By.cssSelector("div.attroutput"));
        assertEquals("Unexpected alert text", String.format("%s%s%s", jsToken, cssToken, fwToken), output.getText());

        return logs;
    }

    // replaces TOKEN found in the source file with the provided replacement
    private void replaceToken(DefDescriptor<?> descriptor, String replacement) throws Exception {
        assertNotNull("Missing descriptor for source replacement!", descriptor);
        ContextService service = Aura.getContextService();
        AuraContext context = service.getCurrentContext();
        if (context == null) {
            context = service.startContext(Mode.SELENIUM, Format.HTML, Access.AUTHENTICATED);
        }
        source = context.getDefRegistry().getSource(descriptor);
        originalContent = source.getContents();
        source.addOrUpdate(originalContent.replace(TOKEN, replacement));
    }

    private List<Request> endMonitoring() {
        List<Request> logs = Lists.newLinkedList();
        for (Map<String, Object> log : TestLoggingAdapterController.endCapture()) {
            if (!log.get("requestMethod").equals("GET")) {
                continue;
            }
            Request toAdd = new Request(log.get("auraRequestURI").toString(), null, null, null);
            for (String part : AuraTextUtil.urldecode(log.get("auraRequestQuery").toString()).split("&")) {
                String[] parts = part.split("=", 2);
                String key = parts[0].substring(AURA.length() + 1);
                String v = parts[1];
                toAdd.put(key, (v != null && !v.isEmpty()) ? v : null);
            }
            logs.add(toAdd);
        }
        return logs;
    }

    private List<Request> getExpectedInitialRequests() {
        return ImmutableList.of(new Request("/auraResource", null, null, "manifest"), new Request("/aura", namespace
                + ":" + appName, null, "HTML"), new Request("/auraResource", null, null, "css"), new Request(
                        "/auraResource", null, null, "js"), new Request("/aura", namespace + ":" + appName, null, null));
    }

    // keep only the info needed for these tests, from the available log info
    static class Request extends HashMap<String, String> {
        private static final long serialVersionUID = 4149738936658714181L;
        private static final ImmutableSet<String> validKeys = ImmutableSet.of("URI", "tag", "namespaces", "format");

        Request(String URI, String tag, String namespaces, String format) {
            super();
            put("URI", URI);
            put("tag", tag);
            put("namespaces", namespaces);
            put("format", format);
        }

        @Override
        public String put(String k, String v) {
            if (validKeys.contains(k)) {
                return super.put(k, v);
            }
            return null;
        }
    }
    @Override
    protected Mode getAuraModeForCurrentBrowser() {
        return Mode.SELENIUM;
    }
}
