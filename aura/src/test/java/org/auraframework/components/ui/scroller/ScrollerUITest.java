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
package org.auraframework.components.ui.scroller;

import org.auraframework.test.*;
import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.touch.TouchActions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.uiautomation.ios.client.uiamodels.impl.augmenter.IOSDriverAugmenter;

/**
 * Test basic scroller
 */
@TargetBrowsers({BrowserType.IPHONE, BrowserType.IPAD})
public class ScrollerUITest extends WebDriverTestCase{

    private static final String SCROLLER_CMP = "/uitest/scroller_basic.cmp";
    private WebDriver driver;
    
    public ScrollerUITest(String name) {
        super(name);
    }
    
    public void testActionMenuForApp() throws Exception {
        open(SCROLLER_CMP);
        driver = this.getDriver();
        driver = IOSDriverAugmenter.getIOSDriver((RemoteWebDriver)driver);
        this.startFlick(0, -70, 1);
        this.startFlick(0, -70, 1);
        this.startFlick(0, -70, 1);
    }
    
    private void startFlick(int xOffset, int yOffset, int speed){
		//WebElement e = driver.findElement(By.id("scroller"));
		//Action flick = (new TouchActions(driver)).flick(e, xOffset, yOffset, speed).perform();
        //flick.perform();
		//new TouchActions(driver).flick(e, xOffset, yOffset, speed).perform();
		new TouchActions(driver).flick(xOffset, yOffset).build().perform();
	}
    
}
