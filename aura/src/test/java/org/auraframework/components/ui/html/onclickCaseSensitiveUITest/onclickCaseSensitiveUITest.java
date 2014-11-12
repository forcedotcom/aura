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
package org.auraframework.components.ui.html.onclickCaseSensitiveUITest;

import java.net.MalformedURLException;
import java.net.URISyntaxException;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.util.AuraTextUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

@TargetBrowsers({ BrowserType.GOOGLECHROME, BrowserType.FIREFOX })
public class onclickCaseSensitiveUITest extends WebDriverTestCase {

    public static final String TEST_APP = "/uitest/html_onclickCaseSensitive.cmp";
    private final String onclickAnchor = ".onclickHandler";	
	private final String onClickAnchor = ".onClickHandler";	
	private final String onclickOutput = ".onclickOutput";	
	private final String onClickOutput = ".onClickOuput";	
    
    public onclickCaseSensitiveUITest(String name) {
        super(name);
    }

    /**
     * Test to verify onClick is CaseSensitive
     * Bug: W-2404809
     * @throws MalformedURLException
     * @throws URISyntaxException
     */
    public void testOnClickIsCaseSensitive() throws MalformedURLException, URISyntaxException {
		open(TEST_APP);
		WebElement onclickElement = findDomElement(By.cssSelector(onclickAnchor));
		WebElement onclickOutputText = findDomElement(By.cssSelector(onclickOutput));
		WebElement onClickOutputText = findDomElement(By.cssSelector(onClickOutput));
		WebElement onClickElement = findDomElement(By.cssSelector(onClickAnchor));
		assertTrue("onclick Event should not be fired when cmp is loaded", AuraTextUtil.isEmptyOrWhitespace(onclickOutputText.getText()));
		assertTrue("onClick Event should not be fired when cmp is loaded", AuraTextUtil.isEmptyOrWhitespace(onClickOutputText.getText()));
		onclickElement.click();
		assertFalse("onclick Event should not be fired when cmp is loaded", AuraTextUtil.isEmptyOrWhitespace(onclickOutputText.getText()));
		//this action should not be fired as onClick is case sensitive 
		onClickElement.click();
		assertTrue("onClick Event should not be fired as onClick is case Sensitive", AuraTextUtil.isEmptyOrWhitespace(onClickOutputText.getText()));
    }
}
    