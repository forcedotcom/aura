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
    activateTab: function (cmp, index, focus) {
        var tabItems = cmp.get("v.tabHeaders");
        if ($A.util.isNumber(index) && tabItems[index]) {
            var tabItem = tabItems[index];
            if (cmp.get("v.useOverflowMenu") && this.isInOverflow(cmp, this.getTabName(tabItem))
                && focus !== false) {
                this.updateOverflowTab(cmp, index);
            }

            this.deactivateTab(cmp, tabItem);
            tabItem.setActive(true, focus);
            cmp._activeTabIndex = index;
            cmp._activeTab = tabItem;
        }
    },

    /**
     * Close given tab item
     */
    closeTab: function (cmp, index) {
        var closed = false;
        var tabItems = cmp.get("v.tabHeaders");
        if ($A.util.isNumber(index) && index >= 0 && index < tabItems.length) {
            tabItems.splice(index, 1);
            cmp.set("v.tabHeaders",tabItems);
            closed = true;
        }
        return closed;
    },

    /**
     * Add new tab item to the tabBar
     * TODO: overflow integration
     */
    addTab: function (cmp, index, tab, callback) {
        var self = this, items = cmp.get("v.tabHeaders");
        if ($A.util.isNumber(index) && index >= 0 && index <= items.length) {
            tab.localId = "tabItem";
            var tabValues = [tab];
            this.createComponents(cmp, tabValues, function (newItems) {
                items.splice.apply(items, [index, 0].concat(newItems));
                cmp.set("v.tabHeaders", items);
                if (newItems[0].get("v.active")) {
                    self.activateTab(cmp, index);
                }
                if (typeof callback === "function") {
                    callback(newItems[0]);
                }
            });
        }
    },

    /**
     * Update an existing tab item in the tabBar
     */
    updateTab: function (cmp, index, tab, callback, name) {

        var tabs = cmp.get("v.tabHeaders"),
            existingTab;

        //Prioritize finding a tab by name rather than index
        if(name) {
            existingTab = tabs.filter(function(tabHeader) {
                return tabHeader.get("v.name") === name;
            })[0];
        } else if($A.util.isNumber(index) && index >= 0 && index < tabs.length) {
            existingTab = tabs[index];
        }

        if(existingTab) {
            tab.title && existingTab.set("v.title", tab.title);

            if(tab.icon) {
                var icon = $A.createComponentFromConfig(tab.icon);
                existingTab.set("v.icon", icon);
                if (typeof callback === "function") {
                    callback(existingTab);
                }
            } else if (typeof callback === "function") {
                callback(existingTab);
            }
        }
    },

    /**
     * @private
     * Deactivate the active tab
     */
    deactivateTab: function (cmp, activeTab) {
        if (cmp._activeTab === activeTab) {
            return;
        }
        if (cmp._activeTab && cmp._activeTab.isValid()) {
            cmp._activeTab.setActive(false);
        }
    },

    onKeyDown: function (cmp, domEvent) {
        var srcElement = domEvent.srcElement || domEvent.target, keyCode = domEvent.keyCode;

        if (srcElement.hasAttribute("aria-selected") && keyCode >= 37 && keyCode <= 40) {
            var useOverflow = cmp.get("v.useOverflowMenu");
            var overflowData = this.getOverflowData(cmp);
            var visibleTabs = overflowData.visibleTabs;
            var activateOverflowMenu = false;

            var tabItems = cmp.get("v.tabHeaders"), len = tabItems.length;
            var srcIndex = this.getTabIndex(cmp, srcElement);
            var visibleElementIndex = this.getTabIndex(cmp, srcElement, true);

            if (srcIndex < 0 || srcIndex >= len) {
                return;
            }

            var oldTab = srcIndex;
            if (keyCode === 37 || keyCode === 38) {
                //left or up arrow key
                if (useOverflow && overflowData.hasOverflow) {
                    if (visibleElementIndex === 0) {
                        activateOverflowMenu = true;
                    } else {
                        srcIndex = overflowData.visibleTabs[--visibleElementIndex].index;
                    }
                } else if (srcIndex === 0) {
                    srcIndex = len - 1;
                } else {
                    srcIndex--;
                }
            } else if (keyCode === 39 || keyCode === 40) {
                //right or down arrow key
                if (useOverflow && overflowData.hasOverflow) {
                    if (visibleElementIndex === visibleTabs.length - 1) {
                        activateOverflowMenu = true;
                    } else {
                        srcIndex = visibleTabs[++visibleElementIndex].index;
                    }
                } else if (srcIndex === len - 1) {
                    srcIndex = 0;
                } else {
                    srcIndex++;
                }
            }

            if (activateOverflowMenu) {
                //always focus on the first menu item
                cmp.find("overflowMenu").focus();
            } else {
                cmp.get('e.onTabActivated').setParams({"index": srcIndex, "oldTab": oldTab}).fire();
            }
            $A.util.squash(domEvent, true);
        }
    },


    /**
     * Get element position index
     * @private
     */
    getTabIndex: function (cmp, element, visible) {
        var index = -1, container = cmp.find("tabItemsContainer").getElement();
        var el = element;
        var children;
        while (el.parentNode) {
            if (el.parentNode === container) {
                children = visible ? container.querySelectorAll("li.uiTabItem:not([class*='hidden'])") : container.children;
                index = Array.prototype.indexOf.call(children, el);
                break;
            }
            el = el.parentNode;
        }
        return index;
    },

    /**
     * @private
     */
    setTabItems: function (cmp) {
        this.createComponents(cmp, cmp.get("v.tabs"), function (items) {
            cmp.set("v.tabHeaders", items);
        });
    },

    /**
     * @private
     */
    createComponents: function (cmp, tabValues, callback) {
        var items = [];
        var len = tabValues.length;
        var counter = len;

        var fn = function (newCmp) {
            counter--;
            newCmp.addHandler("onActivate", cmp, "c.onTabActivated");
            newCmp.addHandler("onClose", cmp, "c.onTabClosed");
            newCmp.addHandler("onTabHover", cmp, "c.onTabHover");
            newCmp.addHandler("onTabUnhover", cmp, "c.onTabUnhover");
            items.push(newCmp);
            
            if(newCmp.get("v.active")) {
                cmp._activeTabIndex = items.length-1;
                cmp._activeTab = newCmp;
            }
            
            if (counter === 0 && callback) {
                callback(items);
            }
        };

        for (var i = 0; i < len; i++) {
            var config = tabValues.get ? tabValues.get(i) : tabValues[i];
            var newComponent = $A.createComponentFromConfig(config);
            fn(newComponent);

        }
        
    },

    /**
     * ===============================
     * Overflow
     * ===============================
     */

    /**
     * Calculates the maximum number of tabs that should be in the tab bar.
     * If the tab bar contains more tabs, those will go into the overflow
     */
    calculateMaxTabs : function(cmp) {
        var overflowData = this.getOverflowData(cmp);
        var barWidth = this.getBarWidth(cmp);
        var tabItems = cmp.get("v.tabHeaders");
        var tabsFitting = 0;
        var mustShowTabs = this.getMustShowTabs(cmp) ;
        var mustShowTabIndices = mustShowTabs.indices;
        var visibleTabWidths = [];

        overflowData.barWidth = barWidth;
        barWidth -= mustShowTabs.totalWidth;
        tabsFitting += mustShowTabs.indices.length;

        if (barWidth > 0) {
            var tabItem, width, totalTabs = tabItems.length;
            for (var i = 0; i < totalTabs; i++) {
                tabItem = tabItems[i];
                if (!tabItem.isRendered() || mustShowTabIndices.indexOf(i) >= 0) {
                    continue;
                }
                width = this.getOuterWidth(tabItem.getElement());
                if (width > 0) {
                    if (barWidth > width) {
                        barWidth -= width;
                        tabsFitting++;
                        visibleTabWidths.push(width);
                    } else {
                        break;
                    }
                }
            }
            if (visibleTabWidths.length > 0 && tabsFitting < totalTabs) {
                var tabWidth = visibleTabWidths.pop();
                var menuWidth = this.getOverflowMenuWidth(cmp);
                if (tabWidth && barWidth < menuWidth) {
                    barWidth = barWidth + tabWidth - menuWidth;
                    tabsFitting--;
                }
            }
        }
        overflowData.extraWidth = barWidth;

        return tabsFitting;
    },

    getMustShowTabs: function(cmp) {
        var totalWidth = 0;
        var numberOfTabs = 0;
        var indices = [];
        if (cmp._activeTab && cmp._activeTab.isValid()) {
            //active tab should always be visible and accounted for
            totalWidth = this.getActiveTabWidth(cmp);
            numberOfTabs++;
            indices.push(cmp._activeTabIndex);
        }
        return {numberOfTabs: numberOfTabs, totalWidth: totalWidth, indices: indices};
    },

    getActiveTabWidth: function(cmp) {
        return cmp._activeTab && cmp._activeTab.isValid() ? this.getOuterWidth(cmp._activeTab.getElement()) : 0;
    },

    getOverflowMenuWidth: function(cmp) {
        var overflowMenu = cmp.find("overflowMenu").getElement();
        return overflowMenu ? this.getOuterWidth(overflowMenu) : 0;
    },

    /**
     * Initializes overflow data and creates the overflow menu
     * starting at the specified startIndex
     */
    initializeOverflowData : function(cmp) {
        var overflowData = this.getOverflowData(cmp);

        overflowData.barWidth = 0;
        overflowData.extraWidth = 0;
        overflowData.hasOverflow = false;
        overflowData.tabCache = [];
        overflowData.visibleTabs = [];
    },

    getBarWidth: function(cmp) {
        var container = cmp.find("tabItemsContainer");
        return container.getElement().getBoundingClientRect().width || 0;
    },

    getOuterWidth: function(el) {
        var dataAttr = "original-width";
        var width = $A.util.getDataAttribute(el, dataAttr);
        if ($A.util.isUndefinedOrNull(width)) {
            var style = window.getComputedStyle(el, '');
            width = parseFloat(style["marginLeft"]) + parseFloat(style["marginRight"]) + el.offsetWidth;
            $A.util.setDataAttribute(el, "original-width", width);
        } else {
            width = parseFloat(width);
        }

        return $A.util.isUndefinedOrNull(width) ? 0 : width;
    },

    adjustOverflow: function(cmp) {
        var tabCache = {};
        var overflowData = this.getOverflowData(cmp);
        var maxTabs = this.calculateMaxTabs(cmp);
        var tabItems = cmp.get("v.tabHeaders");
        var startIndex = cmp._activeTab && cmp._activeTabIndex >= maxTabs ? maxTabs - 1 : maxTabs;
        
        //To avoid showing overflow menu link when useOverflowMenu is set and tabitems are empty
        if(tabItems.length === 0){
        	this.toggleOverflowMenu(cmp, false);
            overflowData.hasOverflow = false;
        }
        
        if (maxTabs === overflowData.visibleTabs.length) {
            return;
        }

        this.updateVisibleTabs(overflowData, tabItems, startIndex);
        if (maxTabs >= tabItems.length) {
            //enough space, don't need to show overflow tab
            this.toggleOverflowMenu(cmp, false);
            overflowData.hasOverflow = false;
        } else {
            var tabItem, menuItems = [], title, key;

            this.toggleOverflowMenu(cmp, true);
            overflowData.hasOverflow = true;

            for (var i = startIndex; i < tabItems.length; i++) {
                tabItem = tabItems[i];
                key = this.getTabName(tabItem);
                if (!tabItem.get("v.active")) {
                    // Hide all overflowing tabs
                    title = tabItem.get("v.title");
                    tabCache[key] = i;
                    tabItem.set("v.hidden", true);
                    menuItems.push(this.createMenuItem(key, title, i));
                } else {
                    overflowData.visibleTabs.push({key: key, index: i});
                }
            }

            if (menuItems.length > 0) {
                cmp.find("overflowMenu").set("v.menuItems", menuItems);
            }
        }

        overflowData.tabCache = tabCache;
    },

    onResize: function(cmp) {
        var overflowData = this.getOverflowData(cmp);
        var barWidth = this.getBarWidth(cmp);
        if (barWidth > 0 && overflowData.barWidth !== barWidth) {
            var helper = this;
            requestAnimationFrame($A.getCallback(function () {
                if (cmp.isValid()) {
                    helper.adjustOverflow(cmp);
                }
            })
            );
        }
    },


    updateVisibleTabs: function(overflowData, tabItems, startIndex) {
        var visibleTabs = [];
        var tabItem, key;
        for (var i = 0; i < startIndex; i++) {
            tabItem = tabItems[i];
            key = this.getTabName(tabItem);
            visibleTabs.push({key: key, index: i});

            if (tabItem.get("v.hidden")) {
                tabItem.set("v.hidden", false);
            }
        }
        overflowData.visibleTabs = visibleTabs;
    },

    toggleOverflowMenu: function(cmp, visible) {
        var overflowMenu = cmp.find("overflowMenu");
        $A.util[visible ? 'removeClass' : 'addClass'](overflowMenu.getElement(), "hidden");
    },

    /**
     * Swaps the last tab with the tab at the specified index
     */
    updateOverflowTab: function(cmp, index) {
        var overflowData = this.getOverflowData(cmp),
            tabItems = cmp.get("v.tabHeaders"),
            tabCache = overflowData.tabCache,
            visibleTabs = overflowData.visibleTabs,
            targetIndex = visibleTabs[visibleTabs.length - 1].index,
            targetTab = tabItems[targetIndex],
            sourceTab = tabItems[index];

        if (index !== targetIndex) {
            var overflowMenu = cmp.find("overflowMenu");
            var menuList = overflowMenu.get("v.menuItems");
            var sourceTabName = this.getTabName(sourceTab);
            //remove the menu item to swap
            menuList = menuList.filter(function(menuItem) {
                return menuItem.id !== sourceTabName;
            });
            delete tabCache[sourceTabName];

            var tabs = this.findVisibleTabsToReplace(cmp, overflowData, sourceTab, targetTab);
            var tab;
            for (var i = 0; i < tabs.length; i++) {
                tab = tabs[i].tab;
                this.toggleTab(tab, true);
                this.insertMenuItem(cmp, tab, menuList);
                tabCache[this.getTabName(tab)] = tabs[i].index;
                visibleTabs.pop();
            }

            overflowMenu.set("v.menuItems", menuList);
            //show source tab
            this.toggleTab(sourceTab, false);
            visibleTabs.push({key: this.getTabName(sourceTab), index: index});
        }
    },

    findVisibleTabsToReplace: function(cmp, overflowData, sourceTab, targetTab) {
        var visibleTabs = overflowData.visibleTabs;
        var tabItems = cmp.get("v.tabHeaders");
        var availableWidth = this.getOuterWidth(targetTab.getElement()) + overflowData.extraWidth;
        var sourceWidth = this.getOuterWidth(sourceTab.getElement());
        var tabs = [];
        var targetTabIndex = visibleTabs.length - 1;
        var nextTab, index;

        tabs.push({tab: targetTab, index: visibleTabs[targetTabIndex].index});
        while (sourceWidth > availableWidth && targetTabIndex-- > 0) {
            index = visibleTabs[targetTabIndex].index;
            nextTab = tabItems[index];
            availableWidth += this.getOuterWidth(nextTab.getElement());
            tabs.push({tab: nextTab, index: index});
        }
        overflowData.extraWidth = availableWidth - sourceWidth;
        return tabs;
    },

    insertMenuItem: function(cmp, tabItem, menuList) {
        //insert tab into menuTab items in correct order
        var tabIndex = this.getTabIndex(cmp, tabItem.getElement());
        var insertIndex = 0;
        var len = menuList.length;
        while (insertIndex < len) {
            var index = menuList[insertIndex].value;
            if (index > tabIndex) {
                break;
            }
            insertIndex++;
        }

        menuList.splice(insertIndex, 0, this.createMenuItemFromTab(tabItem, tabIndex));
    },

    /**
     * Private helper methods
     */
    toggleTab : function(tab, condition) {
        if (condition === undefined) {
            condition = !tab.get("v.hidden");
        }

        tab.set("v.hidden", condition);
        $A.util.toggleClass(tab, "hidden", condition);
    },

    isInOverflow : function(cmp, key) {
        var overflowData = this.getOverflowData(cmp);
        return overflowData.tabCache[key] >= 0;
    },

    getTabName : function(tab) {
        return (tab.get("v.name") || tab.get("v.title")|| "").toLowerCase();
    },

    getOverflowData : function(cmp) {
        var data = cmp.get("v.overflowData");
        if(!data) {
            data = {};
            cmp.set("v.overflowData", data);
        }
        return data;
    },

    createMenuItemFromTab: function(tab, tabIndex) {
        var name = this.getTabName(tab);
        return this.createMenuItem(name, tab.get("v.title") || name, tabIndex);
    },

    createMenuItem : function(id, label, value) {
        return {id : id, label : label, value: value};
    }
})// eslint-disable-line semi
