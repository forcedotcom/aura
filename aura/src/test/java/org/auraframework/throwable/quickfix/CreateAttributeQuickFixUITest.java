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

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.BuilderService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Tests to verify that users can add missing attributes to components via QuickFixes through the browser.
 */
// Unadaptable since does not function properly when running from jars
@UnAdaptableTest
public class CreateAttributeQuickFixUITest extends WebDriverTestCase {
    private final QuickFixUITestUtil util = new QuickFixUITestUtil(this);
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
        util.deleteFiles(defDescriptor);
        super.tearDown();
    }

    public CreateAttributeQuickFixUITest(String name) {
        super(name);
    }

    /**
     * Verify QuickFix is displayed to user and attribute can be inserted into component.
     */
    public void testCreationQuickFix() throws Exception {
        open("/auratest/createAttributeQuickFix.cmp", Mode.DEV);
        verifyToolbarAndClickCreateButton();
        verifyDefaultNameType("foo", "String");
        util.clickFix(true, "TODO: auratest:createAttributeQuickFix_child\nIn component createAttributeQuickFix");

        // check attribute created on component
        AttributeDef fooAttr = defDescriptor.getDef().getAttributeDef("foo");
        assertNotNull(fooAttr);
    }

    /**
     * Enter invalid attribute type and verify proper error message is displayed to user.
     */
    public void testInvalidAttributeType() throws Exception {
        open("/auratest/createAttributeQuickFix.cmp", Mode.DEV);
        verifyToolbarAndClickCreateButton();
        setAttributeNameType("foo", "myInvalidType");
        util.clickFix(false,
                "org.auraframework.throwable.AuraRuntimeException: java.lang.ClassNotFoundException: myInvalidType");

        // TODO(W-1506170): attribute still created when given invalid input
        // check attribute _not_ created
        // AttributeDef fooAttr = defDescriptor.getDef().getAttributeDef("foo");
        // assertNull(fooAttr);
    }

    /**
     * Leave name of attribute empty and verify that proper error message is displayed.
     */
    public void testEmptyNameType() throws Exception {
        open("/auratest/createAttributeQuickFix.cmp", Mode.DEV);
        verifyToolbarAndClickCreateButton();
        setAttributeNameType("", "String");
        util.clickFix(false, "QualifiedName is required for descriptors");

        // TODO(W-1506170): attribute still created when given invalid input
        // check attribute _not_ created
        // AttributeDef fooAttr = defDescriptor.getDef().getAttributeDef("foo");
        // assertNull(fooAttr);
    }

    private void verifyDefaultNameType(String name, String type) {
        By nameCssPath = By.cssSelector("input[name='attName']");
        By typeCssPath = By.cssSelector("input[name='type']");

        // Verify attribute name
        WebElement nameTextBox = getDriver().findElement(nameCssPath);
        assertEquals("Default attribute name incorrect", name, nameTextBox.getAttribute("value"));

        // Set attribute type
        WebElement typeTextBox = getDriver().findElement(typeCssPath);
        assertEquals("Default attribute type incorrect", type, typeTextBox.getAttribute("value"));
    }

    private void setAttributeNameType(String name, String type) {
        By nameCssPath = By.cssSelector("input[name='attName']");
        WebElement nameTextBox = getDriver().findElement(nameCssPath);
        nameTextBox.click();
        nameTextBox.clear();
        nameTextBox.sendKeys(name);

        By typeCssPath = By.cssSelector("input[name='type']");
        WebElement typeTextBox = getDriver().findElement(typeCssPath);
        typeTextBox.click();
        typeTextBox.clear();
        typeTextBox.sendKeys(type);
    }

    /**
     * Verify message displayed in QuickFix toolbar at top of the screen and click the create attribute button.
     */
    private void verifyToolbarAndClickCreateButton() {
        util.verifyToolbarText("The attribute \"foo\" was "
                + "not found on the COMPONENT markup://auratest:createAttributeQuickFix_child");
        util.clickCreateButton("Create Attribute");
    }
}
