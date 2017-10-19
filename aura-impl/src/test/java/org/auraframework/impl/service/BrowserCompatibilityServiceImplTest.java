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

import org.auraframework.http.BrowserCompatibilityService;
import org.auraframework.impl.service.BrowserCompatibilityServiceImpl;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;

/**
 * User Agent checks for browser compatibility
 */
public class BrowserCompatibilityServiceImplTest {
    @Test
    public void isCompatible() throws Exception {
        List<UserAgentResult> uaTestEntries = new ArrayList<>();
        uaTestEntries.add(new UserAgentResult("Safari 11.0", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38", true));
        uaTestEntries.add(new UserAgentResult("Safari 10.0.3", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8", false));
        uaTestEntries.add(new UserAgentResult("Chrome 58", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", true));
        uaTestEntries.add(new UserAgentResult("Chrome 55", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36", false));
        uaTestEntries.add(new UserAgentResult("IE 11", "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko", false));
        uaTestEntries.add(new UserAgentResult("IE 9", "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)", false));
        uaTestEntries.add(new UserAgentResult("MS Edge 15", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.14986", true));
        uaTestEntries.add(new UserAgentResult("MS Edge 15", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.14986", true));
        uaTestEntries.add(new UserAgentResult("Firefox 53", "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.16.5; rv:53.0) Gecko/20100101 Firefox/53.0", true));
        uaTestEntries.add(new UserAgentResult("Firefox 52", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_19_2; rv:52.0a) Gecko/20100101 Firefox/52.0a", false));
        uaTestEntries.add(new UserAgentResult("null", null, false));
        uaTestEntries.add(new UserAgentResult("empty", "", false));

        BrowserCompatibilityService bcs = new BrowserCompatibilityServiceImpl();

        for (UserAgentResult uar : uaTestEntries) {
            boolean isUserAgentCompatible = bcs.isCompatible(uar.ua);
            boolean expected = uar.compatible;
            assertEquals(uar.name + ": expected " + expected + ", actual " + isUserAgentCompatible, expected, isUserAgentCompatible);
        }
    }

    public static class UserAgentResult {
        public String name;
        public String ua;
        public boolean compatible;
        public UserAgentResult(String name, String ua, boolean compatible) {
            this.name = name;
            this.ua = ua;
            this.compatible = compatible;
        }
    }
}