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
package org.auraframework.integration.test.css;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.CheckAccessibility;
import org.junit.Test;
import org.openqa.selenium.By;

/**
 * Tests that verify minimum required functionality of Aura Tokens. Basic sanity testing of various flows. As phase 2
 * is built out more tests will be added here.
 *
 * @author ljagasia
 */
@CheckAccessibility(false)
public class TokensSanityUITest extends WebDriverTestCase {

    private String getRGBonly(String value) {
        Pattern pattern = Pattern.compile("rgba?\\(((?:\\d+, ){2}\\d+)(, .+)?\\)");
        Matcher matcher = pattern.matcher(value.toLowerCase());
        return matcher.matches() ? "rgb(" + matcher.group(1) + ")" : value;
    }
    
    /**
     * Using token variables in CSS
     */
    @Test
    public void testTokenVariablesInCSS() throws Exception {
        final String expectedBgColor = "rgb(0, 128, 0)"; // green
        final String expectedFgColor = "rgb(255, 0, 0)"; // red
        final String expectedHeight = "300px";

        open("/tokenSanityTest/tokenVariable.cmp");
        String actualBgColor = getRGBonly(
                getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("background-color"));
        String actualFgColor = getRGBonly(
                getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("color"));
        String actualHeight = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("height")
                .toLowerCase();

        assertEquals("Loaded app should have template css present for background-color.", expectedBgColor,
                actualBgColor);
        assertEquals("Loaded app should have template css present for color.", expectedFgColor, actualFgColor);
        assertEquals("Loaded app should have template css present for height.", expectedHeight, actualHeight);
    }

    /**
     * Verify token override.
     *
     * @throws Exception
     */
    @Test
    public void testTokenOverride() throws Exception {
        // base tokens
        final String expectedHeight1 = "300px";
        final String expectedColor1 = "rgb(255, 0, 0)"; // red
        final String expectedBgColor1 = "rgb(0, 128, 0)"; // green

        // overridden child tokens
        final String expectedColor2 = "rgb(255, 255, 0)"; // yellow
        final String expectedBgColor2 = "rgb(0, 128, 0)"; // green

        open("/tokenSanityTest/usingOverride.app");

        String actualHeight1 = getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("height")
                .toLowerCase();
        String actualColor1 = getRGBonly(
                getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("color"));
        String actualBgColor1 = getRGBonly(
                getDriver().findElement(By.cssSelector(".tokenSanityTestHeader")).getCssValue("background-color"));

        String actualColor2 = getRGBonly(
                getDriver().findElement(By.cssSelector(".tokenSanityTestHeader2")).getCssValue("color"));
        String actualBgColor2 = getRGBonly(
                getDriver().findElement(By.cssSelector(".tokenSanityTestHeader2")).getCssValue("background-color"));

        assertEquals("Loaded app should have base tokens applied for height", expectedHeight1, actualHeight1);
        assertEquals("Loaded app should have base tokens applied for color", expectedColor1, actualColor1);
        assertEquals("Loaded app should have base tokens applied for background-color", expectedBgColor1,
                actualBgColor1);

        assertEquals("Loaded app should have overridden child tokens applied for color", expectedColor2, actualColor2);
        assertEquals("Loaded app should have overridden child tokens applied for background-color", expectedBgColor2,
                actualBgColor2);
    }
}
