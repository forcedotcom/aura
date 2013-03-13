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
package org.auraframework.impl.appCache;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.annotation.FreshBrowserInstance;
import org.auraframework.test.annotation.ThreadHostileTest;

import org.junit.Ignore;
import org.openqa.selenium.By;

/**
 * UI automation for AppCache implementation. ThreadHostile because simultaneous
 * loads of the testApp will interfere with progress bar loading.
 * 
 * @userStory a07B0000000LyOe
 * @since 0.0.224
 */
@ThreadHostileTest
@TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET })
public class AppCacheProgressBarUITest extends WebDriverTestCase {
    private final String PROGRESSEVENTSCRIPT = "var evt = new ProgressEvent('%s', {%s});"
            + "window.applicationCache.dispatchEvent(evt);";
    private final String APPCACHEPROGRESS = String.format(PROGRESSEVENTSCRIPT, "progress", "loaded:%s, total:%s");
    private final String APPCACHENOUPDATE = String.format(PROGRESSEVENTSCRIPT, "noupdate", "");
    private final String APPCACHECACHED = String.format(PROGRESSEVENTSCRIPT, "cached", "");

    private final By appCacheProgressDiv = By.cssSelector("div[id='auraAppcacheProgress']");

    public AppCacheProgressBarUITest(String name) {
        super(name);
    }

    /**
     * Verify that progress bar is visible.
     * 
     * @throws Exception
     * 
     *             TODO: this should pass in iBrowsers since no javascript
     *             called, but looks like the progress bar loads/disappears too
     *             fast for test to pick it up. Passes locally if you clear
     *             cache in Safari first. It will probably no longer pass even
     *             locally if you have already loaded testApp.app.
     */
    @FreshBrowserInstance
    @Ignore("W-1570969")
    @ExcludeBrowsers({ BrowserType.SAFARI, BrowserType.IPAD, BrowserType.IPHONE })
    public void testProgressBar() throws Exception {
        open("/appCache/testApp.app", Mode.SELENIUM, false);
        assertTrue("Progress bar for appCache did not show up.", findDomElement(appCacheProgressDiv).isDisplayed());
        waitForAuraInit();
        waitForElementAbsent("Progress bar for appCache is visible even after aura is ready.",
                findDomElement(appCacheProgressDiv));
    }

    /**
     * Verify that progress bar shows true progress by simulating the progress
     * event.
     * 
     * @throws Exception
     */
    public void testProgressBarBySimulatingProgressEvents() throws Exception {
        open("/appCache/testApp.app", Mode.DEV);
        waitForElementAbsent("Progress bar for appCache is visible even after aura is ready.",
                findDomElement(appCacheProgressDiv));

        // Step 1: Fire a progress event and verify that progress bar is visible
        auraUITestingUtil.getEval(String.format(APPCACHEPROGRESS, 1, 100));
        waitForElementPresent("Progress bar for appCache is not visible visible.", findDomElement(appCacheProgressDiv));

        // Step 2: 50% progress
        auraUITestingUtil.getEval(String.format(APPCACHEPROGRESS, 50, 100));
        waitForElementPresent("Progress bar for appCache is not visible visible.", findDomElement(appCacheProgressDiv));

        assertEquals("width: 50%;", findDomElement(By.cssSelector("div[class~='progressBar']")).getAttribute("style")
                .trim());

        // Step 3: Fire a cached event and verify that progress bar has
        // disappeared
        auraUITestingUtil.getEval(APPCACHECACHED);
        waitForElementAbsent("Progress bar for appCache is visible even after 'cached' event is fired.",
                findDomElement(appCacheProgressDiv));
    }

    /**
     * Verify that when a noupdate event is fired for appcache, the progress bar
     * doesn't show up.
     * 
     * @throws Exception
     */
    public void testNoUpdateBySimulatingEvents() throws Exception {
        open("/appCache/testApp.app", Mode.DEV);

        // Step 1: Force the progress bar to show up
        auraUITestingUtil.getEval(String.format(APPCACHEPROGRESS, 1, 100));
        waitForElementPresent("Progress bar for appCache is not visible visible.", findDomElement(appCacheProgressDiv));

        // Step 2: Fire noupdate event and make sure there is no progress bar
        auraUITestingUtil.getEval(APPCACHENOUPDATE);
        waitForElementAbsent("Progress bar for appCache is visible even after 'noupdate' event is fired.",
                findDomElement(appCacheProgressDiv));
    }

    /**
     * Verify that the progress bar doesn't show up in PROD mode.
     * 
     * @throws Exception
     */
    @FreshBrowserInstance
    public void testProgressbarNotVisibleInPRODMode() throws Exception {
        open("/appCache/testApp.app", Mode.PROD, false);
        assertFalse("Progress bar for appCache should not show up in PROD mode.", findDomElement(appCacheProgressDiv)
                .isDisplayed());
        // This time simulate the progress event and verify that the progress
        // bar does not show up.
        auraUITestingUtil.getEval(String.format(APPCACHEPROGRESS, 1, 100));
        assertFalse("Progress bar for appCache should not show up in PROD mode.", findDomElement(appCacheProgressDiv)
                .isDisplayed());
    }
}
