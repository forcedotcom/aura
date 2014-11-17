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

import org.auraframework.def.ComponentDef;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

//this is an example of AuraPageObject, it represents uiExamples:buttonExample, with a ui:button and ui:outputText
public class SampleAuraPageObject extends AuraPageObject<ComponentDef> {

    public SampleAuraPageObject(String name, Boolean isComponent, String descriptorString, SampleUIWithPageObjectTest sampleUIWithPageObjectTest) {
        super(name, isComponent, descriptorString, sampleUIWithPageObjectTest);
    }

    public void clickOnButton() {
        WebElement element = pageObjectTestCase.getDriver().findElement(By.cssSelector(".uiButton"));
        element.click();
    }
    
    public String getOutputText() {
        WebElement content = pageObjectTestCase.getDriver().findElement(By.cssSelector(".uiOutputText"));
        return content.getText();
	}
}
