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
package org.auraframework.test;

import java.io.File;
import java.io.FileOutputStream;
import java.io.PrintWriter;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.logging.Logger;

import junit.framework.AssertionFailedError;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.annotation.FreshBrowserInstance;
import org.auraframework.test.annotation.WebDriverTest;
import org.auraframework.util.AuraUITestingUtil;
import org.auraframework.util.AuraUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.ScreenshotException;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * Base class for Aura WebDriver tests.
 */
@WebDriverTest
public abstract class WebDriverTestCase extends IntegrationTestCase {
    private static final Logger logger = Logger.getLogger("WebDriverTestCase");

    /** Checks whether {@code oneClass} is mentioned as a class on {@code elem}. */
    public boolean hasCssClass(WebElement elem, String oneClass) {
        String allClasses = elem.getAttribute("class");
        return allClasses.contains(" " + oneClass + " ") || allClasses.equals(oneClass)
                || allClasses.startsWith(oneClass + " ") || allClasses.endsWith(" " + oneClass);
    }

    protected int timeoutInSecs = 30;
    private WebDriver currentDriver = null;
    BrowserType currentBrowserType = null;
    protected AuraUITestingUtil auraUITestingUtil;

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE, ElementType.METHOD })
    public @interface TargetBrowsers {
        BrowserType[] value();
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.TYPE, ElementType.METHOD })
    public @interface ExcludeBrowsers {
        BrowserType[] value();
    }

    public WebDriverTestCase(String name) {
        super(name);
    }

    /**
     * Setup specific to a test case but common for all browsers. Run only once per test case.
     */
    @Override
    public void setUp() throws Exception {
        super.setUp();
    }

    /**
     * Teardown common stuff shared across all browsers while running a test case. Run only once per test case.
     */
    @Override
    public void tearDown() throws Exception {
        currentDriver = null;
        super.tearDown();
    }

    /**
     * Setup specific to a test run against a particular browser. Run once per test case, per browser.
     */
    public void perBrowserSetUp() {
        // re-initialize driver pointer here because test analysis might need it after perBrowserTearDown
        currentDriver = null;
        // W-1475510: instantiating it inorder to expose certain Util methods.
        auraUITestingUtil = new AuraUITestingUtil(this.getDriver());
    }

    /**
     * TearDown specific to a test run against a particular browser. Run once per test case, per browser.
     */

    public void perBrowserTearDown() {
    }

    private void superRunTest() throws Throwable {
        super.runTest();
    }

    public void runTestWithBrowser(BrowserType browserType) throws Throwable {
        currentBrowserType = browserType;
        try {
            perBrowserSetUp();
            superRunTest();
        } finally {
            perBrowserTearDown();
        }

    }

    @SuppressWarnings("serial")
    private class AggregateFailure extends AssertionFailedError {
        private final Collection<Throwable> failures;

        private AggregateFailure(Collection<Throwable> failures) {
            super(String.format("There were errors across %s browsers:", failures == null ? 0 : failures.size()));
            this.failures = failures;
        }

        @Override
        public void printStackTrace(PrintWriter printer) {
            printer.append(getMessage()).append('\n');
            for (Throwable e : failures) {
                e.printStackTrace(printer);
            }
        }
    }

    @Override
    public void runTest() throws Throwable {
        List<Throwable> failures = Lists.newArrayList();
        for (BrowserType browser : WebDriverUtil.getBrowserListForTestRun(this.getTargetBrowsers(),
                this.getExcludedBrowsers())) {
            try {
                runTestWithBrowser(browser);
            } catch (Throwable t) {
                failures.add(addAuraInfoToTestFailure(t));
            } finally {
                if (currentDriver != null) {
                    try {
                        currentDriver.quit();
                    } catch (Exception e) {
                    }
                }
            }
        }
        // Aggregate results across browser runs, if more than one failure was encountered
        if (!failures.isEmpty()) {
            if (failures.size() == 1) {
                throw failures.get(0);
            }
            throw new AggregateFailure(failures);
        }
    }

    /**
     * Wrapper for non-asserted failures
     */
    private class UnexpectedError extends Error {
        private static final long serialVersionUID = 1L;

        UnexpectedError(String description, Throwable cause) {
            super(description, cause);
        }
    }

    private static String WRAPPER_APP = "<aura:application render=\"%s\"><%s/></aura:application>";

    /**
     * Load a string as a component in an app.
     * 
     * @param name the name of the component
     * @param componentText The actual text of the component.
     * @param isClient Should we use client or server rendering.
     */
    protected void loadComponent(String namePrefix, String componentText, boolean isClient)
            throws MalformedURLException, URISyntaxException {
        String appText;
        String render;

        if (isClient) {
            render = "client";
        } else {
            render = "server";
        }

        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, componentText, namePrefix);
        appText = String.format(WRAPPER_APP, render, cmpDesc.getDescriptorName());
        loadApplication(namePrefix + "App", appText, isClient);
    }

    /**
     * A convienience routine to load a application string.
     * 
     * @param name the application name.
     * @param appText the actual text of the application
     */
    protected void loadApplication(String namePrefix, String appText, boolean isClient) throws MalformedURLException,
            URISyntaxException {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, appText, namePrefix);
        String openPath = String.format("/%s/%s.app", appDesc.getNamespace(), appDesc.getName());
        if (isClient) {
            open(openPath);
        } else {
            // when using server side rendering, we need to not wait for aura
            openNoAura(openPath);
        }
    }

    /**
     * Gather up useful info to add to a test failure. try to get
     * <ul>
     * <li>any client js errors</li>
     * <li>last known js test function</li>
     * <li>running/waiting</li>
     * <li>a screenshot</li>
     * </ul>
     * 
     * @param originalErr the test failure
     * @throws Throwable a new AssertionFailedError or UnexpectedError with the original and additional info
     */
    private Throwable addAuraInfoToTestFailure(Throwable originalErr) {
        StringBuffer description = new StringBuffer();
        if (originalErr != null) {
            String msg = originalErr.getMessage();
            if (msg != null) {
                description.append(msg);
            }
        }
        description.append(String.format("\nBrowser: %s", currentBrowserType));
        if (currentDriver == null) {
            description.append("\nTest failed before WebDriver was initialized");
        } else {
            description.append("\nJS state: ");
            try {
                String dump = (String) auraUITestingUtil
                        .getRawEval("return (window.$A && $A.test && $A.test.getDump())||'';");
                if (dump.isEmpty()) {
                    description.append("no errors detected");
                } else {
                    description.append(dump);
                }
            } catch (Throwable t) {
                description.append(t.getMessage());
            }

            String screenshotsDirectory = System.getProperty("screenshots.directory");
            if (screenshotsDirectory != null) {
                String img = getBase64EncodedScreenshot(originalErr, true);
                if (img == null) {
                    description.append("\nScreenshot: {not available}");
                } else {
                    String fileName = getClass().getName() + "." + getName() + "_" + currentBrowserType + ".png";
                    File path = new File(screenshotsDirectory + "/" + fileName);
                    try {
                        path.getParentFile().mkdirs();
                        byte[] bytes = Base64.decodeBase64(img.getBytes());
                        FileOutputStream fos = new FileOutputStream(path);
                        fos.write(bytes);
                        fos.close();
                        String baseUrl = System.getProperty("screenshots.baseurl");
                        description.append(String.format("%nScreenshot: %s/%s", baseUrl, fileName));
                    } catch (Throwable t) {
                        description.append(String.format("%nScreenshot: {save error: %s}", t.getMessage()));
                    }
                }
            }

            try {
                description.append("\nApplication cache status: ");
                description
                        .append(auraUITestingUtil
                                .getRawEval(
                                        "var cache=window.applicationCache;return (cache===undefined || cache===null)?'undefined':cache.status;")
                                .toString());
            } catch (Exception ex) {
                description.append("error calculating status: " + ex);
            }
            description.append("\n");
            if (SauceUtil.areTestsRunningOnSauce()) {
                String linkToJob = SauceUtil.getLinkToPublicJobInSauce(currentDriver);
                description.append("\nSauceLabs-recording: ");
                description.append((linkToJob != null) ? linkToJob : "{not available}");
            }
        }

        // replace original exception with new exception with additional info
        Throwable newFailure;
        if (originalErr instanceof AssertionFailedError) {
            newFailure = new AssertionFailedError(description.toString());
        } else {
            description.insert(0, originalErr.getClass() + ": ");
            newFailure = new UnexpectedError(description.toString(), originalErr.getCause());
        }
        newFailure.setStackTrace(originalErr.getStackTrace());
        return newFailure;
    }

    /**
     * Try to extract a screenshot from the given Throwable's stacktrace.
     * 
     * @param t the throwable to check for
     * @param trigger if true, and t is null or doesn't have a screenshot, synthesize a WebDriverException and look in
     *            there.
     * @return base64 encoding of the screenshot, or null if one could not be obtained
     */
    private String getBase64EncodedScreenshot(Throwable t, boolean trigger) {
        if (t == null) {
            if (trigger) {
                try {
                    auraUITestingUtil.getRawEval("return $A.test.dummymethod();");
                } catch (Throwable i) {
                    return getBase64EncodedScreenshot(i, false);
                }
            }
        } else {
            if (t instanceof AssertionFailedError) {
                return getBase64EncodedScreenshot(null, trigger);
            } else if (t instanceof ScreenshotException) {
                return ((ScreenshotException) t).getBase64EncodedScreenshot();
            } else {
                return getBase64EncodedScreenshot(t.getCause(), trigger);
            }
        }
        return null;
    }

    protected BrowserType getBrowserType() {
        return currentBrowserType;
    }

    /**
     * Find all the browsers the current test case should be executed in. Test cases can be annotated with multiple
     * target browsers. If the testcase does not have an annotation, the class level annotation is used.
     * 
     * @return
     * @throws NoSuchMethodException
     */
    public Set<BrowserType> getTargetBrowsers() {
        TargetBrowsers targetBrowsers = null;
        try {
            Method method = getClass().getMethod(getName());
            targetBrowsers = method.getAnnotation(TargetBrowsers.class);
            if (targetBrowsers == null) {
                // Inherit defaults from the test class
                targetBrowsers = getClass().getAnnotation(TargetBrowsers.class);
            }
        } catch (NoSuchMethodException e) {
            // Do nothing
        }
        if (targetBrowsers == null) {
            // If no target browsers are specified, default to ALL
            return EnumSet.allOf(BrowserType.class);
        }
        return Sets.newEnumSet(Arrays.asList(targetBrowsers.value()), BrowserType.class);
    }

    /**
     * Browser types to be excluded for this testcase or test class.
     * 
     * @return
     * @throws NoSuchMethodException
     */
    public Set<BrowserType> getExcludedBrowsers() {
        ExcludeBrowsers excludeBrowsers = null;
        try {
            Method method = getClass().getMethod(getName());
            excludeBrowsers = method.getAnnotation(ExcludeBrowsers.class);
            if (excludeBrowsers == null) {
                // Inherit defaults from the test class
                excludeBrowsers = getClass().getAnnotation(ExcludeBrowsers.class);
            }
        } catch (NoSuchMethodException e) {
            // Do nothing
        }
        if (excludeBrowsers == null) {
            return EnumSet.noneOf(BrowserType.class);
        }
        return Sets.newEnumSet(Arrays.asList(excludeBrowsers.value()), BrowserType.class);
    }

    public WebDriver getDriver() {
        if (currentDriver == null) {
            WebDriverProvider provider = AuraUtil.get(WebDriverProvider.class);
            DesiredCapabilities capabilities;
            if (SauceUtil.areTestsRunningOnSauce()) {
                capabilities = SauceUtil.getCapabilities(currentBrowserType, this);
            } else {
                capabilities = currentBrowserType.getCapability();
            }
            boolean reuseBrowser = true;
            try {
                Class<?> clazz = getClass();
                reuseBrowser = clazz.getAnnotation(FreshBrowserInstance.class) == null
                        && clazz.getMethod(getName()).getAnnotation(FreshBrowserInstance.class) == null;
            } catch (NoSuchMethodException e) {
                // happens for dynamic tests
            }
            capabilities.setCapability(WebDriverProvider.REUSE_BROWSER_PROPERTY, reuseBrowser);

            logger.info(String.format("Requesting: %s", capabilities));
            currentDriver = provider.get(capabilities);
            if (currentDriver == null) {
                fail("Failed to get webdriver for " + currentBrowserType);
            }
            logger.info(String.format("Received: %s", currentDriver));
        }
        return currentDriver;
    }

    private URI getAbsoluteURI(String url) throws MalformedURLException, URISyntaxException {
        return getTestServletConfig().getBaseUrl().toURI().resolve(url);
    }

    /**
     * Open a URI without any additional handling.
     */
    protected void openRaw(URI uri) {
        getDriver().get(uri.toString());
    }

    /**
     * Open a URL without any additional handling.
     */
    protected void openRaw(String url) throws MalformedURLException, URISyntaxException {
        openRaw(getAbsoluteURI(url));
    }

    /**
     * Open a URL without the usual waitForAuraInit().
     */
    protected void openNoAura(String url) throws MalformedURLException, URISyntaxException {
        open(url, getAuraModeForCurrentBrowser(), false);
    }

    /**
     * Open a Aura URL with the default mode provided by {@link WebDriverTestCase#getAuraModeForCurrentBrowser()} and
     * wait for intialization as defined by {@link WebDriverTestCase#waitForAuraInit()}.
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    protected void open(String url) throws MalformedURLException, URISyntaxException {
        open(url, getAuraModeForCurrentBrowser(), true);
    }

    /**
     * Return the default Aura Mode based on the browser type. IPAD and Android browsers return
     * {@link org.auraframework.system.AuraContext.Mode#CADENCE} in order to disable fast click.
     */
    protected Mode getAuraModeForCurrentBrowser() {
        return Mode.SELENIUM;
    }

    protected void open(DefDescriptor<? extends BaseComponentDef> dd) throws MalformedURLException, URISyntaxException {
        open(getUrl(dd));
    }

    /**
     * Open a Aura URL in given aura.mode and wait for initialization.
     * 
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    protected void open(String url, Mode mode) throws MalformedURLException, URISyntaxException {
        open(url, mode, true);
    }

    protected void open(String url, Mode mode, boolean waitForInit) throws MalformedURLException, URISyntaxException {
        // save any fragment
        int hashLoc = url.indexOf('#');
        String hash = "";
        if (hashLoc >= 0) {
            hash = url.substring(hashLoc);
            url = url.substring(0, hashLoc);
        }

        // strip query string
        int qLoc = url.indexOf('?');
        String qs = "";
        if (qLoc >= 0) {
            qs = url.substring(qLoc + 1);
            url = url.substring(0, qLoc);
        }

        List<NameValuePair> newParams = Lists.newArrayList();
        URLEncodedUtils.parse(newParams, new Scanner(qs), "UTF-8");

        // update query with a nonce
        newParams.add(new BasicNameValuePair("aura.mode", mode.name()));
        newParams.add(new BasicNameValuePair("aura.test", getQualifiedName()));
        url = url + "?" + URLEncodedUtils.format(newParams, "UTF-8") + hash;

        auraUITestingUtil.getRawEval("document._waitingForReload = true;");
        try{
        	openAndWait(url,waitForInit);
        }
        catch(TimeoutException e){
        	//Adding hack to avoid timeout issue for ie7 and ie8 
        	//seems like IE7 and IE8 test fails for the first time when we run the test in new vm session
        	if(currentBrowserType == BrowserType.IE7 || currentBrowserType == BrowserType.IE8){
        		openAndWait(url,waitForInit);
        	}
        	else{
        		throw e;
        	}
        } 
    }

    private void openAndWait(String url, boolean waitForInit) throws MalformedURLException, URISyntaxException{
    	auraUITestingUtil.getRawEval("document._waitingForReload = true;");
		openRaw(url);
		waitForCondition("return !document._waitingForReload");
		if (waitForInit) {
			auraUITestingUtil.waitForAuraInit(getExceptionsAllowedDuringInit());
		}
    }
    
    public void waitForAuraFrameworkReady() {
        auraUITestingUtil.waitForAuraFrameworkReady(getExceptionsAllowedDuringInit());
    }

    protected Set<String> getExceptionsAllowedDuringInit() {
        return Collections.emptySet();
    }

    /**
     * Wait the specified number of seconds for the provided javascript to evaluate to true.
     * 
     * @throws AssertionFailedError if the provided javascript does not return a boolean.
     */
    public void waitForCondition(final String javascript, int timeoutInSecs) {
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return auraUITestingUtil.getBooleanEval(javascript);
            }
        }, timeoutInSecs);
    }

    /**
     * Wait for the provided javascript to evaluate to true. Make sure script has return statement.
     */
    public void waitForCondition(final String javascript) {
        waitForCondition(javascript, timeoutInSecs);
    }

    /**
     * Wait for a specified amount of time.
     */
    public void waitFor(long timeoutInSeconds) {
        WebDriverWait wait = new WebDriverWait(getDriver(), timeoutInSeconds);
        try {
            wait.until(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
                    return false;
                }
            });
        } catch (TimeoutException expected) {
            return;
        }
    }

    /**
     * Wait for text to be present for element.
     */
    public void waitForElementTextPresent(WebElement e, String text) {
        waitForElementText(e, text, true, timeoutInSecs);
    }

    /**
     * Wait for text to be absent for element.
     */
    public void waitForElementTextAbsent(WebElement e, String text) {
        waitForElementText(e, text, false, timeoutInSecs);
    }

    /**
     * Wait for text on element to be either cleared or present.
     */
    protected void waitForElementText(final WebElement e, final String text, final boolean isPresent, long timeout) {
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return isPresent == text.equals(e.getText());
            }
        }, timeoutInSecs);
    }

    protected void waitForElementAbsent(String msg, final WebElement e) {
        waitForElement(msg, e, false, timeoutInSecs);
    }

    protected void waitForElementAbsent(final WebElement e) {
        waitForElement("Timed out (" + timeoutInSecs + "ms) waiting for " + e + "to disappear.", e, false,
                timeoutInSecs);
    }

    protected void waitForElementPresent(String msg, final WebElement e) {
        waitForElement(msg, e, true, timeoutInSecs);
    }

    protected void waitForElementPresent(final WebElement e) {
        waitForElement("Timed out (" + timeoutInSecs + "ms) waiting for " + e, e, true, timeoutInSecs);
    }

    /**
     * short waitForElement to present or absent before executing the next command
     */
    protected void waitForElement(String msg, final WebElement e, final boolean isDisplayed) {
        waitForElement(msg, e, isDisplayed, timeoutInSecs);
    }

    /**
     * waitForElement to present or absent before executing the next command
     * 
     * @param msg Error message
     * @param e WebElement to look for
     * @param isDisplayed if set to true, will wait till the element is displayed else will wait till element is not
     *            visible.
     * @param timeoutinSecs number of seconds to wait before erroring out
     */
    protected void waitForElement(String msg, final WebElement e, final boolean isDisplayed, int timeoutInSecs) {
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return isDisplayed == e.isDisplayed();
            }
        }, timeoutInSecs);
    }

    /**
     * Overriding wait to wait until the dialog box closes, Since we are using the class variable to check for the
     * Dialog box, it changes from dialog modal medium uiDialog slideUp -> dialog modal medium uiDialog-> dialog hidden
     * modal medium uiDialog (this is the state that we want to make sure to grab)
     * 
     * @param selector way to find componenet (ex: "div[class*='dialog']")
     * @param attr components attribute that we want to find
     * @param itemInAttr Keyword that we are looking for in the attribute
     * @param useBangOperator Whether we want to use the bang operator or not
     */
    public void waitForComponentToChangeStatus(final String selectorToFindCmp, final String attr,
            final String itemAttrShouldContain, final boolean useBangOperator) {
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                if (useBangOperator) {
                    return !d.findElement(By.cssSelector(selectorToFindCmp)).getAttribute(attr)
                            .contains(itemAttrShouldContain);
                }
                else {
                    return d.findElement(By.cssSelector(selectorToFindCmp)).getAttribute(attr)
                            .contains(itemAttrShouldContain);
                }
            }
        }, timeoutInSecs);
    }

    /**
     * Wait for the carousel page to change. Asserts the expectedText appears in the innerHTML of page element
     * 
     * @param page - the next page that should be loaded on carousel.
     * @param expectedText - the expected text on that page.
     */
    public void waitForCarouselPageToChange(final WebElement page, final String expectedText) {
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                String pageContent = page.getAttribute("innerHTML");
                return pageContent.contains(expectedText);
            }
        }, timeoutInSecs);
    }
    
    public void waitForAutoCompleteListVisible(final WebElement list, final boolean isVisible) {
		auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                boolean isInvisible = hasCssClass(list, "invisible");
                return isVisible != isInvisible;
            }
        }, timeoutInSecs);
    }

    /**
     * Find first matching element in the DOM.
     */
    protected WebElement findDomElement(By locator) {
        return auraUITestingUtil.findDomElement(locator);
    }
    
    /**
     * Find list of matching element in the DOM.
     */
    protected List<WebElement> findDomElements(By locator) {
        return auraUITestingUtil.findDomElements(locator);
    }

    /**
     * Return true if there is at least one element matching the locator.
     */
    public boolean isElementPresent(By locator) {
        return getDriver().findElements(locator).size() > 0;
    }

    /**
     * Gets the visible text for the first element matching the locator.
     */
    protected String getText(By locator) {
        return findDomElement(locator).getText();
    }

    public Action shiftTab() {
        Actions builder = new Actions(currentDriver);
        builder.keyDown(Keys.SHIFT)
                .sendKeys(Keys.TAB)
                .keyUp(Keys.SHIFT);
        return builder.build();
    }

    protected void assertClassesSame(String message, String expected, String actual) {
        auraUITestingUtil.assertClassesSame(message, expected, actual);
    }
}
