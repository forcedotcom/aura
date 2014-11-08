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

import java.net.MalformedURLException;
import java.net.URISyntaxException;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverUtil.BrowserType;

/**
 * this is an example for testing UI with PageObject pattern.
 * for more info about the PageObject 'idea': https://code.google.com/p/selenium/wiki/PageObjects
 */
public class SampleUIWithPageObjectTest extends PageObjectTestCase<SampleAuraPageObject> {

	public SampleUIWithPageObjectTest(SampleAuraPageObject page) {
		super(page);
	}
	
	public SampleUIWithPageObjectTest(String name) throws MalformedURLException, URISyntaxException {
		super(new SampleAuraPageObject(name, true, "uiExamples:buttonExample"));
		//TODO browserType&mode etc should belong to [test]Context, not Page Object.
		page().setCurrentBrowserType(this.getBrowserType());
		page().setDriver(this.currentDriver);
		page().setMode(getDefaultMode());
		page().setTimeoutInSecs(timeoutInSecs);
		page().setWaitForInit(true);
	}
	
	/**
	 * get the default mode 
	 * @return
	 */
	private static Mode getDefaultMode() {
		return Mode.SELENIUM;
	}
	
	/**
	 * get the mode without fast click, for IPAD and Android browsers
	 * @return
	 */
	@SuppressWarnings("unused")
	private Mode getModeWithoutFastClick() {
		return Mode.CADENCE;
	}
	
	public void _testButtunUIWithPageObject() throws Exception {
		//PageObject is in charge of load itself, clicking , typing , etc
		page().open();
        page().clickOnButton();
        String outputText = page().getOutputText();

        //Test case is in charge of assertion.
        //we didn't input anything into inputText, so it's undefined.
        assertEquals("get different text!","Hi, undefined",outputText);
    }
	
	//need at least one test per class or it complains
	public void testDummyPageObject() {
		return;
	}

}
