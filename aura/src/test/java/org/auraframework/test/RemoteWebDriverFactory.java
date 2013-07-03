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
package org.auraframework.test;

import java.net.URL;
import java.util.concurrent.Callable;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * Basic provider of RemoteWebDrivers.
 * 
 * 
 * @since 0.0.178
 */
public class RemoteWebDriverFactory implements WebDriverProvider {
    protected final int MAX_GET_RETRIES = 3;
    protected final URL serverUrl;

    public RemoteWebDriverFactory(URL serverUrl) {
        this.serverUrl = serverUrl;
    }

    @Override
    public WebDriver get(final DesiredCapabilities capabilities) {
        return retry(new Callable<WebDriver>() {
            @Override
            public WebDriver call() throws Exception {
                return new RemoteWebDriver(serverUrl, capabilities);
            }
        }, MAX_GET_RETRIES, "Failed to get a new RemoteWebDriver");
    }

    protected <T> T retry(Callable<T> callable, int retries, String msg) {
        for (int i = 0; i < retries; i++) {
            try {
                return callable.call();
            } catch (Throwable t) {
                Logger.getLogger(getClass().getName()).log(Level.WARNING, msg, t);
            }
        }
        throw new Error(msg + String.format(" after %s tries", retries));
    }

    @Override
    public void release() {
        // nothing to release here
    }
}
