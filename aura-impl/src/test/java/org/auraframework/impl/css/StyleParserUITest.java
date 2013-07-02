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
package org.auraframework.impl.css;

import org.auraframework.test.WebDriverTestCase;

public class StyleParserUITest extends WebDriverTestCase {
    public StyleParserUITest(String name) {
        super(name);
    }

    /**
     * Verify css from template is properly injected and present on loaded DOM.
     * 
     * Automation for W-1538820.
     */
    public void testStyleCssInjectedIntoDom() throws Exception {
        open("/test/styleTest.app");

        String pageSource = getDriver().getPageSource();
        String sourceNoWhitespace = pageSource.replaceAll("\\s", "");
        String expectedCssOnDom = "body{background-color:#FF9}.templateRule{border:1pxdottedblack;"
                + "font-style:italic;font-family:monospace}span{word-spacing:20px}";
        assertTrue("Loaded app does not have template css present.", sourceNoWhitespace.contains(expectedCssOnDom));
    }
}
