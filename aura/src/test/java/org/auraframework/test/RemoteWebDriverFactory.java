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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * Basic provider of RemoteWebDrivers.
 * 
 * 
 * @since 0.0.178
 */
public class RemoteWebDriverFactory implements WebDriverProvider {
    protected final int MAX_GET_RETRIES = 3;
    protected final URL serverUrl;
    private final long GETDRIVER_TIMEOUT_DEFAULT = 300;

    private final ExecutorService executorService = Executors.newCachedThreadPool();

    public RemoteWebDriverFactory(URL serverUrl) {
        this.serverUrl = serverUrl;
    }

    @Override
    public WebDriver get(final DesiredCapabilities capabilities) {
        return retry(new Callable<WebDriver>() {
            @Override
            public WebDriver call() throws Exception {
                return new AdaptiveWebElementDriver(serverUrl, capabilities);
            }
        }, MAX_GET_RETRIES, getGetDriverTimeout(capabilities), "Failed to get a new RemoteWebDriver");
    }

    protected long getGetDriverTimeout(DesiredCapabilities capabilities) {
        try {
            return Long.parseLong(capabilities.getCapability(WebDriverProvider.GETDRIVER_TIMEOUT_PROPERTY).toString());
        } catch (Throwable t) {
        }
        try {
            return Long.parseLong(System.getProperty(GETDRIVER_TIMEOUT_PROPERTY));
        } catch (Throwable t) {
        }
        return GETDRIVER_TIMEOUT_DEFAULT;
    }

    protected <T> T retry(final Callable<T> callable, int retries, long retryTimeout, String msg) {
        for (int i = 0; i < retries; i++) {
            FutureTask<T> task = new FutureTask<>(callable);
            executorService.execute(task);
            try {
                return task.get(retryTimeout, TimeUnit.SECONDS);
            } catch (Throwable t) {
                task.cancel(true);
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
