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
package org.auraframework.integration.test.http;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;

public class WebDriverFilter extends CookieFilter {
	/**
	 * Make sure driver is already at the target domain since a Cookie will be
	 * set for tracking.
	 * 
	 * @param driver
	 */
	public WebDriverFilter(WebDriver driver) {
		super(((RemoteWebDriver) driver).getSessionId().toString());
		driver.manage().addCookie(new Cookie(getCookieName(), "$A"));
	}
}
