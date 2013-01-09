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

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;

/**
 * This class has tests to verify QuickFix exception handling.
 */
@UnAdaptableTest
public class AuraQuickFixUITest extends WebDriverTestCase {
    public final By CREATE_COMPONENT_BUTTON = By.xpath("//button[text()='Create Component Definition']");

    public AuraQuickFixUITest(String name) {
        super(name);
    }

    /**
     * Verify that aura QuickFix UI appears in DEV mode.
     */
    public void testQuickFixDevMode() throws Exception {
        openNoAura("/foo/bar.cmp?aura.mode=DEV");
        waitForAuraInit();
        Thread.sleep(1000);
        assertEquals("Create Component Definition", getText(CREATE_COMPONENT_BUTTON));
    }

    /**
     * Verify that aura QuickFix UI does not appear in SELENIUM mode.
     */
    public void testQuickFixSeleniumMode() throws Exception {
        openNoAura("/foo/bar.cmp?aura.mode=SELENIUM");
        assertFalse(isElementPresent(CREATE_COMPONENT_BUTTON));
        assertTrue(getText(By.id("auraErrorMessage"))
                .contains(
                        "org.auraframework.throwable.quickfix.DefinitionNotFoundException: No COMPONENT named markup://foo:bar found"));
    }

    /**
     * Verify that aura QuickFix UI does not appear in PROD mode.
     */
    @UnAdaptableTest
    public void testQuickFixProdMode() throws Exception {
        openNoAura("/aura/SomeNonExistingJunk.app?aura.mode=PROD");
        assertFalse(isElementPresent(CREATE_COMPONENT_BUTTON));
        assertTrue(getText(By.tagName("body")).contains("404 Not Found"));
    }
}
