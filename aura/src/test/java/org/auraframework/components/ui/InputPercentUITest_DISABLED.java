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
package org.auraframework.components.ui;

import org.auraframework.test.WebDriverTestCase;

public class InputPercentUITest_DISABLED extends WebDriverTestCase {

    public InputPercentUITest_DISABLED(String name) {
        super(name);
    }

    // This tests behaviour exhibited by HTML5 input type="number".
    // We are currently rendering ui:inputPercent using type="text" to get around
    // browser implementation bugs.  If these bugs are resolved, we should
    // switch back to using type="number" and re-enable this test.

//  public void testPercentSymbol() throws Exception{
//      String source = "<aura:component>" +
//              "<ui:inputPercent/>" +
//              "</aura:component>";
//      addSource("inputtextuipercentsymboltest", source, ComponentDef.class);
//      open("/string/inputtextuipercentsymboltest.cmp");
//
//      WebDriver d = getDriver();
//        WebElement input = d.findElement(By.tagName("input"));
//        input.sendKeys("12.3%");
//        AuraUITestingUtil.pressTab(input);
//        input = d.findElement(By.tagName("input"));
//        assertEquals("Percent symbol was not trimed", "12.3", input.getAttribute("value"));
//    }
}
