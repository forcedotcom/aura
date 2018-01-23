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
 * WITHOUT WARRANTIES OR CONDITIOloNS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    /**
     * Test to verify action menu works when interacting with the menu items
     * which has attachToBody attribute set
     * using AURA API
     * TODO: Disabling test in IE7&8, bug W-2320774
     * Flapping in Safari
     */
    testActionMenuWithAttachToBodySet: {
        browsers: ["-IE8", "-SAFARI"],
        test: [function(cmp) {
                actionMenu = cmp.find("actionMenuAttachToBody");
                menuLabel = cmp.find("triggerAttachToBody");
                item1 = cmp.find("actionItemAttachToBody1");
                item2 = cmp.find("actionItemAttachToBody2");
                item3 = cmp.find("actionItemAttachToBody3");

                //check menu is default to hidden by using AURA API
                $A.test.assertFalse(actionMenu.get('v.visible'),"Action Menu should not be visible");

                //check menu is default to hidden by using DOM API
                $A.test.assertTrue($A.util.hasClass(actionMenu.getElement(),"uiMenuList"), "Class name should be just uiMenuList");
                $A.test.assertFalse($A.util.hasClass(actionMenu.getElement(),"visible"), "Class name should not contain visible");

                //open menu
                this.clickAnchor(menuLabel);
                this.waitForMenuVisible(actionMenu, true);
            }, function() {
                //Check if secondItem in the menu is disabled
                $A.test.assertTrue(this.isMenuItemDisabled(item2), "Menu item 2 should be disabled");
                $A.test.assertFalse(this.isMenuItemDisabled(item1), "Menu item 1 should be clickable");

                //disable ActionItem1
                item1.set("v.disabled", true);
                $A.test.addWaitForWithFailureMessage(true, function() {
                    return item1.get("v.disabled");
                }, "Menu item 1 should not be clickable");
            }, function() {
                //make sure menuItem is attached to body directly and its not attached to uiMenu instead
                //Test case for W-2181713
                var actionMenuParentElement = actionMenu.getElement().parentNode;
                var bodyElement = document.getElementsByTagName("body")[0];
                $A.test.assertEquals(actionMenuParentElement, bodyElement,
                        "Menu Item List should be attached to body");

                //Make sure horizontal alignment of menuItem is correct with reference to triggerElement
                $A.test.addWaitForWithFailureMessage(true, function() {
                    var actionMenuLeftPositionValue = parseInt($A.test.getStyle(actionMenu.getElement(),"left"));
                    var triggerLeftPositionValue = Math.floor(menuLabel.getElement().getBoundingClientRect().left);
                    return actionMenuLeftPositionValue === triggerLeftPositionValue;
                }, "Menu Item is not alligned properly wrt to trigger it should be at left");
            }, function() {
                //click actionItem3, menu should close
                this.clickAnchor(item3);
                this.waitForMenuVisible(actionMenu, false);

                //check if label is updated to item3
                $A.test.addWaitForWithFailureMessage(item3.get('v.label'), function(){
                    return menuLabel.get('v.label');
                }, "Label should be updated to "+ item3.get('v.label'));
            }
        ]
    },

    /**
     * TODO: W-4368103
     * Investigate why the menu top/bottom check fails in Jenkins
     */
    testLongMenuOpenTopPosition: {
        test: [
            function (cmp) {
                var menu = cmp.find("actionUILongMenuOpenTop");
                var menuTrigger = cmp.find("triggerUILongMenuOpenTop");
                this.clickAnchor(menuTrigger);
                this.waitForMenuVisible(menu, true);
            }
        ]
    },

    /**
     * TODO: W-4368103
     * Investigate why the menu top/bottom check fails in Jenkins
     */
    testLongMenuOpenBottomPosition: {
        test: [
            function (cmp) {
                var menu = cmp.find("actionUILongMenuOpenBottom");
                var menuTrigger = cmp.find("triggerUILongMenuOpenBottom");
                this.clickAnchor(menuTrigger);
                this.waitForMenuVisible(menu, true);
            }
        ]
    },

    getAnchor: function(trigger) {
        return trigger.getElement().getElementsByTagName("a")[0];
    },

    clickAnchor: function (trigger) {
        $A.test.clickOrTouch(this.getAnchor(trigger));
    },

    isMenuItemDisabled: function(menuItem) {
        return menuItem.get("v.disabled") &&
                this.getAnchor(menuItem).getAttribute("aria-disabled") === "true";
    },

    waitForMenuVisible: function(menu, isVisible) {
        $A.test.addWaitForWithFailureMessage(true, function() {
            return menu.get("v.visible") === isVisible &&
                    $A.util.hasClass(menu.getElement(), "visible") === isVisible;
        }, "Menu should" + (isVisible ? " " : " not ") + "be visible");
    }

})//eslint-disable-line
