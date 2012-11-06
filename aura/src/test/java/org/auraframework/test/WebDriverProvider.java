/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * @since 0.0.94
 */
// If you get a "/ by zero" WebDriverException, then most likely the Grid node tried to use an unavailable port.
// Check available ports and make sure the low value is NOT 1024, and the high value is NOT 65535.
// - to view port range: sysctl net.ipv4.ip_local_port_range
// - to set port range: sudo sysctl -w net.ipv4.ip_local_port_range="1025 32000"
// - to save port range: edit /etc/sysctl.conf and edit/add property for net.ipv4.ip_local_port_range = 1025
// 32000
public interface WebDriverProvider {
    String WEBDRIVER_SERVER_PROPERTY = "webdriver.remote.server";
    String REUSE_BROWSER_PROPERTY = "webdriver.reusebrowser";
    String BROWSER_TYPE_PROPERTY = "webdriver.browser.type";

    /**
     * Get a a {@link WebDriver} instance.
     *
     * @param capabilities
     * @return
     */
    WebDriver get(DesiredCapabilities capabilities);

    /**
     * Release any long held resources, e.g. pooled driver instances.
     */
    void release();
}
