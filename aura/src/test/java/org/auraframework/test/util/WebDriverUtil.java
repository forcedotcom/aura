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

import com.google.common.collect.Lists;
import org.junit.Assert;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Platform;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.EnumSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

/**
 * Utility methods related to WebDriver
 * 
 * Test cases can be annotated with @TargetBrowsers and @ExcludeBrowsers. These annotations are applicable for
 * Methods(TestCase) and Classes.
 */
public final class WebDriverUtil {
    private static String SELENIUM_VERSION = null;
    private static Set<BrowserType> defaultBrowsers = EnumSet.of(BrowserType.GOOGLECHROME);
    public static Set<BrowserType> MOBILE = 
    		EnumSet.of(BrowserType.IPHONE,
                    	BrowserType.IPAD,
                    	BrowserType.ANDROID_PHONE,
                    	BrowserType.ANDROID_TABLET);
    public static Set<BrowserType> DESKTOP = 
    		EnumSet.of(BrowserType.IE9,
                    	BrowserType.IE10,
    					BrowserType.IE11,
			            BrowserType.FIREFOX,
			            BrowserType.GOOGLECHROME,
			            BrowserType.SAFARI);
    private static Set<BrowserType> availableBrowsers = null;

    private enum ExtraCapability {
        PHONE("deviceType", "phone"),
        TABLET("deviceType", "tablet"),
        LANDSCAPE("deviceOrientation", "landscape"),
        PORTRAIT("deviceOrientation", "portrait"),
        DISABLE_NATIVE_EVENTS("webdriverEnableNativeEvents", "false"),
        DISABLE_POPUP_BLOCKING("disable-popup-blocking", "true");

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
        FIREFOX(DesiredCapabilities.firefox(), "29", ExtraCapability.DISABLE_NATIVE_EVENTS),
        IE11(DesiredCapabilities.internetExplorer(), "11", "Windows 8.1"),
        IE10(DesiredCapabilities.internetExplorer(), "10", "Windows 2012"),
        IE9(DesiredCapabilities.internetExplorer(), "9", "Windows 7"),
        IE8(DesiredCapabilities.internetExplorer(), "8", Platform.WINDOWS),
        IE7(DesiredCapabilities.internetExplorer(), "7", Platform.WINDOWS),
        GOOGLECHROME(DesiredCapabilities.chrome(), "34", Platform.ANY, ExtraCapability.DISABLE_POPUP_BLOCKING),
        SAFARI(DesiredCapabilities.safari(), "7", "OS X 10.9"),
        ANDROID_PHONE(DesiredCapabilities.android(), "4", "Linux", ExtraCapability.PHONE, ExtraCapability.PORTRAIT),
        ANDROID_TABLET(DesiredCapabilities.android(), "4", "Linux", ExtraCapability.TABLET, ExtraCapability.LANDSCAPE),
        IPAD(DesiredCapabilities.ipad()),
        IPHONE(DesiredCapabilities.iphone());
        private final DesiredCapabilities capability;
        private final ExtraCapability[] extraCapabilities;
        private final String version;

        private BrowserType(DesiredCapabilities capabilities, String version, ExtraCapability... extraCapabilities) {
            this.capability = capabilities;
            this.version = version;
            this.extraCapabilities = extraCapabilities;
        }

        private BrowserType(DesiredCapabilities capabilities, ExtraCapability... extraCapabilities) {
            this.capability = capabilities;
            this.version = "";
            this.extraCapabilities = extraCapabilities;

            String browser = capabilities.getBrowserName();
            if (browser.equalsIgnoreCase("iphone") || browser.equalsIgnoreCase("ipad")) {
                String deviceName = System.getProperty(WebDriverProvider.DEVICE_NAME_PROPERTY);
                String platformVersion = System.getProperty(WebDriverProvider.PLATFORM_VERSION_PROPERTY);
                if (deviceName == null || deviceName.length() <= 0) {
                    if (browser.equalsIgnoreCase("iphone")) {
                        deviceName = SauceUtil.getIosIphoneDevice();
                    } else if (browser.equalsIgnoreCase("ipad")) {
                        deviceName = SauceUtil.getIosIpadDevice();
                    }
                }
                if (platformVersion == null || platformVersion.length() <= 0) {
                    SauceUtil.setIOSAppiumCapabilities(this.capability, "Safari", deviceName);
                } else {
                    SauceUtil.setIOSAppiumCapabilities(this.capability, "Safari", deviceName, platformVersion);
                }
            }
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
                if (extra.equals(ExtraCapability.DISABLE_POPUP_BLOCKING)
                        && this.capability.getBrowserName().equals("chrome")
                        && extra.getValue().equals("true")) {
                    // Disable pop-up blocking in google chrome
                    // Chromedriver v21+ has this feature by default https://bugs.chromium.org/p/chromedriver/issues/detail?id=1291
                    ChromeOptions options = new ChromeOptions();
                    options.addArguments(extra.getCapabilityName());
                    this.capability.setCapability(ChromeOptions.CAPABILITY, options);
                } else {
                    this.capability.setCapability(extra.getCapabilityName(), extra.getValue());
                }
            }
        }

        public DesiredCapabilities getCapability() {
            if (extraCapabilities != null) {
                initExtraCapabilities(extraCapabilities);
            }
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
        Boolean noSandbox = Boolean.valueOf(System.getProperty("webdriver.chrome.nosandbox"));
        if (noSandbox) {
            arguments.add("--no-sandbox");
        }
        if (windowSize != null) {
            arguments.add("window-size=" + windowSize.width + ',' + windowSize.height);
        }
        options.addArguments(arguments);
        // To remove message "You are using an unsupported command-line flag: --ignore-certificate-errors.
        // Stability and security will suffer."
        // Add an argument 'test-type'
        options.addArguments("test-type");
        capabilities.setCapability(ChromeOptions.CAPABILITY, options);
        return options;
    }
}
