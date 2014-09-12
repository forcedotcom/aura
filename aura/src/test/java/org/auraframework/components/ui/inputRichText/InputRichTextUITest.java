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
package org.auraframework.components.ui.inputRichText;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

@UnAdaptableTest("Issue with sfdc environments with sendkeys in iframes. See W-2009411.")
public class InputRichTextUITest extends WebDriverTestCase {
    private final String URL = "/uitest/inputRichText_Test.cmp";
    private final String LINKBEFORE_LOCATOR = ".linkbefore";
    private final String CK_EDITOR_LOCATOR = ".cke_contents";
    private final String SUBMIT_BUTTON_LOCATOR = ".uiButton";
    private final String OUTPUT_LOCATOR = ".uiOutputText";
    private final String RT_CMP = "Text";

    public InputRichTextUITest(String name) {
        super(name);
    }

    /**
     * Able to tab into inputRichText Component.
     */
    /* Excluding ipad and safari because safari driver has issues with element.sendkeys(Keys.TAB) */
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.IPAD, BrowserType.IPHONE })
    public void testRichTextTabbing() throws Exception {
        open(URL);
        WebElement beforeLink = auraUITestingUtil.waitForElement(By.cssSelector(LINKBEFORE_LOCATOR));
        WebElement ckEditor = auraUITestingUtil.waitForElement(By.cssSelector(CK_EDITOR_LOCATOR));
        WebElement ckEditorInput = ckEditor.findElement(By.tagName("iframe"));
        WebElement submitBtn = auraUITestingUtil.findDomElement(By.cssSelector(SUBMIT_BUTTON_LOCATOR));

        String inputText = "im here";

        // setup
        beforeLink.click();

        // tab into
        auraUITestingUtil.pressTab(beforeLink);

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
    // ios-driver fails to send the '/' key
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET,
            BrowserType.IPAD, BrowserType.IPHONE })
    @ThreadHostileTest("testHtmlContentEscaped is not thread-safe")
    public void testHtmlContentEscaped() throws Exception {
        open(URL);
        WebElement ckEditor = auraUITestingUtil.waitForElement(By.cssSelector(CK_EDITOR_LOCATOR));
        WebElement ckEditorInput = ckEditor.findElement(By.tagName("iframe"));

        String html = "</html>";
        String escapedHtml = "&lt;/html&gt;";

        ckEditor.click();
        ckEditorInput.sendKeys(html);
        waitForTextInRichText(RT_CMP, escapedHtml);
    }

    private void waitForTextInRichText(final String auraId, final String text) {
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                String expr = auraUITestingUtil.getValueFromCmpRootExpression(auraId, "v.value");
                String rtText = (String) auraUITestingUtil.getEval(expr);
                return text.equals(rtText);
            }
        });
    }

    private void assertOutputText(String expectedText) {
        auraUITestingUtil.waitForElementText(By.cssSelector(OUTPUT_LOCATOR), expectedText, true);
    }
}
