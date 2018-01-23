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
    owner: "rrigot",
    browsers: ["-IE8"],

    /**
     * Test that opens the menu twice, and checks that the content that the ui:menuList has indexed is correctly
     * both times in its childMenuItems attribute, even though the contennt changed between the two times.
     * This wouldn't work if the inner component doesn't implement ui:menuListProvider,
     * since we're in a case where the list and the items are in separate components.
     */
    testMenuItems: {
        owner: "rrigot",
        test: [
          function (cmp) { // Checking that menu is closed, opening it, waiting for proper content.
            $A.test.assertFalse(this._menuIsOpen(cmp));
            this._clickTrigger(cmp);

            $A.test.addWaitForWithFailureMessage(
              'Dynamically generated item 1',
              function() {
                return $A.test.getElementByClass('dynamic-item') && $A.test.getElementByClass('dynamic-item').length > 0 && $A.test.getText($A.test.getElementByClass('dynamic-item')[0]);
              },
              'The menu never opened with the right content the first time.'
            );
          },
          function(cmp) { // Checking that menu is open, asserting items' size and content, then closing menu, waiting for it to close.
            $A.test.assertTrue(this._menuIsOpen(cmp), "Menu should be open");

            $A.test.assertEquals(5, cmp.find('actionMenu').get('v.childMenuItems').length, "The number of child items that were found in the menuList is not as expected");
            var textItems = this._textItems(cmp);
            $A.test.assertEquals("Dynamically generated item 1", textItems[0]);
            $A.test.assertEquals("Dynamically generated item 2", textItems[1]);
            $A.test.assertEquals("Dynamically generated item 3", textItems[2]);
            $A.test.assertEquals("Dynamically generated item 4", textItems[3]);
            $A.test.assertEquals("Static item", textItems[4]);
            this._clickTrigger(cmp);

            var that = this;
            $A.test.addWaitForWithFailureMessage(
              false,
              function() {
                return that._menuIsOpen(cmp);
              },
              'The menu never closed.'
            );
          },
          function(cmp) { // Checking that menu is closed, opening it, waiting on new content to be there.
            $A.test.assertFalse(this._menuIsOpen(cmp), "Menu should be closed");

            this._clickTrigger(cmp);
            $A.test.addWaitForWithFailureMessage(
              'Dynamically generated item 5',
              function() {
                return $A.test.getElementByClass('dynamic-item') && $A.test.getElementByClass('dynamic-item').length > 0 && $A.test.getText($A.test.getElementByClass('dynamic-item')[0]);
              },
              'The menu never opened with the right content the first time.'
            );
          },
          function(cmp) { // Checking that menu is open, asserting items' size and content.
            $A.test.assertTrue(this._menuIsOpen(cmp), "Menu should be open");

            $A.test.assertEquals(5, cmp.find('actionMenu').get('v.childMenuItems').length, "The number of child items that were found in the menuList is not as expected");
            var textItems = this._textItems(cmp);
            $A.test.assertEquals("Dynamically generated item 5", textItems[0]);
            $A.test.assertEquals("Dynamically generated item 6", textItems[1]);
            $A.test.assertEquals("Dynamically generated item 7", textItems[2]);
            $A.test.assertEquals("Dynamically generated item 8", textItems[3]);
            $A.test.assertEquals("Static item", textItems[4]);
          }
        ]
    },

    // Performing a click on the menu's trigger, either to open or to close it.
    _clickTrigger: function(cmp) {
      cmp.find('trigger').getElement().getElementsByTagName("a")[0].click();
    },

    // Returns an array of the current labels inside the menu list.
    _textItems: function(cmp) {
      return cmp.find('actionMenu').get('v.childMenuItems').map(function(c){ return $A.test.getText(c.getElement()); });
    },

    // Returns a boolean informing whether the menu is currently open or not.
    _menuIsOpen: function(cmp) {
      var elem = $A.test.getElementByClass('uiMenuList');
      return elem && elem.length > 0 && $A.util.hasClass(elem[0], 'visible');
    }
})
