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
package org.auraframework.impl;

import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

@ThreadHostileTest("Tests modify what namespaces are privileged or not")
public class AccessChecksUITest extends WebDriverTestCase {

    public AccessChecksUITest(String name) {
        super(name);
    }

    public void testGlobalComponentAccessibleFromUnprivilegedNamespace() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("componentTest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessGlobalComponent");
        clickCreateComponentButton();
        verifyComponentCreated("auratest:accessGlobalComponent");
    }

    /**
     * Cannot create a component with PUBLIC access from an unprivileged namespace.
     */
    public void testPublicComponentInaccessibleFromUnprivilegedNamespace() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("componentTest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessPublicComponent");
        clickCreateComponentButton();
        verifyComponentNotCreated();
    }

    /**
     * Cannot create a component with INTERNAL access from an unprivileged namespace.
     */
    public void testInternalComponentInaccessibleFromUnprivilegedNamespace() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("componentTest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessInternalComponent");
        clickCreateComponentButton();
        verifyComponentNotCreated();
    }

    /**
     * Component in a privileged namespace can extend a non-privileged namespace component marked PUBLIC
     */
    public void testPrivilegedComponentExtendsUnprivilegedComponent() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("auratest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=componentTest:accessExtendsPublic");
        clickCreateComponentButton();
        waitForElementTextContains(getDriver().findElement(By.className("output")), "componentTest:accessExtendsPublic");
    }

    /**
     * Component in a privileged namespace can _not_ extend a non-privileged namespace component marked PUBLIC
     */
    public void testUnprivilegedComponentExtendsPrivilegedComponent() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("componentTest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=componentTest:accessExtendsPublic");

        clickCreateComponentButton();

        // The component will be created successfully but empty so need to wait for the completed flag before asserting
        waitForElementTextPresent(
                getDriver().findElement(By.className("completed")), "true");
        WebElement output = getDriver().findElement(By.className("output"));
        assertEquals("", output.getText());
    }

    public void testAccessPublicMarkupOnPrivilegedNamespaceFromUnprivileged() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("componentTest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessPublicAttribute");
        doAttributeAccessTest("undefined");

    }

    public void testAccessPublicMarkupOnUnprivilegedNamespaceFromPrivileged() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("auratest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessPublicAttribute");
        doAttributeAccessTest("PUBLIC");
    }

    public void testAccessGlobalMarkupOnPrivilegedNamespaceFromUnprivileged() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("componentTest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessGlobalAttribute");
        doAttributeAccessTest("GLOBAL");

    }

    public void testAccessGlobalMarkupOnUnprivilegedNamespaceFromPrivileged() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("auratest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessGlobalAttribute");
        doAttributeAccessTest("GLOBAL");
    }

    public void testAccessPrivateMarkupOnPrivilegedNamespaceFromUnprivileged() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("componentTest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessPrivateAttribute");
        doAttributeAccessTest("undefined");

    }

    public void testAccessPrivateMarkupOnUnprivilegedNamespaceFromPrivileged() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("auratest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessPrivateAttribute");
        doAttributeAccessTest("undefined");
    }

    public void testAccessInternalMarkupOnPrivilegedNamespaceFromUnprivileged() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("componentTest");
        open("/componentTest/accessUnprivilegedNamespace.cmp?cmpToCreate=auratest:accessInternalAttribute");
        doAttributeAccessTest("undefined");
    }

    /**
     * Setting an attribute to have access level INTERNAL in a non-privileged namespace will error.
     */
    public void testAccessInternalMarkupOnUnprivilegedNamespace() throws Exception {
        getMockConfigAdapter().setUnprivilegedNamespace("auratest");
        openNoAura("/auratest/accessInternalAttribute.cmp");

        String errorMsg = "org.auraframework.throwable.quickfix.InvalidAccessValueException: Invalid access attribute value \"INTERNAL\"";
        waitForElementTextContains(
                getDriver().findElement(By.id("auraErrorMessage")), errorMsg);
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
        getDriver().findElement(By.className("testComponentAccess")).click();
    }

    private void verifyComponentCreated(String expected) {
        waitForElementTextPresent(getDriver().findElement(By.className("output")), expected);
    }

    private void verifyComponentNotCreated() {
        waitForElementTextPresent(getDriver().findElement(By.className("output")), "null");
    }
}
