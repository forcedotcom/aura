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
package org.auraframework.integration.test.modules.ui;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;

/**
 * Runs the /moduleTest/bootstrap.app app to verify module and aura/module interoperability works.
 */
public class ModulesBootstrapUITest extends WebDriverTestCase {

    private static final By BY_BUTTON_TOGGLE = By.cssSelector(".button-toggle");
    private static final By BY_BUTTON_SET1 = By.cssSelector(".button-set1");
    private static final By BY_BUTTON_SET2 = By.cssSelector(".button-set2");
    private static final By BY_BUTTON_SET3 = By.cssSelector(".button-set3");
    private static final By BY_A_RES1 = By.cssSelector(".a-res1");
    private static final By BY_A_RES2 = By.cssSelector(".a-res2");
    private static final By BY_A_RES3 = By.cssSelector(".a-res3");
    private static final By BY_A_EXPR = By.cssSelector(".a-expr");
    private static final By BY_M_LITERAL = By.cssSelector(".simple .m-literal");
    private static final By BY_M_BOUND = By.cssSelector(".m-bound");
    private static final By BY_M_UNBOUND = By.cssSelector(".m-unbound");
    private static final By BY_M_EXPR = By.cssSelector(".m-expr");
    protected String BOOTSTRAP_APP_URL = "/moduleTest/bootstrap.app";

    @Flapper
    @Test
    @TargetBrowsers({BrowserType.GOOGLECHROME}) // non-compat will fail in unsupported browsers
    public void testInteropProd() throws Exception {
        open(BOOTSTRAP_APP_URL, Mode.PROD);
        doInteropTest();
    }

    @Flapper
    @Test
    @TargetBrowsers({BrowserType.IE11}) // IE11 is the main place we care about compat
    public void testInteropCompatProd() throws Exception {
        open(BOOTSTRAP_APP_URL, Mode.PROD);
        doInteropTest();
    }

    @Flapper
    @Test
    @TargetBrowsers({BrowserType.GOOGLECHROME}) // non-compat will fail in unsupported browsers
    public void testInteropMinified() throws Exception {
        open(BOOTSTRAP_APP_URL + "?aura.compat=0", Mode.SELENIUM);
        doInteropTest();
    }

    @Flapper
    @Test
    public void testInteropMinifiedCompat() throws Exception {
        open(BOOTSTRAP_APP_URL + "?aura.compat=1", Mode.SELENIUM);
        doInteropTest();
    }

    @Flapper
    @Test
    @TargetBrowsers({BrowserType.GOOGLECHROME}) // non-compat will fail in unsupported browsers
    public void testInteropDev() throws Exception {
        open(BOOTSTRAP_APP_URL + "?aura.compat=0", Mode.DEV);
        doInteropTest();
    }

    @Flapper
    @Test
    public void testInteropDevCompat() throws Exception {
        open(BOOTSTRAP_APP_URL + "?aura.compat=1", Mode.DEV);
        doInteropTest();
    }

    private void doInteropTest() {
        // check initial state
        assertEquals("I'm modules!", findDomElement(By.cssSelector(".i-am-modules")).getText());
        assertState(
                "I'm v.test",
                "I'm v.test2",
                "I'm v.test3",
                "I'm v.test3!!",
                "Literal: Hi!",
                "Bound: I'm v.test",
                "Unbound: I'm v.test2",
                "Expression: I'm v.test3!!");

        // press "Set v.test"
        findDomElement(BY_BUTTON_SET1).click();
        assertState(
                "v.test | 1",
                "I'm v.test2",
                "I'm v.test3",
                "I'm v.test3!!",
                "Literal: Hi!",
                "Bound: v.test | 1",
                "Unbound: I'm v.test2",
                "Expression: I'm v.test3!!");

        // press "Set v.test2"
        findDomElement(BY_BUTTON_SET2).click();
        assertState(
                "v.test | 1",
                "v.test2 | 2",
                "I'm v.test3",
                "I'm v.test3!!",
                "Literal: Hi!",
                "Bound: v.test | 1",
                "Unbound: I'm v.test2",
                "Expression: I'm v.test3!!");

        // press "Set v.test3"
        findDomElement(BY_BUTTON_SET3).click();
        assertState(
                "v.test | 1",
                "v.test2 | 2",
                "v.test3 | 3",
                "v.test3 | 3!!",
                "Literal: Hi!",
                "Bound: v.test | 1",
                "Unbound: I'm v.test2",
                "Expression: v.test3 | 3!!");

        // toogle aura:if to hide/show component
        findDomElement(BY_BUTTON_TOGGLE).click();
        waitForCondition("return $A.getRoot().find('simple') === undefined");
        findDomElement(BY_BUTTON_TOGGLE).click();
        waitForCondition("return $A.getRoot().find('simple') !== undefined");

        // iteration should display multiple module components
        assertTrue(findDomElements(By.cssSelector(".modules-container")).size() > 1);
    }
    
    private void assertState(String aRes1, String aRes2, String aRes3, String aExpr, String mLiteral, String mBound,
            String mUnbound, String mExpr) {
        assertEquals(aRes1, findDomElement(BY_A_RES1).getText());
        assertEquals(aRes2, findDomElement(BY_A_RES2).getText());
        assertEquals(aRes3, findDomElement(BY_A_RES3).getText());
        assertEquals(aExpr, findDomElement(BY_A_EXPR).getText());
        assertEquals(mLiteral, findDomElement(BY_M_LITERAL).getText());
        assertEquals(mBound, findDomElement(BY_M_BOUND).getText());
        assertEquals(mUnbound, findDomElement(BY_M_UNBOUND).getText());
        assertEquals(mExpr, findDomElement(BY_M_EXPR).getText());
    }
}
