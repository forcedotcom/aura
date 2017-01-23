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
({
    SELECTOR: {
        tabsetcmp : 'tabSet',
        tabitem: '.uiTabItem',
        tabitem_anchor : '.uiTabItem .tabHeader',
        tabitem_icon : '.uiTabItem .tabHeader :first-child',
        tabitem_active: '.uiTabItem.active',
        tabbody: '.uiTab.active',
        tabbody_active: '.uiTab.active',
        tabitem_close: '.uiTabItem.active .close'
    },

    owner: 'ctatlah',

    /**
     * Test adding dynamic tabs
     */
    testAddTab: {
        attributes: {
            "renderItem": "testAddTab"
        },
        test: [
            function(cmp) {
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp),
                    i;

                //attempt to add 2 tab 
                for (i = 0; i < 2; i++) {
                    self.addDynamicTab(
                        tabSet,
                        "tab" + i,//tab title
                        "tab content " + i,//tab content
                        "tab" + i//tab name
                    );
                }

                //assertion tab items
                $A.test.addWaitForWithFailureMessage(
                    2,
                    function(){
                        return $A.test.select(self.SELECTOR.tabitem).length;
                    },
                    'Tab items count should be 2 (after adding 2 tabs)'
                );
            },
            function(cmp){
                //activate a tab
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp);

                self.selectedTabByIndex(tabSet, 0);
                self.verifySelectedTabContent('tab content 0');
            }
        ]
    },

    /**
     * Test updating existing tabs
     */
    testUpdateTab: {
        attributes: {
            "renderItem": "testUpdateTab"
        },
        test: [
            //Update title
            function(cmp) {
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp),
                newTitle = "Updated Title",
                tab0Name = "tab0";

                self.updateTab(tabSet, undefined, tab0Name, {title: newTitle});

                $A.test.addWaitForWithFailureMessage(
                    newTitle,
                    function() {
                        return $A.test.select(self.SELECTOR.tabitem_anchor)[0].title;
                    },
                    "Title should be " + newTitle
                );
            },
            //Update icon
            function(cmp) {
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp),
                newIconText = "T",
                //Using aura:text just to confirm icon was updated since it's of type Aura.Component[]
                newIcon = {
                    "descriptor": "markup://aura:text",
                    "attributes": {
                        "value": newIconText
                    }
                };

                self.updateTab(tabSet, 0, undefined, {icon: newIcon});
            }, function(cmp) {
                var self = this,
                newIconText = "T";
                $A.test.addWaitForWithFailureMessage(
                    newIconText,
                    function() {
                        var icon = $A.test.select(self.SELECTOR.tabitem_icon)[0];
                        return $A.test.getText(icon);
                    },
                    "Icon should be " + newIconText
                );
            },
            //Update body
            function(cmp) {
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp),
                newBodyText = "Body Updated!";

                $A.createComponent("aura:text", { "value": newBodyText }, function(newCmp) {
                    self.updateTab(tabSet, 0, undefined, {body: newCmp});

                    $A.test.addWaitForWithFailureMessage(
                        newBodyText,
                        function() {
                            var tabbody = $A.test.select(self.SELECTOR.tabbody)[0];
                            return $A.test.getText(tabbody);
                        },
                        "Body should be " + newBodyText
                    );
                })
            },
            //Confirm we are updating the right tab
            function(cmp) {
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp),
                newTitle0 = "Title 0 Updated!",
                newTitle1 = "Title 1 Updated!",
                tab1Name = "tab1";

                self.updateTab(tabSet, 0, undefined, {title: newTitle0});
                self.updateTab(tabSet, undefined, tab1Name, {title: newTitle1});
            }, function(cmp) {
                var self = this,
                newTitle0 = "Title 0 Updated!";
                $A.test.addWaitForWithFailureMessage(
                    newTitle0,
                    function() {
                        return $A.test.select(self.SELECTOR.tabitem_anchor)[0].title;
                    },
                    "Title of tab 0 should be " + newTitle0
                );
            }, function(cmp) {
                var self = this,
                newTitle1 = "Title 1 Updated!";
                $A.test.addWaitForWithFailureMessage(
                    newTitle1,
                    function() {
                        return $A.test.select(self.SELECTOR.tabitem_anchor)[1].title;
                    },
                    "Title of tab 1 should be " + newTitle1
                );
            }
        ]
    },

    /**
     * Test removing dynamic tabs
     */
    testRemoveTab: {
        attributes: {
            "renderItem": "testRemoveTab"
        },
        test: [
            function(cmp){
                // remove tab via API
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp);

                self.removeTab(tabSet, "tab0");

                //assertion tab items
                $A.test.addWaitForWithFailureMessage(
                    1,
                    function(){
                        return $A.test.select(self.SELECTOR.tabitem).length;
                    },
                    'Tab items count should be 1 (after removing 1 tab)'
                );
            },
            function(cmp){
                var removeCallbackCount = cmp.get("v._tabRemoveCount");
                $A.test.assertEquals(1, removeCallbackCount, "The number of onClose callbacks is not correct.");
            },
            function(cmp){
                // close tab manually
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp);

                self.closeActiveTab();

                //assertion tab items
                $A.test.addWaitForWithFailureMessage(
                    0,
                    function(){
                        return $A.test.select(self.SELECTOR.tabitem).length;
                    },
                    'Tab items count should be 0 (after removing 2 tabs)'
                );
            },
            function(cmp){
                var removeCallbackCount = cmp.get("v._tabRemoveCount");
                $A.test.assertEquals(2, removeCallbackCount, "The number of onClose callbacks is not correct.");

                var removeIndices = cmp.get("v._tabRemoveIndices");
                $A.test.assertEquals(2, removeIndices.length, "The number of onClose indices is not correct.");
                $A.test.assertEquals(0, removeIndices[0], "The onClose index is not correct.");
                $A.test.assertEquals(0, removeIndices[1], "The onClose index is not correct.");

                // only one name should be returned since only one tab provided a name
                var removeNames = cmp.get("v._tabRemoveNames");
                $A.test.assertEquals(1, removeNames.length, "The number of onClose names is not correct.");
                $A.test.assertEquals("tab0", removeNames[0], "The onClose name is not correct.");
            }
        ]
    },

    /**
     * Test alt text on tabitem
     */
    testTabItemAltText: {
        attributes: {
            "renderItem": "testTabItemAltText"
        },
        test: [
            function(cmp) {
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp);

                //verify that the title attribute is set
                $A.test.addWaitForWithFailureMessage(
                    2,
                    function(){
                        return $A.test.select(self.SELECTOR.tabitem_anchor).length;
                    },
                    'Total tab count should be 3 after adding a tab',
                    function(){
                        cmp.set('v._tabTitle', self.getTabTitlesString());

                        $A.test.assertEqualsIgnoreWhitespace(
                            'tab 0 title',
                            $A.util.getElementAttributeValue(
                                $A.test.select(self.SELECTOR.tabitem_anchor)[0],
                                'title'
                            ),
                            '"Tab 0 title" attribute should be populated'
                        );
                        $A.test.assertEqualsIgnoreWhitespace(
                            'tab 1 title',
                            $A.util.getElementAttributeValue(
                                $A.test.select(self.SELECTOR.tabitem_anchor)[1],
                                'title'
                            ),
                            '"Tab 1 title" attribute should be populated'
                        );
                    }
                );
            },
            function(cmp){
                var self = this,
                tabSet = cmp.find(self.SELECTOR.tabsetcmp);

                //this shall work with dynamic tab
                self.addDynamicTab(
                    tabSet,
                    "dynamictab<b>dummy html</b>",//tab title
                    "dynamictab content ",//tab content
                    "dynamictab"//tab name
                );

                //verify
                $A.test.addWaitForWithFailureMessage(
                    3,
                    function(){
                        return $A.test.select(self.SELECTOR.tabitem_anchor).length;
                    },
                    'Total tab count should be 3 after adding a tab',
                    function(){
                        cmp.set('v._tabTitle', self.getTabTitlesString());

                        $A.test.assertEqualsIgnoreWhitespace(
                            'dynamictab<b>dummy html</b>',
                            $A.util.getElementAttributeValue(
                                $A.test.select(self.SELECTOR.tabitem_anchor)[2],
                                'title'
                            ),
                            '"dynamictab<b>dummy html</b>" special tab title with HTML encoded'
                        );
                    }
                );
            }
        ]
    },


    /**
     * test after tabset render container width and height clipping rectangle.
     * first tab selected
     */
    testAfterRenderStateTab0Active: {
        attributes: {
            "renderItem": "testAfterRenderStateTab0Active"
        },
        test: [
            function(cmp) {
                var self = this;

                //the entire tabset
                var tabSet = cmp.find(self.SELECTOR.tabsetcmp);
                var afterRenderWidth = tabSet.get('v._afterRenderWidth');
                var afterRenderHeight = tabSet.get('v._afterRenderHeight');

                cmp.set(
                    'v._tabSet',
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight
                    }
                );

                self.verifyAfterRenderSizePostive(afterRenderWidth, 'Entire Tabset: afterRenderWidth:');
                self.verifyAfterRenderSizePostive(afterRenderHeight, 'Entire Tabset: afterRenderHeight');
            },
            function(cmp){
                var self = this;
                var curtabitemId = 'tab0';
                var curtabitem = cmp.find(curtabitemId);
                var afterRenderWidth = curtabitem.get('v._afterRenderWidth');
                var afterRenderHeight = curtabitem.get('v._afterRenderHeight');
                var isDomPresent = $A.util.getBooleanValue( curtabitem.get('v._isDomPresent') );

                cmp.set(
                    'v._' + curtabitemId,
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight,
                        isDomPresent: isDomPresent
                    }
                );

                self.verifyAfterRenderSizePostive(afterRenderWidth, curtabitemId + ': afterRenderWidth:');
                self.verifyAfterRenderSizePostive(afterRenderHeight, curtabitemId + ': afterRenderHeight:');

                //assert dom presence
                $A.test.assertTruthy(
                    isDomPresent,
                    curtabitemId + ': should be present in the dom: isDomPresent="' + isDomPresent + '"'
                );
            },
            function(cmp){
                var self = this;
                var curtabitemId = 'tab1';
                var curtabitem = cmp.find(curtabitemId);
                var afterRenderWidth = curtabitem.get('v._afterRenderWidth') || 0;
                var afterRenderHeight = curtabitem.get('v._afterRenderHeight') || 0;
                var isDomPresent = $A.util.getBooleanValue( curtabitem.get('v._isDomPresent') );

                cmp.set(
                    'v._' + curtabitemId,
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight,
                        isDomPresent: isDomPresent
                    }
                );


                //assert that tab 1 is of zero width and zero height
                self.verifyAfterRenderSizeZero(afterRenderWidth, curtabitemId + ': afterRenderWidth:');
                self.verifyAfterRenderSizeZero(afterRenderHeight, curtabitemId + ': afterRenderHeight:');

                //assert dom presence
                $A.test.assertFalse(
                    isDomPresent,
                    curtabitemId + ': should NOT BE present in the dom (because tab0 is currently selected): isDomPresent="' + isDomPresent + '"'
                );
            }
        ]
    },



    /**
     * test after tabset render container width and height clipping rectangle.
     * second tab selected
     */
    testAfterRenderStateTab1Active: {
        attributes: {
            "renderItem": "testAfterRenderStateTab1Active"
        },
        test: [
            function(cmp) {
                var self = this;

                //the entire tabset
                var tabSet = cmp.find(self.SELECTOR.tabsetcmp);
                var afterRenderWidth = tabSet.get('v._afterRenderWidth');
                var afterRenderHeight = tabSet.get('v._afterRenderHeight');

                cmp.set(
                    'v._tabSet',
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight
                    }
                );

                self.verifyAfterRenderSizePostive(afterRenderWidth, 'Entire Tabset: afterRenderWidth:');
                self.verifyAfterRenderSizePostive(afterRenderHeight, 'Entire Tabset: afterRenderHeight');
            },
            function(cmp){
                var self = this;
                var curtabitemId = 'tab1';
                var curtabitem = cmp.find(curtabitemId);
                var afterRenderWidth = curtabitem.get('v._afterRenderWidth');
                var afterRenderHeight = curtabitem.get('v._afterRenderHeight');
                var isDomPresent = $A.util.getBooleanValue( curtabitem.get('v._isDomPresent') );

                cmp.set(
                    'v._' + curtabitemId,
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight,
                        isDomPresent: isDomPresent
                    }
                );

                self.verifyAfterRenderSizePostive(afterRenderWidth, curtabitemId + ': afterRenderWidth:');
                self.verifyAfterRenderSizePostive(afterRenderHeight, curtabitemId + ': afterRenderHeight:');

                //assert dom presence
                $A.test.assertTruthy(
                    isDomPresent,
                    curtabitemId + ': should be present in the dom: isDomPresent="' + isDomPresent + '"'
                );
            },
            function(cmp){
                var self = this;
                var curtabitemId = 'tab0';
                var curtabitem = cmp.find(curtabitemId);
                var afterRenderWidth = curtabitem.get('v._afterRenderWidth') || 0;
                var afterRenderHeight = curtabitem.get('v._afterRenderHeight') || 0;
                var isDomPresent = $A.util.getBooleanValue( curtabitem.get('v._isDomPresent') );

                cmp.set(
                    'v._' + curtabitemId,
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight,
                        isDomPresent: isDomPresent
                    }
                );


                //assert that tab 1 is of zero width and zero height
                self.verifyAfterRenderSizeZero(afterRenderWidth, curtabitemId + ': afterRenderWidth:');
                self.verifyAfterRenderSizeZero(afterRenderHeight, curtabitemId + ': afterRenderHeight:');

                //assert dom presence
                $A.test.assertFalse(
                    isDomPresent,
                    curtabitemId + ': should NOT BE present in the dom (because tab0 is currently selected): isDomPresent="' + isDomPresent + '"'
                );
            }
        ]
    },



    /**
     * test after tabset render container width and height clipping rectangle.
     * no selected tab on page init
     */
    testAfterRenderStateNoActiveTab: {
        attributes: {
            "renderItem": "testAfterRenderStateNoActiveTab"
        },
        test: [
            function(cmp) {
                var self = this;

                //the entire tabset
                var tabSet = cmp.find(self.SELECTOR.tabsetcmp);
                var afterRenderWidth = tabSet.get('v._afterRenderWidth');
                var afterRenderHeight = tabSet.get('v._afterRenderHeight');

                cmp.set(
                    'v._tabSet',
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight
                    }
                );

                self.verifyAfterRenderSizePostive(afterRenderWidth, 'Entire Tabset: afterRenderWidth:');
                self.verifyAfterRenderSizePostive(afterRenderHeight, 'Entire Tabset: afterRenderHeight');
            },
            function(cmp){
                var self = this;
                var curtabitemId = 'tab0';
                var curtabitem = cmp.find(curtabitemId);
                var afterRenderWidth = curtabitem.get('v._afterRenderWidth');
                var afterRenderHeight = curtabitem.get('v._afterRenderHeight');
                var isDomPresent = $A.util.getBooleanValue( curtabitem.get('v._isDomPresent') );

                cmp.set(
                    'v._' + curtabitemId,
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight,
                        isDomPresent: isDomPresent
                    }
                );

                self.verifyAfterRenderSizePostive(afterRenderWidth, curtabitemId + ': afterRenderWidth:');
                self.verifyAfterRenderSizePostive(afterRenderHeight, curtabitemId + ': afterRenderHeight:');

                //assert dom presence
                $A.test.assertTruthy(
                    isDomPresent,
                    curtabitemId + ': should be present in the dom: isDomPresent="' + isDomPresent + '"'
                );
            },
            function(cmp){
                var self = this;
                var curtabitemId = 'tab1';
                var curtabitem = cmp.find(curtabitemId);
                var afterRenderWidth = curtabitem.get('v._afterRenderWidth') || 0;
                var afterRenderHeight = curtabitem.get('v._afterRenderHeight') || 0;
                var isDomPresent = $A.util.getBooleanValue( curtabitem.get('v._isDomPresent') );

                cmp.set(
                    'v._' + curtabitemId,
                    {
                        width: afterRenderWidth,
                        height: afterRenderHeight,
                        isDomPresent: isDomPresent
                    }
                );


                //assert that tab 1 is of zero width and zero height
                self.verifyAfterRenderSizeZero(afterRenderWidth, curtabitemId + ': afterRenderWidth:');
                self.verifyAfterRenderSizeZero(afterRenderHeight, curtabitemId + ': afterRenderHeight:');

                //assert dom presence
                $A.test.assertFalse(
                    isDomPresent,
                    curtabitemId + ': should NOT BE present in the dom (because tab0 is currently selected): isDomPresent="' + isDomPresent + '"'
                );
            }
        ]
    },


    //helper
    /**
     * @param  expected active tab body
     * @return none but verify active tab body
     */
    verifySelectedTabContent: function(expectedActiveTabBody){
        //assertion selected tab body
        var self = this;

        $A.test.addWaitForWithFailureMessage(
            1,
            function(){
                return $A.test.select(self.SELECTOR.tabbody_active).length;
            },
            'should only have 1 selected tab',
            function(){
                //assert active tab body text
                $A.test.assertEqualsIgnoreWhitespace(
                    expectedActiveTabBody,
                    $A.util.trim(
                        $A.test.getText(
                            $A.test.select(self.SELECTOR.tabbody_active)[0]
                        )
                    ),
                    'Selected tab content should be "' + expectedActiveTabBody + '"'
                );
            }
        );
    },
    //selected tab by index
    /**
     * @param  tabset component reference
     * @param  index of tab to be selected
     * @return none, but select the tab
     */
    selectedTabByIndex: function(tabSet, idx){
        var e = tabSet.get("e.activateTab");
        e.setParams({
            index : idx
        });
        e.fire();
    },
    /**
     * @param  tabset component reference
     * @param  tab title
     * @param  tab body
     * @param  tab name
     */
    addDynamicTab: function(tabSet, tabTitle, tabBody, tabName){
        var e = tabSet.get("e.addTab");
        e.setParams({
            tab: {
                "title": tabTitle,
                "name": tabName || tabTitle,
                "closable": true,
                "body": [{
                    "componentDef": {
                        descriptor: "markup://aura:text"
                    },
                    "attributes": {
                        "values": {
                            "value": tabBody
                        }
                    }
                }]
            }
        });
        e.fire();
    },

    /**
     * Update the specified tab
     */
    updateTab: function(tabSet, tabIndex, tabName, updatedTab) {
        var e = tabSet.get("e.updateTab");
        e.setParams({
            name: tabName,
            index: tabIndex,
            tab: updatedTab
        });
        e.fire();
    },

    /**
     * Closes the active tab.
     */
    closeActiveTab: function(){
        // only one close button should be returned since the selector filters on the active tab        
        var elemCloseButtons = $A.test.select(this.SELECTOR.tabitem_close);
        if (elemCloseButtons && elemCloseButtons.length > 0) {
            $A.test.clickOrTouch(elemCloseButtons[0]);
        }
    },

    /**
     * Removes the specified tab.
     */
    removeTab: function(tabSet, tabName){
        var e = tabSet.get("e.removeTab");
        e.setParams({ name: tabName });
        e.fire();
    },

    /**
     * @return tab titles separated by " | "
     */
    getTabTitlesString: function(){
        var self = this;
        var arrayTabTitle = [];
        var elTabItemAnchor = $A.test.select(self.SELECTOR.tabitem_anchor);
        for (var i = 0; i < elTabItemAnchor.length; i++){
            arrayTabTitle.push(
                $A.util.getElementAttributeValue(
                    elTabItemAnchor[i],
                    'title'
                ) || '"undefined"'
            );
        }

        return arrayTabTitle.join(' | ');
    },


    /**
     * verify after render width and height both POSTIVE (> 0)
     */
    verifyAfterRenderSizePostive: function(size, optionalMessage){
        optionalMessage = optionalMessage || '';
        size = parseInt(size);

        $A.test.assertTruthy(
            size > 0,
            optionalMessage + ' size="' + size + '" should be > 0'
        );
    },



    /**
     * verify after render width and height both EQUALS 0
     */
    verifyAfterRenderSizeZero: function(size, optionalMessage){
        optionalMessage = optionalMessage || '';
        size = parseInt(size);
        $A.test.assertTruthy(
            size === 0,
            optionalMessage + ' size="' + size + '" should be === 0'
        );
    }
})