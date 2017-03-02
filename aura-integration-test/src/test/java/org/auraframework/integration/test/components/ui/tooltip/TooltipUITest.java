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
package org.auraframework.integration.test.components.ui.tooltip;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

@ExcludeBrowsers({ BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPHONE, BrowserType.IPAD, BrowserType.IE7, BrowserType.IE8})
public class TooltipUITest extends WebDriverTestCase {
	private final String URL_FULL_CMP = "/uitest/tooltip_FullTest.cmp";

	/**
	 * If tooltip is triggered by click then it should open and close by
	 * pressing enter on keyboard
	 */
    @Test
    @Ignore
	public void testToolTipOpenAndCloseWithEnterKey() throws Exception {
		open(URL_FULL_CMP);

		WebElement trigger = findDomElement(By.cssSelector(".triggerClick"));

		// click on element to gain focus and verify tooltip opens
		trigger.click();
		waitForToolTipPresent();
		turnOffToggleGuard();

		// close by sending enter key
		getAuraUITestingUtil().pressEnter(trigger);
		waitForToolTipAbsent();
		turnOffToggleGuard();

		// open by sending enter key
		getAuraUITestingUtil().pressEnter(trigger);
		waitForToolTipPresent();
	}
	
	private void turnOffToggleGuard() {
	    // turn off toggleGuard so we can toggle it immediately without waiting
        getAuraUITestingUtil().getEval("$A.getRoot().find('triggerclick')._toggleGuard = false;");
	}

	private void waitForToolTipPresent() {
	    getAuraUITestingUtil().waitForElement("Tooltip should be present but is not", By.cssSelector(".uiTooltipAdvanced.visible"));
	}

	private void waitForToolTipAbsent() {
	    getAuraUITestingUtil().waitForElementNotPresent("Tooltip should not be present but is", By.cssSelector(".uiTooltipAdvanced.visible"));
	}
}

