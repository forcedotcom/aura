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
package org.auraframework.integration.test.components.ui.virtualMenuWrapper;

import java.util.function.Consumer;

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

@TargetBrowsers({BrowserType.GOOGLECHROME, BrowserType.FIREFOX, BrowserType.IE11})
public class VirtualMenuWrapperUITest extends WebDriverTestCase {

    private static final String TEST_CMP = "/uitest/virtualList_Test.cmp?pageSize=1";
    private static final String MENU_WITH_TRIGGER_LABEL_SEL = ".virtualMenuContainer.menuWithTriggerLabel";
    private static final String MENU_SEL = ".uiMenu .uiMenuList";
    private static final String MENU_ITEM_SEL = MENU_SEL + " .uiMenuItem";
    private static final String VISIBLE_SEL = ".visible.positioned";

    @Test
    public void testFocusAfterDownArrowKeyOpenMenu() throws Exception {
        open(TEST_CMP);
        String menuSel = MENU_WITH_TRIGGER_LABEL_SEL;
        String focusSel = menuSel + " " + MENU_ITEM_SEL;
        testTriggerAndFocus(menuSel, focusSel, trigger -> trigger.sendKeys(Keys.DOWN));
    }

    @Test
    public void testFocusAfterUpArrowKeyOpenMenu() throws Exception {
        open(TEST_CMP);
        String menuSel = MENU_WITH_TRIGGER_LABEL_SEL;
        String focusSel = menuSel + " " + MENU_ITEM_SEL;
        testTriggerAndFocus(menuSel, focusSel, trigger -> trigger.sendKeys(Keys.UP));
    }

    @Test
    public void testFocusAfterEnterOpenMenu() throws Exception {
        open(TEST_CMP);
        String menuSel = MENU_WITH_TRIGGER_LABEL_SEL;
        String focusSel = menuSel + " a";
        testTriggerAndFocus(menuSel, focusSel, trigger -> getAuraUITestingUtil().pressEnter(trigger));
    }
    
    @Test
    public void testFocusAfterClickOpenMenu() throws Exception {
        open(TEST_CMP);
        String menuSel = MENU_WITH_TRIGGER_LABEL_SEL;
        String focusSel = menuSel + " a";
        testTriggerAndFocus(menuSel, focusSel, trigger -> trigger.click());
    }

    /**
     * Accessibility Test template
     * Trigger menu through triggerAction and check if focus is correct
     * @param virtualMenuSel css selector of virtual menu wrapper
     * @param focusSel css selector of element to be focused on after menu is triggered
     * @param triggerAction action to trigger menu
     */
    private void testTriggerAndFocus(String virtualMenuSel, String focusSel,
            Consumer<WebElement> triggerAction) throws Exception {

        WebDriver driver = this.getDriver();
        WebElement virtualMenu = driver.findElement(By.cssSelector(virtualMenuSel));

        WebElement menuTrigger = virtualMenu.findElement(By.tagName("a"));
        triggerAction.accept(menuTrigger);

        waitForMenuOpen(virtualMenuSel);

        WebElement focusElement = driver.findElement(By.cssSelector(focusSel));
        waitForFocusOnElement(focusElement);
    }

    /**
     * Wait for the visible class to be present on the menu list.
     * @param menu The WebElement on which to wait for the visible class to be present
     */
    private void waitForMenuOpen(String virtualMenuSel) {
        String menuSel = virtualMenuSel + " " + MENU_SEL + VISIBLE_SEL;
        getAuraUITestingUtil().waitForElement(By.cssSelector(menuSel));
    }

    /**
     * Wait for focus to be on a certain menu action item by checking the current active element.
     * @param element The WebElement on which to wait for focus
     */
    private void waitForFocusOnElement(final WebElement element) {
        String text = element.toString();
        getAuraUITestingUtil().waitUntil(check -> {
            String elementText = element.getText();
            String activeElementText = getAuraUITestingUtil().getActiveElementText();
            return elementText.equals(activeElementText);
        }, "Focus hasn't switched to WebElement <" + text + ">");
    }
}
