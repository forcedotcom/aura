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

import junit.framework.Assert;

import org.apache.commons.lang.StringEscapeUtils;
import org.auraframework.util.json.JsonReader;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

/**
 * A place to put common UI testing specific helper methods
 */

public class AuraUITestingUtil {
    private final WebDriver d;

    public AuraUITestingUtil(WebDriver d) {
        this.d = d;
    }

    public WebElement findElementAndTypeEventNameInIt(String event) {
        String locatorTemplate = "#%s > input.uiInputText.uiInput";
        String locator = String.format(locatorTemplate, event);
        WebElement input = d.findElement(By.cssSelector(locator));
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
    
    /**
     * Very useful to get handle on the component passing globalId
     * @param cmp: globalId of the component
     * @return
     */
    public String getCmpExpr(String cmp) {
        String exp = "window.$A.getCmp('" + cmp + "')";
        return exp;
    }
    
    /**
     * Return the javascript using which component's attribute value could be found out
     * @param cmp : cmpName whose attribute you are looking for
     * @param val : attribute name
     * @return
     */
    public String getValueFromCmpRootExpression(String cmp, String val){
		return this.prepareReturnStatement(this.getFindAtRootExpr(cmp) + ".get('" + val + "')");
	}
    
    /**
     * Very useful when we know the globalId of the component, inorder to get the attribute value of cmp
     * @param cmp: globalId of the component
     * @param val: attribute name of the component
     * @return
     */
    public String getValueFromCmpExpression(String cmp, String val){
		return this.prepareReturnStatement(this.getCmpExpr(cmp) + ".get('" + val + "')");
	}
    
    public void pressEnter(WebElement e) {
        e.sendKeys("\n");
    }

    public void pressTab(WebElement e) {
        e.sendKeys("\t");
    }

    /**
     * Execute the given javascript and args in the current window. Fail if the
     * result is not a boolean. Otherwise, return the result.
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

        return ((Boolean) status).booleanValue();
    }

    /**
     * Evaluate the given javascript in the current window. Upon completion, if
     * the framework has loaded and is in a test mode, then assert that there
     * are no uncaught javascript errors.
     * <p>
     * As an implementation detail, we accomplish this by wrapping the given
     * javascript so that we can perform the error check on each evaluation
     * without doing a round-trip to the browser (which might be long in cases
     * of remote test runs).
     * 
     * @return the result of calling
     *         {@link JavascriptExecutor#executeScript(String, Object...) with
     *         the given javascript and args.
     */
    public Object getEval(final String javascript, Object... args) {
        /**
         * Wrap the given javascript to evaluate and then check for any
         * collected errors. Then, return the result and errors back to the
         * WebDriver. We must return as an array because
         * {@link JavascriptExecutor#executeScript(String, Object...) cannot
         * handle Objects as return values."
         */
        String escapedJavascript = StringEscapeUtils.escapeJavaScript(javascript);
        String wrapper = "var ret,scriptExecException;"
                + String.format("var func = new Function('arguments', \"%s\");\n", escapedJavascript) + "try\n{"
                + " ret = func.call(this, arguments);\n" + "}\n" + "catch(e){\n"
                + " scriptExecException = e.message || e.toString();\n" + "}\n"
                + //
                "var jstesterrors = (window.$A && window.$A.test) ? window.$A.test.getErrors() : '';\n"
                + "return [ret, jstesterrors, scriptExecException];";

        try {
            @SuppressWarnings("unchecked")
            List<Object> wrapResult = (List<Object>) getRawEval(wrapper, args);
            Assert.assertEquals("Wrapped javsascript execution expects an array of exactly 3 elements", 3,
                    wrapResult.size());
            Object exception = wrapResult.get(2);
            Assert.assertNull("Following JS Exception occured while evaluating provided script:\n" + exception + "\n"
                    + "Arguments: (" + Arrays.toString(args) + ")\n" + "Script:\n" + javascript + "\n", exception);
            String errors = (String) wrapResult.get(1);
            assertJsTestErrors(errors);
            return wrapResult.get(0);
        } catch (WebDriverException e) {
            // shouldn't come here that often as we are also wrapping the js
            // script being passed to us in try/catch above
            Assert.fail("Script execution failed.\n" + "Failure Message: " + e.getMessage() + "\n" + "Arguments: ("
                    + Arrays.toString(args) + ")\n" + "Script:\n" + javascript + "\n");
            throw e;
        }
    }

    /**
     * Returns value of executing javascript in current window.
     * 
     * @see org.openqa.selenium.JavscriptExecutor#executeSript(String,
     *      Object...)
     */
    public Object getRawEval(String javascript, Object... args) {
        return ((JavascriptExecutor) d).executeScript(javascript, args);
    }

    /**
     * Process the results from $A.test.getErrors(). If there were any errors,
     * then fail the test accordingly.
     * 
     * @param errors the raw results from invoking $A.test.getErrors()
     */
    public void assertJsTestErrors(String errors) {
        if (!errors.isEmpty()) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> errorsList = (List<Map<String, Object>>) new JsonReader().read(errors);
            StringBuffer errorMessage = new StringBuffer();
            for (Map<String, Object> error : errorsList) {
                errorMessage.append(error.get("message") + "\n");
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
     * @param element
     */
	public void setHoverOverElement(String elem) {
		Actions builder = new Actions(d);
		// find the element a 2nd time which helps get around the IE hover issues by focusing the element
		WebElement element = d.findElement(By.className(elem));
		builder.moveToElement(element).build().perform();
	}

	/**
     * Get the text content of a DOM node. Tries "innerText" followed by
     * "textContext" to take browser differences into account.
     * 
     */
	public String getActiveElementText() {
		return (String) getEval("return $A.test.getActiveElementText()");
	}

}
