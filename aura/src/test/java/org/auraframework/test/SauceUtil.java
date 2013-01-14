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
package org.auraframework.test;

import java.net.MalformedURLException;
import java.net.URL;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import junit.framework.TestCase;

import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * SauceLabs-related utility methods
 */
public final class SauceUtil {

    private static final boolean TUNNEL_SELENIUM_COMMANDS_THROUGH_SAUCE_CONNECT = false;
    static final String SAUCELABS_SERVER_URL = "saucelabs.com";
    private static final String SAUCE_USERNAME = System.getProperty("sauce.username", "lumen");
    private static final String SAUCE_ACCESS_KEY = System.getProperty("sauce.access.key",
            "4df61bdf-1696-4f73-b869-ead4c7603dca");
    private static final String SAUCE_WEB_DRIVER_URL = "http://" + SAUCE_USERNAME + ':' + SAUCE_ACCESS_KEY
            + "@saucelabs.com:4444/wd/hub";
    private static final String SAUCE_CONNECT_URL = "http://" + SAUCE_USERNAME + ':' + SAUCE_ACCESS_KEY
            + "@rsalvador-wsl.internal.salesforce.com:4445/wd/hub";
    static final String SAUCE_ONDEMAND_HOST = "ondemand.saucelabs.com";
    static final int SAUCE_ONDEMAND_PORT = 80;

    public static boolean areTestsRunningOnSauce() {
        return "saucelabs.com".equals(System.getProperty(WebDriverProvider.WEBDRIVER_SERVER_PROPERTY));
    }

    public static URL getSauceServerUrl() throws MalformedURLException {
        String hubURL = TUNNEL_SELENIUM_COMMANDS_THROUGH_SAUCE_CONNECT ? SAUCE_CONNECT_URL : SAUCE_WEB_DRIVER_URL;
        return new URL(hubURL);
    }

    /**
     * @param test
     * @param browserType String identifying browser and version (same String as
     *            the one used by SeleniumTest.BrowserType)
     * @return Capabilities for the browserType as required by SauceLabs
     */
    public static DesiredCapabilities getCapabilities(BrowserType browserType, TestCase test) {
        DesiredCapabilities capabilities = browserType.getCapability();

        if (browserType.equals(BrowserType.IPAD) || browserType.equals(BrowserType.IPHONE)) {
            // dont set let SauceLabs choose
        } else {
            capabilities.setCapability("selenium-version", WebDriverUtil.getSeleniumClientVersion());
        }

        capabilities.setVersion(browserType.getVersion());
        capabilities.setCapability("name", getTestName(test));
        String buildId = System.getProperty("aura.build.id");
        if (buildId != null) {
            capabilities.setCapability("build", buildId);
        }

        // adding timeouts to prevent jobs to run for too long when problems
        // occur:
        // see http://saucelabs.com/docs/ondemand/additional-config#timeouts
        capabilities.setCapability("max-duration", 300); // 5min, default was
                                                         // 30mins
        capabilities.setCapability("command-timeout", 60); // 1min, default was
                                                           // 5mins
        capabilities.setCapability("idle-timeout", 60); // 1min, default was
                                                        // 90secs

        capabilities.setCapability("record-video", System.getProperty("sauce.record.video", "false"));
        capabilities.setCapability("record-screenshots", System.getProperty("sauce.record.screenshots", "false"));
        return capabilities;
    }

    private static String getTestName(TestCase test) {
        if (test == null) {
            return "unknown";
        }
        String className = test.getClass().getName();
        int last_dot = className.lastIndexOf('.');
        if (last_dot != -1) {
            className = className.substring(last_dot + 1);
        }
        return className + '.' + test.getName();
    }

    // LINKS TO SAUCE JOBS:

    /**
     * @return link to job in SauceLabs or null if it cannot be calculated
     */
    public static String getLinkToJobInSauce(WebDriver driver) {
        if (!(driver instanceof RemoteWebDriver)) {
            return null;
        }
        String sessionId = ((RemoteWebDriver) driver).getSessionId().toString();
        return "https://saucelabs.com/jobs/" + sessionId;
    }

    /**
     * @return link to public (no login required) job in SauceLabs or null if it
     *         cannot be calculated
     */
    public static String getLinkToPublicJobInSauce(WebDriver driver) {
        if (!(driver instanceof RemoteWebDriver)) {
            return null;
        }
        String sessionId = ((RemoteWebDriver) driver).getSessionId().toString();
        try {
            return "https://saucelabs.com/jobs/" + sessionId + "?auth=" + authToken(sessionId);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String authToken(String jobId) throws Exception {
        String message = SAUCE_USERNAME + ':' + SAUCE_ACCESS_KEY;
        SecretKeySpec secretKey = new SecretKeySpec(message.getBytes(), "HMACMD5");

        Mac mac = Mac.getInstance(secretKey.getAlgorithm());
        mac.init(secretKey);
        byte[] result = mac.doFinal(jobId.getBytes());

        return toHexString(result);
    }

    private static String toHexString(byte[] bytes) {
        StringBuffer hash = new StringBuffer();
        for (int i = 0; i < bytes.length; i++) {
            String hex = Integer.toHexString(0xFF & bytes[i]);
            if (hex.length() == 1) {
                hash.append('0');
            }
            hash.append(hex);
        }
        return hash.toString();
    }
}
