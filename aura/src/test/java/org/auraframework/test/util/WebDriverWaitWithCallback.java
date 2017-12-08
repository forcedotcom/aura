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
package org.auraframework.test.util;

import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.function.Function;

/**
 * A specialization of {@link WebDriverWait} that run passed in callback function when wait time out.
 */
public class WebDriverWaitWithCallback extends WebDriverWait {
    private final WebDriver driver;

    public WebDriverWaitWithCallback(WebDriver driver, long timeOutInSeconds, String message) {
        super(driver, timeOutInSeconds);
        withMessage(message);
        this.driver = driver;
    }

    public <V2, V1> V1 until(Function<? super WebDriver, V1> function,
            Function<? super WebDriver, V2> callbackWhenTimeout) {
        try {
            return super.until(function);
        } catch (TimeoutException e) {
            // catch timeout exception and throw exception with extra message from callback function
            V2 ret = callbackWhenTimeout.apply(driver);
            throw new TimeoutException(e.getMessage() + "\n" + ret.toString(), e.getCause());
        }
    }
}