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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.HttpCommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.URL;

public class AdaptiveWebElementDriver extends RemoteWebDriver {

    public static String DEFAULT_CAPABILITY = "org.auraframework.webdriver.flexible.default";

    /**
     * @deprecated Use {@link AdaptiveWebElementDriver(CommandExecutor, Capabilities)}.
     * @param executor
     * @param desiredCapabilities
     * @param requiredCapabilities
     */
    @Deprecated
    public AdaptiveWebElementDriver(CommandExecutor executor, Capabilities desiredCapabilities,
            Capabilities requiredCapabilities) {
        super(executor, desiredCapabilities.merge(requiredCapabilities));

        // Unless you explicitly request a "default" driver, return a driver that returns AdaptiveWebElements
        if (!((desiredCapabilities != null && desiredCapabilities.is(DEFAULT_CAPABILITY)) || (requiredCapabilities != null && requiredCapabilities
                .is(DEFAULT_CAPABILITY)))) {
            this.setElementConverter(new AdaptiveWebElement.JsonConverter(this));
        }
    }

    public AdaptiveWebElementDriver(CommandExecutor executor, Capabilities desiredCapabilities) {
        super(executor, desiredCapabilities);
    }

    public AdaptiveWebElementDriver(Capabilities desiredCapabilities) {
        super(desiredCapabilities);
    }

    /**
     * @deprecated Use {@link AdaptiveWebElementDriver(URL, Capabilities)}.
     * @param remoteAddress
     * @param desiredCapabilities
     * @param requiredCapabilities
     */
    @Deprecated
    public AdaptiveWebElementDriver(URL remoteAddress, Capabilities desiredCapabilities,
            Capabilities requiredCapabilities) {
        this(new HttpCommandExecutor(remoteAddress), desiredCapabilities, requiredCapabilities);
    }

    public AdaptiveWebElementDriver(URL remoteAddress, Capabilities desiredCapabilities) {
        super(remoteAddress, desiredCapabilities);
    }

}
