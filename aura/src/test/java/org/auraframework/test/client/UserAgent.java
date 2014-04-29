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
package org.auraframework.test.client;

/**
 * Collect some useful user agent strings here.
 */
public enum UserAgent {
    GOOGLE_CHROME("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.162 Safari/535.19"),
    IE6("Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)"),
    IE7("Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)"),
    IE8("Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 5.2; Trident/4.0; Media Center PC 4.0; SLCC1; .NET CLR 3.0.04320)"),
    IE9("Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 7.1; Trident/5.0)"),
    IE10("Mozilla/4.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)"),
    IE11("Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko"),
    IE11_NET_FRAMEWORK("Mozilla/5.0 (Windows NT 6.3; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko"),
    // Nokia Lumia 928
    IE10_WINDOWS_PHONE_8("Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 928)"),
    IE10_WINDOWS_RT_8("Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; ARM; Trident/6.0 Touch)"),
    IE11_WINDOWS_PHONE_8_1("Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0;Touch; rv:11.0; IEMobile/11.0; Microsoft; Virtual) like Gecko"),
    IE11_WINDOWS_RT_8_1("Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 6.3; ARM; Trident/7.0)"),
    FIREFOX("Mozilla/6.0 (Windows NT 6.2; WOW64; rv:16.0.1) Gecko/20121011 Firefox/16.0.1"),
    SAFARI6("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.73.11 (KHTML, like Gecko) Version/6.1.1 Safari/537.73.11"),
    IPHONE4("Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3"),
    IPAD("Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25"),
    IPAD_7("Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53"),
    // Reported user agent when Aura is loaded via Integration Service inside an IFrame within a UIWebView on iPad
    IPAD_WEBVIEW("Mozilla/5.0 (iPad; CPU OS 6_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Mobile/10B141"),
    // Google Nexus 4, Android version 4.2
    ANDROID4_2("Mozilla/5.0 (Linux; Android 4.2.1; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19"),
    // Blackberry Z10
    BLACKBERRY_10("Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+"),
    GOOD_IPHONE("Mozilla/5.0 (iPhone; CPU iPhone OS 7_1 like Mac OS X) AppleWebKit/.537.51.2 (KHTML, like Gecko) Mobile/11D167 Safari/8536.25 GoodAccess/1.1.333.302"),
    GOOD_ANDROID("Mozilla/5.0 (Linux; Android 4.1.1; SAMSUNG-SGH-1747 Build/JRO03L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.45 Mobile Safari/537.36 Good Access/1.0.21.304"),

    IPOD("Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; ja-jp) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5"),
    SAFARI5_MAC("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2"),
    SAFARI5_WINDOWS("Mozilla/5.0 (Windows; U; Windows NT 6.1; tr-TR) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27"),
    OPERA12("Opera/12.0(Windows NT 5.2;U;en)Presto/22.9.168 Version/12.00"),
    OPERA12_MOBILE("Opera/12.02 (Android 4.1; Linux; Opera Mobi/ADR-1111101157; U; en-US) Presto/2.9.201 Version/12.02"),
    OPERA_MINI("Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54"),
    ANDROID2_3("Mozilla/5.0 (Linux; U; Android 2.3.5; en-us; HTC Vision Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"),
    ANDROID1_6("Mozilla/5.0 (Linux; U; Android 1.6; ar-us; SonyEricssonX10i Build/R2BA026) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1"),
    KINDLE_FIRE("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-84) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true"),
    PLAYBOOK("Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.0.0; en-US) AppleWebKit/535.8+ (KHTML, like Gecko) Version/7.2.0.0 Safari/535.8+"),
    NOKIA_N95("Mozilla/5.0 (SymbianOS/9.2; U; Series60/3.1 NokiaN95/10.0.018; Profile/MIDP-2.0 Configuration/CLDC-1.1 ) AppleWebKit/413 (KHTML, like Gecko) Safari/413"),
    NOKIA_920("Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)"),
    BLACKBERRY_7("Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+"),
    NETSCAPE("Mozilla/5.0 (Windows; U; Win 9x 4.90; SG; rv:1.9.2.4) Gecko/20101104 Netscape/9.1.0285"),
    EMPTY("");

    private String userAgentString;

    private UserAgent(String agentString) {
        this.userAgentString = agentString;
    }

    public String getUserAgentString() {
        return userAgentString;
    }
}
