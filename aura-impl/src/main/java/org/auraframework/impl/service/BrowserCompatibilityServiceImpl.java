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
package org.auraframework.impl.service;

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
     * safari 10.1.1
     * firefox 53
     * edge 15
     *
     * @param userAgent user agent string
     * @return whether browser has built in features
     */
    @Override
    public boolean isCompatible(String userAgent) {

        if (userAgent == null || (userAgent != null && userAgent.isEmpty())) {
            return false;
        }

        BrowserInfo bi = new BrowserInfo(userAgent);
        boolean isCompatibleSafari10 = false;
        if (bi.isBrowser(UserAgent.SAFARI, 10)) {
            int minor = 0;
            int rev = 2;
            try {
                int minorStart = userAgent.indexOf("Version/10.") + 11;
                int minorEnd = userAgent.indexOf(".", minorStart);
                minor = Integer.parseInt(userAgent.substring(minorStart, minorEnd));
                int revStart = userAgent.indexOf(".", minorEnd);
                int revEnd = userAgent.indexOf(" ", revStart);
                rev = Integer.parseInt(userAgent.substring(revStart + 1, revEnd));
            } catch (NumberFormatException | IndexOutOfBoundsException ignored) {}
            // Only 10.1.0, 10.1.1 are compatible
            isCompatibleSafari10 = minor == 1 && rev != 2;
        }

        return bi.isBrowser(UserAgent.CHROME, 56, true) ||
                bi.isBrowser(UserAgent.FIREFOX, 53, true) ||
                bi.isBrowser(UserAgent.EDGE, 15, true) ||
                isCompatibleSafari10;
    }
}
