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
package org.auraframework.throwable.quickfix;

import java.io.File;

import org.auraframework.system.SourceListener;

import junit.framework.Assert;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.Source;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Utility class for browser QuickFixes. Logic here should be common to all QuickFixes.
 */
public class QuickFixUITestUtil {
    private final WebDriverTestCase testCase;

    QuickFixUITestUtil(WebDriverTestCase testCase) {
        this.testCase = testCase;
    }

    /**
     * Given the buttons localId (aura:id on component), execute javascript on the browser to use COQL to find it's
     * globalId and then invoke the ui:button's press event. Using this method instead of WebDriver's click() method for
     * browser compatibility reasons.
     * 
     * Note that this method is similar to AuraUITestingUtil's findGlobalIdForComponentWithGivenProperties() and
     * getEval() methods, but these tests must be run in DEV mode where $A.test is not supported.
     */
    public void clickButtonByLocalId(String localId) {
        JavascriptExecutor jsExecutor = (JavascriptExecutor) testCase.getDriver();
        String query = "var cmp = $A.getQueryStatement().from('component').field('globalId').field('localId')"
                + ".where(\"localId === '" + localId + "'\").query();return cmp.rows[0].globalId";
        String globalId = jsExecutor.executeScript(query).toString();
        jsExecutor.executeScript("$A.getCmp(\"" + globalId + "\").get('e.press').fire()");
    }

    /**
     * Click the 'Fix!' button and verify text displayed in browser either from newly loaded component, or any error
     * message that is displayed on failure.
     */
    public void clickFix(boolean expectedSuccess, String text) {
        clickButtonByLocalId("fixButton");
        if (expectedSuccess) {
            // Newly created component should be loaded with it's contents displayed to the user
            waitForFixToProcess("Text from newly created component never displayed", By.tagName("body"), text);
        } else {
            // Expecting error message to pop up
            waitForFixToProcess("Quickfix error text never displayed", By.xpath("//div[@id='auraErrorMessage']"), text);
        }
    }

    /**
     * Wait for the browser to refresh and display the given text, or timeout with error.
     */
    private void waitForFixToProcess(String msg, final By elementSelector, final String text) {
        WebDriverWait wait = new WebDriverWait(testCase.getDriver(), 30);
        // Expect StaleElementReferenceException if browser hasn't displayed new text yet, so ignore until timeout
        wait.withMessage(msg).ignoring(StaleElementReferenceException.class).until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                String elementText = testCase.getDriver().findElement(elementSelector).getText();
                return elementText.contains(text);
            }
        });
    }

    /**
     * Verify text at top of QuickFix screen which describes the error.
     */
    public void verifyToolbarText(String text) {
        By toolbarXpath = By.xpath("//div[@class='toolbar']");
        String toolbarText = testCase.getDriver().findElement(toolbarXpath).getText();
        Assert.assertTrue("Incorrect message displayed on quickfix toolbar. Expected: " + text + ". But got: "
                + toolbarText, toolbarText.contains(text));
    }

    public void clickCreateButton(String text) {
        By buttonXpath = By.xpath("//button/span[text()='" + text + "']");
        Assert.assertTrue("Create Attribute QuickFix button not present", testCase.isElementPresent(buttonXpath));
        clickButtonByLocalId("createButton");
    }

    /**
     * Delete all files in component bundle, and then directory file itself.
     */
    public void deleteFiles(DefDescriptor<?> defDescriptor) {
        Source<?> source = Aura.getContextService().getCurrentContext().getDefRegistry().getSource(defDescriptor);
        if (source != null) {
            File f = new File(source.getSystemId());
            if (f.exists()) {
                File dir = f.getParentFile();
                for (File x : dir.listFiles()) {
                    x.delete();
                }
                dir.delete();
            }
        }
        Aura.getDefinitionService().onSourceChanged(defDescriptor, SourceListener.SourceMonitorEvent.deleted);
    }
}
