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
    clickAnchor: function (trigger) {
        var anchor = trigger.getElement().getElementsByTagName("a")[0];
        anchor.click();
    },
    /**
     * Test to verify action menu works when interacting with the menu items
     * using AURA API
     * Disabling test from IE7 and IE8 as sauce labs env issue.
     */
    owner: "ronak.shah",
    browsers: ["-IE7", "-IE8"],
    testActionMenu: {
        owner: "ctatlah,ronak.shah",
        test: [function (cmp) {
            actionMenu = cmp.find("actionMenu");
            menuLabel = cmp.find("trigger");

            //check menu is default to hidden by using AURA API
            $A.test.assertFalse(actionMenu.get('v.visible'), "Action Menu should not be visible");

            //check menu is default to hidden by using DOM API
            $A.test.assertTrue($A.util.hasClass(actionMenu.getElement(), "uiMenuList"), "Class name should be just uiMenuList");
            $A.test.assertFalse($A.util.hasClass(actionMenu.getElement(), "visible"), "Class name should not contain visible");
            this.clickAnchor(menuLabel);

            //Check if secondItem in the menu is disabled
            $A.test.addWaitForWithFailureMessage(true, function () {
                return cmp.find("actionItem2").get("v.disabled");
            }, "Check if Item2 in the menu is disabled");
        }, function (cmp) {
            //make sure menuItem is not attached to body directly and its attached to uiMenu instead
            //Test case for W-2181713
            var actionMenuParentClassName = actionMenu.getElement().parentNode.className;
            $A.test.assertTrue($A.test.contains(actionMenuParentClassName, "uiMenu"), "Menu Item List not attached to correct uiMenu");

            var disableAttrValue = cmp.find("actionItem1").get("v.disabled");
            $A.test.assertFalse(disableAttrValue, "Menu item 1 should be clickable");

            //check menu is visible by using AURA API
            $A.test.assertTrue(actionMenu.get('v.visible'), "Menu should be visible");
            $A.test.assertTrue($A.util.hasClass(actionMenu.getElement(), "visible"), "Class name should be uiMenuList visible");

            //disable ActionItem1
            cmp.find("actionItem1").set("v.disabled", true);
            var disableAttrValue = cmp.find("actionItem1").get("v.disabled");
            $A.test.assertTrue(disableAttrValue, "Menu item 1 should not be clickable");

            //click actionItem3 and check if label is updated
            this.clickAnchor(cmp.find("actionItem3"));
            $A.test.addWaitForWithFailureMessage(cmp.find("actionItem3").get('v.label'), function () {
                return menuLabel.get('v.label')
            }, "Label should be updated to " + cmp.find("actionItem3").get('v.label'));
        }
        ]
    },

    /**
     * verify hideMenuAfterSelected when set on menu's
     * Test case for W-2720943
     */
    testActionMenuHideAfterSelectedSet: {
    	attributes : {"hideMenuAfterSelected" : "true"},
        test: [function (cmp) {
            actionMenu = cmp.find("actionMenu");
            menuLabel = cmp.find("trigger");

            //check menu is default to hidden by using AURA API
            $A.test.assertFalse(actionMenu.get('v.visible'), "Action Menu should not be visible");
            this.clickAnchor(menuLabel);

            //Check if secondItem in the menu is disabled
            $A.test.addWaitForWithFailureMessage(true, function () {
                return cmp.find("actionItem2").get("v.disabled");
            }, "Check if Item2 in the menu is disabled");
        }, function (cmp) {
            //check menu is visible by using AURA API
            $A.test.assertTrue(actionMenu.get('v.visible'), "Menu should be visible");
            $A.test.assertTrue($A.util.hasClass(actionMenu.getElement(), "visible"), "Class name should be uiMenuList visible");

            //click actionItem3 and check if label is updated
            this.clickAnchor(cmp.find("actionItem3"));
            $A.test.addWaitForWithFailureMessage(cmp.find("actionItem3").get('v.label'), function () {
                return menuLabel.get('v.label')
            }, "Label should be updated to " + cmp.find("actionItem3").get('v.label'));
        }, function (cmp) {
        	$A.test.assertTrue(actionMenu.get('v.visible'), "Menu should be visible");
            $A.test.assertTrue($A.util.hasClass(actionMenu.getElement(), "visible"), "Class name should be uiMenuList visible");
        }
        ]
    },

    /**
     * Test to verify checkbox menu works when interacting with the menu items
     * using AURA API
     */
    testCheckboxMenu: {
        test: [function (cmp) {
            menuLabel = cmp.find("checkboxMenuLabel");
            checkboxMenu = cmp.find("checkboxMenu");
            ouptutButton = cmp.find("checkboxButton");
            outputText = "checkboxMenuResult";

            ouptutButton.get('e.press').fire();
            //check if default value is checked
            $A.test.addWaitForWithFailureMessage(cmp.find("checkboxItem4").get('v.label'), function () {
                return cmp.find(outputText).get('v.value')
            }, "Ouput Label should be updated to " + cmp.find("checkboxItem4").get('v.label'));
        }, function (cmp) {
            this.clickAnchor(menuLabel);
            //Check if menu is visible
            $A.test.addWaitForWithFailureMessage(true, function () {
                return $A.util.hasClass(checkboxMenu.getElement(), "visible")
            }, "Checkbox Menu Should be visible");
        }, function (cmp) {
            //check item 1 is not selected
            $A.test.assertFalse(cmp.find("checkboxItem1").get('v.selected'), "Checkbox Menu item 1 should not be selected");
            //Select item1 from the list
            this.clickAnchor(cmp.find("checkboxItem1"));
            $A.test.addWaitForWithFailureMessage(true, function () {
                return cmp.find("checkboxItem1").get('v.selected')
            }, "Checkbox Menu item 1 should be selected");
        }, function (cmp) {
            this.clickAnchor(menuLabel);
            $A.test.addWaitForWithFailureMessage(false, function () {
                return $A.util.hasClass(checkboxMenu.getElement(), "visible")
            }, "Checkbox Menu Should be not be visible");
        }, function (cmp) {
            //check output result
            ouptutButton.get('e.press').fire();

            var expectedOutputText = cmp.find("checkboxItem1").get('v.label') + "," + cmp.find("checkboxItem4").get('v.label');
            $A.test.addWaitForWithFailureMessage(expectedOutputText, function () {
                return cmp.find(outputText).get('v.value')
            }, "Checkbox Menu Default value is not correct");
        }, function (cmp) {
            //uncheck item1 from the list
            this.clickAnchor(cmp.find("checkboxItem1"));

            $A.test.addWaitForWithFailureMessage(false, function () {
                return cmp.find("checkboxItem1").get('v.selected')
            }, "Checkbox Menu item 1 should be unchecked");
        }, function (cmp) {
            //check output result
            ouptutButton.get('e.press').fire();

            var expectedOutputText = cmp.find("checkboxItem4").get('v.label');
            $A.test.addWaitForWithFailureMessage(expectedOutputText, function () {
                return cmp.find(outputText).get('v.value')
            }, "Checkbox Menu output text did not get updated");
        }
        ]
    },

    /**
     * verify hideMenuAfterSelected when set on menu's
     * Test case for W-2720943
     */
    testCheckboxMenuListHidesAfterSelected: {
    	attributes : {"hideMenuAfterSelected" : "true"},
        test: [function (cmp) {
            menuLabel = cmp.find("checkboxMenuLabel");
            checkboxMenu = cmp.find("checkboxMenu");
            ouptutButton = cmp.find("checkboxButton");
            outputText = "checkboxMenuResult";

            ouptutButton.get('e.press').fire();
            //check if default value is checked
            $A.test.addWaitForWithFailureMessage(cmp.find("checkboxItem4").get('v.label'), function () {
                return cmp.find(outputText).get('v.value')
            }, "Ouput Label should be updated to " + cmp.find("checkboxItem4").get('v.label'));
        }, function (cmp) {
            this.clickAnchor(menuLabel);
            //Check if menu is visible
            $A.test.addWaitForWithFailureMessage(true, function () {
                return $A.util.hasClass(checkboxMenu.getElement(), "visible")
            }, "Checkbox Menu Should be visible");
        }, function (cmp) {
            //Select item1 from the list
            this.clickAnchor(cmp.find("checkboxItem1"));
            $A.test.addWaitForWithFailureMessage(true, function () {
                return cmp.find("checkboxItem1").get('v.selected')
            }, "Checkbox Menu item 1 should be selected");
        }, function (cmp) {
            $A.test.assertFalse($A.util.hasClass(checkboxMenu.getElement(), "visible"), "Checkbox Menu Should not be visible as hideMenuAfterSelected is set to true");
        }
        ]
    },

    /**
     * Test to verify radiobox menu works when interacting with the menu items
     * using AURA API
     */
    testRadioMenu: {
        test: [function (cmp) {
            menuLabel = cmp.find("radioMenuLabel");
            radioMenu = cmp.find("radioMenu");
            ouptutButton = cmp.find("radioButton");
            item1 = cmp.find("radioItem1");
            item2 = cmp.find("radioItem2");
            outputText = "radioMenuResult";

            this.clickAnchor(menuLabel);
            //check if menu is visible
            $A.test.addWaitForWithFailureMessage(true, function () {
                return $A.util.hasClass(radioMenu.getElement(), "visible")
            }, "Radio Menu should be visible");
        }, function (cmp) {
            //Select first item from the menu
            this.clickAnchor(item1);
            //check if first item is selected
            $A.test.addWaitForWithFailureMessage(true, function () {
                return item1.get('v.selected')
            }, "Radio Menu item 1 should be selected");
        }, function (cmp) {
            //select 2nd item from the menu
            this.clickAnchor(item2);
            $A.test.addWaitForWithFailureMessage(true, function () {
                return item2.get('v.selected')
            }, "Radio Menu item 2 should be selected");
        }, function (cmp) {
            //menu item 1 should be unchecked after selecting item2
            $A.test.assertFalse(item1.get('v.selected'), "Radio Menu item 1 should be unchecked");
            this.clickAnchor(menuLabel);
            $A.test.addWaitForWithFailureMessage(false, function () {
                return $A.util.hasClass(radioMenu.getElement(), "visible")
            }, "Radio Menu should not be visible");
        }, function (cmp) {
            ouptutButton.get('e.press').fire();
            var expectedOutputText = item2.get('v.label');
            $A.test.addWaitForWithFailureMessage(expectedOutputText, function () {
                return cmp.find(outputText).get('v.value')
            }, "Radio Menu output text did not get updated");
        }

        ]
    },

    testRadioMenuListHidesAfterSelected: {
    	attributes : {"hideMenuAfterSelected" : "true"},
        test: [function (cmp) {
            menuLabel = cmp.find("radioMenuLabel");
            radioMenu = cmp.find("radioMenu");
            ouptutButton = cmp.find("radioButton");
            item1 = cmp.find("radioItem1");
            item2 = cmp.find("radioItem2");
            outputText = "radioMenuResult";

            this.clickAnchor(menuLabel);
            //check if menu is visible
            $A.test.addWaitForWithFailureMessage(true, function () {
                return $A.util.hasClass(radioMenu.getElement(), "visible")
            }, "Radio Menu should be visible");
        }, function (cmp) {
            //Select first item from the menu
            this.clickAnchor(item1);
            //check if first item is selected
            $A.test.addWaitForWithFailureMessage(true, function () {
                return item1.get('v.selected')
            }, "Radio Menu item 1 should be selected");
        }, function (cmp) {
            $A.test.assertFalse($A.util.hasClass(radioMenu.getElement(), "visible"), "Radio Menu should not be visible as hideMenuAfterSelected is set to true");
        }
        ]
    },

    /**
     * Test to verify radiobox menu created using iteration cmp works when interacting with the menu items
     * using AURA API
     * Test Case for W-1617363, W-1617518
     */
    testRadioMenuCreatedByIteration: {
        test: [function (cmp) {
            menuLabel = cmp.find("iterationTrigger");
            menu = cmp.find("iterationRadioMenu");
            ouptutButton = cmp.find("radioIterationButton");
            outputText = cmp.find("iterationRadioMenuResult");

            this.verifyMenuVisibilityOnClick(menuLabel, menu, true, "Radio Menu created by Iteration should be visible")

            menuItems = menu.get("v.childMenuItems");
            this.verifyChildMenuItems(menuItems, 4);
        }, function (cmp) {
            item1 = menuItems[0];
            item2 = menuItems[1];
            this.verifyMenuItemSelected(item1, "Radio Menu created by iteration should have item 1 selected");
            this.verifyMenuItemSelected(item2, "Radio Menu created by iteration should have item 2 selected");
            this.verifyMenuItemNotSelected(item1, "Radio Menu created by iteration should have item 1 deselected");
            this.verifyMenuVisibilityOnClick(menuLabel, menu, false, "Radio Menu created by Iteration should not be visible");

            this.verifyOutputText(ouptutButton, outputText, item2.get('v.label'), "Output text did not get updated for Menu created by iteration");

        }
        ]
    },


    /**
     * Test to verify radiobox menu item created inside an if condition works when interacting with the menu items
     * using AURA API
     */
    testMenuItemsInsideIf: {
        attributes: {menuCondition: "true"},
        test: [function (cmp) {
            menuLabel = cmp.find("conditionTrigger");
            menu = cmp.find("conditionRadioMenu");
            ouptutButton = cmp.find("radioConditionButton");
            outputText = cmp.find("conditionRadioMenuResult");

            this.verifyMenuVisibilityOnClick(menuLabel, menu, true, "Radio Menu created in a condition should be visible")

            menuItems = menu.get("v.childMenuItems");
            this.verifyChildMenuItems(menuItems, 2);
        }, function (cmp) {
            item1 = menuItems[0];
            item2 = menuItems[1];
            this.verifyMenuItemSelected(item1, "Radio Menu created in a condition should have item 1 selected");
            this.verifyMenuItemSelected(item2, "Radio Menu created in a condition should have item 2 selected");
            this.verifyMenuItemNotSelected(item1, "Radio Menu created in a condition should have item 1 deselected");
            this.verifyMenuVisibilityOnClick(menuLabel, menu, false, "Radio Menu created in a condition should not be visible");

            this.verifyOutputText(ouptutButton, outputText, item2.get('v.label'), "Output text did not get updated for Menu created in a condition");

        }]
    },

    /**
     * Test to verify radiobox menu item created inside an else condition works when interacting with the menu items
     * using AURA API
     */
    testMenuItemsInsideElse: {
        attributes: {menuCondition: "false"},
        test: [function (cmp) {
            menuLabel = cmp.find("conditionTrigger");
            menu = cmp.find("conditionRadioMenu");
            ouptutButton = cmp.find("radioConditionButton");
            outputText = cmp.find("conditionRadioMenuResult");

            this.verifyMenuVisibilityOnClick(menuLabel, menu, true, "Radio Menu created in a condition should be visible")

            menuItems = menu.get("v.childMenuItems");
            this.verifyChildMenuItems(menuItems, 3);
        }, function (cmp) {
            item1 = menuItems[0];
            item2 = menuItems[1];
            this.verifyMenuItemSelected(item1, "Radio Menu created in a condition should have item 1 selected");
            this.verifyMenuItemSelected(item2, "Radio Menu created in a condition should have item 2 selected");
            this.verifyMenuItemNotSelected(item1, "Radio Menu created in a condition should have item 1 deselected");
            this.verifyMenuVisibilityOnClick(menuLabel, menu, false, "Radio Menu created in a condition should not be visible");

            this.verifyOutputText(ouptutButton, outputText, item2.get('v.label'), "Output text did not get updated for Menu created in a condition");

        }]
    },

    /**
     * Test to verify nested menu items work
     * using AURA API
     */
    testNestedMenuItems: {
        attributes: {menuCondition: "true"},
        test: [function (cmp) {
            menuLabel = cmp.find("conditionIterationTrigger");
            menu = cmp.find("conditionIterationMenu");
            ouptutButton = cmp.find("conditionIterationButton");
            outputText = cmp.find("conditionIterationMenuResult");

            this.verifyMenuVisibilityOnClick(menuLabel, menu, true, "Menu created with nested menu items should be visible")

            menuItems = menu.get("v.childMenuItems");
            this.verifyChildMenuItems(menuItems, 6);
        }, function (cmp) {
            item1 = menuItems[2];
            item2 = menuItems[3];
            this.verifyMenuItemSelected(item1, "Menu created with nested menu items should have item 1 selected");
            this.verifyMenuItemSelected(item2, "Menu created with nested menu items should have item 2 selected");
            this.verifyMenuItemNotSelected(item1, "Menu created with nested menu items should have item 1 deselected");
            this.verifyMenuVisibilityOnClick(menuLabel, menu, false, "Menu created with nested menu items should not be visible");

            this.verifyOutputText(ouptutButton, outputText, item2.get('v.label'), "Output text did not get updated for Menu created with nested menu items");

        }]
    },

    /**
     * General Test to verify focus on menu item when hovering the mouse over
     */
    testFocusOnMenuItem: {
        test: [function (cmp) {
            trigger = cmp.find("trigger");
            this.clickAnchor(trigger);
        }, function (cmp) {
            var menuItem3 = cmp.find("actionItem3");
            var mouseOverEvent;
            if ($A.util.isIE) {
                mouseOverEvent = document.createEvent("MouseEvent")
                mouseOverEvent.initMouseEvent("mouseover", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            } else {
               mouseOverEvent = new MouseEvent("mouseover")
            }
            menuItem3.getElement().dispatchEvent(mouseOverEvent);
            $A.test.addWaitForWithFailureMessage(menuItem3.get('v.label'), function () {
                return $A.test.getActiveElementText()
            }, "Focus should be on item 3");
        }]
    },

    /**
     * Test menu is positioned above if there is no space left at the bottom.
     * Test Case: W-1622773
     */
    testPositionOfMenu: {
        test: [function (cmp) {
            trigger = cmp.find("triggercheckPosition");
            menuList = cmp.find("checkPosition");
            menuListElement = menuList.getElement();
            item1 = cmp.find("checkPositionItem1").getElement();
            this.clickAnchor(trigger);
            $A.test.setTestTimeout(10000);
            $A.test.addWaitForWithFailureMessage(true, function () {
                return $A.util.hasClass(menuList.getElement(), "visible") && $A.util.hasClass(menuList.getElement(), "positioned");
            }, "Menu Should be visible");
        }, function (cmp) {
            //check if expand event got fired - test case for W-1647658
            $A.test.assertTrue(cmp.get('v.expandEventFired'), "Expand event did not get fired");
            $A.test.assertFalse(cmp.get('v.collapseEventFired'), "Collapse event should not be fired");

            topPropertyValue = $A.util.style.getCSSProperty(menuListElement, 'top');
            //default value
            $A.test.assertTrue(parseInt(topPropertyValue) >= 0 || topPropertyValue == "auto", "CSS property of MenuList should be auto or a positive value");
            viewPort = $A.util.getWindowSize();
            //change the height for item1 such that not enough space below
            item1.style.height = viewPort.height * 2 + "px";
            this.clickAnchor(trigger);
            $A.test.addWaitForWithFailureMessage(false, function () {
                return $A.util.hasClass(menuList.getElement(), "visible")
            }, "Menu Should not be visible");
        }, function (cmp) {
            //check if collapse event got fired - test case for W-1647658
            $A.test.assertTrue(cmp.get('v.collapseEventFired'), "Collapse event did not get fired");
            $A.test.assertFalse(cmp.get('v.expandEventFired'), "Expand event should not be fired");

            //open the menu
            this.clickAnchor(trigger);
            $A.test.addWaitForWithFailureMessage(true, function () {
                return $A.util.hasClass(menuList.getElement(), "visible");
            }, "Menu Should be visible after changing height of item1");
        }, function (cmp) {
            $A.test.addWaitForWithFailureMessage(true, function () {
                return parseInt($A.util.style.getCSSProperty(menuListElement, 'top')) < 0;
            }, "Menu is not positioned properly");
        }
        ]
    },

    /**
     * Test case for W-1636495
     * Test to verify menuTrigger expands menuList since ui:menuList is extensible
     */
    testMenuExpandWhenExtendFromMenuList: {
        test: function (cmp) {
            trigger = cmp.find("triggerLink");
            menuList = cmp.find("extendMenuList");
            this.clickAnchor(trigger);
            $A.test.addWaitForWithFailureMessage(true, function () {
                return $A.util.hasClass(menuList.getElement(), "visible")
            }, "Menu Should be visible when you extend from menuList");
        }
    },

    /**
     * Test to verify menuSelect event is fired only 1 time upon selecting a menu item and not multiple times
     * Test Case: W-2413902
     */
    testMenuSelectEventFiredOncePerMenuItemClick: {
        test: [function (cmp) {
            trigger = cmp.find("triggercheckPosition");
            menuList = cmp.find("checkPosition");
            menuListElement = menuList.getElement();
            $A.test.assertEquals(0, cmp.get("v.menuSelectFireCount"), "menuSelect event should not be fired yet");
            item1 = cmp.find("checkPositionItem1");

            this.clickAnchor(trigger);

            $A.test.addWaitForWithFailureMessage(true, function () {
                return $A.util.hasClass(menuList.getElement(), "visible")
            }, "Menu list Should be visible");
        }, function (cmp) {
            //click item1
            this.clickAnchor(item1);
            $A.test.addWaitForWithFailureMessage(false, function () {
                return $A.util.hasClass(menuList.getElement(), "visible")
            }, "Menu list Should not be visible");
        }, function (cmp) {
            //make sure menuSelect event is fired only once
            $A.test.assertEquals(1, cmp.get("v.menuSelectFireCount"), "menuSelect event should be fired only once");
        }
        ]
    },

    /**
     * Test to verify Clicking on a ui:image does trigger menu item list
     */
    testActionMenuWithImageTrigger: {
        test: function (cmp) {
            actionMenu = cmp.find("actionMenuImage");
            menuLabel = cmp.find("triggerImage");

            //check menu is default to hidden by using AURA API
            $A.test.assertFalse(actionMenu.get('v.visible'), "Action Menu should not be visible");

            //check menu is default to hidden by using DOM API
            $A.test.assertTrue($A.util.hasClass(actionMenu.getElement(), "uiMenuList"), "Class name should be just uiMenuList");
            $A.test.assertFalse($A.util.hasClass(actionMenu.getElement(), "visible"), "Class name should not contain visible");
            this.clickAnchor(menuLabel);

            // check to see if menu opened
            $A.test.addWaitForWithFailureMessage(true, function () {
                return actionMenu.get('v.visible');
            }, "Menu did not display");
        }
    },

    /**
     * Test to verify if focus event is triggered on focus
     */
    testFocusEvent: {
        owner: 'smo',
        test: [function (cmp) {
            this.fireEvents(cmp, "focus", 2);
        }, function (cmp) {
            this.verifyCount(cmp, "focus", 2);
        }]
    },

    /**
     * Test to verify if blur event is triggered on blur
     */
    testBlurEvent: {
        owner: 'smo',
        test: [function (cmp) {
            this.fireEvents(cmp, "blur", 2);
        }, function (cmp) {
            this.verifyCount(cmp, "blur", 2);
        }]
    },

    /****************** Helpers *********************/

    verifyMenuItemSelected: function (menuItem, message) {
        //Test case for W-1617363
        $A.test.assertDefined(menuItem.get('v.value'), "value of menuItem should be defined");
        $A.test.assertEquals(menuItem.get('v.value'), menuItem.get('v.label'), "Value of menuItem is not correct");
        //select item from the menu
        this.clickAnchor(menuItem);
        $A.test.assertTrue(menuItem.get('v.selected'), message);
    },

    verifyMenuItemNotSelected: function (menuItem, message) {
        $A.test.assertFalse(menuItem.get('v.selected'), message);
    },

    verifyChildMenuItems: function (menuItems, expectedLength) {
        $A.test.assertEquals(menuItems.length, expectedLength, "Incorrect number of child items found");
    },

    verifyMenuVisibilityOnClick: function (menuLabel, menu, visible, message) {
        this.clickAnchor(menuLabel);

        //check if menu is visible
        $A.test.addWaitForWithFailureMessage(visible,
            function () {
                return $A.util.hasClass(menu.getElement(), "visible")
            }, message);
    },

    verifyOutputText: function (outputButton, outputText, expectedText, message) {
        ouptutButton.get('e.press').fire();
        $A.test.addWaitForWithFailureMessage(expectedText,
            function () {
                return outputText.get('v.value')
            }, message);
    },

    fireEvents: function (cmp, evtName, count) {
        var menuLinkEl = cmp.find("menuLink").getElement();
        for (var i = 0; i < count; i++) {
            $A.test.fireDomEvent(menuLinkEl, evtName);
        }
    },

    verifyCount: function (cmp, evtName, count) {
        $A.test.assertEquals(count, cmp.get("v." + evtName + "_counter"),
            evtName + "event counter is not correct! Event might not be handled!");
    }
})
