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
package org.auraframework.test;

import java.util.EnumSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import junit.framework.Assert;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.Platform;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.uiautomation.ios.IOSCapabilities;

import com.google.common.collect.Lists;

/**
 * Utility methods related to WebDriver
 * 
 * Test cases can be annotated with @TargetBrowsers and @ExcludeBrowsers. These annotations are applicable for
 * Methods(TestCase) and Classes.
 */
public final class WebDriverUtil {
    private static String SELENIUM_VERSION = null;
    private static Set<BrowserType> defaultBrowsers = EnumSet.of(BrowserType.GOOGLECHROME);
    private static Set<BrowserType> availableBrowsers = null;

    private enum ExtraCapability {
        PHONE("deviceType", "phone"),
        TABLET("deviceType", "tablet"),
        LANDSCAPE("deviceOrientation", "landscape"),
        PORTRAIT("deviceOrientation", "portrait"),
        DISABLE_NATIVE_EVENTS("webdriverEnableNativeEvents", "false"),
        SIMULATOR_SCALE_IPAD("simulatorScale", ".35"),
        SIMULATOR_SCALE_IPHONE("simulatorScale", ".5");

        private final String value;
        private final String name;

        private ExtraCapability(String name, String value) {
            this.name = name;
            this.value = value;
        }

        private String getCapabilityName() {
            return this.name;
        }

        private String getValue() {
            return this.value;
        }
    }

    public enum BrowserType {
        FIREFOX(DesiredCapabilities.firefox(), null, Platform.ANY, ExtraCapability.DISABLE_NATIVE_EVENTS),
        IE11(DesiredCapabilities.internetExplorer(), "11", "Windows 8.1"),
        IE10(DesiredCapabilities.internetExplorer(), "10", Platform.WIN8),
        IE9(DesiredCapabilities.internetExplorer(), "9", Platform.VISTA),
        IE8(DesiredCapabilities.internetExplorer(), "8", Platform.WINDOWS),
        IE7(DesiredCapabilities.internetExplorer(), "7", Platform.WINDOWS),
        GOOGLECHROME(DesiredCapabilities.chrome(), null, Platform.ANY),
        SAFARI(DesiredCapabilities.safari(), "6", "OS X 10.8"),
        SAFARI5(DesiredCapabilities.safari(), "5", "Mac"), // Not run in autobuilds
        ANDROID_PHONE(DesiredCapabilities.android(), "4", "Linux", ExtraCapability.PHONE, ExtraCapability.PORTRAIT),
        ANDROID_TABLET(DesiredCapabilities.android(), "4", "Linux", ExtraCapability.TABLET, ExtraCapability.LANDSCAPE),
        IPHONE(DesiredCapabilities.iphone(), "6", "Mac 10.8"),
        IPAD(DesiredCapabilities.ipad(), "6", "Mac 10.8"),
        IPAD7(DesiredCapabilities.ipad(), "7.1", "OS X 10.9", ExtraCapability.PORTRAIT), // Not run in autobuilds
        IPHONE7(DesiredCapabilities.iphone(), "7.1", "OS X 10.9", ExtraCapability.PORTRAIT), // Not run in autobuilds
        IPAD_IOS_DRIVER(IOSCapabilities.ipad("Safari"), "7.1", "Mac 10.9", ExtraCapability.SIMULATOR_SCALE_IPAD),
        IPHONE_IOS_DRIVER(IOSCapabilities.iphone("Safari"), "7.1", "Mac 10.9", ExtraCapability.SIMULATOR_SCALE_IPHONE); // Not run in autobuilds (yet)

        private final DesiredCapabilities capability;
        private final String version;
        private final String IOSDRIVER_VERSION = "sauce-storage:iosserver066.jar";

        private BrowserType(DesiredCapabilities capabilities, String version, ExtraCapability... extraCapabilities) {
            this.capability = capabilities;
            this.version = version;
            // capabilities for ios-driver common to ipad/iphone
            if (capabilities instanceof IOSCapabilities) {
                this.capability.setCapability("simulator", "true");
                this.capability.setCapability("iosdriver-version", IOSDRIVER_VERSION);
                this.capability.setCapability("variation", (String) null);
            }
            initExtraCapabilities(extraCapabilities);
        }

        private BrowserType(DesiredCapabilities capabilities, String version, String platform,
                ExtraCapability... extraCapabilities) {
            this(capabilities, version, extraCapabilities);
            if (capabilities != null) {
                this.capability.setCapability("platform", platform);
            }
        }

        private BrowserType(DesiredCapabilities capabilities, String version, Platform platform,
                ExtraCapability... extraCapabilities) {
            this(capabilities, version, extraCapabilities);
            if (capabilities != null) {
                this.capability.setPlatform(platform);
            }
        }

        private void initExtraCapabilities(ExtraCapability... extraCapabilities) {
            for (ExtraCapability extra : extraCapabilities) {
                // newer versions of firefox no longer support native events
                if (extra.getCapabilityName().equals(ExtraCapability.DISABLE_NATIVE_EVENTS.getCapabilityName())
                        && this.capability.getBrowserName().equals("firefox")) {
                    FirefoxProfile firefoxProfile = new FirefoxProfile();
                    firefoxProfile.setEnableNativeEvents(Boolean.parseBoolean(extra.getValue()));
                    this.capability.setCapability("firefox_profile", firefoxProfile);
                } else {
                    this.capability.setCapability(extra.getCapabilityName(), extra.getValue());
                }
            }
        }

        public DesiredCapabilities getCapability() {
            return new DesiredCapabilities(this.capability);
        }

        /**
         * Set the version only when requesting capabilities from SauceLab.
         * 
         * @return
         */
        public String getVersion() {
            return this.version;
        }
    }

    public static Set<BrowserType> getBrowserListForTestRun(Set<BrowserType> targetBrowsers,
            Set<BrowserType> excludeBrowsers) {
        if (targetBrowsers == null || targetBrowsers.isEmpty()) {
            targetBrowsers = EnumSet.allOf(BrowserType.class);
        }
        targetBrowsers.retainAll(getSupportedBrowserTypes());
        if (excludeBrowsers != null) {
            targetBrowsers.removeAll(excludeBrowsers);
        }
        return targetBrowsers;
    }

    /**
     * Allow override of browser from command line using -Dwebdriver.browser.type=""
     * 
     * @return
     */
    public static Set<BrowserType> getSupportedBrowserTypes() {
        if (availableBrowsers == null) {
            String browserTypeSysVar = System.getProperty(WebDriverProvider.BROWSER_TYPE_PROPERTY);
            if (browserTypeSysVar == null) {
                availableBrowsers = EnumSet.copyOf(defaultBrowsers);
            } else {
                availableBrowsers = EnumSet.noneOf(BrowserType.class);
                try {
                    for (String b : browserTypeSysVar.split(",")) {
                        availableBrowsers.add(BrowserType.valueOf(b.trim().toUpperCase()));
                    }
                } catch (IllegalArgumentException e) {
                    Assert.fail(String.format(
                            "Invalid browser specification. Check system property %s - currently set to: %s",
                            WebDriverProvider.BROWSER_TYPE_PROPERTY, browserTypeSysVar));
                }
            }
        }
        return EnumSet.copyOf(availableBrowsers);
    }

    /**
     * Get the expected Selenium client version based on the current server version. Used when requesting drivers from
     * Sauce.
     */
    public static String getSeleniumClientVersion() {
        if (SELENIUM_VERSION == null) {
            String version = new BuildInfo().getReleaseLabel();
            if (version.matches("^\\d+\\.\\d+\\.\\d+$")) {
                SELENIUM_VERSION = version;
            } else {
                try {
                    Properties p = new Properties();
                    p.load(WebDriverUtil.class.getResourceAsStream("/VERSION.txt"));
                    SELENIUM_VERSION = String.format("%s%s", p.getProperty("selenium.core.version"),
                            p.getProperty("selenium.core.revision"));
                } catch (Throwable t) {
                    throw new Error("Unable to determine Selenium version");
                }
            }
        }
        return SELENIUM_VERSION;
    }

    public static synchronized ChromeOptions addChromeOptions(DesiredCapabilities capabilities, Dimension windowSize) {
        ChromeOptions options = new ChromeOptions();
        List<String> arguments = Lists.newArrayList();
        arguments.add("--ignore-gpu-blacklist");
        if (windowSize != null) {
            arguments.add("window-size=" + windowSize.width + ',' + windowSize.height);
        }
        options.addArguments(arguments);
        capabilities.setCapability(ChromeOptions.CAPABILITY, options);
        return options;
    }
}
