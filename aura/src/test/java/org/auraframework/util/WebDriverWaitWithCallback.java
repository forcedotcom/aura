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
package org.auraframework.util;

import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.base.Function;

/**
 * A specialization of {@link WebDriverWait} that run passed in callback function when wait time out.
 */
public class WebDriverWaitWithCallback extends WebDriverWait {
    private final WebDriver driver;

    public WebDriverWaitWithCallback(WebDriver driver, long timeOutInSeconds) {
        super(driver, timeOutInSeconds);
        this.driver = driver;
    }

    public WebDriverWaitWithCallback(WebDriver driver, long timeOutInSeconds, String message) {
        super(driver, timeOutInSeconds);
        super.withMessage(message);
        this.driver = driver;
    }

    public <V2, V1> V1 until(Function<? super WebDriver, V1> function,
            Function<? super WebDriver, V2> callbackWhenTimeout) {
        try {
            return super.until(function);
        } catch (TimeoutException et) {
            // catch timeout exception and throw exception with extra message from callback function
            V2 ret = callbackWhenTimeout.apply(driver);
            TimeoutExceptionWithExtraMessage tecm = new TimeoutExceptionWithExtraMessage(et.getMessage(),
                    et.getCause(), ret.toString());
            throw tecm;
        }
        // let other exception (like WebDriverException) bubble up
    }

    /**
     * Customized TimeoutException class, with extra message prepended to the original one
     */
    public class TimeoutExceptionWithExtraMessage extends TimeoutException {
        private static final long serialVersionUID = 1L;
        private final String extraMessage;

        public TimeoutExceptionWithExtraMessage(String message, Throwable lastException, String extraMessage) {
            super(message, lastException);
            this.extraMessage = extraMessage;
        }

        public TimeoutExceptionWithExtraMessage(String message, String extraMessage) {
            super(message);
            this.extraMessage = extraMessage;
        }

        public TimeoutExceptionWithExtraMessage(Throwable lastException, String extraMessage) {
            super(lastException);
            this.extraMessage = extraMessage;
        }

        /**
         * getExtraMessage return the result of callback function
         */
        public String getExtraMessage() {
            return extraMessage;
        }

        /**
         * return message with extra message append to the beginning (from callback function)
         */
        @Override
        public String getMessage() {
            return "\nExtra message from callback function when time out: " + this.extraMessage + ".\n"
                    + super.getMessage();
        }
    }
}