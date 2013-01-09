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
package org.auraframework.impl.util;

import static org.auraframework.impl.util.BrowserConsts.BROWSER_OFFICE_TOOLKIT;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * User agent variants. These are generally for use by {@link BrowserUserAgent}
 * and {@link Browser}. Check those classes for your needs first.
 * 
 * Each implementation should be self-sufficient and not dependent on ordering
 * with other UserAgent instances for validation or parsing where practical.
 * They may be ordered for performance reasons, but do not assume a static order
 * over time.
 * 
 * If a browser purposely identifies itself wrongly, such as Opera emulating
 * Firefox for compatibility can be identified as the the reported browser
 * rather than the underlying actual browser.
 * 
 * Very common, very expensive, or very ugly cases can be rerouted to the real
 * browser to avoid problems. For example old Palm devices pretend to be
 * Internet Explorer, often with bad results, and IE in compatibility mode acts
 * like IE7 but we log it in Login History as the true IE version, with a note
 * that it was in compatibility view.
 * 
 * @see config/labels/app/login.xml
 * @see BrowserUserAgent
 * @see UA
 * 
 * @see UserAgentTest - tests members of this enum for accurate parsing
 * @see UserAgentTestData - if you add to this enum, add to this test too
 * 
 * @since 182
 */
public enum UserAgent {

    IE(10) {
        // IE desktop vs metro/win8 & touch user agents (there are none)
        // http://msdn.microsoft.com/en-us/library/ie/hh771832(v=vs.85).aspx

        // about IE user agents
        // http://msdn.microsoft.com/en-us/library/ie/hh869301(v=vs.85).aspx

        // about IE 10 user agents and the Touch token (IE10+)
        // http://msdn.microsoft.com/en-us/library/ie/hh920767(v=vs.85).aspx

        // about Trident
        // http://msdn.microsoft.com/en-us/library/ms537503(v=vs.85).aspx
        // Note this page has an error - the Trident version is only held during
        // Compatibility View, not during F12 developer tools Browser Mode
        // switching.
        // There is no way on the server to distinguish IE7 from IE9 emulating
        // IE7 via F12.

        // IE mobile
        // http://blogs.msdn.com/b/iemobile/archive/2010/03/25/ladies-and-gentlemen-please-welcome-the-ie-mobile-user-agent-string.aspx

        // about IE9 on Windows Phone 7.5
        // http://blogs.windows.com/windows_phone/b/wpdev/archive/2011/08/29/introducing-the-ie9-on-windows-phone-mango-user-agent-string.aspx

        // about IE10 on Windows Phone 8
        // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/10/17/getting-websites-ready-for-internet-explorer-10-on-windows-phone-8.aspx

        // some impostor info
        // http://www.developer.nokia.com/Community/Wiki/User-Agent_headers_for_Nokia_devices
        // http://my.opera.com/community/openweb/idopera/
        // http://www.chromium.org/developers/how-tos/chrome-frame-getting-started/understanding-chrome-frame-user-agent
        @Override
        boolean match(String ua) {

            // do a couple of faster checks before looking for "MSIE"
            boolean claimsToBeIE = ua.startsWith(UA.MOZILLA_5_MSIE) || ua.startsWith(UA.MOZILLA_4_MSIE)
                    || ua.contains(UA.MSIE);

            if (!claimsToBeIE) {
                return false;
            }

            // check for impostors, stop checking after finding one
            if (ua.contains(UA.CHROMEFRAME) || ua.contains(UA.OPERA) || ua.contains(UA.MS_WEB_SERVICES)
                    || ua.contains(UA.SFORCE_HTTP) || ua.contains(UA.SFORCE_OFFICE_TOOLKIT)
                    // the rest block really IE4-5-6-7 so they show up as 'other
                    // mobile'
                    // instead of IE since they can't do many things 'normal' IE
                    // can do.
                    // as IE8/9/10 are moved onto devices that might match
                    // these, they will
                    // include TRIDENT and generally work as IE, so we allow
                    // those
                    || (!ua.contains(UA.TRIDENT) && (ua.contains(UA.SYMBIAN) || ua.contains(UA.NOKIA)
                            || ua.contains(UA.PALMSOURCE) || ua.contains(UA.BLAZER) || ua.contains(UA.PALM_OS)))) {
                return false;
            }

            // didn't find any impostors - treat as IE
            return true;
        }

        /**
         * Reports the Trident (actual) based IE version if available, otherwise
         * the "MSIE x.0" version.
         * 
         * This means IE8 in compatibility view mode will return as IE8 but
         * provide a flag indicating it should emulate IE7
         * 
         * We do not spend effort detecting &quot;trident/3.1&quot; since it is
         * the Trident string for IE7 and will also have &quot;msie 7&quot; in
         * the same string anyway.
         */
        @Override
        int majorVersion(String ua) {
            if (ua.contains(UA.TRIDENT_4)) {
                return 8;
            } else if (ua.contains(UA.TRIDENT_5)) {
                return 9;
            } else if (ua.contains(UA.TRIDENT_6)) {
                return 10;
            } else if (ua.contains(UA.TRIDENT_7)) {
                return 11;
            } else if (ua.contains(UA.TRIDENT_8)) {
                return 12;
            } else {
                try {
                    int verStart = ua.indexOf(UA.MSIE) + 5; // 5 =
                                                            // "msie ".length()
                    int verEnd = ua.indexOf(UA.DOT, verStart);
                    return Integer.parseInt(ua.substring(verStart, verEnd));
                } catch (NumberFormatException e) {
                } catch (IndexOutOfBoundsException e) {
                }
            }
            return UA.UNSPECIFIED;
        }

        /**
         * 001 if mobile 010 if compatibility mode 100 if explicitly touch
         * enabled 000 otherwise
         */
        @Override
        int flags(String ua) {
            int flags = UA.UNSPECIFIED;
            if (ua.contains(UA.TOUCH)) {
                flags += 100;
            }
            // compatibility view mode pretends to be IE7, and includes a
            // Trident/ string
            // the only non-compatibility view Trident is IEMobile 7 +
            // Trident/3.1
            if (ua.contains(UA.TRIDENT) && ua.contains(UA.MSIE_7) && !ua.contains(UA.TRIDENT_3_1)) {
                flags += 10;
            }
            // recent IE mobile contain "iemobile" but we don't need to add this
            // since we already need to look for "mobile" for older versions
            if (ua.contains(UA.MOBILE) || ua.contains(UA.ARM) || ua.contains(UA.WINDOWS_CE) || ua.contains(UA.WINCE)) {
                flags += UA.MOBILE_FLAG;
            }
            return flags;
        }

        /**
         * Need to account for compatibility mode (IE7 emulation)
         */
        @Override
        public boolean match(int browser, int version, boolean atLeast) {
            // is it 182+ IE?
            if (match(browser)) {
                // check if compatibility mode
                if ('1' == String.valueOf(browser).charAt(6)) {
                    // if yes, fake IE7
                    return super.match(BrowserConsts.XBROWSER_IE_7, version, atLeast);
                } else {
                    // if no, check normally
                    return super.match(browser, version, atLeast);
                }
            }
            // not IE
            return false;
        }

        /**
         * Need to account for compatibility mode (IE7 emulation)
         */
        @Override
        public boolean match(int browser, int minVer, int maxVer) {
            // is it 182+ IE?
            if (match(browser)) {
                // check if compatibility mode
                if ('1' == String.valueOf(browser).charAt(6)) {
                    // if yes, fake IE7
                    return super.match(BrowserConsts.XBROWSER_IE_7, minVer, maxVer);
                } else {
                    // if no, check normally
                    return super.match(browser, minVer, maxVer);
                }
            }
            // not IE
            return false;
        }

    },

    FIREFOX(11) {
        // https://developer.mozilla.org/en-US/docs/Gecko_user_agent_string_reference

        @Override
        boolean match(String ua) {
            return (ua.contains(UA.FIREFOX) && ua.contains(UA.GECKO) && !ua.contains(UA.NAVIGATOR) && !ua
                    .contains(UA.OPERA));
        }

        /**
         * All the 4.x Firefoxes will appear as &quot;Firefox 4&quot;. This used
         * to not be precise enough, but since we are now supporting only latest
         * (FF 15 as of now), 4.anything is precise enough to know to 'do the
         * old stuff' or 'do not bother - it is unsupported'.
         */
        @Override
        int majorVersion(String ua) {
            try {
                int verStart = ua.indexOf(UA.FIREFOX) + 8; // 8 =
                                                           // "firefox/".length()
                int verEnd = ua.indexOf(UA.DOT, verStart);
                return Integer.parseInt(ua.substring(verStart, verEnd));
            } catch (NumberFormatException ex) {
            } catch (IndexOutOfBoundsException e) {
            }
            return UA.UNSPECIFIED;
        }

        /**
         * 002 if phone, 003 if tablet, 001 for generic mobile otherwise 000
         */
        @Override
        int flags(String ua) {
            if (ua.contains(UA.PHONE)) {
                return UA.PHONE_FLAG;
            } else if (ua.contains(UA.TABLET)) {
                return UA.TABLET_FLAG;
            } else if (ua.contains(UA.FENNEC) || ua.contains(UA.MOBILE)) {
                return UA.MOBILE_FLAG;
            }
            return UA.UNSPECIFIED;
        }
    },

    CHROME_FRAME(12) {
        // http://www.chromium.org/developers/how-tos/chrome-frame-getting-started/understanding-chrome-frame-user-agent

        @Override
        boolean match(String ua) {
            // must check CHROME_FRAME before CHROME if you want to
            // differentiate for logging, etc.
            return (ua.contains(UA.CHROMEFRAME));
        }

        @Override
        int majorVersion(String ua) {
            try {
                int verStart = ua.indexOf(UA.CHROMEFRAME) + 12; // 12 =
                                                                // "chromeframe/".length()
                int verEnd = ua.indexOf(UA.DOT, verStart);
                return Integer.parseInt(ua.substring(verStart, verEnd));
            } catch (NumberFormatException ex) {
            } catch (IndexOutOfBoundsException e) {
            }
            return UA.UNSPECIFIED;
        }

        /**
         * Identifies which IE we are running inside if possible returns as 1st
         * and 2nd digit of flags. For example in IE8 it would be 080
         */
        @Override
        int flags(String ua) {
            try {
                int verStart = ua.indexOf(UA.MSIE) + 5; // 5 = "msie ".length()
                int verEnd = ua.indexOf(UA.DOT, verStart);
                return 10 * Integer.parseInt(ua.substring(verStart, verEnd));
            } catch (NumberFormatException ex) {
            } catch (IndexOutOfBoundsException e) {
            }
            return UA.UNSPECIFIED;
        }
    },

    CHROME(13) {
        // http://www.useragentstring.com/pages/Chrome/
        // https://developers.google.com/chrome/mobile/docs/user-agent

        @Override
        boolean match(String ua) {
            // We would normally exclude matches to UA.CHROMEFRAME since we log
            // it separately, but if somebody asks "is this browser Chrome?"
            // they mean "can it be treated like Chrome" and Chromeframe can be.
            return ua.contains(UA.CHROME) || ua.contains(UA.CHROME_IOS);
        }

        @Override
        int majorVersion(String ua) {
            try {
                int verStart = ua.indexOf(UA.CHROMEFRAME);
                if (verStart != -1) {
                    verStart += 12; // 12 = "chromeframe/".length()
                } else if (ua.contains(UA.CHROME_IOS)) {
                    verStart = ua.indexOf(UA.CHROME_IOS) + 6; // 6 =
                                                              // "crios/".length
                } else {
                    verStart = ua.indexOf(UA.CHROME_SLASH) + 7; // 7 =
                                                                // "chrome/".length()
                }
                int verEnd = ua.indexOf(UA.DOT, verStart);
                return Integer.parseInt(ua.substring(verStart, verEnd));
            } catch (NumberFormatException ex) {
            } catch (IndexOutOfBoundsException e) {
            }
            return UA.UNSPECIFIED;
        }

        /**
         * 001 if mobile, 006 if on IOS (a hybrid of Chrome and Safari),
         * otherwise 000
         */
        @Override
        int flags(String ua) {
            if (ua.contains(UA.CHROME_IOS)) {
                return 6;
            } else if (ua.contains(UA.MOBILE)) {
                return UA.MOBILE_FLAG;
            }
            return UA.UNSPECIFIED;
        }
    },

    SAFARI(14) {
        // http://developer.apple.com/library/ios/#documentation/AppleApplications/Reference/SafariWebContent/OptimizingforSafarioniPhone/OptimizingforSafarioniPhone.html
        // http://www.useragentstring.com/pages/Safari/

        @Override
        boolean match(String ua) {
            return (ua.contains(UA.SAFARI) && ua.contains(UA.APPLE_WEBKIT) && !ua.contains(UA.CHROME)
                    && !ua.contains(UA.ANDROID) && !ua.contains(UA.SYMBIAN) && !ua.contains(UA.BLACKBERRY) && !ua
                    .contains(UA.SILK));
        }

        @Override
        int majorVersion(String ua) {
            try {
                if (ua.contains(UA.VERSION)) {
                    // Safari 3.0 or later
                    int verStart = ua.indexOf(UA.VERSION) + 8; // 8 =
                                                               // "version/".length()
                    int verEnd = ua.indexOf(UA.DOT, verStart);
                    return Integer.parseInt(ua.substring(verStart, verEnd));
                } else if (ua.contains(UA.SAFARI_2_KEY)) {
                    return 2;
                } else if (ua.contains(UA.SAFARI_1_KEY1) || ua.contains(UA.SAFARI_1_KEY2)
                        || ua.contains(UA.SAFARI_1_KEY3)) {
                    return 1;
                }
            } catch (NumberFormatException ex) {
            } catch (IndexOutOfBoundsException e) {
            }
            return UA.UNSPECIFIED;
        }

        /**
         * 001 if mobile (unknown device), 002 if iphone 003 if ipad 004 if ipod
         * otherwise 000
         */
        @Override
        int flags(String ua) {
            if (ua.contains(UA.IPHONE)) {
                return UA.PHONE_FLAG;
            } else if (ua.contains(UA.IPAD)) {
                return UA.TABLET_FLAG;
            } else if (ua.contains(UA.IPOD)) {
                return UA.MPLAYER_FLAG;
            } else if (ua.contains(UA.MOBILE)) {
                return UA.MOBILE_FLAG;
            }
            return UA.UNSPECIFIED;
        }

    },

    OPERA(15) {
        // http://my.opera.com/community/openweb/idopera/
        // http://dev.opera.com/articles/view/opera-ua-string-changes/

        @Override
        boolean match(String ua) {
            return (ua.contains(UA.OPERA));
        }

        @Override
        int majorVersion(String ua) {
            try {
                int verStart;
                if (ua.contains(UA.VERSION)) {
                    verStart = ua.indexOf(UA.VERSION) + 8; // 8 =
                                                           // "version/".length()
                } else if (ua.contains(UA.OPERA_MINI)) {
                    verStart = ua.indexOf(UA.OPERA_MINI) + 11; // 11 =
                                                               // "opera mini/".length()
                } else if (ua.contains(UA.OPERA_SLASH)) {
                    verStart = ua.indexOf(UA.OPERA_SLASH) + 6; // 6 =
                                                               // "opera/".length()
                } else {
                    verStart = ua.indexOf(UA.OPERA_SPACE) + 6; // 6 =
                                                               // "opera ".length()
                }
                int verEnd = ua.indexOf(UA.DOT, verStart);
                return Integer.parseInt(ua.substring(verStart, verEnd));
            } catch (NumberFormatException ex) {
            } catch (IndexOutOfBoundsException e) {
            }
            return UA.UNSPECIFIED;
        }

        /**
         * 001 if mobile, otherwise 000
         */
        @Override
        int flags(String ua) {
            if (ua.contains(UA.OPERA_MINI)) {
                return 6;
            } else if (ua.contains(UA.OPERA_MOBILE) || ua.contains(UA.HTC)) {
                return UA.MOBILE_FLAG;
            }
            return UA.UNSPECIFIED;
        }
    },

    ANDROID_WEBKIT(16) {
        // http://www.useragentstring.com/pages/Android%20Webkit%20Browser/
        // http://android-developers.blogspot.com/2010/12/android-browser-user-agent-issues.html

        @Override
        boolean match(String ua) {
            return (ua.contains(UA.ANDROID) && ua.contains(UA.APPLE_WEBKIT));
        }

        @Override
        int majorVersion(String ua) {
            try {
                int verStart = ua.indexOf(UA.VERSION) + 8; // 8 =
                                                           // "version/".length()
                int verEnd = ua.indexOf(UA.DOT, verStart);
                return Integer.parseInt(ua.substring(verStart, verEnd));
            } catch (NumberFormatException ex) {
            } catch (IndexOutOfBoundsException e) {
            }
            return UA.UNSPECIFIED;
        }

        /**
         * 001 if mobile (phone or small tablet), otherwise 000 (large tablets,
         * netbooks, etc.)
         */
        @Override
        int flags(String ua) {
            if (ua.contains(UA.MOBILE) || ua.contains(UA.PHONE) || ua.contains(UA.HTC) || ua.contains(UA.SAMSUNG)) {
                return UA.MOBILE_FLAG;
            }
            return UA.UNSPECIFIED;
        }
    },

    NETSCAPE(17) {
        // http://www.useragentstring.com/pages/Netscape/

        @Override
        boolean match(String ua) {
            return ((ua.contains(UA.GECKO) && (ua.contains(UA.NAVIGATOR) || ua.contains(UA.NETSCAPE_NOSLASH))) || (ua
                    .contains(UA.MOZILLA_4) && (!ua.contains(UA.GECKO) && !ua.contains(UA.MSIE)
                    && !ua.contains(UA.PALM_OS) && !ua.contains(UA.SYMBIAN) && !ua.contains(UA.OMNIWEB) && !ua
                    .contains(UA.ICAB))));
        }

        @Override
        int majorVersion(String ua) {
            try {
                if (ua.contains(UA.GECKO)) {
                    int verStart = -1;
                    if (ua.contains(UA.NAVIGATOR)) {
                        verStart = ua.indexOf(UA.NAVIGATOR) + 10; // 10 =
                                                                  // "navigator/".length()
                    } else if (ua.contains(UA.NETSCAPE)) {
                        verStart = ua.indexOf(UA.NETSCAPE) + 9; // 9 =
                                                                // "netscape/".length()
                    } else if (ua.contains(UA.NETSCAPE_6)) {
                        verStart = ua.indexOf(UA.NETSCAPE_6) + 10; // 10 =
                                                                   // "netscape6/".length()
                    } else if (ua.contains(UA.NETSCAPE_NOSLASH)) {
                        verStart = ua.indexOf(UA.NETSCAPE_NOSLASH) + 8; // 8 =
                                                                        // "netscape".length()
                    }
                    if (verStart != -1) {
                        int verEnd = ua.indexOf(UA.DOT, verStart);
                        // can be "netscape 6." "netscape6/" "netscape/6"
                        return Integer.parseInt(ua.substring(verStart, verEnd).trim());
                    }
                } else {
                    // Netscape 4.x is the rest of what passes match()
                    return 4;
                }
            } catch (NumberFormatException ex) {
            } catch (IndexOutOfBoundsException e) {
            }
            return UA.UNSPECIFIED;
        }
    },

    /**
     * Webkit browsers other than those from Apple, Google, and the Android OS.
     * This includes some newer Nokia and Blackberry systems.
     */
    OTHER_WEBKIT(18) {

        @Override
        boolean match(String ua) {
            // is webkit, but doesn't match other specific webkit UserAgent
            // instances
            return (ua.contains(UA.APPLE_WEBKIT) && !ua.contains(UA.CHROME) && !ua.contains(UA.ANDROID)
                    && !ua.contains(UA.IPAD) && !ua.contains(UA.IPHONE) && !ua.contains(UA.IPOD));
        }

        /**
         * 001 if mobile, otherwise 000
         */
        @Override
        int flags(String ua) {
            if (ua.contains(UA.MOBILE) || ua.contains(UA.SYMBIAN) || ua.contains(UA.BLACKBERRY)
                    || ua.contains(UA.PHONE) || ua.contains(UA.TABLET) || ua.contains(UA.SILK) || ua.contains(UA.HTC)
                    || ua.contains(UA.SAMSUNG)) {
                return UA.MOBILE_FLAG;
            }
            return UA.UNSPECIFIED;
        }
    },

    /**
     * This includes some releases of Camino, Konquerer, Chimera, etc.
     */
    OTHER_GECKO(19) {

        @Override
        boolean match(String ua) {
            // is gecko, but doesn't match other specific gecko UserAgent
            // instances
            return (ua.contains(UA.GECKO) && !ua.contains(UA.FIREFOX) && !ua.contains(UA.NAVIGATOR) && !ua
                    .contains(UA.NETSCAPE));
        }

        /**
         * 001 if mobile, otherwise 000
         */
        @Override
        int flags(String ua) {
            if (ua.contains(UA.MOBILE)) {
                return UA.MOBILE_FLAG;
            }
            return UA.UNSPECIFIED;
        }
    },

    /**
     * Non-Gecko other KHTML (rare)
     */
    OTHER_KHTML(20) {
        @Override
        boolean match(String ua) {
            // is KHTML, but doesn't match other specific UserAgent instances
            return (ua.contains(UA.KHTML) && !ua.contains(UA.GECKO));
        }

    },

    /**
     * This includes legacy (old) Blackberry, Nokia, Palm, and other browsers
     * that are not based on modern engines (Gecko, Chromium, and Webkit).
     */
    OTHER_MOBILE(21) {

        // http://www.developer.nokia.com/Community/Wiki/User-Agent_headers_for_Nokia_devices
        // http://www.zytrax.com/tech/web/mobile_ids.html
        // http://www.useragentstring.com/pages/Mobile%20Browserlist/

        @Override
        boolean match(String ua) {
            // is a mobile we know about but don't want to handle specially
            // APPLE_WEBKIT should have been found as OTHER_WEBKIT
            // TRIDENT should have matched for modern IEMobile
            if (ua.contains(UA.APPLE_WEBKIT) || ua.contains(UA.TRIDENT)) {
                return false;
            }
            // TODO: should we also look for 'phone' and 'mobile' here?
            return (ua.contains(UA.BLACKBERRY) || ua.contains(UA.HTC) || ua.contains(UA.SAMSUNG)
                    || ua.contains(UA.SYMBIAN) || ua.contains(UA.NOKIA) || ua.contains(UA.PALMSOURCE)
                    || ua.contains(UA.BLAZER) || ua.contains(UA.PALM_OS));
        }

        /**
         * 001
         */
        @Override
        int flags(String ua) {
            return UA.MOBILE_FLAG;
        }

    },

    /**
     * Web services and minor clients that don't need a version or flag.
     * 
     * We consolidate them here to roll up all of them into a smaller space, to
     * avoid running out of usable prefixes later. This also gives them a
     * different label pattern to avoid clutter in login.xml: 99 _ _ _ _ _ _
     * 
     * Everything after 99 can be used to point to a label or legacy browserType
     * int value.
     */
    OTHER_CLIENT(99) {

        // [<key to match ua.startsWith> , <label key>]
        // order is important in some cases - a string might contain matches to
        // 2+ keys
        private final Map<String, Integer> STARTS_WITH = new LinkedHashMap<String, Integer>() {
            /**
             * 
             */
            private static final long serialVersionUID = -2448380631422792311L;

            {
                put(UA.SFORCE_HTTP, BROWSER_OFFICE_TOOLKIT);
                put(UA.SFORCE_OFFICE_TOOLKIT, BrowserConsts.BROWSER_OFFICE_TOOLKIT);
                put("pocketsoap", BrowserConsts.BROWSER_POCKETSOAP);
                put("pear-soap", BrowserConsts.BROWSER_PEAR_SOAP);
                put("php soap", BrowserConsts.BROWSER_PHP_SOAP);
                put("nusoap", BrowserConsts.BROWSER_NUSOAP);
                put("java", BrowserConsts.BROWSER_JAVA);
                put("easysoap", BrowserConsts.BROWSER_EASYSOAP);
                put("curl", BrowserConsts.BROWSER_CURL);
                put("beatbox", BrowserConsts.BROWSER_BEATBOX);
                put("python-urllib", BrowserConsts.BROWSER_PYTHON);
                put("soappy", BrowserConsts.BROWSER_PYTHON);
                put("bea wlw", BrowserConsts.BROWSER_BEA_WLW);
                put("activesalesforce", BrowserConsts.BROWSER_ACTIVESALESFORCE);
                put("dreamfactory", BrowserConsts.BROWSER_DREAMFACTORY);
                put("salesforce/phptoolkit", BrowserConsts.BROWSER_SFDC_PHP);
                put("sfajax", BrowserConsts.BROWSER_SFDC_AJAX);
                put("salesforce web service connector for java", BrowserConsts.BROWSER_SFDC_JAVA);
                put("bw-httpclient", BrowserConsts.BROWSER_TIBCO_BW);
                put("bwsoap", BrowserConsts.BROWSER_TIBCO_BW);
                put("spanningsalesforce", BrowserConsts.BROWSER_SPANNING_SFDC);
                put("brew/http", BrowserConsts.BROWSER_BREW);
                put("meap http client library", BrowserConsts.BROWSER_MEAP);
                put("microsoft wse", BrowserConsts.BROWSER_DOTNET_WSE);
                put("xml spy", BrowserConsts.BROWSER_XMLSPY);
                put("soap toolkit 3.0", BrowserConsts.BROWSER_MSFT_STK);
            }
        };

        // [<key to match ua.contains> , <label key>]
        private final Map<String, Integer> CONTAINS = new LinkedHashMap<String, Integer>() {
            /**
             * 
             */
            private static final long serialVersionUID = -2448380631422792312L;

            {
                put(UA.MS_WEB_SERVICES_2_0, BrowserConsts.BROWSER_DOTNET_2_0);
                put(UA.MS_WEB_SERVICES_1_1, BrowserConsts.BROWSER_DOTNET_1_1);
                put(UA.MS_WEB_SERVICES_1_0, BrowserConsts.BROWSER_DOTNET_1_0);
                put(UA.MS_WEB_SERVICES, BrowserConsts.BROWSER_DOTNET_UNKNOWN);
                put(UA.AXIS_2_0, BrowserConsts.BROWSER_AXIS_2_0);
                put(UA.AXIS_1_4, BrowserConsts.BROWSER_AXIS_1_4);
                put(UA.AXIS_1_3, BrowserConsts.BROWSER_AXIS_1_3);
                put(UA.AXIS_1_2, BrowserConsts.BROWSER_AXIS_1_2);
                put(UA.AXIS_1_1, BrowserConsts.BROWSER_AXIS_1_1);
                put(UA.AXIS_1_0, BrowserConsts.BROWSER_AXIS_1_0);
                put(UA.AXIS, BrowserConsts.BROWSER_AXIS_UNKNOWN);
                put("soap::lite/perl", BrowserConsts.BROWSER_SOAP_LITE);
                put("ibm webservices", BrowserConsts.BROWSER_IBM_WEBSERVICES);
                put("jakarta commons-httpclient", BrowserConsts.BROWSER_HTTP_COMMONS);
            }
        };

        @Override
        boolean match(String ua) {
            for (String s : STARTS_WITH.keySet()) {
                if (ua.startsWith(s)) {
                    return true;
                }
            }
            for (String s : CONTAINS.keySet()) {
                if (ua.contains(s)) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Returns a 4 digit flag that can be used as the label key or the
         * legacy browserType int value.
         */
        @Override
        int flags(String ua) {
            for (String s : STARTS_WITH.keySet()) {
                if (ua.startsWith(s)) {
                    return (STARTS_WITH.get(s).intValue());
                }
            }
            for (String s : CONTAINS.keySet()) {
                if (ua.contains(s)) {
                    return (CONTAINS.get(s).intValue());
                }
            }
            // this should never happen
            return UA.UNSPECIFIED;
        }
    };

    // higher than this means 182+ dynamic versions
    static final int LEGACY_CUTOFF = 9999999;

    // higher than this means 182+ unversioned
    static final int VERSIONED_CUTOFF = 99000000;

    // 2 digits for browser family/type
    private int prefix;

    /**
     * Private constructor, setting the prefix value.
     * 
     * @param prefix an int between MIN_PREFIX and MAX_PREFIX (inclusive).
     */
    private UserAgent(int prefix) {
        this.prefix = prefix;
    }

    /**
     * Examines the user agent String and returns the appropriate matching
     * UserAgent enum instance.
     * 
     * @param userAgent
     * 
     * @return the corresponding UserAgent, or null if unknown
     */
    static UserAgent get(String userAgent) {
        if (userAgent != null) {
            userAgent = userAgent.toLowerCase().trim();
            for (UserAgent a : UserAgent.values()) {
                if (a.match(userAgent)) {
                    return a;
                }
            }
        }
        return null;
    }

    /**
     * Get the browser two digit prefix for this UserAgent as an int.
     * 
     * @return the prefix int
     */
    int prefix() {
        return this.prefix;
    }

    /**
     * Gets the major version for this browser as an int, or 0 if unknown.
     * 
     * If overridden and a a calculated int may be returned, it should be no
     * greater than {@link UserAgent#MAX_SUPPORTED_VERSION}.
     * 
     * @param userAgent a non-null user agent String to parse
     * 
     * @return the version (an int from 0-999)
     */
    int majorVersion(String userAgent) {
        return UA.UNSPECIFIED;
    }

    /**
     * Gets the flags for this browser as an int, or 0 if none.
     * 
     * @param userAgent a non-null user agent String to parse
     * 
     * @return the flags (an int from 0 to 999)
     */
    int flags(String userAgent) {
        return UA.UNSPECIFIED;
    }

    /**
     * Determines if the given browser int is a match for this UserAgent.
     * 
     * @param browser the browser int to check
     * 
     * @return true if a match, false otherwise
     */
    public boolean match(int browser) {
        if (browser > LEGACY_CUTOFF) {
            return this.prefix == Integer.parseInt(String.valueOf(browser).substring(0, 2));
        }
        return false;
    }

    /**
     * Determines if the given browser int is a match for this UserAgent, and if
     * the browser int major version refers to exactly the given version.
     * 
     * @param browser the browser int to check
     * @param version the version to compare against
     * 
     * @return true if a match, false otherwise
     */
    public boolean match(int browser, int version) {
        return match(browser, version, false);
    }

    /**
     * Determines if the given browser int is a match for this UserAgent, and if
     * the browser int major version refers to the given version.
     * 
     * If atLeast is true, any version equal to or higher than the passed in
     * version will return true. If atLeast is false, the version must match
     * exactly.
     * 
     * @param browser the browser int to check
     * @param version the version to compare against
     * @param atLeast whether the check should be equal (false), or equal or
     *            greater than (true)
     * 
     * @return true if a match, false otherwise
     */
    public boolean match(int browser, int version, boolean atLeast) {
        if (browser > LEGACY_CUTOFF) {
            String b = String.valueOf(browser);
            if (this.prefix == Integer.parseInt(b.substring(0, 2))) {
                int browserVer = Integer.parseInt(b.substring(2, 5));
                if (atLeast) {
                    return browserVer >= version;
                } else {
                    return browserVer == version;
                }
            }
        }
        return false;
    }

    /**
     * Determines if the given browser int is a match for this UserAgent, and if
     * the browser int refers to a version in the given range.
     * 
     * @param browser the browser int to check
     * @param int minVer the minimum version to compare against
     * @param int maxVer the maximum version to compare against
     * 
     * @return true if a match for browser and version, false otherwise
     */
    public boolean match(int browser, int minVer, int maxVer) {
        if (browser > LEGACY_CUTOFF) {
            String b = String.valueOf(browser);
            if (this.prefix == Integer.parseInt(b.substring(0, 2))) {
                int browserVer = Integer.parseInt(b.substring(2, 5));
                return (browserVer >= minVer) && (browserVer <= maxVer);
            }
        }
        return false;
    }

    /**
     * Determines if the given user agent is a match for this UserAgent.
     * 
     * @param userAgent a non-null user agent String to parse
     * 
     * @return true if a match, false otherwise
     */
    abstract boolean match(String userAgent);

    /**
     * Holder for some common constants used by the UserAgent parsers. Separated
     * because many of these share logical names with UserAgent enums.
     */
    static class UA {

        // General
        static final String DOT = ".";
        static final String VERSION = "version/";
        static final String MOBILE = "mobile";
        static final String PHONE = "phone";
        static final String TABLET = "tablet";
        static final String TOUCH = "touch";
        static final String GECKO = "gecko/";
        static final int UNSPECIFIED = 0; // desktop, no options
        static final int MOBILE_FLAG = 1;
        static final int PHONE_FLAG = 2;
        static final int TABLET_FLAG = 3;
        static final int MPLAYER_FLAG = 4;

        // MS
        static final String MSIE = "msie ";
        static final String MOZILLA_4_MSIE = "Mozilla/4.0 (compatible; MSIE";
        static final String MOZILLA_5_MSIE = "Mozilla/5.0 (compatible; MSIE";
        static final String MSIE_7 = "msie 7"; // for compatibility view checks
                                               // not IE7 checks
        static final String TRIDENT = "trident/"; // identifier for > IE7
        static final String TRIDENT_3_1 = "trident/3.1"; // IEMobile 7
        static final String TRIDENT_4 = "trident/4.0"; // IE8
        static final String TRIDENT_5 = "trident/5.0"; // IE9
        static final String TRIDENT_6 = "trident/6.0"; // IE10
        static final String TRIDENT_7 = "trident/7.0"; // IE11?
        static final String TRIDENT_8 = "trident/8.0"; // IE12?
        static final String IEMOBILE = "iemobile/";
        static final String WINCE = "wince";
        static final String WINDOWS_CE = "windows ce";
        static final String MS_WEB_SERVICES = "ms web services client protocol ";
        static final String MS_WEB_SERVICES_1_0 = "ms web services client protocol 1.0";
        static final String MS_WEB_SERVICES_1_1 = "ms web services client protocol 1.1";
        static final String MS_WEB_SERVICES_2_0 = "ms web services client protocol 2.0";
        static final String ARM = "arm";
        static final String WIN = "win";
        static final String WIN_XP = "windows nt 5.1";
        static final String WIN_2K3 = "windows nt 5.2";
        static final String WIN_2K = "windows nt 5.0";
        static final String WIN_VISTA = "windows nt 6.0";
        static final String WIN_7 = "windows nt 6.1";
        static final String WIN_8 = "windows nt 6.2";
        static final String WIN_NT = "winnt";
        static final String WINDOWS_NT = "windows nt";
        static final String WIN_ME = "win 9x 4.90";
        static final String WIN_98 = "win98";
        static final String WINDOWS_98 = "windows 98";
        static final String WIN_95 = "win95";
        static final String WINDOWS_95 = "windows 95";
        static final String WINDOWS_3_1 = "windows 3.1";
        static final String WINDOWS_16_BIT = "windows 16-bit";
        static final String WIN_16_BIT = "win16";
        static final String WINDOWS_PHONE_OS_7 = "windows phone os 7.0";
        static final String WINDOWS_PHONE_OS_7_5 = "windows phone os 7.5";
        static final String WINDOWS_PHONE_8 = "windows phone 8.0";

        // Apple
        static final String APPLE_WEBKIT = "applewebkit";
        static final String SAFARI = "safari";
        static final String SAFARI_2_KEY = "safari/4";
        static final String SAFARI_1_KEY1 = "safari/3";
        static final String SAFARI_1_KEY2 = "safari/1";
        static final String SAFARI_1_KEY3 = "safari/8";
        static final String IPHONE = "iphone";
        static final String IPAD = "ipad";
        static final String IPOD = "ipod";
        static final String MAC = "mac";
        static final String MAC68K = "68k";
        static final String MAC68000 = "68000";
        static final String OSX = "osx";
        static final String OS_X = "os x";
        static final String PPC = "ppc";
        static final String POWERPC = "powerpc";

        // Google
        static final String CHROME = "chrome";
        static final String CHROME_SLASH = "chrome/";
        static final String ANDROID = "android";
        static final String CHROMEFRAME = "chromeframe/";
        static final String CHROME_IOS = "crios/";

        // Firefox
        static final String FIREFOX = "firefox/";
        static final String FENNEC = "fennec";

        // Opera
        static final String OPERA = "opera";
        static final String OPERA_SLASH = "opera/";
        static final String OPERA_SPACE = "opera ";
        static final String OPERA_MOBILE = "opera mobi";
        static final String OPERA_MINI = "opera mini/";

        // Netscape
        static final String NAVIGATOR = "navigator/";
        static final String NETSCAPE = "netscape/";
        static final String NETSCAPE_NOSLASH = "netscape";
        static final String NETSCAPE_6 = "netscape6/";
        static final String MOZILLA_4 = "mozilla/4";

        // Linux / Unix
        static final String SUNOS = "sunos";
        static final String SUNOS_4 = "sunos 4";
        static final String SUNOS_5 = "sunos 5";
        static final String I86 = "i86";
        static final String INUX = "inux";

        // Other
        static final String KHTML = "khtml";
        static final String BLACKBERRY = "blackberry";
        static final String SYMBIAN = "symbian";
        static final String NOKIA = "nokia";
        static final String SAMSUNG = "samsung";
        static final String PALMSOURCE = "palmsource";
        static final String BLAZER = "blazer";
        static final String EPOC = "epoc";
        static final String PALM_OS = "palmos";
        static final String PALM = "palm";
        static final String ICAB = "icab";
        static final String OMNIWEB = "omniweb";
        static final String HTC = "htc";
        static final String SFORCE_HTTP = "sforce http";
        static final String SFORCE_OFFICE_TOOLKIT = "sforceofficetoolkit";
        static final String SILK = "silk";
        static final String AXIS = "axis";
        static final String AXIS_1_0 = "axis/1.0";
        static final String AXIS_1_1 = "axis/1.1";
        static final String AXIS_1_2 = "axis/1.2";
        static final String AXIS_1_3 = "axis/1.3";
        static final String AXIS_1_4 = "axis/1.4";
        static final String AXIS_2_0 = "axis/2.0";
    }

}
