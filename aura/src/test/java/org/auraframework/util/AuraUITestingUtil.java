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
package org.auraframework.util;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringEscapeUtils;
import org.auraframework.util.json.JsonReader;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import junit.framework.Assert;

/**
 * A place to put common UI testing specific helper methods
 *
 *
 */

public class AuraUITestingUtil {
	private WebDriver d;
	
	public AuraUITestingUtil(WebDriver d){
		this.d = d;
	}
	
    public WebElement findElementAndTypeEventNameInIt(String event){
        String locatorTemplate = "#%s > input.uiInputText.uiInput";
        String locator = String.format(locatorTemplate, event);
        WebElement input = d.findElement(By.cssSelector(locator));
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
        className = " " + className + " "; // so we wont get false positive for nonactive if looking for active
        namePart = " " + namePart + " ";

        if (doesContain) {
            Assert.assertTrue("Class name '" + className + "' does not contain '" + namePart + "'",
                    className.contains(namePart));
        } else {
            Assert.assertFalse("Class name '" + className + "' contains '" + namePart + "'",
                    className.contains(namePart));
        }
    }
    
    public String getValueFromRootExpr(String val){
        String exp = "return window.$A.getRoot().get('"+val+"')";
        return exp;
    }

    public void pressEnter(WebElement e){
        e.sendKeys("\n");
    }

    public void pressTab(WebElement e){
        e.sendKeys("\t");
    }
    
    /**
     * Execute the given javascript and args in the current window. Fail if the result is not a boolean. Otherwise,
     * return the result.
     */
    public boolean getBooleanEval(String javascript, Object... args) {
        Object status;
        status = getEval(javascript, args);

        if (status == null) {
            Assert.fail("Got a null status for " + javascript + "(" + args + ")");
        }
        if (!(status instanceof Boolean)) {
            Assert.fail("Got unexpected return value: for " + javascript + "(" + args + ") :\n" + status.toString());
        }

        return ((Boolean)status).booleanValue();
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
         * Wrap the given javascript to evaluate and then check for any collected errors. Then, return the result and
         * errors back to the WebDriver. We must return as an array because
         * {@link JavascriptExecutor#executeScript(String, Object...) cannot handle Objects as return values."
         */
        String escapedJavascript = StringEscapeUtils.escapeJavaScript(javascript);
        String wrapper = "var ret;" + //
                String.format("var func = new Function('arguments', \"%s\");\n", escapedJavascript) + //
                "var ret = func.call(this, arguments);\n" + //
                "var errors = (window.$A && window.$A.test) ? window.$A.test.getErrors() : '';\n" + //
                "return [ret, errors];";

        try {
            @SuppressWarnings("unchecked")
            List<Object> wrapResult = (List<Object>)getRawEval(wrapper, args);
            Assert.assertEquals("Wrapped javsascript execution expects an array of exactly 2 elements", 2, wrapResult.size());
            String errors = (String)wrapResult.get(1);
            assertJsTestErrors(errors);
            return wrapResult.get(0);
        } catch (WebDriverException e) {
            Assert.fail("Script execution failed.\n" + //
                    "Arguments: (" + Arrays.toString(args) + ")\n" + //
                    "Script:\n" + javascript + "\n");
            throw e;
        }
    }
    
    /**
     * Returns value of executing javascript in current window.
     *
     * @see org.openqa.selenium.JavscriptExecutor#executeSript(String, Object...)
     */
    public Object getRawEval(String javascript, Object... args) {
        return ((JavascriptExecutor)d).executeScript(javascript, args);
    }
    
    /**
     * Process the results from $A.test.getErrors(). If there were any errors, then fail the test accordingly.
     * 
     * @param errors
     *            the raw results from invoking $A.test.getErrors()
     */
    public void assertJsTestErrors(String errors) {
        if (!errors.isEmpty()) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> errorsList = (List<Map<String, Object>>)new JsonReader().read(errors);
            StringBuffer errorMessage = new StringBuffer();
            for (Map<String, Object> error : errorsList) {
                errorMessage.append(error.get("message") + "\n");
            }
            Assert.fail(errorMessage.toString());
        }
    }
}
