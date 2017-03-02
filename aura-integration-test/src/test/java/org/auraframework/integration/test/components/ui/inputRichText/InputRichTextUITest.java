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
package org.auraframework.integration.test.components.ui.inputRichText;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

/* UnAdaptable because issue with sfdc environments with sendkeys in iframes
 * see W-1985839 and W-2009411
 */
@UnAdaptableTest
@ThreadHostileTest("Tests modify if locker service is enabled")
public class InputRichTextUITest extends WebDriverTestCase {
    private final String URL = "/uitest/inputRichText_Test.cmp";
    private final String CMP_URL = "/ui/inputRichText.cmp";
    private final String LINKBEFORE_LOCATOR = ".linkbefore";
    private final String CK_EDITOR_LOCATOR = ".cke_contents";
    private final String SUBMIT_BUTTON_LOCATOR = ".uiButton";
    private final String OUTPUT_LOCATOR = ".uiOutputText";
    private final String IN_RICHTEXT_BODY = ".inputRichTextBody";
    private final String RT_CMP = "Text";

    @Override
    public void setUp() throws Exception {
        super.setUp();
        
        getMockConfigAdapter().setLockerServiceEnabled(false);
    }

    // TODO: remove when another test in this class is activated
    @Test
    public void testDummy() {}

    /**
     * Able to tab into inputRichText Component.
     */
    /* Excluding ipad and safari because safari driver has issues with element.sendkeys(Keys.TAB) */
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.IPAD, BrowserType.IPHONE })
    @Test
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    public void _testRichTextTabbing() throws Exception {
        open(URL);
        WebElement beforeLink = getAuraUITestingUtil().waitForElement(By.cssSelector(LINKBEFORE_LOCATOR));
        WebElement ckEditor = getAuraUITestingUtil().waitForElement(By.cssSelector(CK_EDITOR_LOCATOR));
        WebElement ckEditorInput = ckEditor.findElement(By.tagName("iframe"));
        WebElement submitBtn = getAuraUITestingUtil().findDomElement(By.cssSelector(SUBMIT_BUTTON_LOCATOR));

        String inputText = "im here";

        // setup
        beforeLink.click();

        // tab into
        getAuraUITestingUtil().pressTab(beforeLink);

        // type into ck editor
        ckEditorInput.sendKeys(inputText);
        waitForTextInRichText(RT_CMP, inputText);

        // click submit and see if text was entered into editor
        submitBtn.click();
        assertOutputText(inputText);
    }

    /**
     * Test html content is escaped.
     */
    // Issue with sendKeys in Safari https://code.google.com/p/selenium/issues/detail?id=4467.
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD,
            BrowserType.IPHONE })
    @ThreadHostileTest("testHtmlContentEscaped is not thread-safe")
    @Test
    // TODO: Flapping on Jenkins autobuilds
    public void _testHtmlContentEscaped() throws Exception {
        open(URL);
        WebElement ckEditor = getAuraUITestingUtil().waitForElement(By.cssSelector(CK_EDITOR_LOCATOR));
        WebElement ckEditorInput = ckEditor.findElement(By.tagName("iframe"));

        String html = "</html>";
        String escapedHtml = "&lt;/html&gt;";

        ckEditor.click();
        ckEditorInput.sendKeys(html);
        waitForTextInRichText(RT_CMP, escapedHtml);
    }

    /**
     * ui:inputRichText doesn't render its initial value Test case: W-2428455
     */
    // Excluding test as switchTo not supported with android drivers
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET })
    @Test
    // TODO: Flapping on Jenkins autobuilds
    public void _testRenderInitialValueOfRichText() throws Exception {
        String defaultText = "testing text";
        WebDriver driver = this.getDriver();
        open(String.format("%s?value=%s", CMP_URL, defaultText));
        WebElement ckEditor = getAuraUITestingUtil().waitForElement(By.cssSelector(CK_EDITOR_LOCATOR));
        WebElement ckEditorInput = ckEditor.findElement(By.tagName("iframe"));
        driver.switchTo().frame(ckEditorInput);
        getAuraUITestingUtil().waitForElementDisplayed(By.cssSelector(IN_RICHTEXT_BODY), "no richtext body");
        getAuraUITestingUtil().waitForElementText(By.cssSelector(IN_RICHTEXT_BODY), defaultText, true);
        driver.switchTo().defaultContent();
    }

    private void waitForTextInRichText(final String auraId, final String text) {
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                String expr = getAuraUITestingUtil().getValueFromCmpRootExpression(auraId, "v.value");
                String rtText = (String) getAuraUITestingUtil().getEval(expr);
                return text.equals(rtText);
            }
        });
    }

    private void assertOutputText(String expectedText) {
        getAuraUITestingUtil().waitForElementText(By.cssSelector(OUTPUT_LOCATOR), expectedText, true);
    }
}
