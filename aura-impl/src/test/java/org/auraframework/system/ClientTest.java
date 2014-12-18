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
package org.auraframework.system;

import java.util.Map;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.Client.Type;
import org.auraframework.test.client.UserAgent;

import com.google.common.collect.Maps;

public class ClientTest extends AuraImplTestCase {
    public ClientTest(String name) {
        super(name);
    }

    /**
     * Verify that User Agent string is parsed out to obtain right ClientType
     */
    public void testGetType() {
        Map<String, Type> pairs = Maps.newHashMap();
        pairs.put(UserAgent.IE6.getUserAgentString(), Type.IE6);
        pairs.put(UserAgent.IE7.getUserAgentString(), Type.IE7);
        pairs.put(UserAgent.IE8.getUserAgentString(), Type.IE8);
        pairs.put(UserAgent.IE9.getUserAgentString(), Type.IE9);
        pairs.put(UserAgent.IE10.getUserAgentString(), Type.IE10);
        pairs.put(UserAgent.IE10_WINDOWS_PHONE_8.getUserAgentString(), Type.IE10);
        pairs.put(UserAgent.IE10_WINDOWS_RT_8.getUserAgentString(), Type.IE10);
        pairs.put(UserAgent.IE11_WINDOWS_PHONE_8_1.getUserAgentString(), Type.IE11);
        pairs.put(UserAgent.IE11_WINDOWS_RT_8_1.getUserAgentString(), Type.IE11);
        pairs.put(UserAgent.IE11_WINDOWS_PHONE_8_1_SDK.getUserAgentString(), Type.IE11);
        pairs.put(UserAgent.LUMIA_928.getUserAgentString(), Type.IE11);
        pairs.put(UserAgent.IE11.getUserAgentString(), Type.IE11);
        pairs.put(UserAgent.IE11_NET_FRAMEWORK.getUserAgentString(), Type.IE11);
        pairs.put(UserAgent.FIREFOX.getUserAgentString(), Type.FIREFOX);
        pairs.put(UserAgent.GOOGLE_CHROME.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.SAFARI5_MAC.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.SAFARI5_WINDOWS.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.SAFARI6.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.IPAD.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.IPAD_7.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.IPAD_WEBVIEW.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.IPHONE4.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.ANDROID4_2.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.BLACKBERRY_7.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.BLACKBERRY_10.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.GOOD_IPHONE.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.GOOD_ANDROID.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.NEXUS_10.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.NEXUS_9_CHROME.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.NEXUS_9_SFDC_CONTAINER.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.NEXUS_7_SFDC_CONTAINER.getUserAgentString(), Type.WEBKIT);
        pairs.put(UserAgent.OPERA12.getUserAgentString(), Type.OTHER);
        pairs.put(UserAgent.OPERA_MINI.getUserAgentString(), Type.OTHER);
        pairs.put(UserAgent.NETSCAPE.getUserAgentString(), Type.OTHER);
        pairs.put("", Type.OTHER);

        for (String userAgent : pairs.keySet()) {
            assertEquals("Unexpected ClientType from userAgent string:",
                    pairs.get(userAgent), new Client(userAgent).getType());
        }
        assertEquals("Unexpected ClientType from userAgent string:", Type.OTHER, new Client().getType());
        assertEquals("Unexpected ClientType from userAgent string:", Type.OTHER, new Client(null).getType());
    }

    public void testDefaultClientType() throws Exception {
        Client client = new Client();
        assertEquals("Incorrect default client type.", client.getType().name(), "OTHER");
    }
}
