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
    CSS_SELECTOR:{
        tabItems: '.tabs__item',
        visibleTabHeaders: '.tabs__item.uiTabItem:not(.hidden) .tabHeader',
        moreTabHeader: '.tabs__item:not(.hidden):not(.uiTabItem) .tabHeader',
        selectedTabItem : '.tabs__item.active',
        selectedTabBody : '.tabs__content.active',
        overflowItemsContainer: '.popupTargetContainer.visible',
        overflowItems: '.popupTargetContainer .selectable',
        tabHeaders : '.tabHeader'
    },

    LEFTARROW_KEY: 37,
    UPARROW_KEY: 38,
    RIGHTARROW_KEY: 39,
    DOWNARROW_KEY: 40,
    ENTER_KEY: 13,


    //test to see if overflow works correctly when the first tab is selected
    //this tab is not in the overflowdata
    testFirstSelectedTab: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {
            "renderItem" : "tabsetOverflow1"
        },
        test: [
            function(cmp) {
                //initialization stuffs
                var elCmp = this._getTabOverflowAuraControl(cmp);

                //verify children size
                this.verifyTabItemCount(elCmp, 7);
            }, function(cmp){
                //verify the first one is selected
                this.verifyTabSet(
                    this._getTabOverflowAuraControl(cmp),
                    'Tab 1',//tab title
                    'Tab 1 Content',//tab content
                    ['Tab 1','Tab 2','Tab 3', 'More'],//visible tabs
                    ['Tab 4','Tab 5','Tab 6']//overflow tabs
                );
            },function(cmp){
                //open overflow menu
                this.openOverflowMenu(cmp, 'Tab 4 Content');
            }, function(cmp){
                //choose 4 from overflow
                var self = this;
                var elCmp = self._getTabOverflowAuraControl(cmp);
                self.selectTabByName(elCmp, "Tab 4");
                self.verifyTabSet(
                    elCmp,
                    'Tab 4',
                    'Tab 4 Content',
                    ['Tab 1','Tab 2','Tab 4', 'More'],
                    ['Tab 3','Tab 5','Tab 6']
                );
            }, function(cmp){
                //open overflow menu
                this.openOverflowMenu(cmp, 'Tab 3 Content');
            }, function(cmp){
                //choose 4 from overflow
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.selectTabByName(elCmp, "Tab 5");
                this.verifyTabSet(
                    elCmp,
                    'Tab 5',//tab title
                    'Tab 5 Content',//tab content
                    ['Tab 1','Tab 2','Tab 5', 'More'],//visible tabs
                    ['Tab 4','Tab 3','Tab 6']//overflow tabs
                );
            }, function(cmp){
                //add new tab
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.addTab(cmp);
                this.verifyTabItemCount(elCmp, 8);
                this.verifyTabSet(
                    elCmp,
                    'Dynamic 0',//tab title
                    'Dynamic Content 0',//tab content
                    ['Tab 1','Tab 2','Dynamic 0', 'More'],//visible tabs
                    ['Tab 5','Tab 4', 'Tab 3', 'Tab 6']//overflow tabs
                );
            }
        ]
    },


    // test to see if tabset functions correctly when the selected tab
    // is originally part of the overflow data
    testSelectedTabInMenuOverflow: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow2"},
        test: [
            function(cmp) {
                //initialization stuffs
                var elCmp = this._getTabOverflowAuraControl(cmp);

                //verify children size
                this.verifyTabItemCount(elCmp, 7);
            }, function(cmp){
                this.verifyTabSet(
                    this._getTabOverflowAuraControl(cmp),
                    'Tab 6',//tab title
                    'Tab 6 Content',//tab content
                    ['Tab 1','Tab 2','Tab 6', 'More'],//visible tabs
                    ['Tab 3','Tab 4','Tab 5']//overflow tabs
                );
            }, function(cmp){
                //open overflow menu
                this.openOverflowMenu(cmp, 'Tab 3 Content');
            }, function(cmp){
                //choose 4 from overflow
                var self = this;
                var elCmp = self._getTabOverflowAuraControl(cmp);
                self.selectTabByName(elCmp, "Tab 5");
                self.verifyTabSet(
                    elCmp,
                    'Tab 5',
                    'Tab 5 Content',
                    ['Tab 1','Tab 2','Tab 5', 'More'],
                    ['Tab 6','Tab 3','Tab 4']
                );
            }
        ]
    },



    //  test to make sure overflow shouldn't show when there is less number of tabs
    //  than required to show more menu
    testOverflowNotNeeded: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow3"},
        test: [
            function(cmp) {
                //initialization stuffs
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.verifyTabItemCount(elCmp, 2);
                this.verifyTabSet(
                    elCmp,
                    'Tab 2',//tab title
                    'Tab 2 Content',//tab content
                    ['Tab 1','Tab 2'],//visible tabs
                    []//overflow tabs
                );
            },
            function(cmp){
                //add new tab
                var self = this;
                var elCmp = self._getTabOverflowAuraControl(cmp);
                self.addTab(cmp);
                this.verifyTabItemCount(elCmp, 3);
            }
        ]
    },



    //test to see if custom overflow label attribute working correctly
    testCustomOverflowLabel: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow4"},
        test: [
            function(cmp) {
                //initialization stuffs
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.verifyTabItemCount(elCmp, 3);
                this.verifyTabSet(
                    elCmp,
                    'Tab 1',//tab title
                    'Tab 1 Content',//tab content
                    ['Tab 1','My Custom Overflow Label'],//visible tabs
                    ['Tab 2']//overflow tabs
                );
            }
        ]
    },



    //keyboard nav : UP and LEFT to see if the tab is navigated left
    testKeyboardNavSimple1: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow5"},
        test: [
            function(cmp){
                //UP ARROW
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.UPARROW_KEY
                );
                this.verifySelectedTab(
                    elCmp,
                    'Tab 2',
                    'Tab 2 Content'
                );
                this.verifyOnlyOneTabSelected(
                    elCmp
                );
            }, function(cmp){
                //LEFT ARROW
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.LEFTARROW_KEY
                );
                this.verifySelectedTab(
                    elCmp,
                    'Tab 1',
                    'Tab 1 Content'
                );
                this.verifyOnlyOneTabSelected(
                    elCmp
                );
            }
        ]
    },


    //keyboard nav : DOWN and RIGHT to see if the tab is navigated right
    testKeyboardNavSimple2: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow1"},
        test: [function(cmp){
                //RIGHT ARROW
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.RIGHTARROW_KEY
                );
                this.verifySelectedTab(
                    elCmp,
                    'Tab 2',
                    'Tab 2 Content'
                );
                this.verifyOnlyOneTabSelected(
                    elCmp
                );
            }, function(cmp){
                //DOWN ARROW
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.DOWNARROW_KEY
                );
                this.verifySelectedTab(
                    elCmp,
                    'Tab 3',
                    'Tab 3 Content'
                );
                this.verifyOnlyOneTabSelected(
                    elCmp
                );
            }
        ]
    },




    //test to see if overflow menu pop when getting hit from the right
    testKeyboardNavOverflowRight: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow5"},
        test: [
            function(cmp){
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.DOWNARROW_KEY
                );
                this._verifyOverflowMenuOpen(
                    cmp,
                    'Tab 4 Content'
                );
            },
            function(cmp){
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.DOWNARROW_KEY,
                    0
                );
                this._verifyOverflowMenuOpen(
                    cmp,
                    'Tab 5 Content'
                );
            },
            function(cmp){
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.RIGHTARROW_KEY,
                    1
                );
                this._verifyOverflowMenuOpen(
                    cmp,
                    'Tab 6 Content'
                );
            },
            function(cmp){
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.RIGHTARROW_KEY,
                    2
                );
                this.verifySelectedTab(
                    elCmp,
                    'Tab 1',
                    'Tab 1 Content'
                );
            }
        ]
    },



    //test to see if overflow menu pop when getting hit from the left
    testKeyboardNavOverflowLeft: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow1"},
        test: [
            function(cmp){
                //up arrow
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.UPARROW_KEY
                );
                this._verifyOverflowMenuOpen(
                    cmp,
                    'Tab 6 Content'
                );
            },
            function(cmp){
                //up arrow
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.UPARROW_KEY,
                    2
                );
                this._verifyOverflowMenuOpen(
                    cmp,
                    'Tab 5 Content'
                );
            },
            function(cmp){
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.LEFTARROW_KEY,
                    1
                );
                this._verifyOverflowMenuOpen(
                    cmp,
                    'Tab 4 Content'
                );
            },
            function(cmp){
                //up arrow
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.LEFTARROW_KEY,
                    0
                );
                this.verifySelectedTab(
                    elCmp,
                    'Tab 3',
                    'Tab 3 Content'
                );
            }
        ]
    },



    //test to see if overflow menu selection will swap the tab
    testKeyboardNavOverflowSelection: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow5"},
        test: [
            function(cmp){
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.DOWNARROW_KEY
                );
                this._verifyOverflowMenuOpen(
                    cmp,
                    'Tab 4 Content'
                );
            },
            function(cmp){
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.DOWNARROW_KEY,
                    0
                );
                this._verifyOverflowMenuOpen(
                    cmp,
                    'Tab 5 Content'
                );
            },
            function(cmp){
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.selectTabByName(elCmp, "Tab 5");
                this.verifySelectedTab(
                    elCmp,
                    'Tab 5',
                    'Tab 5 Content'
                );
            }
        ]
    },



    //test keyboard navigation behavior when no overflow is present
    testKeyboardNavNoOverflow: {
        owner:"sle",
        browsers : ["-IE7","-IE8"],
        attributes : {"renderItem" : "tabsetOverflow3"},
        test: [function(cmp){
                //1. UP
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.UPARROW_KEY
                );
                this.verifySelectedTabSynchronously(
                    elCmp,
                    'Tab 2',
                    'Tab 2 Content'
                );
                this.verifyOnlyOneTabSelected(
                    elCmp
                );
            }, function(cmp){
                //2. LEFT
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.LEFTARROW_KEY
                );
                this.verifySelectedTabSynchronously(
                    elCmp,
                    'Tab 1',
                    'Tab 1 Content'
                );
                this.verifyOnlyOneTabSelected(
                    elCmp
                );
            }, function(cmp){
                //3. RIGHT
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.RIGHTARROW_KEY
                );
                this.verifySelectedTabSynchronously(
                    elCmp,
                    'Tab 2',
                    'Tab 2 Content'
                );
                this.verifyOnlyOneTabSelected(
                    elCmp
                );
            }, function(cmp){
                //4. DOWN
                var elCmp = this._getTabOverflowAuraControl(cmp);
                this.fireKeyDown(
                    elCmp,
                    this.DOWNARROW_KEY
                );
                this.verifySelectedTabSynchronously(
                    elCmp,
                    'Tab 1',
                    'Tab 1 Content'
                );
                this.verifyOnlyOneTabSelected(
                    elCmp
                );
            }
        ]
    },


    /*************************************************************************************************************
     * HELPER FUNCTIONS
     ************************************************************************************************************/
    /**
     * this methods assume we are in overflow mode with 1 extra tab added for more
     * @param  {[type]} elCmp         [description]
     * @param  {[type]} expectedCount [description]
     * @return none
     */
    verifyTabItemCount: function(elCmp, expectedCount) {
        var self = this;
        $A.test.addWaitForWithFailureMessage(expectedCount, function() {
            return self._getTabCount(elCmp);
        }, "There should " + expectedCount + " tabs : " + (expectedCount - 1) + " tabs + 1 more tab");
    },
    _getTabCount: function(elCmp){
        return elCmp.querySelectorAll(this.CSS_SELECTOR.tabItems).length;
    },
    _verifySelectedTabTitle: function(elCmp, expectedText) {
        //trim expected text
        expectedText = $A.util.trim( expectedText || '');

        var self = this;
        $A.test.addWaitForWithFailureMessage(
            expectedText,
            function() {
                return $A.util.trim(
                    $A.util.getText(self._getElSelectedTabTitle(elCmp))
                );
            },
            'Selected Tab Title should be "' + expectedText + '"'
        );
    },
    _verifySelectedTabBody: function(elCmp, expectedText) {
        //trim expected text
        expectedText = $A.util.trim(expectedText || '');

        var self = this;
        $A.test.addWaitForWithFailureMessage(
            expectedText,
            function() {
                return $A.util.trim(
                    $A.util.getText(self._getElSelectedTabBody(elCmp))
                );
            },
            'Selected Tab Content should match "' + expectedText + '"'
        );
    },
    _getElSelectedTabTitle: function(elCmp){
        return elCmp.querySelector(this.CSS_SELECTOR.selectedTabItem);
    },
    _getElSelectedTabBody: function(elCmp){
        return elCmp.querySelector(this.CSS_SELECTOR.selectedTabBody);
    },
    verifyTabBarItems: function(elCmp, visibleItems, overflowData){
        //verify overflow data
        this._verifyVisibleItems(
            elCmp,
            visibleItems
        );
        this._verifyOverflowItems(
            elCmp,
            overflowData
        );
    },
    _verifyVisibleItems: function(elCmp, visibleItems){
        var self = this;
        var expectedVisibleItemsTxt = $A.util.trim( visibleItems.join(',') );
        var elSelector = [
            this.CSS_SELECTOR.visibleTabHeaders,
            this.CSS_SELECTOR.moreTabHeader
        ].join(',');


        $A.test.addWaitForWithFailureMessage(
            expectedVisibleItemsTxt,
            function() {
                return self._getElArrayText(
                    elCmp.querySelectorAll( elSelector )
                ).join(',');
            },
            'Visible Items Must matched "' + expectedVisibleItemsTxt + '"'
        );
    },
    _verifyOverflowItems: function(elCmp, overflowData){
        var self = this;
        var expectedOverflowDataTxt = $A.util.trim( overflowData.join(','));

        $A.test.addWaitForWithFailureMessage(
            expectedOverflowDataTxt,
            function(){
                var el = elCmp.querySelectorAll(self.CSS_SELECTOR.overflowItems);
                return $A.util.trim(
                    self._getElArrayText(el).join(',')
                );
            },
            '_verifyOverflowItems : Overflow Data Must matched "' + expectedOverflowDataTxt + '"'
        );
    },
    verifyOverflowContainer: function(elCmp, isOpen){
        var self = this;

        if (isOpen){
            $A.test.addWaitForWithFailureMessage(1, function() {
                return elCmp.querySelectorAll(self.CSS_SELECTOR.overflowItemsContainer).length;
            }, "overflow container should be OPEN");
        }
        else{
            $A.test.addWaitForWithFailureMessage(0, function() {
                return elCmp.querySelectorAll(self.CSS_SELECTOR.overflowItemsContainer).length;
            }, "overflow container should be CLOSED");
        }
    },
    _getOverflowContainer: function(elCmp){
        return elCmp.querySelectorAll(this.CSS_SELECTOR.overflowItemsContainer);
    },
    _getTabHeaders: function(elCmp){
        return elCmp.querySelectorAll(this.CSS_SELECTOR.tabHeaders);
    },
    _openOverflowMenu: function(elCmp){
        var el = this._getTabHeaders(elCmp);
        var elMenuMore = el[el.length - 1];

        $A.test.assertNotUndefinedOrNull(elMenuMore, 'Overflow Menu Anchor must be present');
        $A.test.clickOrTouch(elMenuMore);
    },
    selectTabByName: function(elCmp, tabName){
        tabName = $A.util.trim( tabName );//trim original tab names

        var elArray;

        //check the visible tabs
        elArray = elCmp.querySelectorAll(this.CSS_SELECTOR.visibleTabHeaders);
        for (var i = 0;i < elArray.length; i++){
            if ($A.util.trim( $A.util.getText(elArray[i] ) ) === tabName){
                $A.test.clickOrTouch(elArray[i]);
                return;
            }
        }


        //check the overflow tabs
        // first make sure overflow menu is visible
        $A.test.assertEquals(
            1,
            this._getOverflowContainer(elCmp).length,
            'Overflow menu needs to be visible first to open tab in overflow container'
        );

        //go ahead with assertion of tab in overflow section
        elArray = elCmp.querySelectorAll(this.CSS_SELECTOR.overflowItems);
        for (var i = 0;i < elArray.length; i++){
            if ($A.util.trim( $A.util.getText(elArray[i]) ) === tabName){
                $A.test.clickOrTouch(elArray[i]);
                return;
            }
        }


        $A.test.assertNotUndefinedOrNull(null, 'Cant find tab matching name "'+tabName+ '"');
    },

    /**
     * @param  Array elArray Array of dom
     * <a>11</a>
     * <a>22</a>
     * <a>33</a>
     * @return ['11','22','33']
     */
    _getElArrayText: function(elArray){
        var arr = [];

        if(elArray && elArray.length > 0){
            for (var i = 0; i < elArray.length; i++){
                arr.push(
                    $A.util.trim( $A.util.getText( elArray[i] ) )
                );
            }
        }

        return arr;
    },


    _getTabOverflowAuraControl: function(cmp){
        return cmp.find("tabsetOverflow").getElement();
    },


    _getAddTabBtn: function(cmp){
        return cmp.find('addTabBtn').getElement();
    },

    addTab: function(cmp){
        var el = this._getAddTabBtn(cmp);
        $A.test.clickOrTouch(el);
    },


    verifySelectedTab: function(elCmp, expectedTabtitle, expectedTabBody){
        var self = this;

        self._verifySelectedTabTitle(
            elCmp,
            expectedTabtitle
        );

        self._verifySelectedTabBody(
            elCmp,
            expectedTabBody
        );
    },


    verifySelectedTabSynchronously: function(elCmp, expectedTabtitle, expectedTabBody){
        $A.test.assertEquals(
            expectedTabtitle,
            $A.util.trim( $A.util.getText(this._getElSelectedTabTitle(elCmp)) ),
            'Selected tab title should match: ' + expectedTabtitle
        );

        $A.test.assertEquals(
            expectedTabBody,
            $A.util.trim( $A.util.getText(this._getElSelectedTabBody(elCmp))),
            'Selected tab body should match: ' + expectedTabBody
        );
    },


    verifyTabSet: function(elCmp, expectedTabtitle, expectedTabBody, expectedVisibleTabs, expectedOverflowTab){
        //verify tab items
        this._verifyVisibleItems(

            elCmp,
            expectedVisibleTabs
        );

        this._verifyOverflowItems(
            elCmp,
            expectedOverflowTab
        );

        //verify selected tab
        this._verifySelectedTabTitle(
            elCmp,
            expectedTabtitle
        );

        this._verifySelectedTabBody(
            elCmp,
            expectedTabBody
        );
    },


    verifyOnlyOneTabSelected: function(elCmp){
        var elArray = elCmp.querySelectorAll('.tabs__item.active');
        $A.test.assertEquals(true, elArray.length === 1, 'Only one tab can be selected at a time. Found ' + elArray.length + ' in selected state');
    },


    openOverflowMenu: function(cmp, expectedTabContent){
        var self = this;
        var elCmp = self._getTabOverflowAuraControl(cmp);

        self._openOverflowMenu(elCmp);
        self._verifyOverflowMenuOpen(cmp, expectedTabContent);
    },


    _verifyOverflowMenuOpen: function(cmp, expectedTabContent){
        var self = this;
        var elCmp = self._getTabOverflowAuraControl(cmp);

        $A.test.addWaitForWithFailureMessage(expectedTabContent, function() {
            return $A.util.trim(
                $A.util.getText(self._getElSelectedTabBody(elCmp))
            );
        }, "Overflow focus will change tab content");

        //verify overflow container is open
        self.verifyOverflowContainer(elCmp, true);
    },

    fireKeyDown: function (cmp, key, curIdx){
        var el = cmp.querySelector('.tabs__nav .tabs__item.active:not(.hidden) .tabHeader');
        if (el === null){
            // el = document.activeElement;
            el = document.querySelectorAll('.popupTargetContainer.uiPopupTarget.visible .selectable')[curIdx];
        }

        if(document.createEvent)
        {
            var eventObj = document.createEvent("Events");
            eventObj.initEvent("keydown", true, true);
            eventObj.which = key; 
            eventObj.keyCode = key;
            el.dispatchEvent(eventObj);
        }
        else{
            var eventObj = document.createEventObject();
            eventObj.keyCode = key;
            el.fireEvent("onkeydown", eventObj);
        }
    }
});