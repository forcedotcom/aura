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
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

public final class RenderIfComponentTest extends CustomPerfAbstractTestCase {

    public RenderIfComponentTest(String name) {
        super(name);

        setComponentDef(getDefDescriptor("performanceTest:aura_renderif"));
    }

    public void TODO_testChangeCount() throws Throwable {
        // Change number of first level renderIf's to 200.
        final int numberOfRows = 200;
        WebElement inputText = currentDriver.findElement(By.cssSelector(".count"));
        inputText.clear();
        inputText.sendKeys(Integer.toString(numberOfRows));
        WebElement button = currentDriver.findElement(By.cssSelector(".changeCount"));
        button.click();

        waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return d.findElements(By.cssSelector(".container div")).size() > numberOfRows;
            }
        });
    }

    public void TODO_testChangeNestedCount() throws Throwable {
        // Change number of second level renderIf's to 5.
        WebElement inputText = currentDriver.findElement(By.cssSelector(".nestedCount"));
        inputText.clear();
        inputText.sendKeys("5");
        WebElement button = currentDriver.findElement(By.cssSelector(".changeNestedCount"));
        button.click();
    }
}
