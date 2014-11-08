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
package org.auraframework.test.page;

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.WebDriver;

public abstract class PageObjectTestCase<T extends PageObject> extends WebDriverTestCase {

	private final T page;
	
	public PageObjectTestCase(T page) {
		super(page.getName());
		this.page = page;
	}
	
	@Override
	protected void setCurrentDriver(WebDriver currentDriver) {
		super.setCurrentDriver(currentDriver);
		page.setDriver(currentDriver);
		page.setAuraTestingUtil(getAuraTestingUtil());
	}
	
	@Override
	protected void setAuraUITestingUtil() {
		super.setAuraUITestingUtil();
		page.setAuraUITestingUtil(auraUITestingUtil);
	}

	public T page() {
		return page;
	}
	
}
