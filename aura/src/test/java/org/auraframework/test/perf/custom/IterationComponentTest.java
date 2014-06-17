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

public final class IterationComponentTest extends CustomPerfAbstractTestCase {

    public IterationComponentTest(String name) {
        super(name);

        setComponentDef(getDefDescriptor("performanceTest:aura_iteration"));
    }

    public void testChangeItemValue() throws Throwable {
        runWithPerfApp(descriptor);

        profileStart(getPerfStartMarker());

        // Change value of an item at index 20.
        WebElement indexInputText = currentDriver.findElement(By.cssSelector(".itemIndex"));
        indexInputText.sendKeys("20");
        WebElement valueInputText = currentDriver.findElement(By.cssSelector(".itemValue"));
        valueInputText.sendKeys("new test value");
        WebElement button = currentDriver.findElement(By.cssSelector(".changeValue"));
        button.click();

        profileEnd(getPerfEndMarker());
    }

    public void testChangePageSize() throws Throwable {
        runWithPerfApp(descriptor);

        profileStart(getPerfStartMarker());

        // Shrink the list to 20 items.
        WebElement inputText = currentDriver.findElement(By.cssSelector(".pageSize"));
        inputText.sendKeys("20");
        WebElement button = currentDriver.findElement(By.cssSelector(".changePageSize"));
        button.click();

        profileEnd(getPerfEndMarker());
    }

    public void testChangePageCount() throws Throwable {
        runWithPerfApp(descriptor);

        profileStart(getPerfStartMarker());

        // Render 200 pages of the default 25 item list.
        WebElement inputText = currentDriver.findElement(By.cssSelector(".pageCount"));
        inputText.clear();
        inputText.sendKeys("200");
        WebElement button = currentDriver.findElement(By.cssSelector(".changePageCount"));
        button.click();

        profileEnd(getPerfEndMarker());
    }
}
