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

public final class IterationComponentTest extends CustomPerfAbstractTestCase {

    public IterationComponentTest(String name) {
        super(name);

        setComponentDef(getDefDescriptor("performanceTest:aura_iteration"));
    }

    public void TODO_testChangeItemValue() throws Throwable {
        // Change value of an item at index 20.
        final int rowIndex = 20;
        final String rowValue = "new test value";
        WebElement indexInputText = currentDriver.findElement(By.cssSelector(".itemIndex"));
        indexInputText.sendKeys(Integer.toString(rowIndex));
        WebElement valueInputText = currentDriver.findElement(By.cssSelector(".itemValue"));
        valueInputText.sendKeys(rowValue);
        WebElement button = currentDriver.findElement(By.cssSelector(".changeValue"));
        button.click();

        waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                WebElement row = d.findElements(By.cssSelector(".container div")).get(rowIndex);
                return rowValue.equals(row.findElement(By.cssSelector(".uiOutputText")).getText());
            }
        });
    }

    public void TODO_testChangePageSize() throws Throwable {
        // Shrink the list to 20 items.
        WebElement inputText = currentDriver.findElement(By.cssSelector(".pageSize"));
        inputText.sendKeys("20");
        WebElement button = currentDriver.findElement(By.cssSelector(".changePageSize"));
        button.click();

        waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return d.findElements(By.cssSelector(".container div")).size() < 25;
            }
        });
    }

    public void TODO_testChangePageCount() throws Throwable {
        final int pageSize = 25;
        final int pageCount = 20;
        WebElement inputText = currentDriver.findElement(By.cssSelector(".pageCount"));
        inputText.clear();
        inputText.sendKeys(Integer.toString(pageCount));
        WebElement button = currentDriver.findElement(By.cssSelector(".changePageCount"));
        button.click();

        waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return d.findElements(By.cssSelector(".container div")).size() > pageCount * pageSize;
            }
        });
    }
}
