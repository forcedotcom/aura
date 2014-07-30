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
package org.auraframework.test.perf.custom;

import org.auraframework.test.perf.core.CustomPerfAbstractTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public final class CheckboxMenuListComponentTest extends CustomPerfAbstractTestCase {

    public CheckboxMenuListComponentTest(String name) {
        super(name);

        setComponentDef(getDefDescriptor("performanceTest:ui_menu_checkBox"));
    }

    public void TODO_testChangeMenuItem() throws Throwable {
        // Open a menu and check multiple items.
        WebElement menu = currentDriver.findElement(By.cssSelector(".uiMenu"));
        menu.click();

        WebElement item = currentDriver.findElement(By.cssSelector(".checkboxItem1"));
        waitForElementPresent(item);
        item.click();

        item = currentDriver.findElement(By.cssSelector(".checkboxItem2"));
        item.click();

        item = currentDriver.findElement(By.cssSelector(".checkboxItem3"));
        item.click();
    }
}
