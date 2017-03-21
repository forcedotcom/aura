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
import org.junit.Test;
import org.openqa.selenium.By;

public class ModulesBootstrapUITest extends WebDriverTestCase {

    // private static final By BY_BUTTON_TOGGLE = By.cssSelector(".button-toggle");
    private static final By BY_BUTTON_SET1 = By.cssSelector(".button-set1");
    private static final By BY_BUTTON_SET2 = By.cssSelector(".button-set2");
    private static final By BY_BUTTON_SET3 = By.cssSelector(".button-set3");
    private static final By BY_A_RES1 = By.cssSelector(".a-res1");
    private static final By BY_A_RES2 = By.cssSelector(".a-res2");
    private static final By BY_A_RES3 = By.cssSelector(".a-res3");
    private static final By BY_A_EXPR = By.cssSelector(".a-expr");
    private static final By BY_M_LITERAL = By.cssSelector(".m-literal");
    private static final By BY_M_BOUND = By.cssSelector(".m-bound");
    private static final By BY_M_UNBOUND = By.cssSelector(".m-unbound");
    private static final By BY_M_EXPR = By.cssSelector(".m-expr");

    @Test
    public void testInterop() throws Exception {
        open("/moduletest/bootstrap.app");

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

        // TODO: "Toggle if ..." button fails with: Cannot read property 'replace' of undefined
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
