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

import java.io.File;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.BuilderService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Source;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Tests to verify that users can add missing attributes to components via
 * QuickFixes through the browser.
 */
public class CreateAttributeQuickFixUITest extends WebDriverTestCase {
    private final DefDescriptor<ComponentDef> defDescriptor = Aura.getDefinitionService().getDefDescriptor(
            "auratest:createAttributeQuickFix_child", ComponentDef.class);

    @Override
    public void setUp() throws Exception {
        super.setUp();
        Aura.getContextService().startContext(Mode.SELENIUM, Format.JSON, Access.AUTHENTICATED);

        // Build component where the new attribute is created
        BuilderService builderService = Aura.getBuilderService();
        DefinitionService definitionService = Aura.getDefinitionService();
        ComponentDef def = builderService.getComponentDefBuilder().setDescriptor(defDescriptor).build();
        definitionService.save(def);
    }

    @Override
    public void tearDown() throws Exception {
        deleteFiles(defDescriptor);
        super.tearDown();
    }

    public CreateAttributeQuickFixUITest(String name) {
        super(name);
    }

    /**
     * Verify QuickFix is displayed to user and attribute can be inserted into
     * component.
     */
    public void testCreationQuickfix() throws Exception {
        open("/auratest/createAttributeQuickFix.cmp", Mode.DEV);
        verifyToolbarAndClickCreateButton();
        verifyDefaultNameType("foo", "String");
        String result = clickFix(true);
        assertTrue("Component not loaded in browser after attribute added via Quickfix",
                result.contains("In component createAttributeQuickFix"));

        // check attribute created on component
        AttributeDef fooAttr = defDescriptor.getDef().getAttributeDef("foo");
        assertNotNull(fooAttr);
    }

    /**
     * Enter invalid attribute type and verify proper error message is displayed
     * to user.
     */
    public void testInvalidAttributeType() throws Exception {
        open("/auratest/createAttributeQuickFix.cmp", Mode.DEV);
        verifyToolbarAndClickCreateButton();
        setAttributeNameType("foo", "myInvalidType");
        String result = clickFix(false);
        assertTrue("Incorrect error message displayed to user.", result.contains("org.auraframework.throwable."
                + "AuraRuntimeException: java.lang.ClassNotFoundException: myInvalidType"));

        // TODO(W-1506170): attribute still created when given invalid input
        // check attribute _not_ created
        // AttributeDef fooAttr = defDescriptor.getDef().getAttributeDef("foo");
        // assertNull(fooAttr);
    }

    /**
     * Leave name of attribute empty and verify that proper error message is
     * displayed.
     */
    public void testEmptyNameType() throws Exception {
        open("/auratest/createAttributeQuickFix.cmp", Mode.DEV);
        verifyToolbarAndClickCreateButton();
        setAttributeNameType("", "String");
        String result = clickFix(false);
        assertTrue("Incorrect error message displayed to user.",
                result.contains("QualifiedName is required for descriptors"));

        // TODO(W-1506170): attribute still created when given invalid input
        // check attribute _not_ created
        // AttributeDef fooAttr = defDescriptor.getDef().getAttributeDef("foo");
        // assertNull(fooAttr);
    }

    private void verifyDefaultNameType(String name, String type) {
        By nameXpath = By.xpath("//input[@name='attName']");
        By typeXpath = By.xpath("//input[@name='type']");

        // Verify attribute name
        WebElement nameTextBox = getDriver().findElement(nameXpath);
        assertEquals("Default attribute name incorrect", name, nameTextBox.getAttribute("value"));

        // Set attribute type
        WebElement typeTextBox = getDriver().findElement(typeXpath);
        assertEquals("Default attribute type incorrect", type, typeTextBox.getAttribute("value"));
    }

    private void setAttributeNameType(String name, String type) {
        By nameXpath = By.xpath("//input[@name='attName']");
        WebElement nameTextBox = getDriver().findElement(nameXpath);
        nameTextBox.clear();
        nameTextBox.sendKeys(name);

        By typeXpath = By.xpath("//input[@name='type']");
        WebElement typeTextBox = getDriver().findElement(typeXpath);
        typeTextBox.clear();
        typeTextBox.sendKeys(type);
    }

    /**
     * Verify message displayed in Quickfix toolbar at top of the screen and
     * click the create attribute button.
     */
    private void verifyToolbarAndClickCreateButton() {
        By toolbarXpath = By.xpath("//div[@class='toolbar']");
        String toolbarText = getDriver().findElement(toolbarXpath).getText();
        assertTrue("Incorrect message displayed on quickfix toolbar", toolbarText.contains("The attribute \"foo\" was "
                + "not found on the COMPONENT markup://auratest:createAttributeQuickFix_child"));

        By buttonXpath = By.xpath("//button[text()='Create Attribute']");
        assertTrue("Create Attribute Quickfix button not present", isElementPresent(buttonXpath));
        WebElement button = getDriver().findElement(buttonXpath);
        button.click();
    }

    /**
     * Click the 'Fix!' button and return text displayed in browser either from
     * newly loaded component, or any error message that is displayed on
     * failure.
     */
    private String clickFix(boolean expectedSuccess) {
        By fixButton = By.xpath("//img[@alt='Fix!']");
        WebElement button = getDriver().findElement(fixButton);
        button.click();
        waitFor(3);
        if (expectedSuccess) {
            return getDriver().findElement(By.tagName("body")).getText();
        } else {
            return getDriver().findElement(By.xpath("//div[@id='auraErrorMessage']")).getText();
        }
    }

    /**
     * Delete all files in component bundle, and then directory file itself.
     */
    private void deleteFiles(DefDescriptor<?> defDescriptor) {
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
    }
}
