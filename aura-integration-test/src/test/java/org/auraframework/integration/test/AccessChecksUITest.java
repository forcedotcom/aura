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

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

@ThreadHostileTest("Tests modify what namespaces are Internal or not and locker service enabled")
//I'm doing the AccessChecks with component tests now, this file will get removed soon
public class AccessChecksUITest extends WebDriverTestCase {

    @Override
    public void setUp() throws Exception {
        super.setUp();
        
        // TODO: remove when $A.createComponent is exposed in the locker
        getMockConfigAdapter().setLockerServiceEnabled(false);
    }

    @Test
    public void testGlobalComponentAccessibleFromExternalNamespace() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=auratest:accessGlobalComponent");
        clickCreateComponentButton();
        verifyComponentCreated("auratest:accessGlobalComponent", false);
    }

    /**
     * Cannot create a component with PUBLIC access from an External namespace.
     *
     * Note that since auratest:accessPublicComponent IS included as a dependency on accessExternalNamespace, this
     * will try to the component on the client and fail.
     */
    @Test
    public void testPublicComponentInaccessibleFromExternalNamespace() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=auratest:accessPublicComponent");
        clickCreateComponentButton();

        // Component create will fail on the client due to access checks so wait for error dialog to be displayed
        // and then assert no new component on page.
        getAuraUITestingUtil().waitForElementText(By.id("auraErrorMessage"), "Access Check Failed", true,
                "Didn't find ACF on page", false);
        assertEquals("No new component should be present", "null",
                getDriver().findElement(By.className("output")).getText());
    }

    /**
     * Cannot create a component with INTERNAL access from an External namespace.
     *
     * Note that since we did not include auratest:accessInternalComponent as a dependency on
     * accessExternalNamespace, this will attempt to get the component from the server.
     */
    @Test
    public void testInternalComponentInaccessibleFromExternalNamespace() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=auratest:accessInternalComponent");
        clickCreateComponentButton();
        verifyComponentNotCreated();
    }

    /**
     * Component in a Internal namespace can extend a non-Internal namespace component marked PUBLIC
     */
    @Test
    @Ignore("W-2769151: outlier, need to fix for setNonInternalNamespace")
    public void testInternalComponentExtendsExternalComponent() throws Exception {
        //getMockConfigAdapter().setNonInternalNamespace("auratest");
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=componentTest:accessExtendsPublic");
        clickCreateComponentButton();
        getAuraUITestingUtil().waitForElementText(By.className("output"),
                "componentTest:accessExtendsPublic", true, "missing component", false);
    }

    /**
     * Component in a External namespace can _not_ extend a Internal namespace component marked PUBLIC
     */
    @Test
    public void testExternalComponentExtendsInternalComponent() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=testCustomNS2:accessExtendsPublic");

        // Error dialog will be displayed, this is expected. Just verify inaccessible component isn't created.
        clickCreateComponentButton();
        verifyComponentNotCreated();
    }

    /**
     * External component cannot access public attribute of Internal namespace
     */
    @Test
    public void testAccessPublicMarkupOnInternalNamespaceFromExternal() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=auratest:accessPublicAttribute");
        doAttributeAccessTest("undefined");

    }

    @Test
    public void testAccessPublicMarkupOnExternalNamespaceFromInternal() throws Exception {
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=testCustomNS2:accessPublicAttribute");
        doAttributeAccessTest("PUBLIC");
    }

    @Test
    public void testAccessGlobalMarkupOnInternalNamespaceFromExternal() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=auratest:accessGlobalAttribute");
        doAttributeAccessTest("GLOBAL");
    }

    @Test
    public void testAccessGlobalMarkupOnExternalNamespaceFromInternal() throws Exception {
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=testCustomNS2:accessGlobalAttribute");
        doAttributeAccessTest("GLOBAL");
    }

    @Test
    public void testAccessGlobalMarkupOnExternalNamespaceFromExternal() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=testCustomNS2:accessGlobalAttribute");
        doAttributeAccessTest("GLOBAL");
    }

    @Test
    public void testAccessPrivateMarkupOnInternalNamespaceFromExternal() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=auratest:accessPrivateAttribute");
        doAttributeAccessTest("undefined");
    }

    @Test
    public void testAccessPrivateMarkupOnExternalNamespaceFromInternal() throws Exception {
        open("/componentTest/accessExternalNamespace.cmp?cmpToCreate=testCustomNS2:accessPrivateAttribute");
        doAttributeAccessTest("undefined");
    }

    @Test
    public void testAccessInternalMarkupOnInternalNamespaceFromExternal() throws Exception {
        open("/testCustomNS1/accessExternalNamespace.cmp?cmpToCreate=auratest:accessInternalAttribute");
        doAttributeAccessTest("undefined");
    }

    /**
     * Setting an attribute to have access level INTERNAL in a non-Internal namespace will error.
     */
    @Test
    public void testAccessInternalMarkupOnExternalNamespace() throws Exception {
        openNoAura("/testCustomNS1/accessInternalAttribute.cmp");

        String errorMsg = "org.auraframework.throwable.quickfix.InvalidAccessValueException: Invalid access attribute value \"INTERNAL\"";
        getAuraUITestingUtil().waitForElementText(By.id("auraErrorMessage"), errorMsg, true,
                "Didn't find expected error", false);
    }

    /**
     * An External component contains a global component in markup that provides an internal component. This is to
     * verify the internal component access is checked against the global providing component, not the top level
     * External component.
     */
    @Test
    public void testAccessGlobalProvidesInternalComponent() throws Exception {
        open("/testCustomNS1/accessGlobalProvidesInternal.cmp");
        getAuraUITestingUtil().waitForElementText(By.className("accessInternalComponent"),
                "auratest:accessInternalComponent", true, "Missing component", false);
    }

    @Test
    @Ignore("(W-2769151): Not sure if this should work, but if it shouldn't we need a better error message")
    public void testAccessExternalProvidesInternalComponent() throws Exception {
        //getMockConfigAdapter().setNonInternalNamespace("provider");
        open("/componentTest/accessGlobalProvidesInternal.cmp");
        getAuraUITestingUtil().waitForElementText(By.className("accessInternalComponent"),
                "auratest:accessInternalComponent", true, "Missing component", false);
    }

    @Test
    @Ignore("(W-2769151): Not sure if this should work, but if it shouldn't we need a better error message")
    public void testAccessExternalProvidesPublicComponent() throws Exception {
        //getMockConfigAdapter().setNonInternalNamespace("provider");
        open("/componentTest/accessGlobalProvidesPublic.cmp");
        getAuraUITestingUtil().waitForElementText(By.className("output"),
                "auratest:accessPublicComponent", true, "Missing component", false);
    }

    @Test
    @Ignore("(W-2769151): This case should work since the provided cmp is GLOBAL")
    public void testAccessExternalProvidesGlobalComponent() throws Exception {
        //getMockConfigAdapter().setNonInternalNamespace("provider");
        open("/componentTest/accessGlobalProvidesGlobal.cmp");
        getAuraUITestingUtil().waitForElementText(By.className("accessGlobalComponent"),
                "auratest:accessGlobalComponent", true, "Missing component", false);
    }

    @Test
    public void testAccessInternalProvidesPublicComponent() throws Exception {
        open("/componentTest/accessGlobalProvidesCustom.cmp");
        getAuraUITestingUtil().waitForElementText(By.className("output"),
                "testCustomNS1:accessPublicComponent", true, "Missing component", false);
    }

    private void doAttributeAccessTest(String expected) {
        clickCreateComponentButton();
        getAuraUITestingUtil().waitForElementText(By.className("completed"), "true", true);
        getDriver().findElement(By.className("getAttribute")).click();
        getAuraUITestingUtil().waitForElementText(By.className("attrValue"), expected, true);
    }

    private void clickCreateComponentButton() {
        getAuraUITestingUtil().waitForElement(By.className("testComponentAccess"));
        // Workaround for Webdriver tests run on Firefox. Calling WebElement.click() fails to click the button in some
        // situations but executing a javascript click like so seems to work.
        WebElement webElement = getDriver().findElement(By.className("testComponentAccess"));
        JavascriptExecutor executor = (JavascriptExecutor) getDriver();
        executor.executeScript("arguments[0].click();", webElement);
    }

    private void verifyComponentCreated(String expected, boolean exactMatch) {
        if(exactMatch == true) {
            getAuraUITestingUtil().waitForElementText(By.className("output"), expected, true);
        } else {
            getAuraUITestingUtil().waitForElementText(By.className("output"),
                    expected, true, "Missing text", false);
        }
        
    }

    private void verifyComponentNotCreated() {
        getAuraUITestingUtil().waitForElementText(By.className("output"), "null", true, "Expected 'null' to be outputted "
                + "to indicate component could not be created due to access check violations");
    }
}
