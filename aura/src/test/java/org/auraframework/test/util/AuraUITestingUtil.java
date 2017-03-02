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
package org.auraframework.test.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.logging.Logger;

import org.apache.commons.lang3.StringEscapeUtils;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.JsonReader;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.base.Function;
import com.google.common.collect.Lists;

/**
 * A place to put common UI testing specific helper methods
 */

public class AuraUITestingUtil {
    private final WebDriver driver;
    private final String logPrefix;
    private final Logger logger;
    private int timeoutInSecs = 30;
    private int rerunCount = 0;
    protected static final Random RAND = new Random(System.currentTimeMillis());

    public AuraUITestingUtil(WebDriver driver) {
        this(driver, null, null);
    }

    public AuraUITestingUtil(WebDriver driver, Logger logger, String logPrefix) {
        this.driver = driver;
        this.logPrefix = logPrefix == null ? "" : logPrefix;
        this.logger = logger != null ? logger : Logger.getLogger(AuraUITestingUtil.class.getSimpleName());
    }

    public enum ActionDuringTransit {
        DROPACTION,
        NAVIGATEBACK
        // TODO: navigate to other place
        // TODO: delay the action
    }

    public enum ActionTiming {
        PRESEND,
        POSTSEND,
        PREDECODE,
        // TODO: AFTERDECODE
    }

    public static class StressAction {
        private final String auraActionWeCare;
        private final ActionTiming actionTiming;
        private final ActionDuringTransit[] actionDuringTransit;

        public StressAction(String auraActionWeCare, ActionTiming actionTiming,
                ActionDuringTransit... actionDuringTransit) {
            this.auraActionWeCare = auraActionWeCare;
            this.actionTiming = actionTiming;
            this.actionDuringTransit = actionDuringTransit;
        }

        public String getAuraActionWeCare() {
            return auraActionWeCare;
        }

        public ActionTiming getActionTiming() {
            return actionTiming;
        }

        public ActionDuringTransit[] getActionDuringTransit() {
            return actionDuringTransit;
        }
    };

    public static StressAction createStressAction(String auraActionWeCare, ActionTiming stressActionTiming,
            ActionDuringTransit... stressActionDuringTransitList) {
        return new StressAction(auraActionWeCare, stressActionTiming, stressActionDuringTransitList);
    }

    public Object performStressActionsDuringTransit(StressAction stressAction) {
        return performStressActionsDuringTransit(stressAction.getAuraActionWeCare(), stressAction.getActionTiming(),
                stressAction.getActionDuringTransit());
    }

    public Object performStressActionsDuringTransit(String auraActionWeCare, ActionTiming stressActionTiming,
            ActionDuringTransit... stressActionDuringTransitList) {
        String jsScript;
        jsScript = "var customCallback = function(actions) { " +
                "var i;" +
                "var action = undefined;" +
                "for (i = 0; i < actions.length; i++) {" +
                "if (actions[i].getDef().name === '" + auraActionWeCare + "') {" +
                "action = actions[i];" +
                "break;" +
                "}" +
                "}" +
                "if (action) {";

        for (ActionDuringTransit actionDuringTransit : stressActionDuringTransitList) {
            switch (actionDuringTransit) {
            case DROPACTION:
                jsScript += "actions.splice(i, 1);";
                break;
            case NAVIGATEBACK:
                jsScript += "$A.historyService.back();";
                break;
            default: // do nothing
                break;
            }
        }

        // remove the callback once we are done, only do it once
        jsScript += "$A.test.removePrePostSendCallback(cb_handle);";
        jsScript += "}" + // end of if(action)
                "};"; // end of function customCallback

        // register the custom callback
        switch (stressActionTiming) {
        case PRESEND:
            jsScript += "var cb_handle = $A.test.addPreSendCallback(undefined, customCallback);";
            break;
        case POSTSEND:
            jsScript += "var cb_handle = $A.test.addPostSendCallback(undefined, customCallback);";
            break;
        // we need different customCallback for this case PREDECODE:
        // jsScript += "var cb_handle = $A.test.addPreDecodeCallback(customCallback);";
        default:
            break;
        }

        // TODO & Note:
        // getEval will wrap jsScript in a try...catch(e), return an array of [result, jsTestErrors,
        // scriptExecException]
        // result is the result of executing jsScript
        // jsTestErrors = window.$A.test.getErrors() if there is any
        // scriptExecException = e.message() , e is what we catched if any
        // if jsTestErrors exist, we fail the test right away -- this is not what we want, if we are expecting some
        // error in test
        return getEval(jsScript);
    }

    public void setTimeoutInSecs(int timeoutInSecs) {
        this.timeoutInSecs = timeoutInSecs;
        if (SauceUtil.areTestsRunningOnSauce()) {
            // things are slower in SauceLabs
            this.timeoutInSecs *= 6;
        }
    }

    public int getTimeout() {
        return timeoutInSecs;
    }

    /**
     * An internal class to wait for and retrieve an element from the driver.
     */
    private static class WaitAndRetrieve implements ExpectedCondition<Boolean> {
        private final By locator;
        private WebElement found = null;

        public WaitAndRetrieve(By locator) {
            this.locator = locator;
        }

        @Override
        public Boolean apply(WebDriver d) {
            List<WebElement> elements = d.findElements(locator);

            if (elements.size() > 0) {
                found = elements.get(0);
                return true;
            }
            return false;
        }

        public WebElement getFound() {
            return this.found;
        }

        @Override
        public String toString() {
            return "WaitAndRetrieve: " + this.locator + " found " + this.found;
        }
    }

    /**
     * Waits for element with matching locator to appear in dom.
     * 
     * This will wait for at least one element with the locator to appear in the dom, and it will return the first
     * element found. If there are more than one element that match the locator, this will succeed when the first one
     * appears.
     * 
     * @param msg Error message on timeout.
     * @param locator By of element waiting for.
     */
    public WebElement waitForElement(String msg, By locator) {
        WaitAndRetrieve war = new WaitAndRetrieve(locator);
        WebDriverWait wait = new WebDriverWait(driver, timeoutInSecs);
        wait.withMessage(msg);
        wait.ignoring(NoSuchElementException.class);
        wait.until(war);
        return war.getFound();
    }

    /**
     * Waits for element with matching locator to appear in dom.
     * 
     * Convenience routine to supply a message.
     * 
     * @param locator By of element waiting for.
     */
    public WebElement waitForElement(By locator) {
        String msg = "Element with locator \'" + locator.toString() + "\' never appeared";
        return waitForElement(msg, locator);
    }

    /**
     * Waits for element to be not present
     * 
     * @param locator By of element waiting to disapear
     * @return
     */
    public boolean waitForElementNotPresent(String msg, final By locator) {
        WebDriverWait wait = new WebDriverWait(driver, timeoutInSecs);
        return wait.withMessage(msg)
            .ignoring(StaleElementReferenceException.class).until(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver d) {
                    return d.findElements(locator).isEmpty();
                }
            });
    }

    public WebElement findElementAndTypeEventNameInIt(String event) {
        String locatorTemplate = "input[class*='%s']";
        String locator = String.format(locatorTemplate, event);
        WebElement input = findDomElement(By.cssSelector(locator));
        input.click(); // IE7 need to bring focus
        input.clear();
        input.sendKeys(event);
        return input;
    }

    public void assertClassNameContains(WebElement element, String namePart) {
        assertClassNameContains(element, namePart, true);
    }

    public void assertClassNameDoesNotContain(WebElement element, String namePart) {
        assertClassNameContains(element, namePart, false);
    }

    private void assertClassNameContains(WebElement element, String namePart, boolean doesContain) {
        String className = element.getAttribute("class").trim();
        className = " " + className + " "; // so we wont get false positive for
        // nonactive if looking for active
        namePart = " " + namePart + " ";

        if (doesContain) {
            Assert.assertTrue("Class name '" + className + "' does not contain '" + namePart + "'",
                    className.contains(namePart));
        } else {
            Assert.assertFalse("Class name '" + className + "' contains '" + namePart + "'",
                    className.contains(namePart));
        }
    }

    public String getValueFromRootExpr(String val) {
        String exp = "window.$A.getRoot().get('" + val + "')";
        return exp;
    }

    public String getFindAtRootExpr(String cmp) {
        String exp = "window.$A.getRoot().find('" + cmp + "')";
        return exp;
    }

    public String getEncodedContextForServer() {
        String exp = "window.$A.getContext().encodeForServer()";
        return exp;
    }

    /**
     * Very useful to get handle on the component passing globalId
     * 
     * @param cmp: globalId of the component
     * @return
     */
    public String getCmpExpr(String cmp) {
        String exp = "window.$A.getCmp('" + cmp + "')";
        return exp;
    }

    /**
     * Return the javascript using which component's attribute value could be found out
     * 
     * @param cmp : cmpName whose attribute you are looking for
     * @param val : attribute name
     * @return
     */
    public String getValueFromCmpRootExpression(String cmp, String val) {
        return this.prepareReturnStatement(this.getFindAtRootExpr(cmp) + ".get('" + val + "')");
    }

    /**
     * Very useful when we know the globalId of the component, inorder to get the attribute value of cmp
     * 
     * @param cmp: globalId of the component
     * @param val: attribute name of the component
     * @return
     */
    public String getValueFromCmpExpression(String cmp, String val) {
        return this.prepareReturnStatement(this.getCmpExpr(cmp) + ".get('" + val + "')");
    }

    public void pressEnter(WebElement e) {
        e.sendKeys("\n");
    }

    public void pressTab(WebElement e) {
        e.sendKeys("\t");
    }

    /**
     * Execute the given javascript and args in the current window. Fail if the result is not a boolean. Otherwise,
     * return the result.
     */
    public boolean getBooleanEval(String javascript, Object... args) {
        Object status;
        status = getEval(javascript, args);

        // Special case for weird behavior with ios-driver returning 'ok' instead of true or false. Appears to be an
        // ios-driver bug. Return false so we can retry executing the js instead of erroring out.
        if (status instanceof String && status.equals("ok")) {
            return false;
        }

        if (status == null) {
            Assert.fail("Got a null status for " + javascript + "(" + args + ")");
        }
        if (!(status instanceof Boolean)) {
            Assert.fail("Got unexpected return value: for " + javascript + "(" + args + ") :\n" + status.toString());
        }

        return ((Boolean) status).booleanValue();
    }

    /**
     * Evaluate the given javascript in the current window. Upon completion, if the framework has loaded and is in a
     * test mode, then assert that there are no uncaught javascript errors.
     * <p>
     * As an implementation detail, we accomplish this by wrapping the given javascript so that we can perform the error
     * check on each evaluation without doing a round-trip to the browser (which might be long in cases of remote test
     * runs).
     * 
     * @return the result of calling {@link JavascriptExecutor#executeScript(String, Object...) with the given
     *         javascript and args.
     */
    public Object getEval(final String javascript, Object... args) {
        /**
         * Wrapping the javascript on the native Android browser is broken. By not using the wrapper we won't catch any
         * javascript errors here, but on passing cases this should behave the same functionally. See W-1481593.
         */
        if (driver instanceof RemoteWebDriver
                && "android".equals(((RemoteWebDriver) driver).getCapabilities().getBrowserName())) {
            return getRawEval(javascript, args);
        }

        /**
         * Wrap the given javascript to evaluate and then check for any collected errors. Then, return the result and
         * errors back to the WebDriver. We must return as an array because
         * {@link JavascriptExecutor#executeScript(String, Object...)} cannot handle Objects as return values."
         */
        String escapedJavascript = StringEscapeUtils.escapeEcmaScript(javascript);
        String wrapper = "var ret,scriptExecException;\n"
                + "try {\n"
                + String.format("var func = new Function('arguments', \"%s\");\n", escapedJavascript)
                + "  ret = func.call(this, arguments);\n"
                + "} catch(e){\n"
                + "  scriptExecException = e.message || e.toString();\n"
                + "}\n"
                + "var jstesterrors = (window.$A && window.$A.test) ? window.$A.test.getErrors() : '';\n"
                + "return [ret, jstesterrors, scriptExecException];";

        try {
            Object obj = getRawEval(wrapper, args);
            Assert.assertTrue("Expecting an instance of list, but get " + obj + ", when running: " + escapedJavascript, obj instanceof List);
            @SuppressWarnings("unchecked")
            List<Object> wrapResult = (List<Object>) obj;
            Assert.assertEquals("Wrapped javsascript execution expects an array of exactly 3 elements", 3,
                    wrapResult.size());
            Object exception = wrapResult.get(2);
            Assert.assertNull("Following JS Exception occured while evaluating provided script:\n" + exception + "\n"
                    + "Arguments: (" + Arrays.toString(args) + ")\n" + "Script:\n" + javascript + "\n", exception);
            String errors = (String) wrapResult.get(1);
            assertJsTestErrors(errors);
            rerunCount = 0;
            return wrapResult.get(0);
        } catch (WebDriverException e) {
            // shouldn't come here that often as we are also wrapping the js
            // script being passed to us in try/catch above
            Assert.fail("Script execution failed.\n" + "Exception type: " + e.getClass().getName()
                    + "\n" + "Failure Message: " + e.getMessage() + "\n" + "Arguments: ("
                    + Arrays.toString(args) + ")\n" + "Script:\n" + javascript + "\n");
            throw e;
        } catch (NullPointerException npe) {
            // Although it should never happen, ios-driver is occasionally returning null when trying to execute the
            // wrapped javascript. Re-run the script a couple more times before failing.
            if (++rerunCount > 2) {
                Assert.fail("Script execution failed.\n" + "Failure Message: " + npe.getMessage() + "\n"
                        + "Arguments: (" + Arrays.toString(args) + ")\n" + "Script:\n" + javascript + "\n");
            }
            return getEval(javascript, args);
        }
    }

    /**
     * Returns value of executing javascript in current window.
     * 
     * @see org.openqa.selenium.JavscriptExecutor#executeSript(String, Object...)
     */
    public Object getRawEval(String javascript, Object... args) {
        return ((JavascriptExecutor) driver).executeScript(javascript, args);
    }

    /**
     * @return the User-Agent for the browser we are running tests on
     */
    public String getUserAgent() {
        try {
            return (String) getRawEval("return window.navigator.userAgent;");
        } catch (Exception e) {
            return "error getting User-Agent: " + e;
        }
    }

    /**
     * Process the results from $A.test.getErrors(). If there were any errors, then fail the test accordingly.
     * 
     * @param errors the raw results from invoking $A.test.getErrors()
     */
    public void assertJsTestErrors(String errors) {
        if (errors == null) {
            return;
        }

        if (!errors.isEmpty()) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> errorsList = (List<Map<String, Object>>) new JsonReader().read(errors);
            StringBuilder errorMessage = new StringBuilder();
            for (Map<String, Object> error : errorsList) {
                errorMessage.append(error.get("message") + "\n");
                errorMessage.append(error.get("testState") + "\n");
            }
            Assert.fail(errorMessage.toString());
        }
    }

    public String prepareReturnStatement(String returnStatement) {
        return "return " + returnStatement;
    }

    public String findGlobalIdForComponentWithGivenProperties(String fromClause, String whereClause) {
        StringBuilder sb = new StringBuilder();
        sb.append("var cmp = $A.getQueryStatement().from('component').field('globalId').");
        sb.append(fromClause + ".where(\"" + whereClause + "\")" + ".query();\n");
        sb.append("$A.test.assertEquals(1, cmp.rowCount,'Expected to find only one component with given properties.');\n");
        sb.append("return cmp.rows[0].globalId;");
        Object returnVal = getEval(sb.toString());
        return returnVal == null ? null : returnVal.toString();
    }

    /**
     * use to do mouse over the element
     * 
     * @param elem
     */
    public void setHoverOverElement(String elem) {
        Actions builder = new Actions(driver);
        // find the element a 2nd time which helps get around the IE hover issues by focusing the element
        WebElement element = driver.findElement(By.className(elem));
        builder.moveToElement(element).build().perform();
    }

    /**
     * Get the text content of a DOM node. Tries "innerText" followed by "textContext" to take browser differences into
     * account.
     * 
     */
    public String getActiveElementText() {
        return (String) getEval("return $A.test.getActiveElementText()");
    }

    /**
     * Return Bounding Rectangle Property for given Element
     * 
     * @param elementLocalId
     * @param position = "top, left, right, and bottom"
     * @return
     */
    public String getBoundingRectPropOfElement(String elementGlobalId, String position) {
        String element = getCmpExpr(elementGlobalId) + ".getElement().getBoundingClientRect()." + position;
        return getEval(prepareReturnStatement(element)).toString();
    }

    /**
     * Given Element className, method would return component globalId which could be used with $A.getCmp(globalId) to
     * have handle in the component in UI test
     * 
     * @param className
     * @return
     */
    public String getCmpGlobalIdGivenElementClassName(String className) {
        String fields = "field('className',\"get('v.class')\").field(\"conc\", \"isConcrete()\")";
        String whereClause = "className === '" + className + "' && conc === true";
        String globalId = findGlobalIdForComponentWithGivenProperties(fields, whereClause);
        return globalId;
    }

    /**
     * Check for uncaught Aura or Javascript errors after executing a particular WebDriver function.
     * 
     * @param function a Function accepting a WebDriver instance
     * @return
     */
    public <V> Function<? super WebDriver, V> addErrorCheck(final Function<? super WebDriver, V> function) {
        return new Function<WebDriver, V>() {
            @Override
            public V apply(WebDriver driver) {
                V value = function.apply(driver);
                if ((value == null) || (Boolean.class.equals(value.getClass()) && !Boolean.TRUE.equals(value))) {
                    String errors = (String) getRawEval("return (window.$A && window.$A.test) ? window.$A.test.getErrors() : '';");
                    assertJsTestErrors(errors);
                }
                return value;
            }
        };
    }

    /**
     * Look for any quickfix exceptions. These can sometimes reflect a framework load failure but provide a better error
     * message.
     */
    public void assertNoAuraErrorMessage(Set<String> exceptForThese) {
        String auraErrorMsg = getAuraErrorMessage();
        if (!auraErrorMsg.isEmpty()) {
            if (exceptForThese != null) {
                // Compare against any expected failures
                for (String allowedException : exceptForThese) {
                    if (auraErrorMsg.contains(allowedException)) {
                        return;
                    }
                }
            }
            Assert.fail("Initialization error: " + auraErrorMsg);
        }
    }

    /**
     * Find first matching element in the DOM.
     * 
     * @param locator
     * @return
     */
    public WebElement findDomElement(final By locator) {
        List<WebElement> elements = findDomElements(locator);
        if (elements != null) {
            return elements.get(0);
        }
        return null;
    }

    /**
     * Find matching elements in the DOM.
     * 
     * @param locator
     * @return
     */
    public List<WebElement> findDomElements(final By locator) {
        WebDriverWait wait = new WebDriverWait(driver, timeoutInSecs);
        return wait.withMessage("fail to find element in dom:" + locator.toString())
                .ignoring(StaleElementReferenceException.class).until(new ExpectedCondition<List<WebElement>>() {

                    @Override
                    public List<WebElement> apply(WebDriver d) {
                        List<WebElement> elements = driver.findElements(locator);
                        if (elements.size() > 0 &&
                                getBooleanEval("return arguments[0].ownerDocument === document", elements.get(0))) {
                            return elements;
                        }
                        return null;
                    }
                });
    }

    /**
     * Get the current aura error message.
     * 
     * This will fail the test if the div is not found (which means that the page did not load at all). If the box is
     * not displayed, it returns an empty string.
     * 
     * @return any error message that is displayed.
     */
    public String getAuraErrorMessage() {
        WebElement errorBox = driver.findElement(By.id("auraErrorMessage"));
        if (errorBox == null) {
            Assert.fail("Aura errorBox not found.");
        }
        if (!errorBox.isDisplayed()) {
            return "";
        }
        return errorBox.getText();
    }

    /**
     * Assert that our error message is the expected production error message.
     */
    public void assertProdErrorMessage() throws Exception {
        String actual = getAuraErrorMessage().replaceAll("\\s+", " ");
        Assert.assertEquals("Unable to process your request", actual);
    }

    /**
     * @return true if Aura framework has loaded
     */
    public boolean isAuraFrameworkReady() {
        return getBooleanEval("return window.$A ? window.$A.finishedInit === true : false;");
    }

    /**
     * Wait until the provided Function returns true or non-null. Any uncaught javascript errors will trigger an
     * AssertionFailedError.
     */
    public <V> V waitUntil(Function<? super WebDriver, V> function) {
        return waitUntil(function, timeoutInSecs);
    }

    /**
     * Wait the specified number of seconds until the provided Function returns true or non-null. Any uncaught
     * javascript errors will trigger an AssertionFailedError.
     */
    public <V> V waitUntil(Function<? super WebDriver, V> function, long timeoutInSecs) {
        WebDriverWait wait = new WebDriverWait(driver, timeoutInSecs);
        return wait.until(addErrorCheck(function));
    }

    /**
     * Wait until the provided Function returns true or non-null. If this does not occur, error out with passed in
     * message. Any uncaught javascript errors will trigger an AssertionFailedError.
     */
    public <V> V waitUntil(Function<? super WebDriver, V> function, String message) {
        return waitUntil(function, timeoutInSecs, message);
    }

    /**
     * Wait the specified number of seconds until the provided Function returns true or non-null. If this does not
     * occur, error out with passed in message. Any uncaught javascript errors will trigger an AssertionFailedError.
     */
    public <V> V waitUntil(Function<? super WebDriver, V> function, long timeoutInSecs, String message) {
        WebDriverWait wait = new WebDriverWait(driver, timeoutInSecs);
        return wait.withMessage(message).until(addErrorCheck(function));
    }

    public String appCacheStatusIntToString(Integer ret) {
        String status = "Unknown cache state";
        switch (ret) {
        case 0:
            status = "UNCACHED";
            break;
        case 1:
            status = "IDLE";
            break;
        case 2:
            status = "CHECKING";
            break;
        case 3:
            status = "DOWNLOADING";
            break;
        case 4:
            status = "UPDATEREADY";
            break;
        case 5:
            status = "OBSOLETE";
            break;
        }
        return status;
    }

    public void waitForAppCacheReady() {
        final long start = System.currentTimeMillis();
        logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAppCacheReady starting");
        waitUntilWithCallback(
                new ExpectedCondition<Boolean>() {
                    @Override
                    public Boolean apply(WebDriver d) {
                        boolean res = getBooleanEval("var cache=window.applicationCache;"
                                + "return $A.util.isUndefinedOrNull(cache) || (cache.status===cache.UNCACHED)"
                                + "||(cache.status===cache.IDLE)||(cache.status===cache.OBSOLETE);");
                        if (res) {
                            logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAppCacheReady finished " + (System.currentTimeMillis() - start));
                        }
                        return res;
                    }
                },
                new ExpectedCondition<String>() {
                    @Override
                    public String apply(WebDriver d) {
                        Object ret = getRawEval("return window.applicationCache.status");
                        logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAppCacheReady timed_out " + (System.currentTimeMillis() - start));
                        return "Current AppCache status is " + appCacheStatusIntToString(((Long) ret).intValue());
                    }
                },
                timeoutInSecs,
                "AppCache is not Ready!");
    }

    /**
     * @param timeoutSecs number of seconds to wait for test to finish
     */
    public void waitForAuraTestComplete(int timeoutSecs) {
        final long start = System.currentTimeMillis();
        logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraTestComplete starting");
        waitUntilWithCallback(
                new ExpectedCondition<Boolean>() {
                    @Override
                    public Boolean apply(WebDriver d) {
                        boolean res = getBooleanEval("return (window.$A && window.$A.test && window.$A.test.isComplete()) || false;");
                        if (res) {
                            logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraTestComplete finished "
                                    + (System.currentTimeMillis() - start));
                        }
                        return res;
                    }
                },
                new ExpectedCondition<String>() {
                    @Override
                    public String apply(WebDriver d) {
                        Object dump = getRawEval("return (window.$A && window.$A.test) ? window.$A.test.getDump() : 'window.$A.test not present in browser';");
                        if (dump == null || dump.toString().isEmpty()) {
                            dump = "no extra test information to display.";
                        }
                        logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraTestComplete timed_out "
                                + (System.currentTimeMillis() - start));
                        return "Test timed out on server.\n" + dump.toString();
                    }
                },
                timeoutSecs,
                "Test did not complete within " + timeoutSecs + " seconds");
    }

    /**
     * @param function function we will apply again and again until timeout
     * @param callbackWhenTimeout function we will run when timeout happens, the return will be append to other output
     *            message, start with "Extra message from callback". we can pass in function to evaluate the client side
     *            status, like applicationCache status
     * @param timeoutInSecs
     * @param message error message when timeout. notice this will get evaluated BEFORE the wait, so just use a string
     */
    public <V2, V1> void waitUntilWithCallback(Function<? super WebDriver, V1> function,
            Function<? super WebDriver, V2> callbackWhenTimeout, long timeoutInSecs, String message) {
        WebDriverWaitWithCallback wait = new WebDriverWaitWithCallback(driver, timeoutInSecs, message);
        wait.until(function, callbackWhenTimeout);
    }

    public void waitForAuraInit() {
        waitForAuraInit(null);
    }

    /**
     * Wait until Aura has finished initialization or encountered an error.
     */
    public void waitForAuraInit(final Set<String> expectedErrors) {
        final long start = System.currentTimeMillis();
        logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraInit starting");
        try {
            waitForDocumentReady();
            waitForAuraFrameworkReady(expectedErrors);
            waitForAppCacheReady();
            logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraInit finished " + (System.currentTimeMillis() - start));
        } catch (Throwable t) {
            logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraInit failed " + (System.currentTimeMillis() - start));
            throw t;
        }
    }

    /**
     * Wait for the document to enter the complete readyState.
     */
    public void waitForDocumentReady() {
        final long start = System.currentTimeMillis();
        logger.info(logPrefix + " ---->AuraUITestingUtil.waitForDocumentReady starting");
        waitUntilWithCallback(
                new ExpectedCondition<Boolean>() {
                    @Override
                    public Boolean apply(WebDriver d) {
                        boolean res = getBooleanEval("return document.readyState === 'complete'");
                        if (res) {
                            logger.info(logPrefix + " ---->AuraUITestingUtil.waitForDocumentReady finished "
                                    + (System.currentTimeMillis() - start));
                        }
                        return res;
                    }
                },
                new ExpectedCondition<String>() {
                    @Override
                    public String apply(WebDriver d) {
                        String ret = (String) getRawEval("return document.readyState");
                        logger.info(logPrefix + " ---->AuraUITestingUtil.waitForDocumentReady timed_out "
                                + (System.currentTimeMillis() - start));
                        return "Current document.readyState is <" + ret + ">";
                    }
                },
                timeoutInSecs,
                "Document is not Ready!");
    }

    /**
     * First, verify that window.$A has been installed. Then, wait until {@link #isAuraFrameworkReady()} returns true.
     * We assume the document has finished loading at this point: callers should have previously called
     * {@link #waitForDocumentReady()}.
     */
    public void waitForAuraFrameworkReady(final Set<String> expectedErrors) {
        final long start = System.currentTimeMillis();
        logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraFrameworkReady starting");
        String doNotAssign = "\nThis message means, you aren't even on Aura application at this point. " +
                "Please do not assign this test failure to Aura team/s unless, Aura team/s is the owner of this test. ";
        WebDriverWait waitAuraPresent = new WebDriverWait(driver, timeoutInSecs);
        waitAuraPresent.withMessage("Initialization error: Perhaps the initial GET failed." + doNotAssign)
                .until(
                        new Function<WebDriver, Boolean>() {
                            @Override
                            public Boolean apply(WebDriver input) {
                                Boolean res = (Boolean) getRawEval("return !!window.$A");
                                if (res) {
                                    logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraFrameworkReady framework_loaded "
                                            + (System.currentTimeMillis() - start));
                                }
                                return res;
                            }
                        });

        WebDriverWait waitFinishedInit = new WebDriverWait(driver, timeoutInSecs);
        waitFinishedInit.ignoring(StaleElementReferenceException.class)
                .withMessage("Initialization error: $A present but failed to initialize")
                .until(
                        new Function<WebDriver, Boolean>() {
                            @Override
                            public Boolean apply(WebDriver input) {
                                assertNoAuraErrorMessage(expectedErrors);
                                boolean res = isAuraFrameworkReady();
                                if (res) {
                                    logger.info(logPrefix + " ---->AuraUITestingUtil.waitForAuraFrameworkReady finished "
                                            + (System.currentTimeMillis() - start));
                                }
                                return res;
                            }
                        });
    }

    /**
     * Finds the WebElement identified by locator and applies the provided Function to it, ignoring
     * StaleElementReferenceException.
     * 
     * @param locator By locator to find WebElement in the DOM.
     * @param function Function to run on web
     * @param message Message to display to user on timeout.
     * @return
     */
    public <R> R waitForElementFunction(final By locator, final Function<WebElement, R> function, String message) {
        WebDriverWait wait = new WebDriverWait(driver, timeoutInSecs);
        return wait.withMessage(message).until(new ExpectedCondition<R>() {
            private WebElement element = null;

            @Override
            public R apply(WebDriver d) {
                if (element == null) {
                    element = findDomElement(locator);
                }
                try {
                    return function.apply(element);
                } catch (StaleElementReferenceException e) {
                    element = null;
                }
                return null;
            }
        });
    }

    public <R> R waitForElementFunction(final By locator, final Function<WebElement, R> function) {
        return waitForElementFunction(locator, function, "Timeout waiting for element");
    }

    
    /**
     * Finds the WebElement identified by locator and waits for the element to be displayed, ignoring
     * StaleElementReferenceException.
     * 
     * @param locator By locator to find WebElement in the DOM.
     * @param message Message to display to user on timeout.
     */
    public void waitForElementDisplayed(final By locator, String message) {
        waitForElementDisplayed(locator, true, message);
    }
    
    /**
     * Finds the WebElement identified by locator and waits for the element to not be displayed, ignoring
     * StaleElementReferenceException.
     * 
     * @param locator By locator to find WebElement in the DOM.
     * @param message Message to display to user on timeout.
     */
    public void waitForElementNotDisplayed(final By locator, String message) {
        waitForElementDisplayed(locator, false, message);
    }

    private void waitForElementDisplayed(final By locator, boolean isDisplayed, String message) {
        waitForElementFunction(locator, (element) -> {
            return element != null && isDisplayed == element.isDisplayed();
        }, message);
    }

    /**
     * Wait for text of an element to be either present or not present.
     * 
     * @param locator By locator to find WebElement in the DOM.
     * @param text Text on the found WebElement.
     * @param toBePresent True if we want text passed in as parameter to equal text on found WebElement.
     * @param message Message to display to user on timeout.
     * @param looking for exact match or just partial
     */
    public void waitForElementText(final By locator, final String text, final boolean toBePresent, String message,
            final Boolean matchFullText) {
        waitForElementFunction(locator, new Function<WebElement, Boolean>() {
            @Override
            public Boolean apply(WebElement element) {
                if (matchFullText == true) {
                    return toBePresent == element.getText().equals(text);
                } else {
                    return toBePresent == element.getText().contains(text);
                }
            }
        }, message);
    }

    public void waitForElementText(final By locator, final String text, final boolean toBePresent, String message) {
        waitForElementText(locator, text, toBePresent, message, true);
    }

    public void waitForElementText(final By locator, final String text, final boolean toBePresent) {
        waitForElementText(locator, text, toBePresent, "Timeout looking for element with text: " + text);
    }

    public void waitForElementTextContains(final By locator, final String text, final boolean toBePresent) {
        waitForElementText(locator, text, toBePresent, "Timeout looking for element with text: " + text, false);
    }

    /**
     * Method of exposing accessibility tool to be exposed for testing purposes
     * 
     * @return ArrayList - either 0,1, or 2. Position 0: Indicates there were no errors Position 1: Indicates that there
     *         were errors Position 2: Indicates that something unexpected happened.
     */
    public ArrayList<String> doAccessibilityCheck() {
        String jsString = "return ((window.$A != null || window.$A !=undefined) && (!$A.util.isUndefinedOrNull($A.devToolService)))? "
                + "window.$A.devToolService.checkAccessibility() : \"Aura is not Present\"";

        String result = (String) getEval(jsString);

        ArrayList<String> resultList = new ArrayList<>();
        String output = "";

        // No errors
        if (result.equals("") || result.equals("Total Number of Errors found: 0")) {
            output = "0";
        } else if (result.contains("Total Number of Errors found")) {
            output = "1";
        } else {
            output = "2";
        }

        resultList.add(output);
        resultList.add(result);
        return resultList;
    }

    public void assertAccessible() {
        getEval("$A.test.assertAccessible()");

    }

    public String getUniqueIdOfFocusedElement() {
        return (String) getEval("return $A.test.getActiveElement().getAttribute('data-aura-rendered-by')");
    }

    public void assertClassesSame(String message, String expectedClasses, String actualClasses) {
        List<String> expected = AuraTextUtil.splitSimpleAndTrim(" ", expectedClasses, 3);
        List<String> actual = AuraTextUtil.splitSimpleAndTrim(" ", actualClasses, 3);
        List<String> extra = Lists.newArrayList();

        for (String x : actual) {
            if (expected.contains(x)) {
                expected.remove(x);
            } else {
                extra.add(x);
            }
        }
        Assert.assertTrue(message + ": Mismatched classes extra = " + extra + ", missing=" + expected,
                extra.size() == 0 && expected.size() == 0);
    }

    /**
     * Creates a random lower case string. NOTE: this is BAD WAY to produce Strings, as the results are
     * non-reproducible. Do not use it: call {@link #randString(int,long)} instead.
     */
    public String randString(int len) {
        return randString(len, RAND);
    }

    /**
     * Creates a random lower case string of specified length, using given pseudo-Random number generator.
     */
    public String randString(int len, Random rnd) {
        byte[] buff = new byte[len];
        for (int i = 0; i < len; i++) {
            buff[i] = (byte) (rnd.nextInt(26) + 'a');
        }
        try {
            return new String(buff, "US-ASCII");
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    /**
     * Return true if div has scrollBar
     * 
     * @param elementClassName
     * @return
     */
    public boolean hasScrollBar(String elementClassName) {
        String js = "var elementBody = $A.test.getElementByClass('" + elementClassName
                + "')[0];return (elementBody.scrollHeight > this.innerHeight);";
        boolean hasScroll = this.getBooleanEval(js);
        return hasScroll;
    }
}
