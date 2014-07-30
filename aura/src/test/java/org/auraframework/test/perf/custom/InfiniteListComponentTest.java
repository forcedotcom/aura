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

public final class InfiniteListComponentTest extends CustomPerfAbstractTestCase {

    public InfiniteListComponentTest(String name) {
        super(name);

        setComponentDef(getDefDescriptor("performanceTest:ui_infiniteList"));
    }

    public void TODO_testShowMore() throws Throwable {
        // Load more data.
        WebElement element = currentDriver.findElement(By.cssSelector(".showMore"));
        element.click();

        final int expectedNumberOfRows = 50;
        waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return d.findElements(By.cssSelector(".listContent ul div")).size() == expectedNumberOfRows;
            }
        });
    }

    public void TODO_testRefresh() throws Throwable {
        // Refresh the list
        WebElement element = currentDriver.findElement(By.cssSelector(".refresh"));
        element.click();

        waitFor(5);
    }
}
