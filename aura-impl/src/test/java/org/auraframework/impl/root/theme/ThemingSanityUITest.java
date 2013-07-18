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
package org.auraframework.impl.root.theme;

import org.auraframework.test.WebDriverTestCase;

/**
 * Tests that verify minimum required functionality of Aura Theming.
 * Basic sanity testing of various flows. As phase 2 is built out more tests will be added here.
 * 
 * @author ljagasia
 *
 */
public class ThemingSanityUITest extends WebDriverTestCase {
    public ThemingSanityUITest (String name) {
        super(name);
    }

    /**
     * Using theme variables in CSS
     */
    public void testThemeVariablesInCSS() throws Exception {
        open("/themeTest/themeVariable.cmp");

        String pageSource = getDriver().getPageSource();
        String sourceNoWhitespace = pageSource.replaceAll("\\s", "");
        String expectedCss = ".themeTestHeader{width:100%;height:300px;color:red;background-color:green}";
        assertTrue("Loaded app does not have template css present.", sourceNoWhitespace.contains(expectedCss));
    }
    
    /**
     * Verify using theme variables across multiple namepaces 
     * @throws Exception 
     */
    public void testThemeVariablesAcrossNamespaces() throws Exception{
    	open("/themeTest/themeAcrossNamespaces.cmp");

        String pageSource = getDriver().getPageSource();
        String sourceNoWhitespace = pageSource.replaceAll("\\s", "");
        String expectedCss = ".themeTestThemeAcrossNamespaces{margin:10px;font-family:Arial,sans-serif;background:#bbbbbb}";
        assertTrue("Loaded app does not have template css present.", sourceNoWhitespace.contains(expectedCss));
    }
    
    /**
     * Verify theme extension.
     * @throws Exception
     */
    public void testThemeExtension() throws Exception{
    	open("/themeTest/themeExtension.cmp");

        String pageSource = getDriver().getPageSource();
        String sourceNoWhitespace = pageSource.replaceAll("\\s", "");
        String expectedCss1 = ".themeTestHeader{width:100%;height:300px;color:red;background-color:green}";
        String expectedCss2 = ".themeTestHeader2{color:yellow;background-color:green}";
        assertTrue("Loaded app does not have template css present.", sourceNoWhitespace.contains(expectedCss1));
        assertTrue("Loaded app does not have template css present.", sourceNoWhitespace.contains(expectedCss2));
    }
    
    
}
