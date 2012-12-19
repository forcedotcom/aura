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
package org.auraframework.throwable.quickfix;

import junit.framework.Assert;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Widget class for QuickFix testing.
 *
 *
 * @since 0.0.171
 */
public class QuickFixUIWidget {
    private BaseComponentQuickFixUtil util;
    WebDriverTestCase testCase;
    public QuickFixUIWidget(DefType type, WebDriverTestCase testCase){
        switch(type){
            case APPLICATION:
                util = new ApplicationQuickFixUtil(testCase);
                break;
            case COMPONENT:
                util = new ComponentQuickFixUtil(testCase);
                break;
            default:
                throw new UnsupportedOperationException("The specified defType is not supported by the test framework:"+type.name());
        }
        this.testCase = testCase;
    }
    /**
     * Verify the menu button on QuickFix screen
     */
    public void verifyQuickFixButtons(){
        util.verifyQuickFixButtons();
    }
    /**
     * Verify that clicking create button takes you to customization screen.
     * Also verify the customization options available
     */
    public void clickCreate() {
        util.clickCreateAndNavigateToCustomization();

    }
    /**
     * Click on fix button and verify what happens.
     */
    public String clickFix(Boolean expectedSuccess) throws Exception{
        return util.clickFix(expectedSuccess);
    }

    private abstract class BaseComponentQuickFixUtil{
        WebDriverTestCase testCase;
        protected By createButton;
        BaseComponentQuickFixUtil(WebDriverTestCase testCase){
            this.testCase = testCase;
        }
        /**
         * Verify what happens when fix button is clicked.
         * In case of success it returns the body text else it returns the information provided by alert.
         * @param expectedSuccess
         */
        public String clickFix(Boolean expectedSuccess) throws Exception{
            By fixButton = By.xpath("//img[@alt='Fix!']");
            WebElement button = testCase.getDriver().findElement(fixButton);
            button.click();
            testCase.waitFor(3);
            if(expectedSuccess){
                return testCase.getDriver().findElement(By.tagName("body")).getText();
            }else{
                Alert alert = testCase.getDriver().switchTo().alert();
                return alert.getText();
            }
        }

        /**
         * Verify the buttons you expect to see on the WuickFix screen.
         */
        public void verifyQuickFixButtons(){
            Assert.assertTrue("Could not locate the create button or the label on button is invalid.",
                    testCase.isElementPresent(createButton));
        }
        /**
         * Choose the option to create a component/application and verify the detail in the customization screen.
         */
        public void clickCreateAndNavigateToCustomization(){
            WebElement button = testCase.getDriver().findElement(createButton);
            button.click();
            verifyCustomizationMenu();
        }
        /**
         * What other parts of a Component/Application do you want to create?
         * Verify that menu.
         */
        public void verifyCustomizationMenu(){
            //No support for controller yet
            By jsController = By.xpath("//input[@name='client.controller' and @type='checkbox' and @disabled='disabled']");
            Assert.assertTrue("Could not locate checkbox to create JS controller file.",
                    testCase.isElementPresent(jsController));

            //No support for renderer yet
            By jsRenderer = By.xpath("//input[@name='client.renderer' and @type='checkbox' and @disabled='disabled']");
            Assert.assertTrue("Could not locate checkbox to create JS renderer file.",
                    testCase.isElementPresent(jsRenderer));

            By css = By.xpath("//input[@name='client.css' and @type='checkbox']");
            Assert.assertTrue("Could not locate checkbox to create css theme file.",
                    testCase.isElementPresent(css));

            //No support for controller yet
            By javaController = By.xpath("//input[@name='java.controller' and @type='checkbox' and @disabled='disabled']");
            Assert.assertTrue("Could not locate checkbox to create java controller file.",
                    testCase.isElementPresent(javaController));

            //No support for renderer yet
            By javaRenderer = By.xpath("//input[@name='java.renderer' and @type='checkbox' and @disabled='disabled']");
            Assert.assertTrue("Could not locate checkbox to create java renderer file.",
                    testCase.isElementPresent(javaRenderer));
        }
    }

    private class ComponentQuickFixUtil extends BaseComponentQuickFixUtil{
        ComponentQuickFixUtil(WebDriverTestCase test){
            super(test);
            createButton = By.xpath("//button[text()='Create Component Definition']");
        }

        @Override
        public void verifyCustomizationMenu() {
            super.verifyCustomizationMenu();
            By app = By.xpath("//input[@name='client.cmp' and @type='checkbox']");
            Assert.assertTrue("Could not locate checkbox to create component markup file.",
                    testCase.isElementPresent(app));
            //No support for provider yet
            By jsProvider = By.xpath("//input[@name='client.provider' and @type='checkbox' and @disabled='disabled']");
            Assert.assertTrue("Could not locate checkbox to create JS provider file.",
                    testCase.isElementPresent(jsProvider));
            //No support for provider yet
            By javaProvider = By.xpath("//input[@name='java.provider' and @type='checkbox' and @disabled='disabled']");
            Assert.assertTrue("Could not locate checkbox to create java provider file.",
                    testCase.isElementPresent(javaProvider));
        }
    }
    private class ApplicationQuickFixUtil extends BaseComponentQuickFixUtil{
        ApplicationQuickFixUtil(WebDriverTestCase test){
            super(test);
            createButton = By.xpath("//button[text()='Create Application Definition']");
        }

        @Override
        public void verifyCustomizationMenu() {
            super.verifyCustomizationMenu();
            By app = By.xpath("//input[@name='client.app' and @type='checkbox']");
            Assert.assertTrue("Could not locate checkbox to create application markup file.",
                    testCase.isElementPresent(app));
        }
    }

}
