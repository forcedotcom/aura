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
package org.auraframework.impl.util;

import static org.auraframework.impl.util.BrowserConsts.BROWSER_WEBKIT_UNK;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_ANDROID;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_ANDROID_2_2;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_ANDROID_MAX;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_ANDROID_VERSION_BASE;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_IPAD;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_IPHONE;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_LINUX;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_MAC;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_MAC_68K;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_MAC_OSX;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_MAC_PPC;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_WIN;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_WINPH_7;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_WINPH_7_5;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_WINPH_8;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_WIN_MAX;
import static org.auraframework.impl.util.BrowserConsts.PLATFORM_WIN_NT;
import static org.auraframework.impl.util.UserAgent.ANDROID_WEBKIT;
import static org.auraframework.impl.util.UserAgent.CHROME;
import static org.auraframework.impl.util.UserAgent.OTHER_WEBKIT;
import static org.auraframework.impl.util.UserAgent.SAFARI;




// user-agent parser to provide browser information
public class BrowserInfo {

    /**
     * Form factors for browser client devices.
     * 
     * @see BrowserInfo#getFormFactor()
     */
    public enum FormFactor {
        DESKTOP, TABLET, PHONE
    }

    String userAgentString;
    private boolean isTablet;
    private boolean isPhone;
    private boolean isAndroid;
    private String formFactor;
    private int browserType;
    private int platformType;
    private boolean isIPad;
    private boolean isIPhone;
    private boolean isWebkit;
    private boolean isFirefox;
    private boolean isIE6;
    private boolean isIE7;
    private boolean isIE8;
    private boolean isIE9;
    private boolean isIE10;
    private boolean isWindowsPhone;

    public static final String TOUCH_CONTAINER = "SalesforceTouchContainer";

    public BrowserInfo(String userAgentString) {
        if (userAgentString == null) {
            userAgentString = "";
        }
        this.userAgentString = BrowserUserAgent.sanitizeString(userAgentString).trim();
        parseUserAgent();
    }

    public boolean isTablet() {
        return isTablet;
    }

    public boolean isPhone() {
        return isPhone;
    }

    public boolean isIPad() {
        return isIPad;
    }

    public boolean isIPhone() {
        return isIPhone;
    }

    public boolean isIOS() {
        return isIPhone || isIPad;
    }

    public boolean isAndroid() {
        return isAndroid;
    }

    public boolean isWindowsPhone() {
        return isWindowsPhone;
    }

    public String getFormFactor() {
        return formFactor;
    }

    public boolean isFirefox() {
        return isFirefox;
    }

    public boolean isWebkit() {
        return isWebkit;
    }

    public boolean isIE6() {
        return isIE6;
    }

    public boolean isIE7() {
        return isIE7;
    }

    public boolean isIE8() {
        return isIE8;
    }

    public boolean isIE9() {
        return isIE9;
    }

    public boolean isIE10() {
        return isIE10;
    }

    private void parseUserAgent() {
        // set initial values
        isTablet = false;
        isPhone = false;
        isAndroid = false;
        isIPad = false;
        isIPhone = false;
        isWebkit = false;
        isFirefox = false;
        isWindowsPhone = false;
        formFactor = "";
        platformType = 0;
        browserType = 0;

        if (userAgentString == null || userAgentString == "") {
            return;
        }

        platformType = BrowserUserAgent.parsePlatform(userAgentString);
        browserType = BrowserUserAgent.parseBrowser(userAgentString);

        isTablet = isTabletClient();
        isPhone = isSmartPhoneClient();
        isAndroid = isPlatformAndroid();
        isIPad = isPlatformIPad();
        isIPhone = isPlatformIPhone();
        isWebkit = isBrowserWebkit();
        isFirefox = isBrowserFirefox();
        isIE6 = isBrowserIE6();
        isIE7 = isBrowserIE7();
        isIE8 = isBrowserIE8();
        isIE9 = isBrowserIE9();
        isIE10 = isBrowserIE10();
        isWindowsPhone = isPlatformWindowsPhone();
        formFactor = getHardwareFormFactor().toString();

    }

    private boolean isBrowserIE10() {
        return isBrowser(UserAgent.IE, 10);
    }

    private boolean isBrowserIE9() {
        return isBrowser(UserAgent.IE, 9);
    }

    private boolean isBrowserIE8() {
        return isBrowser(UserAgent.IE, 8);
    }

    private boolean isBrowserIE7() {
        return isBrowser(UserAgent.IE, 7);
    }

    private boolean isBrowserIE6() {
        return isBrowser(UserAgent.IE, 6);
    }

    private boolean isBrowserFirefox() {
        return isBrowser(UserAgent.FIREFOX);
    }

    /**
     * See if this user agent String is for a known mobile client. This is a comprehensive check for hundreds of
     * possible mobile clients.
     * 
     * @see BrowserInfo#isBrowserMobile() if a quicker test of all supported and many common unsupported clients is
     *      sufficient
     * 
     * @param userAgent the string to test
     * @return true if mobile
     */
    public static boolean isMobileClient(String userAgent) {
        // TODO: see if this can be replaced by Browser.isBrowserMobile(String)
        // It is easier to maintain with no third party dependencies and ~6x
        // faster.
        if (userAgent != null) {
            String ua = userAgent.toLowerCase();
            // check against the common ones first (mainstream users get faster
            // perf)
            if (BrowserUserAgent.getCommonMobileUserAgentPattern().matcher(ua).matches()) {
                return true;
            } else if (ua.length() >= 4) {
                // otherwise, check against the full list (expensive)
                // but we can use just the first 4 chars to help perf
                String shortua = ua.substring(0, 4);
                if (BrowserUserAgent.getUncommonMobileUserAgentPattern().matcher(shortua).matches()) {
                    return true;
                }
            }
        }
        return false;
    }

    /*
     * Browser checks The pre-182 checks (isBrowserXXX()) match against both the old 4 digit browserTypes and the new 8
     * digit ones too. The parseBrowser() method will always return the new type from 182 onward, but 4 digit ones may
     * be in the DB or a cookie, or be hard-coded in various places. The 182+ checks (isBrowser(XXX)) will check and
     * match against only new 8 digit browserTypes. Please use these for any new functionality, as they require much
     * less upkeep and rework as new browsers come out and they keep the API list shorter.
     */

    /**
     * Check does this browser type match the given UserAgent.
     * 
     * For example this would check if you are using Firefox:
     * <code>new Browser(useragentstring).isBrowser(UserAgent.FIREFOX)</code>
     * 
     * @param agent the agent to check against this browser type
     * 
     * @return true if this browser type matches the agent
     */
    private boolean isBrowser(UserAgent agent) {
        if (agent != null) {
            // quick simple check by int covers most
            if (agent.match(this.browserType)) {
                return true;
            }
            // string check allows for odd browsers
            if (this.userAgentString != null) {
                return agent.match(this.userAgentString.toLowerCase());
            }
        }
        return false;
    }

    /**
     * Check does this browser type match the given UserAgent and version.
     * 
     * For example this would check if you are using Firefox 12:
     * <code>new BrowserInfo(useragentstring).isBrowser(UserAgent.FIREFOX, 12)</code>
     * 
     * @param agent the agent to check against this browser type
     * @param majorVersion the version to check against this browser type
     * 
     * @return true if this browser type matches the agent and version
     */
    public boolean isBrowser(UserAgent agent, int majorVersion) {
        return isBrowser(agent, majorVersion, false);
    }

    /**
     * Check does this browser type match the given UserAgent and version.
     * 
     * For example this would check if you are using Firefox 8 or higher:
     * <code>new BrowserInfo(useragentstring).isBrowser(UserAgent.FIREFOX, 8, true)</code>
     * 
     * @param agent the agent to check against this browser type
     * @param majorVersion the version to check against this browser type
     * @param atLeast whether the check should be equal (false), or equal or greater than (true)
     * @return true if a match for agent and version
     */
    public boolean isBrowser(UserAgent agent, int majorVersion, boolean atLeast) {
        if (agent != null) {
            return agent.match(this.browserType, majorVersion, atLeast);
        }
        return false;
    }

    /**
     * Determines if this browser type is a match for the UserAgent, and if the browser version refers to a version in
     * the given range.
     * 
     * For example this would check if you are using Firefox 10, 11, or 12:
     * <code>new BrowserInfo(useragentstring).isBrowser(UserAgent.FIREFOX, 10, 12)</code>
     * 
     * @param agent the agent to check against this browser type
     * @param int minVer the minimum version to compare against
     * @param int maxVer the maximum version to compare against
     * 
     * @return true if a match for agent and version, false otherwise
     */
    public boolean isBrowser(UserAgent agent, int minVer, int maxVer) {
        if (agent != null) {
            return agent.match(this.browserType, minVer, maxVer);
        }
        return false;
    }

    /**
     * This checks if we want to treat the browser as a Webkit browser. This mostly maps to &quot;Does it have
     * 'AppleWebkit' in the user agent?&quot; but there can be exceptions to that to form the correct behavior for
     * supported clients.
     * 
     * Before 182 this returned true for Safari, Chrome, and Chromeframe and some other common desktop and mobile Webkit
     * clients, but false for many Android Webkit mobile browsers.
     * 
     * As of 182 Android Webkit browsers will return true, just like IOS Webkit ones.
     * 
     * @return true if the browser is Webkit, false otherwise
     */
    public boolean isBrowserWebkit() {
        return isBrowser(CHROME) || isBrowser(SAFARI) || isBrowser(ANDROID_WEBKIT) || isBrowser(OTHER_WEBKIT)
                || this.browserType == BROWSER_WEBKIT_UNK;
    }

    /* Platform checks */

    /*
     * Please use caution when adding new platform methods - each user agent can only map to 1 platform currently. This
     * causes problems with our use patterns. Some examples: If Linux, Mac and Windows are platforms, why not IOS?
     * Because we need to track iPad and iPhone separately. What about iPad Mini? Is that a new platform or the same as
     * iPad? What about iPod Touch? Same OS, screen, events and browser as iPhone, but different platform? So Android is
     * a Platform...what about the difference between Android phones and tablets? What about Netbooks that have
     * notebook- like screens and capabilities but run Android?
     */

    /**
     * Checks if this is a desktop Apple/Mac system.
     * 
     * @return true if a Mac, false otherwise
     */
    public boolean isPlatformMac(int platformType) {
        return platformType == PLATFORM_MAC_OSX || platformType == PLATFORM_MAC_PPC
                || platformType == PLATFORM_MAC_68K || platformType == PLATFORM_MAC;
    }

    /**
     * Checks if this is an iPhone device running IOS
     * 
     * @return true if a match, false otherwise
     */
    public boolean isPlatformIPhone() {
        return this.platformType == PLATFORM_IPHONE;
    }

    /**
     * Checks if this is an iPad device running IOS
     * 
     * @return true if a match, false otherwise
     */
    public boolean isPlatformIPad() {
        return this.platformType == PLATFORM_IPAD;
    }

    public boolean isPlatformWindowsPhone() {
        return this.platformType == PLATFORM_WINPH_7
                || this.platformType == PLATFORM_WINPH_7_5
                || this.platformType == PLATFORM_WINPH_8;
    }

    /**
     * Checks if this is an Android device.
     * 
     * @return true if Android, false otherwise
     */
    public boolean isPlatformAndroid() {
        return this.platformType == PLATFORM_ANDROID
                || (this.platformType >= PLATFORM_ANDROID_VERSION_BASE && this.platformType <= PLATFORM_ANDROID_MAX);
    }

    /**
     * Checks if this is Android 2.20 or later.
     * 
     * @return true if a match, false otherwise
     */
    public boolean isPlatformAndroid22OrGreater() {
        // 2 found uses as of 182
        // TODO: deprecate and merge with isPlatformAndroid() -
        return (this.platformType >= PLATFORM_ANDROID_2_2 && this.platformType <= PLATFORM_ANDROID_MAX);
    }

    /**
     * Checks if this is an iPhone, iPad, Android or other mobile client running Webkit.
     * 
     * @return true if a match, false otherwise
     */
    public boolean isPlatformMobileWebkit() {
        return (isPlatformIPhone() || (isPlatformAndroid() && this.isBrowserMobile()));
    }

    /**
     * Checks if this is a browser on Linux
     * 
     * @return true if a match, false otherwise
     */
    public boolean isPlatformLinux() {
        // 0 found uses as of 182
        return this.platformType == PLATFORM_LINUX;
    }

    /**
     * Checks if this is a browser on Windows
     * 
     * @return true if a match, false otherwise
     */
    public boolean isPlatformWin() {
        // 1 found use as of 182
        return (this.platformType >= PLATFORM_WIN && this.platformType <= PLATFORM_WIN_MAX);
    }

    /**
     * Checks if this is this Windows NT or later.
     * 
     * @return true if NT or later, false if earlier or if not Windows
     * 
     */
    public boolean isPlatformModernWin() {
        // 1 found use as of 182
        // TODO: deprecate and merge with isPlatformWin() - we don't have many
        // surviving /Win95/95/Me/3.1 users
        return this.platformType >= PLATFORM_WIN_NT && this.platformType <= PLATFORM_WIN_MAX;
    }

    /* Mobile related checks */

    /**
     * Identifies if a browser is advertising itself as being mobile in its user agent String. This will return true if
     * keywords such as mobile, phone, tablet, or touch are present, of it the browser is one that is only available as
     * a mobile version, such as Blackberry.
     * 
     * This will detect all supported mobile clients and many common unsupported ones.
     * 
     * This does not necessarily indicate that the user should get our mobile or Touch UI, as some mobile browsers are
     * very limited in compatibility or resolution so they should get nothing or plain text; and others are netbooks or
     * tablets with keyboards that may as well be laptops for all they can do.
     * 
     * @see BrowserInfo#isMobileClient(String) for a more comprehensive but slower check of known user agents
     * 
     * @return true if we think this is a mobile browser, false if desktop browser
     */
    public boolean isBrowserMobile() {
        // in the 182+ code, it's a simple check
        if (this.browserType > UserAgent.LEGACY_CUTOFF && this.browserType < UserAgent.VERSIONED_CUTOFF) {
            // last digit = 0 means desktop/notebook; anything else is mobile of
            // some sort
            return (this.browserType % 10 != 0);
        } else {
            // pre 182 we itemize across known mobile stuff
            return isPlatformIPhone() || isPlatformIPad() || isPlatformAndroid() || isPlatformWindowsPhone()
                    || isBrowser(UserAgent.OTHER_MOBILE);
        }
    }

    /**
     * See if this Browser is a known mobile client. This is a comprehensive check for hundreds of possible mobile
     * clients.
     * 
     * @see BrowserInfo#isBrowserMobile() if a quicker test of all supported and many common unsupported clients is
     *      sufficient
     * 
     * @return true if mobile
     */
    public boolean isMobileClient() {
        // TODO: see if this can be replaced by BrowserInfo.isBrowserMobile()
        // It is easier to maintain with no third party dependencies and ~7x
        // faster.
        return isMobileClient(userAgentString);
    }

    /**
     * Tries to infer from the user agent string if the client is a smart phone (iphone, droid, blackberry, et al). This
     * can return true for some tablets and other mobile devices.
     * 
     * @return true if it is a phone, false if anything else
     */
    public boolean isSmartPhoneClient() {
        return this.isPlatformIPhone() || this.isPlatformMobileWebkit() || this.isPlatformAndroid()
                || this.isPlatformAndroid22OrGreater() || this.isPlatformWindowsPhone()
                || this.isBrowser(UserAgent.OTHER_MOBILE);
    }

    /**
     * Infers from the user agent string if the client is a tablet.
     * 
     * Note: As of 182 this is actually &quot;Is it an iPad or an Android 2.2 or higher tablet?&quot;
     * 
     * This definition will likely expand as new tablets with other operating systems are released.
     * 
     * @return true if it is, false if anything else
     */
    public boolean isTabletClient() {
        /*
         * TODO: What about these? - Windows RT (not detected) - Kindle (rejected because it is a mobile clients) -
         * Opera Mini/Mobile on Android (rejected because they are mobile clients)
         */
        boolean isAndroidTablet = this.isPlatformAndroid22OrGreater() && !this.isMobileClient();
        return this.isPlatformIPad() || isAndroidTablet;
    }

    /**
     * Returns the {@link FormFactor} for this instance, usually based on the user agent String passed in to the
     * constructor of this Browser.
     * 
     * Be cautious with assumptions based on the return value. For example: - Phones may not always have lower
     * resolutions than tablets, - Tablets may sometimes have cellular capabilities, - Phones may sometimes have
     * cellular disabled, - Some desktops and laptops now come with touch screens - Windows may some day be the most
     * popular tablet OS. - Some tablets can dock and become desktops
     * 
     * @return a FormFactor value
     */
    public FormFactor getHardwareFormFactor() {
        if (isTabletClient()) {
            return FormFactor.TABLET;
        } else if (isSmartPhoneClient()) {
            return FormFactor.PHONE;
        } else {
            return FormFactor.DESKTOP;
        }
    }

}
