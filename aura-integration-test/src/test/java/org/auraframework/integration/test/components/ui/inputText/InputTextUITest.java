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
package org.auraframework.integration.test.components.ui.inputText;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.PerfTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * UI tests for inputText Component
 */
@ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE} )
public class InputTextUITest extends WebDriverTestCase {

    public static final String TEST_CMP = "/uitest/inputtext_updateontest.cmp";
    public static final String TEST_CMP_WITH_LABELS = "/uitest/inputtext_updateonwithlabeltest.cmp";

    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD })
    @Test
    public void testUpdateOnAttribute_UsingStringSource() throws Exception {
        String event = "blur";
        String baseTag = "<aura:component  model=\"java://org.auraframework.components.test.java.model.TestJavaModel\"> "
                + "<div id=\"%s\">" + event + ":"
                + "<ui:inputText aura:id=\"%s\" class=\"%s\" value=\"{!m.string}\" updateOn=\"%s\"/>" + "</div>"
                + "<div id=\"output\">" + "output: <ui:outputText value=\"{!m.string}\"/>" + "</div>"
                + "</aura:component>";
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, baseTag.replaceAll("%s", event));
        open(String.format("/%s/%s.cmp", cmpDesc.getNamespace(), cmpDesc.getName()));
        String value = getCurrentModelValue();
        WebElement input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(event);
        WebElement outputDiv = findDomElement(By.id("output"));
        assertModelValue(value, "Value shouldn't be updated yet.");
        input.click();
        outputDiv.click();// to simulate tab behavior for touch browsers
        assertModelValue(event); // value should have been updated
    }

    @UnAdaptableTest
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD,
            BrowserType.SAFARI, BrowserType.IPHONE })
    // Change event not picked up on IOS devices
    @Test
    public void testUpdateOnAttributeForNonIosAndroidDevice() throws Exception {
        doTestUpdateOnAttributeForNonIosAndroidDevice(TEST_CMP);
    }

    @UnAdaptableTest
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD,
            BrowserType.SAFARI, BrowserType.IPHONE })
    // Change event not picked up on IOS devices
    // Flapper: W-2755040
    public void _testUpdateOnAttributeWithLabelsForNonIosAndroidDevice() throws Exception {
        doTestUpdateOnAttributeForNonIosAndroidDevice(TEST_CMP_WITH_LABELS);
    }

    public void doTestUpdateOnAttributeForNonIosAndroidDevice(String url) throws Exception {
        open(url);
        WebElement outputDiv = findDomElement(By.id("output"));
        String eventName = "change";
        getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        outputDiv.click();
        assertModelValue(eventName);
    }

    @UnAdaptableTest
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET })
    @Test
    public void testUpdateOnAttribute() throws Exception {
        doTestUpdateOnAttribute(TEST_CMP);
    }

    @UnAdaptableTest
    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET })
    @Test
    public void testUpdateOnAttributeWithLabels() throws Exception {
        doTestUpdateOnAttribute(TEST_CMP_WITH_LABELS);
    }

    public void doTestUpdateOnAttribute(String url) throws Exception {
        open(url);
        String value = getCurrentModelValue();
        WebElement outputDiv = findDomElement(By.id("output"));

        String eventName = "blur";
        WebElement input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        assertModelValue(value, "Value shouldn't be updated yet.");
        input.click();
        outputDiv.click(); // to simulate tab behavior for touch browsers
        value = assertModelValue(eventName); // value should have been updated
        assertDomEventSet();

        // ios seems to send a delayed click event when doing a WebElement.clear() and WebElement.sendKeys() in sequence
        // so skip click check.
        if (!BrowserType.IPAD.equals(getBrowserType()) && !BrowserType.IPHONE.equals(getBrowserType())) {
            eventName = "click";
            input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
            assertModelValue(value);
            outputDiv.click();
            assertModelValue(value, "Clicking an element without the updateOn attribute should not change the value");
            input.click();
            value = assertModelValue(eventName);
            assertDomEventSet();
        }

        eventName = "focus";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        outputDiv.click();
        input.click();
        value = assertModelValue(eventName);
        assertDomEventSet();

        eventName = "keydown";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        value = assertModelValue(eventName.substring(0, eventName.length() - 1));
        assertDomEventSet();

        eventName = "keypress";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        value = assertModelValue(eventName.substring(0, eventName.length() - 1));
        assertDomEventSet();

        eventName = "keyup";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        value = assertModelValue(eventName);
        assertDomEventSet();
    }

    @TargetBrowsers({ BrowserType.GOOGLECHROME })
    @Test
    public void testUpdateOnAttributeWithCertainEventsChrome() throws Exception {
        doTestUpdateOnAttributeWithCertainEventsChrome(TEST_CMP);
    }

    @TargetBrowsers({ BrowserType.GOOGLECHROME })
    @Test
    public void testUpdateOnAttributeWithLabelsWithCertainEventsChrome() throws Exception {
        doTestUpdateOnAttributeWithCertainEventsChrome(TEST_CMP_WITH_LABELS);
    }

    @TargetBrowsers({ BrowserType.GOOGLECHROME })
    public void doTestUpdateOnAttributeWithCertainEventsChrome(String url) throws Exception {
        open(url);
        String value = getCurrentModelValue();
        WebDriver d = getDriver();
        Actions a = new Actions(d);

        WebElement outputDiv = findDomElement(By.id("output"));

        String eventName = "dblclick";
        WebElement input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        assertModelValue(value, "Value shouldn't be updated yet.");
        a.doubleClick(input).build().perform();
        value = assertModelValue(eventName);
        assertDomEventSet();

        eventName = "mousemove";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        assertModelValue(value, "Value shouldn't be updated yet.");
        a.moveToElement(input).moveByOffset(0, 100).build().perform();
        value = assertModelValue(eventName);
        assertDomEventSet();

        eventName = "mouseout";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        assertModelValue(value, "Value shouldn't be updated yet.");
        a.moveToElement(input).moveToElement(outputDiv).build().perform();
        value = assertModelValue(eventName);
        assertDomEventSet();

        eventName = "mouseover";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        assertModelValue(value, "Value shouldn't be updated yet.");
        outputDiv.click();
        a.moveToElement(input).build().perform();
        value = assertModelValue(eventName);
        assertDomEventSet();

        eventName = "mouseup";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        assertModelValue(value, "Value shouldn't be updated yet.");
        input.click();
        value = assertModelValue(eventName);
        assertDomEventSet();

        eventName = "select";
        input = getAuraUITestingUtil().findElementAndTypeEventNameInIt(eventName);
        assertModelValue(value, "Value shouldn't be updated yet.");
        a.doubleClick(input).build().perform();
        value = assertModelValue(eventName);
    }

    /**
     * Different browsers support different events, so this case tests an event supported by all browsers.
     * testUpdateOnAttributeWithCertainEventsChrome() more extensively tests different event types, but only on Chrome
     * where we know they are all supported.
     * 
     * Note we are not using auraUITestingUtil.findElementAndTypeEventNameInIt(eventName) in this test because the
     * Android driver sends a mousedown event when clearing the text field.
     */
    @Test
    public void testUpdateOnAttributeWithCertainEventsAllBrowsers() throws Exception {
        doTestUpdateOnAttributeWithCertainEventsAllBrowsers(TEST_CMP);
    }

    @PerfTest
    @Test
    public void testUpdateOnAttributeWithLabelsWithCertainEventsAllBrowsers() throws Exception {
        doTestUpdateOnAttributeWithCertainEventsAllBrowsers(TEST_CMP_WITH_LABELS);
    }

    public void doTestUpdateOnAttributeWithCertainEventsAllBrowsers(String url) throws Exception {
        open(url);
        String value = getCurrentModelValue();
        String eventName = "mousedown";

        String locatorTemplate = "input[class*='%s']";
        String locator = String.format(locatorTemplate, eventName);
        WebElement input = findDomElement(By.cssSelector(locator));
        input.click();
        input.sendKeys(eventName);

        assertModelValue(value, "Value shouldn't be updated yet.");
        input.click();
        String expected = value + eventName;

        assertModelValue(expected);
        assertDomEventSet();
    }

    // W-1551077: Issue with Webdriver API ignores maxlength HTML5 attribute (iOS/Safari)
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.SAFARI })
    @Test
    public void testMaxLength() throws Exception {
        open("/uitest/inputText_MaxLength.cmp");
        WebElement input = findDomElement(By.cssSelector("input.uiInputText.uiInput"));
        input.click();
        input.sendKeys("1234567890");
        waitForInputValue(input, "12345", "Text not truncated to 5 chars correctly");
    }

    @Test
    public void testNoMaxLength() throws Exception {
        open("/uitest/inputText_NoMaxLength.cmp");
        WebElement input = findDomElement(By.cssSelector("input.uiInputText.uiInput"));
        input.click();
        String inputText = "1234567890";
        input.sendKeys(inputText);
        waitForInputValue(input, inputText, "Expected untruncated text");
    }

    private String assertModelValue(final String expectedValue) {
        return assertModelValue(expectedValue, "Model value is not what we expected");
    }

    private String assertModelValue(final String expectedValue, final String errorMsg) {
        try {
            return getAuraUITestingUtil().waitUntil(new ExpectedCondition<String>() {
                @Override
                public String apply(WebDriver d) {
                    String actual = getCurrentModelValue();
                    if (expectedValue.equals(actual)) {
                        return actual;
                    } else {
                        return null;
                    }
                }
            }, (getAuraUITestingUtil().getTimeout() * 3));
        } catch (TimeoutException e) {
            assertEquals(errorMsg, expectedValue, getCurrentModelValue());
            return getCurrentModelValue();
        }
    }

    private String getCurrentModelValue() {
        String valueExpression = getAuraUITestingUtil().prepareReturnStatement(getAuraUITestingUtil()
                .getValueFromRootExpr("m.string"));
        String value = (String) getAuraUITestingUtil().getEval(valueExpression);
        return value;
    }

    private void assertDomEventSet() {
        String valueExpression = getAuraUITestingUtil().prepareReturnStatement(getAuraUITestingUtil()
                .getValueFromRootExpr("v.isDomEventSet"));
        boolean value = getAuraUITestingUtil().getBooleanEval(valueExpression);
        assertTrue("domEvent attribute on event should have been set.", value);
    }

    @Test
    public void testNullValue() throws Exception {
        String cmpSource = "<aura:component  model=\"java://org.auraframework.components.test.java.model.TestJavaModel\"> "
                + "<ui:inputText value=\"{!m.stringNull}\"/>" + "</aura:component>";
        DefDescriptor<ComponentDef> inputTextNullValue = addSourceAutoCleanup(ComponentDef.class, cmpSource);
        open(String.format("/%s/%s.cmp", inputTextNullValue.getNamespace(), inputTextNullValue.getName()));

        WebElement input = findDomElement(By.tagName("input"));
        assertEquals("Value of input is incorrect", "", input.getText());
    }

    @Test
    public void testBaseKeyboardEventValue() throws Exception {
        open(TEST_CMP);
        String inputText = "z";
        WebElement input = findDomElement(By.cssSelector(".keyup2"));
        // SafariDriver has trouble finding nested elements so use this 2 step approach.
        WebElement div = findDomElement(By.id("inspectBaseEvent"));
        WebElement outputValue = div.findElement(By.cssSelector(".outputValue"));
        input.click();
        input.sendKeys(inputText);
        try {
            char outputText = (char) Integer.parseInt(outputValue.getText());
            assertEquals("InputChar and outputChar are different ", inputText.charAt(0), outputText);
        } catch (Exception e) {
            fail("ParseInt failed with following error" + e.getMessage());
        }
    }

    // W-1625895: Safari WebDriver bug- cannot right click because interactions API not implemented
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE, BrowserType.SAFARI, BrowserType.ANDROID_PHONE,
            BrowserType.ANDROID_TABLET })
    @Test
    public void testBaseMouseClickEventValue() throws Exception {
        open(TEST_CMP);
        WebElement input = findDomElement(By.cssSelector(".keyup2"));
        WebElement outputValue = findDomElement(By.cssSelector(".outputValue"));

        // IE < 9 uses values 1, 2, 4 for left, right, middle click (respectively)
        String expectedVal = BrowserType.IE8.equals(getBrowserType()) ? "1"
                : "0";
        input.click();
        assertEquals("Left click not performed ", expectedVal, outputValue.getText());

        // right click behavior
        Actions actions = new Actions(getDriver());
        actions.contextClick(input).perform();
        assertEquals("Right click not performed ", "2", outputValue.getText());
    }

    /**
     * Test Case for W-1689213
     */
    @Test
    public void testInputTextWithLabel() throws Exception {
        open(TEST_CMP);
        WebElement div = findDomElement(By.id("inputwithLabel"));
        WebElement input = div.findElement(By.tagName("input"));
        WebElement outputDiv = findDomElement(By.id("output"));

        String inputAuraId = "inputwithLabel";
        String valueExpression = getAuraUITestingUtil().getValueFromCmpRootExpression(inputAuraId, "v.value");
        String defExpectedValue = (String) getAuraUITestingUtil().getEval(valueExpression);
        assertEquals("Default value should be the same", inputAuraId, defExpectedValue);

        // AndroidDriver likes to type things in all caps so modify input to accommodate.
        String inputText = "UPDATEDTEXT";
        input.clear();
        input.click();
        input.sendKeys(inputText);
        outputDiv.click(); // to simulate tab behavior for touch browsers
        String actualText = (String) getAuraUITestingUtil().getEval(valueExpression);
        assertEquals("Value of Input text shoud be updated", inputText, actualText);
    }

    @ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    @Test
    public void testInputTextWithEmptyLabel() throws Exception {
        open(TEST_CMP_WITH_LABELS);
        String value = getCurrentModelValue();
        WebElement outputDiv = findDomElement(By.id("output"));
        WebElement input = getAuraUITestingUtil().findElementAndTypeEventNameInIt("empty");
        assertModelValue(value, "Value should not be updated yet.");
        input.click();
        outputDiv.click(); // to simulate tab behavior for touch browsers
        assertModelValue("empty"); // value should have been updated
        assertDomEventSet();
    }

    private void waitForInputValue(final WebElement inputElm, final String expValue, final String errorMsg) {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return expValue.equals(inputElm.getAttribute("value"));
            }
        }, errorMsg);
    }
}
