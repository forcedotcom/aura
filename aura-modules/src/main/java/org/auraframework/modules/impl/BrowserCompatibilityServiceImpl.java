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
package org.auraframework.modules.impl;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.http.BrowserCompatibilityService;
import org.auraframework.impl.util.BrowserInfo;
import org.auraframework.impl.util.UserAgent;

/**
 * Determines whether browser has built in features for MODULES
 */
@ServiceComponent
public class BrowserCompatibilityServiceImpl implements BrowserCompatibilityService {

    /**
     * chrome 58
     * safari 10.1
     * firefox 53
     * edge 15
     *
     * @param userAgent user agent string
     * @return whether browser has built in features
     */
    @Override
    public boolean isCompatible(String userAgent) {

        BrowserInfo bi = new BrowserInfo(userAgent);
        boolean isCompatibleSafari10 = false;
        if (bi.isBrowser(UserAgent.SAFARI, 10)) {
            int minor = 0;
            try {
                int minorStart = userAgent.indexOf("Version/10.") + 11;
                int minorEnd = userAgent.indexOf(".", minorStart);
                minor = Integer.parseInt(userAgent.substring(minorStart, minorEnd));
            } catch (NumberFormatException | IndexOutOfBoundsException ignored) {}
            isCompatibleSafari10 = minor > 0;
        }

        return bi.isBrowser(UserAgent.CHROME, 56, true) ||
                bi.isBrowser(UserAgent.FIREFOX, 53, true) ||
                bi.isBrowser(UserAgent.EDGE, 15, true) ||
                isCompatibleSafari10;
    }
}
