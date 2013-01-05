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

// import constants
import static org.auraframework.impl.util.UserAgent.UA.*;
import static org.auraframework.impl.util.UserAgent.*;
import static org.auraframework.impl.util.BrowserConsts.*;

import java.util.regex.Matcher;
import java.util.regex.Pattern;



/**
 * Utility to parse and handle browser user-agent Strings.
 */
public class BrowserUserAgent {
    
     /**
     * The http header identifier for user agents.
     *
     * Use should not be case sensitive.
     */
    public static final String HEADER = "user-agent";

    /** User agent strings have way too many possible characters.
     * This is a white list of all desired characters - basically
     * everything printable except for the backslash.
     */
    public static final Pattern USER_AGENT_WHITELIST = Pattern.compile("[\\x20-\\x7E&&[^\\x5C]]*");

    /* These regular expressions to detect Mobile Browsers based on the User-Agent
     * header were found at
     * http://detectmobilebrowser.com/
     * we should probably refresh them occasionally (last updated May 8, 2012)
     *
     * Also updated to recognize iPad's which for some reason were not part of
     * the current version.
     *
     * This is apparently because that site is ONLY for mobile phones and mini
     * tablets not larger tablets. It seems a fuzzy line though.
     * For example Kindle e-ink is identified as 'mobile' but Kindle Fire is not.
     */
    private static final String mobileRegexp1 = ".*(android.+mobile|apexmobile|avantgo|bada\\/|blackberry|blazer|compal|elaine|" +
        "fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\\/|" +
        "plucker|pocket|psp|symbian|treo|up\\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino).*";
    private static final String mobileRegexp2 = "1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\\-)|" +
        "ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\\-m|r |s )|avan|be(ck|ll|nq)|" +
        "bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\\-(n|u)|c55\\/|capi|ccwa|cdm\\-|cell|chtm|cldc|cmd\\-|co(mp|nd)|" +
        "craw|da(it|ll|ng)|dbte|dc\\-s|devi|dica|dmob|do(c|p)o|ds(12|\\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|" +
        "ez([4-7]0|os|wa|ze)|fetc|fly(\\-|_)|g1 u|g560|gene|gf\\-5|g\\-mo|go(\\.w|od)|gr(ad|un)|haie|hcit|" +
        "hd\\-(m|p|t)|hei\\-|hi(pt|ta)|hp( i|ip)|hs\\-c|ht(c(\\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\\-(20|go|ma)|" +
        "i230|iac( |\\-|\\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\\/)|" +
        "klon|kpt |kwc\\-|kyo(c|k)|le(no|xi)|lg( g|\\/(k|l|u)|50|54|e\\-|e\\/|\\-[a-w])|libw|lynx|m1\\-w|m3ga|" +
        "m50\\/|ma(te|ui|xo)|mc(01|21|ca)|m\\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\\-| |o|v)|zz)|" +
        "mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\\-|on|tf|wf|wg|wt)|" +
        "nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\\-([1-8]|c))|phil|pire|pl(ay|uc)|" +
        "pn\\-2|po(ck|rt|se)|prox|psio|pt\\-g|qa\\-a|qc(07|12|21|32|60|\\-[2-7]|i\\-)|qtek|r380|r600|raks|rim9|" +
        "ro(ve|zo)|s55\\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\\-|oo|p\\-)|sdk\\/|se(c(\\-|0|1)|47|mc|nd|ri)|sgh\\-|" +
        "shar|sie(\\-|m)|sk\\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\\-|v\\-|v )|sy(01|mb)|t2(18|50)|" +
        "t6(00|10|18)|ta(gt|lk)|tcl\\-|tdg\\-|tel(i|m)|tim\\-|t\\-mo|to(pl|sh)|ts(70|m\\-|m3|m5)|tx\\-9|" +
        "up(\\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|" +
        "w3c(\\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\\-|2|g)|yas\\-|your|zeto|zte\\-";
    private static final Pattern mobilePat1 = Pattern.compile(mobileRegexp1);
    private static final Pattern mobilePat2 = Pattern.compile(mobileRegexp2);

    static final Pattern getCommonMobileUserAgentPattern() {
        return mobilePat1;
    }

    static final Pattern getUncommonMobileUserAgentPattern() {
        return mobilePat2;
    }



    /**
     * Parse user agent strings to determine browser.
     *
     * Only supported browsers are expected to be correctly detected. Most
     * unsupported browsers will return <code>BROWSER_UNKNOWN</code>.
     *
     * @param userAgent the user agent String to parse
     *
     * @return a browser int
     */
    public static final int parseBrowser(String userAgent) {
        // clean the input
        if (userAgent == null) {
            return BROWSER_UNKNOWN;
        }
        userAgent = userAgent.toLowerCase().trim();

        // find the browser family
        UserAgent ua = UserAgent.get(userAgent);
        if (ua == null) {
            return BROWSER_UNKNOWN;
        }
        int browser = ua.prefix() * 1000000;

        // then browser version within the family
        int ver = ua.majorVersion(userAgent);
        // don't allow >999 or you change browser families
        browser += Math.min(999, ver) * 1000;

        // browser flags/variants
        int flags = ua.flags(userAgent);
        browser += flags;

        // check for unversioned clients
        if (browser > VERSIONED_CUTOFF) {
            // turn numbers like 99005244 into short form 5244
            browser = browser - VERSIONED_CUTOFF;
        }

        // return the resulting number - this is what goes in the DB for browser type
        return browser;
    }



    /**
     * Parse user agent string to determine platform (OS).
     *
     * Only supported platforms are expected to be correctly detected. Most
     * unsupported platforms will return <code>PLATFORM_UNKNOWN</code>.
     *
     * @param userAgent the user agent String to parse
     *
     * @return a platform int
     */
    public static final int parsePlatform(String userAgent) {
        if (userAgent == null) {
            return PLATFORM_UNKNOWN;
        }
        String ua = userAgent.toLowerCase().trim();

        if (ua.contains(BLACKBERRY)) {
            return PLATFORM_RIM;
        } else if (ua.contains(PALM) || ua.contains(BLAZER)) {
            return PLATFORM_PALM;
        } else if (ua.contains(SYMBIAN) || ua.contains(EPOC) || ua.contains(NOKIA)) { // epoc is old name for symbian
            return PLATFORM_SYMBIAN;
        } else if (ua.contains(ANDROID)) {
            try {
                int idx = ua.indexOf(ANDROID) + 8; // 8 = "android ".length()
                int majorVer = Integer.parseInt(ua.substring(idx, idx + 1)) % 10;
                int minorVer = Integer.parseInt(ua.substring(idx + 2, idx + 3)) % 10;
                return PLATFORM_ANDROID_VERSION_BASE + (majorVer * 10) + minorVer;
            }
            // fall through to generic Android on version parse failure
            catch (IndexOutOfBoundsException e) {}
            catch (NumberFormatException e) {}
            return PLATFORM_ANDROID;
        } else if (ua.contains(WIN)) {
            if (ua.contains(PHONE)) {
                if (ua.contains(WINDOWS_PHONE_8)) {
                    return PLATFORM_WINPH_8;
                } else if (ua.contains(WINDOWS_PHONE_OS_7_5)) {
                    return PLATFORM_WINPH_7_5;
                } else if (ua.contains(WINDOWS_PHONE_OS_7)) {
                    return PLATFORM_WINPH_7;
                }
            }
            // intentionally not an else-if
            if (ua.contains(WIN_7)) {
                return PLATFORM_WIN_7;
            } else if (ua.contains(WIN_XP)) {
                return PLATFORM_WIN_XP;
            } else if (ua.contains(WIN_8)) {
                if (ua.contains(ARM)) {
                    return PLATFORM_WIN_RT;
                } else {
                    return PLATFORM_WIN_8;
                }
            } else if (ua.contains(WIN_VISTA)) {
                return PLATFORM_WIN_VISTA;
            } else if (ua.contains(WIN_2K3)) {
                return PLATFORM_WIN_2K3;
            } else if (ua.contains(WIN_2K)) {
                return PLATFORM_WIN_2K;
            } else if (ua.contains(WIN_NT) || ua.contains(WINDOWS_NT)) {
                return PLATFORM_WIN_NT;
            } else if (ua.contains(WIN_ME)) {
                return PLATFORM_WIN_ME;
            } else if (ua.contains(WIN_98) || ua.contains(WINDOWS_98)) {
                return PLATFORM_WIN_98;
            } else if (ua.contains(WIN_95) || ua.contains(WINDOWS_95)) {
                return PLATFORM_WIN_95;
            } else if (ua.contains(WINDOWS_3_1) || ua.contains(WINDOWS_16_BIT)
                || ua.contains(WIN_16_BIT)) {
                return PLATFORM_WIN_3_1;
            } else if (ua.contains(WINCE) || ua.contains(WINDOWS_CE)) {
                return PLATFORM_WIN_CE;
            } else {
                return PLATFORM_WIN;
            }
        } else if (ua.contains(MAC)) {
            if (ua.contains(IPAD)) {
                return PLATFORM_IPAD;  // Ipad != iPhone
                // http://developer.apple.com/safari/library/technotes/tn2010/tn2262/index.html
            } else if (ua.contains(IPHONE) || ua.contains(IPOD)) {
                // treat ipod and iphone the same for now - they have the same OS, screen, and browser
                return PLATFORM_IPHONE;
            } else if (ua.contains(MAC68K) || ua.contains(MAC68000)) {
                return PLATFORM_MAC_68K;
            } else if (ua.contains(OS_X) || ua.contains(OSX)) {
                return PLATFORM_MAC_OSX;
            } else if (ua.contains(PPC) || ua.contains(POWERPC)) {
                return PLATFORM_MAC_PPC;
            } else {
                return PLATFORM_MAC;
            }
        } else if (ua.contains(SUNOS)) {
            if (ua.contains(SUNOS_4)) {
                return PLATFORM_SUN_4;
            } else if (ua.contains(SUNOS_5)) {
                return PLATFORM_SUN_5;
            } else if (ua.contains(I86)) {
                return PLATFORM_SUN_I86;
            } else {
                return PLATFORM_SUN;
            }
        } else if (ua.contains(INUX)) {
            return PLATFORM_LINUX;
        }

        return PLATFORM_UNKNOWN;
    }



    /**
     * Sanitize a given user agent String, removing potentially dangerous
     * or unusable characters.
     *
     * @param userAgent
     *
     * @return a sanitized user agent String
     */
    public static String sanitizeString(String userAgent) {
        if(userAgent == null) {
            return null;
        }
        userAgent = userAgent.trim();
        StringBuilder resUa = new StringBuilder(userAgent.length());
        Matcher m = USER_AGENT_WHITELIST.matcher(userAgent);
        while(m.find()) {
            resUa.append(m.group());
        }
        return resUa.toString();
    }


    
}
