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
     * which has attachToBody attribute set
     * using AURA API
     * TODO: Disabling test in IE7&8, bug W-2320774
     */
    testActionMenuWithAttachToBodySet: {
        browsers: ["-IE8"],
        test: [function (cmp) {
            actionMenu = cmp.find("actionMenuAttachToBody");
            menuLabel = cmp.find("triggerAttachToBody");
            item1 = "actionItemAttachToBody1";
            item2 = "actionItemAttachToBody2";
            item3 = "actionItemAttachToBody3";

            //check menu is default to hidden by using AURA API
            $A.test.assertFalse(actionMenu.get('v.visible'), "Action Menu should not be visible");

            //check menu is default to hidden by using DOM API
            $A.test.assertTrue($A.util.hasClass(actionMenu.getElement(), "uiMenuList"), "Class name should be just uiMenuList");
            $A.test.assertFalse($A.util.hasClass(actionMenu.getElement(), "visible"), "Class name should not contain visible");
            this.clickAnchor(menuLabel);

            //Check if secondItem in the menu is disabled
            $A.test.addWaitForWithFailureMessage(true, function () {
                return cmp.find(item2).get("v.disabled");
            }, "Check if Item2 in the menu is disabled");
        }, function (cmp) {
            //make sure menuItem is attached to body directly and its not attached to uiMenu instead
            //Test case for W-2181713
            var actionMenuParentElement = actionMenu.getElement().parentNode;
            var bodyElement = document.getElementsByTagName("body")[0];
            $A.test.assertEquals(actionMenuParentElement, bodyElement, "Menu Item List should be attached to body");

            //Make sure horizontal alignment of menuItem is correct with reference to triggerElement
            var actionMenuLeftPostionValue = Math.round(actionMenu.getElement().getBoundingClientRect().left);
            var triggerLeftPositonValue = Math.round(menuLabel.getElement().getBoundingClientRect().left);
            $A.test.assertEquals(actionMenuLeftPostionValue, triggerLeftPositonValue, "Menu Item is not alligned properly wrt to trigger it should be at left:" + triggerLeftPositonValue);

            var disableAttrValue = cmp.find(item1).get("v.disabled");
            $A.test.assertFalse(disableAttrValue, "Menu item 1 should be clickable");

            //check menu is visible by using AURA API
            $A.test.assertTrue(actionMenu.get('v.visible'), "Menu should be visible");

            $A.test.assertTrue($A.util.hasClass(actionMenu.getElement(), "visible"), "Class name should be uiMenuList visible");

            //disable ActionItem1
            cmp.find(item1).set("v.disabled", true);
            var disableAttrValue = cmp.find(item1).get("v.disabled");
            $A.test.assertTrue(disableAttrValue, "Menu item 1 should not be clickable");

            //click actionItem3 and check if label is updated
            this.clickAnchor(cmp.find(item3));
            $A.test.addWaitForWithFailureMessage(cmp.find(item3).get('v.label'), function () {
                return menuLabel.get('v.label')
            }, "Label should be updated to " + cmp.find(item3).get('v.label'));
        }, function (cmp) {
            $A.test.assertFalse(actionMenu.get('v.visible'), "Menu should not be visible");
        }
        ]
    }

})
