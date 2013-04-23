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
    protected final URL serverUrl;

    public RemoteWebDriverFactory(URL serverUrl) {
        this.serverUrl = serverUrl;
    }

    @Override
    public WebDriver get(DesiredCapabilities capabilities) {
        return new RemoteWebDriver(serverUrl, capabilities);
    }

    @Override
    public void release() {
        // nothing to release here
    }
}
