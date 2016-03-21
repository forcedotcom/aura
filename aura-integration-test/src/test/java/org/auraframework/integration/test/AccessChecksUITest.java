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
package org.auraframework.integration.test;

import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

@ThreadHostileTest("Tests modify what namespaces are Internal or not")
public class AccessChecksUITest extends WebDriverTestCase {

    public AccessChecksUITest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        // TODO: remove when $A.createComponent is exposed in the locker
        getMockConfigAdapter().setLockerServiceEnabled(false);
    }

    public void testGlobalComponentAccessibleFromExternalNamespace() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessGlobalComponent");
        clickCreateComponentButton();
        verifyComponentCreated("auratest:accessGlobalComponent");
    }

    /**
     * Cannot create a component with PUBLIC access from an External namespace.
     *
     * Note that since auratest:accessPublicComponent IS included as a dependency on accessExternalNamespace, this
     * will try to the component on the client and fail.
     */
    public void _testPublicComponentInaccessibleFromExternalNamespace() throws Exception {
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessPublicComponent");
        clickCreateComponentButton();

        // Component create will fail on the client due to access checks so wait for error dialog to be displayed
        // and then assert no new component on page.
        waitForElementTextContains(
                getDriver().findElement(By.id("auraErrorMessage")), "Access Check Failed");
        assertEquals("No new component should be present", "null", getDriver().findElement(By.className("output"))
                .getText());
    }

    /**
     * Cannot create a component with INTERNAL access from an External namespace.
     *
     * Note that since we did not include auratest:accessInternalComponent as a dependency on
     * accessExternalNamespace, this will attempt to get the component from the server.
     */
    public void testInternalComponentInaccessibleFromExternalNamespace() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessInternalComponent");
        clickCreateComponentButton();
        verifyComponentNotCreated();
    }

    /**
     * Component in a Internal namespace can extend a non-Internal namespace component marked PUBLIC
     */
    public void testInternalComponentExtendsExternalComponent() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("auratest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=componentTest:accessExtendsPublic");
        clickCreateComponentButton();
        waitForElementTextContains(getDriver().findElement(By.className("output")),
                "componentTest:accessExtendsPublic");
    }

    /**
     * Component in a External namespace can _not_ extend a Internal namespace component marked PUBLIC
     */
    public void testExternalComponentExtendsInternalComponent() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=componentTest:accessExtendsPublic");

        // Error dialog will be displayed, this is expected. Just verify inaccessible component isn't created.
        clickCreateComponentButton();
        verifyComponentNotCreated();
    }

    /**
     * External component cannot access public attribute of Internal namespace
     */
    public void testAccessPublicMarkupOnInternalNamespaceFromExternal() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessPublicAttribute");
        doAttributeAccessTest("undefined");

    }

    public void testAccessPublicMarkupOnExternalNamespaceFromInternal() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("auratest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessPublicAttribute");
        doAttributeAccessTest("PUBLIC");
    }

    public void testAccessGlobalMarkupOnInternalNamespaceFromExternal() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessGlobalAttribute");
        doAttributeAccessTest("GLOBAL");
    }

    public void testAccessGlobalMarkupOnExternalNamespaceFromInternal() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("auratest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessGlobalAttribute");
        doAttributeAccessTest("GLOBAL");
    }

    public void testAccessGlobalMarkupOnExternalNamespaceFromExternal() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("auratest");
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessGlobalAttribute");
        doAttributeAccessTest("GLOBAL");
    }

    public void testAccessPrivateMarkupOnInternalNamespaceFromExternal() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessPrivateAttribute");
        doAttributeAccessTest("undefined");
    }

    public void testAccessPrivateMarkupOnExternalNamespaceFromInternal() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("auratest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessPrivateAttribute");
        doAttributeAccessTest("undefined");
    }

    public void testAccessInternalMarkupOnInternalNamespaceFromExternal() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=auratest:accessInternalAttribute");
        doAttributeAccessTest("undefined");
    }

    /**
     * Setting an attribute to have access level INTERNAL in a non-Internal namespace will error.
     */
    public void testAccessInternalMarkupOnExternalNamespace() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("auratest");
        openNoAura("/auratest/accessInternalAttribute.cmp");

        String errorMsg = "org.auraframework.throwable.quickfix.InvalidAccessValueException: Invalid access attribute value \"INTERNAL\"";
        waitForElementTextContains(
                getDriver().findElement(By.id("auraErrorMessage")), errorMsg);
    }

    /**
     * An External component contains a global component in markup that provides an internal component. This is to
     * verify the internal component access is checked against the global providing component, not the top level
     * External component.
     */
    public void testAccessGlobalProvidesInternalComponent() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("componentTest");
        open("/componentTest/accessGlobalProvidesInternal.cmp");
        waitForElementTextContains(
                getDriver().findElement(By.className("accessInternalComponent")), "auratest:accessInternalComponent");
    }

    // TODO(W-2769151): Not sure if this should work, but if it shouldn't we need a better error message
    public void _testAccessExternalProvidesInternalComponent() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("provider");
        open("/componentTest/accessGlobalProvidesInternal.cmp");
        waitForElementTextContains(
                getDriver().findElement(By.className("accessInternalComponent")), "auratest:accessInternalComponent");
    }

    // TODO(W-2769151): Not sure if this should work, but if it shouldn't we need a better error message
    public void _testAccessExternalProvidesPublicComponent() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("provider");
        open("/componentTest/accessGlobalProvidesPublic.cmp");
        waitForElementTextContains(
                getDriver().findElement(By.className("output")), "auratest:accessPublicComponent");
    }

    // TODO(W-2769151): This case should work since the provided cmp is GLOBAL
    public void _testAccessExternalProvidesGlobalComponent() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("provider");
        open("/componentTest/accessGlobalProvidesGlobal.cmp");
        waitForElementTextContains(
                getDriver().findElement(By.className("accessGlobalComponent")), "auratest:accessGlobalComponent");
    }

    public void testAccessInternalProvidesPublicComponent() throws Exception {
        getMockConfigAdapter().setNonInternalNamespace("auratest");
        open("/componentTest/accessGlobalProvidesPublic.cmp");
        waitForElementTextContains(
                getDriver().findElement(By.className("output")), "auratest:accessPublicComponent");
    }

    private void doAttributeAccessTest(String expected) {
        clickCreateComponentButton();
        waitForElementTextPresent(
                getDriver().findElement(By.className("completed")), "true");
        getDriver().findElement(By.className("getAttribute")).click();
        waitForElementTextPresent(
                getDriver().findElement(By.className("attrValue")), expected);
    }

    private void clickCreateComponentButton() {
        waitForElementAppear(By.className("testComponentAccess"));
        // Workaround for Webdriver tests run on Firefox. Calling WebElement.click() fails to click the button in some
        // situations but executing a javascript click like so seems to work.
        WebElement webElement = getDriver().findElement(By.className("testComponentAccess"));
        JavascriptExecutor executor = (JavascriptExecutor) getDriver();
        executor.executeScript("arguments[0].click();", webElement);
    }

    private void verifyComponentCreated(String expected) {
        waitForElementTextPresent(getDriver().findElement(By.className("output")), expected);
    }

    private void verifyComponentNotCreated() {
        getAuraUITestingUtil().waitForElementText(By.className("output"), "null", true, "Expected 'null' to be outputted "
                + "to indicate component could not be created due to access check violations");
    }
}
