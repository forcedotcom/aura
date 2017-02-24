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
    /**
     * Set tab as active or deactive
     * @param {Component} cmp An instance of ui:tabset componen.
     * @param {Number} index Index position of the tab to activate.
     */
    setActive: function (cmp, option) {
        var active = option.active;
        var index = option.index;
        var tab = option.tab;
        if (typeof active === "undefined") {
            //default to true
            active = true;
        }
        if (!tab) {
            tab = cmp._tabCollection.getTab(index);
        }
        if (tab && this.fireBeforeActiveEvent(cmp, {"tab": tab, "oldTab": this.getActiveTab(cmp)}, tab)) {
            // set active tabItem
            cmp.find("tabBar").get("e.setActive").setComponentEvent().fire({
                "index": index,
                "active": active,
                "focus": option.focus
            });
            // activate body
            this.setActiveTabBody(cmp, {"index": index, "active": active, "tab": tab});
            //fire tabset onActivate event
            cmp.get("e.onActivate").setComponentEvent().fire({"tab": tab, "index": option.index});
        }
    },
    /**
     * Add new tab
     * @param {Number} [index] The index of the new tab to insert to.
     * @param {Object} tab The configuration for the new tab. If the "componentDef" is not defined, "ui:tab" is used.
     */
    addTab: function (cmp, index, tab, callback, name) {
        var size = cmp._tabCollection.getSize();
        if ($A.util.isUndefined(index) || index < 0 || index > size) {
            index = size;
        }
        this.createTabComponent(cmp, tab, function (newTab) {
            // insert tab into current tab list
            cmp._tabCollection.insertTab(index, newTab);
            // add tab into tabBar
            var active = newTab.get("v.active");
            var e = cmp.find("tabBar").get("e.addTab");
            e.setParams({
                "index": index,
                "active": active,
                "name": name,
                "tab": this.getTabItemConfig(cmp, newTab)
            }).setComponentEvent().fire();
            if (newTab.get("v.active")) {
                this.setActiveTabBody(cmp, {"index": index, "tab": newTab, "active": true});
            }
            if ($A.util.isFunction(callback)) {
                callback({"tab": newTab});
            }
        }.bind(this));
    },
    /**
     * Update existing tab
     * @param {Number} [index] The index of the existing tab to update.
     * @param {Object} [tab] The configuration for the updated tab
     */
    updateTab: function (cmp, index, tab, callback, name) {
        var e = cmp.find("tabBar").get("e.updateTab");
        e.setParams({
            "index": index,
            "name": name,
            "tab": tab
        }).setComponentEvent().fire();

        //Prioritize finding a tab by name rather than index
        var tabIndex = name ? cmp._tabCollection.getTabIndex({name: name}) : index,
            existingTab = cmp._tabCollection.getTab(tabIndex);

        if(existingTab && tab.body) {
            existingTab.set("v.body", tab.body);
        }

        if($A.util.isFunction(callback)) {
            callback({"tab": existingTab});
        }
    },
    /**
     * Remove tab
     * @param {Component} cmp
     * @param {Integer} index Index position of tab to remove
     */
    removeTab: function (cmp, index) {
        var self = this, e = cmp.find('tabBar').get('e.closeTab');
        var callback = function (succeed) {
            if (succeed) {
                self.removeTabBody(cmp, index);
            }
        };
        e.setParams({"index": index, "callback": callback}).setComponentEvent().fire();
    },
    /**
     * Returns the active tab
     */
    getActiveTab: function (cmp) {
        return cmp._activeTab;
    },
    //=============================Private Functions==============================
    fireBeforeActiveEvent: function (cmp, params, target) {
        var activate = true;
        target = target || cmp;
        var callback = function (doActivate) {
            activate = doActivate;
        };
        var tab = typeof params.index === "number" ? cmp._tabCollection.getTab(params.index) : params.tab;
        var oldTab = typeof params.oldTab === "number" ? cmp._tabCollection.getTab(params.oldTab) : params.oldTab;

        target.get("e.beforeActivate").setComponentEvent().fire({"tab": tab, "oldTab": oldTab, "callback": callback});

        return activate;
    },
    /**
     * @private
     */
    getTabIndexFromEvent: function (cmp, evt) {
        var index = evt.getParam("index"), name = evt.getParam("name"), tab = evt.getParam("tab");
        //work around bug where Integer type param passed in as string
        if ($A.util.isString(index)) {
            index = parseInt(index);
        } else if (!$A.util.isNumber(index)) {
            index = cmp._tabCollection.getTabIndex({"name": name, "tab": tab});
        }
        return index;
    },
    /**
     * @private
     */
    setActiveTabBody: function (cmp, option) {
        var tab = option.tab;

        var isActiveTab = cmp._activeTab === tab;

        if (option.active && !isActiveTab) {
            //deactivate current tabBody
            if (cmp._activeTab && cmp._activeTab.isValid()) {
                cmp._activeTab.get("e.setActive").setComponentEvent().fire({"active": false});
            }

            //fire event to curent tab to update status
            tab.get("e.setActive").setComponentEvent().fire({"active": true});

            if (!tab.isRendered()) {
                var renderedTabs = cmp.get("v.body");
                renderedTabs.push(tab);
                cmp.set("v.body", renderedTabs);
            }

            //save current active tab
            cmp._activeTab = tab;
        } else if (option.active === false && isActiveTab) {
            //deactivate tab
            tab.get("e.setActive").setComponentEvent().fire({"active": false});
            cmp._activeTab = null;
        }
    },
    /**
     * @private
     */
    removeTabBody: function (cmp, index) {
        var tabToRemove = cmp._tabCollection.getTab(index);
        var tabName = tabToRemove&&tabToRemove.get("v.name");
        var activeIndex = cmp._tabCollection.getTabIndex({"tab": cmp._activeTab});
        cmp._tabCollection.removeTab(index);
        var size = cmp._tabCollection.getSize();
        if (size > 0 && index === activeIndex) {
            //activate next tab, or previous tabif the removed tab is the last one
            index = (index === size) ? --index : index % size;
            this.setActive(cmp, {"index": index});
        }
        // Fire remove event if the tab is removed via the removeTab event or if the tab is closed
        if (tabToRemove) {
            var attrs = { "index": index };
            if (tabName) {
                attrs["name"] = tabName;
            }
            cmp.get("e.onRemove").setComponentEvent().fire(attrs);
        }
    },
    /**
     * Initialize tabs
     * @private
     */
    initTabs: function (cmp) {
        var tabConfigs = cmp.get("v.tabs");
        cmp._tabCollection = this.createTabCollection();
        if (tabConfigs && tabConfigs.length > 0) {
            this.createTabsFromAttribute(cmp, tabConfigs);
        } else {
            this.getTabsFromBody(cmp);
        }
        if ($A.util.getBooleanValue(cmp.get("v.lazyRenderTabs"))) {
            cmp.set("v.body", []);
        }
    },

    finishInit: function (cmp, result) {
        cmp._activeTabIndex = result.activeIndex;
        cmp._tabCollection.init(result.tabs, result.tabIds, result.tabNames);
        cmp.set('v.tabItems', result.tabItemConfigs, true);
    },

    /**
     * @private
     */
    createTabsFromAttribute: function (cmp, tabConfigs) {
        //construct tabs from pass-in tab objects
        var tabComponents = [], tabIds = [], tabItems = [], tabNames = [], activeIndex = 0,
            lazyRendering = $A.util.getBooleanValue(cmp.get("v.lazyRenderTabs")),
            count = 0, total = tabConfigs.length - 1;

        var callback = function (newTab) {
            var id = newTab.getGlobalId(),
                name = newTab.get("v.name");

            tabIds.push(id);
            tabComponents[id] = newTab;
            tabItems.push(this.getTabItemConfig(cmp, newTab));
            if (name) {
                tabNames[name] = {"tabId": id};
            }
            if (newTab.get("v.active")) {
                activeIndex = count;
            }
            if (count === total) {
                cmp._activeTabIndex = activeIndex;
                cmp._tabCollection.init(tabComponents, tabIds, tabNames);
                cmp.set('v.tabItems', tabItems);
                if (!lazyRendering) {
                    cmp.set('v.body', tabComponents);
                }
            }
            count++;
        }.bind(this);
        for (var i = 0; i < tabConfigs.length; i++) {
            this.createTabComponent(cmp, tabConfigs[i], callback);
        }
    },
    /**
     * @private
     */
    getTabsFromBody: function (cmp) {
        var tabs = [], tabIds = [], tabItemConfigs = [], tabNames = [],
        //default active tab to first tab
            activeTab = 0;
        var i, len;

        // get all instances of ui:tab in the body
        var body = cmp.getConcreteComponent().get('v.body');
        for (i = 0; i < body.length; i++) {
            if (body[i].isInstanceOf("aura:iteration")) {
                if (!$A.util.getBooleanValue(body[i].get("v.loaded"))) {
                    body[i].addHandler("iterationComplete", cmp, "{!c.onInit}");
                    return;
                }
            }
        }
        var tabCmps = this.getTabComponents(body);
        for (i = 0, len = tabCmps.length; i < len; i++) {
            var tab = tabCmps[i],
                id = tab.getGlobalId(),
                name = tab.get("v.name");

            if (tab.get('v.active')) {
                activeTab = i;
            }
            if (name) {
                tabNames[name] = {"tabId": id, "index": i};
            }
            tabIds.push(id);
            tabItemConfigs.push(this.getTabItemConfig(cmp, tab));
            tabs[id] = tab;
        }

        this.finishInit(cmp, {
            "tabs": tabs,
            "tabIds": tabIds,
            "activeIndex": activeTab,
            "tabItemConfigs": tabItemConfigs,
            "tabNames": tabNames
        });
    },
    /**
     * @private
     */
    createTabComponent: function (cmp, tabConfig, callback) {
        var cd, config;
        if (!$A.util.isObject(tabConfig)) {
            return;
        }
        if (tabConfig.componentDef || tabConfig.descriptor) {
            cd = tabConfig.componentDef || tabConfig.descriptor;
        } else {
            cd = this.CONSTANTS.TAB_DEF;
        }
        if (!tabConfig.body) {
            tabConfig.body = [];
        }
        config = {"descriptor": cd, attributes: tabConfig};
        var tab = $A.createComponentFromConfig(config);
        callback(tab);
    },
    /**
     * @private
     * Get configurations for ui:tabbar to construct tabItems
     * @param {Object} tab ui:tab component
     */
    getTabItemConfig: function (cmp, tab) {
        var config = {}, values = {},
            compService = $A.componentService,
            tabItemDef = this.CONSTANTS.TAB_ITEM_DEF;

        // Iterate all the attributes ui:tabItem and find the values in ui:tab component
        var attrDefs = compService.getDef(tabItemDef).getAttributeDefs();
        attrDefs.each(function (def) {
            var name = def.getDescriptor().getName();
            //don't want to pass the body to tabItems
            if (name !== "body") {
                values[name] = tab.getReference("v." + name);
            }
        });

        if (!tab.get("v.ariaControlId")){
            tab.set("v.ariaControlId",tab.getGlobalId());
        }

        config.localId = 'tabItem';
        config.attributes = values;
        config.descriptor = tabItemDef;
        config.valueProvider = cmp;

        return config;
    },

    /**
     * @private
     */
    getTabComponents: function (body) {
        var type = "ui:tab";
        var ret = [];
        if (!body) {
            return ret;
        }
        for (var i = 0; i < body.length; i++) {
            var c = body[i];
            var inst = this._getTabComponent(c, type);
            if (inst) {
                ret.push(inst);
            } else {
                ret = ret.concat(this.getTabComponents(this._getSuperest(c).get('v.body')));
            }
        }
        return ret;
    },
    _getTabComponent: function (cmp, type) {
        if (cmp.isInstanceOf(type)) {
            return cmp;
        } else {
            var s = cmp.getSuper();
            if (s) {
                return this._getTabComponent(s, type);
            } else {
                return null;
            }
        }
    },
    _getSuperest: function (cmp) {
        var s = cmp.getSuper();
        if (s) {
            var ancestor = this._getSuperest(s);
            if (ancestor) {
                return ancestor;
            }
            return s;
        } else {
            return cmp;
        }
    },
    handleDestroy: function (cmp) {
        cmp._tabCollection.destroy();
        cmp._tabCollection = [];
    },
    /**
     * Returns an object that wraps the a collection of tabs.
     * @private
     */
    createTabCollection: function () {
        var TabCollection = function () {
            this.tabComponents = [];
            this.tabIds = [];
            this.tabNames = [];
        };
        TabCollection.prototype = {
            init: function (tabs, tabIds, tabNames) {
                this.tabComponents = tabs;
                this.tabIds = tabIds;
                this.tabNames = tabNames;
            },
            getTabIndex: function (option) {
                var index = -1;
                if (option.name) {
                    var name = this.tabNames[option.name];
                    if (name) {
                        index = this.tabIds.indexOf(name.tabId);
                    }
                } else if ($A.util.isComponent(option.tab)) {
                    var gId = option.tab.getGlobalId();
                    index = this.tabIds.indexOf(gId);
                }
                return index;
            },
            getTab: function (index) {
                var tab = null;
                if (index >= 0 && index < this.getSize()) {
                    tab = this.tabComponents[this.tabIds[index]];
                }
                return tab;
            },
            removeTab: function (index) {
                if ($A.util.isNumber(index) && index >= 0 && index < this.tabIds.length) {
                    var id = this.tabIds.splice(index, 1);
                    this.tabComponents[id[0]].destroy();
                    delete this.tabComponents[id[0]];
                }
            },
            insertTab: function (index, tab) {
                if ($A.util.isComponent(tab)) {
                    var id = tab.getGlobalId(),
                        name = tab.get("v.name");

                    if (name) {
                        this.tabNames[name] = {"tabId": id};
                    }
                    this.tabIds.splice(index, 0, id);
                    this.tabComponents[id] = tab;
                }
            },
            getSize: function () {
                return this.tabIds.length;
            },
            destroy: function () {
                var tabs = this.tabComponents;
                for (var id in tabs) {
                    if (tabs.hasOwnProperty(id)) {
                        tabs[id].destroy();
                    }
                }
                this.tabIds = null;
                this.tabComponents = null;
            }
        };
        return new TabCollection();
    },

    CONSTANTS: {
        TAB_DEF: "markup://ui:tab",
        TAB_ITEM_DEF: "markup://ui:tabItem"
    }
})// eslint-disable-line semi
