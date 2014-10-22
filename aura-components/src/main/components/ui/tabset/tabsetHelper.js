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
     setActive: function(cmp, option) {
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
            var e = cmp.find('tabBar').get('e.setActive');
            e.setParams({"index": index, "active": active, "focus": option.focus}).fire();
            // activate body
            this.setActiveTabBody(cmp, {"index":index, "active": active, "tab": tab});
            //fire tabset onActivate event
            cmp.get("e.onActivate").setParams({"tab": tab}).fire();
         }
    },
    /**
     * Add new tab
     * @param {Number} [index] The index of the new tab to insert to.
     * @param {Object} tab The configuration for the new tab. If the "componentDef" is not defined, "ui:tab" is used. 
     */
    addTab: function(cmp, index, tab, callback) {
    	var self = this, size = cmp._tabCollection.getSize();
    	if ($A.util.isUndefined(index) || index < 0 || index > size) {
    		index = size;
    	}
    	this.createTabComponent(cmp, tab, function(newTab) {
	    	// insert tab into current tab list
    	    cmp._tabCollection.insertTab(index, newTab);
    		// add tab into tabBar
    	    var active = newTab.get("v.active");
        	var e = cmp.find("tabBar").get("e.addTab");
        	e.setParams({"index": index, "active": active, "tab": self.getTabItemConfig(cmp, newTab)}).fire();
        	if (newTab.get("v.active")) {
        	    this.setActiveTabBody(cmp, {"index": index, "tab": newTab, "active": true});
        	}
        	if (typeof callback === "function") {
        	    callback({"tab": newTab});
        	}
    	});
    },
    /**
     * Remove tab
     * @param {Component} cmp 
     * @param {Integer} index Index position of tab to remove
     */
    removeTab: function(cmp, index) {
        var self = this, e = cmp.find('tabBar').get('e.closeTab');
        var callback = function(succeed) {
            if (succeed) {
                self.removeTabBody(cmp, index);
            }
        }
        e.setParams({"index": index, "callback": callback}).fire();
    },
    /**
     * Returns the active tab
     */
    getActiveTab: function(cmp) {
        return cmp._activeTab;
    },
    //=============================Private Functions==============================
    fireBeforeActiveEvent: function(cmp, params, target) {
        var activate = true;
        var target = target || cmp;
        var callback = function(doActivate) {
                activate = doActivate;
            }
        var tab = typeof params.index === "number" ? cmp._tabCollection.getTab(params.index) : params.tab;
        var oldTab = typeof params.oldTab === "number" ? cmp._tabCollection.getTab(params.oldTab) : params.oldTab;
        
        target.get("e.beforeActivate").setParams({"tab": tab, "oldTab": oldTab, "callback": callback}).fire();

        return activate;
    },
    /**
     * @private
     */
    getTabIndexFromEvent: function(cmp, evt) {
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
    setActiveTabBody: function(cmp, option) {
        // set active tab body;
        var tab = option.tab, evt;
  
        if (!tab.isRendered() && option.active) {
            // manually render tab component instead of setting v.body to avoid rerendering of all the tabs
            this.renderTabBody(cmp, tab);
        }
        if (option.active) {
            //deactivate current tabBody
            if (cmp._activeTab && cmp._activeTab.isValid()) {
                evt = cmp._activeTab.get("e.setActive");
                evt.setParams({"active": false}).fire();
            }
            //fire event to curent tab to update status 
            tab.get('e.setActive').setParams({active: true}).fire();
            //save current active tab
            cmp._activeTab = tab;
        } else if (option.active === false && cmp._activeTab === tab){
            //deactivate tab
            tab.get('e.setActive').setParams({active: false}).fire();
            cmp._activeTab = null;
        }
    },
    /**
     * @private
     */
    removeTabBody: function(cmp, index) {
        var activeIndex = cmp._tabCollection.getTabIndex({"tab": cmp._activeTab});
        cmp._tabCollection.removeTab(index);
    	var size = cmp._tabCollection.getSize();
    	if (size > 0 && index === activeIndex) {
    	    //activate next tab, or previous tabif the removed tab is the last one
    	    index = (index === size) ? --index : index % size;
    	    this.setActive(cmp, {"index": index});
    	}
    },
    /**
     * Initialize tabs
     * @private
     */
    initTabs: function(cmp) {
        var tabConfigs = cmp.get("v.tabs");
        cmp._tabCollection = this.createTabCollection();
        if (tabConfigs&&tabConfigs.length > 0) {
            this.createTabsFromAttribute(cmp, tabConfigs);
        } else {
            //iterate v.body to find instances of ui:tab
            var result = this.getTabsFromBody(cmp);
            cmp._activeTabIndex = result.activeIndex;
            cmp._tabCollection.init(result.tabs, result.tabIds, result.tabNames);
            cmp.set('v.tabItems', result.tabItemConfigs, true);
        }
    },
    
    /**
     * @private
     */
    createTabsFromAttribute: function(cmp, tabConfigs) {
      //construct tabs from pass-in tab objects
        var tabComponents = [], tabIds = [], tabItems = [], tabNames = [], activeIndex = 0, 
            lazyRendering = cmp.get("v.lazyRenderTabs"),
            count = 0, total = tabConfigs.length - 1;
        
        var callback = function(newTab) {
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
        }
        for (var i=0; i<tabConfigs.length; i++) {
            this.createTabComponent(cmp, tabConfigs[i], callback);
        }
    },
    /**
     * @private
     */
    getTabsFromBody: function(cmp) {
    	var tabs = [], tabIds = [], tabItemConfigs =[], tabNames = [],
    	    //default active tab to first tab
    	    activeTab = 0;
    	
    	// get all instances of ui:tab in the body
    	tabCmps = this.getTabComponents(cmp.getConcreteComponent().get('v.body'));
    	for (var i=0, len=tabCmps.length; i<len; i++) {
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
    	
    	return {"tabs": tabs, "tabIds": tabIds, "activeIndex": activeTab, "tabItemConfigs": tabItemConfigs, "tabNames": tabNames};
    },
    /**
     * @private
     */
    createTabComponent: function(cmp, tabConfig, callback, async) {
        var cd, config;
        if (!$A.util.isObject(tabConfig)) {
            return;
        }
        if (tabConfig.componentDef) {
            cd = tabConfig.componentDef;
            delete tabConfig.componentDef;
        } else {
            cd = this.CONSTANTS.TAB_DEF;
        }
        if (!tabConfig.body) {
            tabConfig.body = [];
        }
        config = {"componentDef": cd, attributes: {values: tabConfig}};
        $A.componentService.newComponentAsync(this, callback, config);
    },
    /**
     * @private
     * Get configurations for ui:tabbar to construct tabItems
     * @param {Object} tab ui:tab component
     */
    getTabItemConfig: function(cmp, tab) {
    	var config={}, values = {},
    		compService = $A.componentService,
    		tabItemDef = this.CONSTANTS.TAB_ITEM_DEF;
    	
    		// Iterate all the attributes ui:tabItem and find the values in ui:tab component
    		var attrDefs = compService.getDef(tabItemDef).getAttributeDefs();
    		attrDefs.each(function(def){
    			var name = def.getDescriptor().getName();
    			//don't want to pass the body to tabItems
    			if (name != "body") {
                    values[name] = tab.get("v." + name);
    			}
    		});
    		values["ariaControlId"] = tab.getGlobalId();
    		config["attributes"] = {"values": values};
    		config["componentDef"] = tabItemDef;
    	 
    	return config;
    },

    /**
     * @private
     */
    getTabComponents: function(body) {
        var type = "ui:tab";
        var ret = [];
        if (!body) {
            return ret;
        }
        for(var i=0;i<body.length;i++) {
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
    _getTabComponent: function(cmp, type) {
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
    _getSuperest: function(cmp) {
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
    /**
     * Render tab component to tabContainer
     * @private
     */
    renderTabBody: function(cmp, tabComponent) {
//JBUCH: HALO: TODO: WHY CAN'T THIS WHOLE METHOD JUST BE:
//cmp.find("tabContainer").set("v.body",tabComponent);
//???
    	var container = cmp.find("tabContainer").getElement(),
    		docFrag = document.createDocumentFragment();

    	$A.render(tabComponent, docFrag);
		$A.afterRender(tabComponent);
		container.appendChild(docFrag);
     },
     /**
     * Clean up
     * @private
     */
     unrender: function(cmp) {
    	 cmp._tabCollection.destroy();
    	 delete cmp._tabCollection;
     },
     /**
      * Returns an object that wraps the a collection of tabs.
      * @private
      */
     createTabCollection: function() {
         var TabCollection = function(){
             this.tabComponents = [];
             this.tabIds = [];
             this.tabNames = [];
         };
         TabCollection.prototype = {
             init: function(tabs, tabIds, tabNames) {
                 this.tabComponents = tabs;
                 this.tabIds = tabIds;
                 this.tabNames = tabNames;
             },
             getTabIndex: function(option) {
                 var index = -1;
                 if (option.name) {
                     var name = this.tabNames[option.name];
                     if (name) {
                         index = $A.util.arrayIndexOf(this.tabIds, name.tabId);
                     }
                 } else if ($A.util.isComponent(option.tab)) {
                     var gId = option.tab.getGlobalId();
                     index = $A.util.arrayIndexOf(this.tabIds, gId);
                 }
                 return index;
             },
             getTab: function(index){
                 var tab = null;
                 if (index >= 0  && index < this.getSize()) {
                     tab = this.tabComponents[this.tabIds[index]];
                 }
                 return tab;
             },
             removeTab: function(index) {
                 var total = this.tabIds.length;
                 if ($A.util.isNumber(index) && index >=0 && index < this.tabIds.length) {
                     var id = this.tabIds.splice(index, 1);
                     var tab = this.tabComponents[id[0]];
                     tab.destroy(true);
                 }
             },
             insertTab: function(index, tab) {
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
             getSize: function() {
                 return this.tabIds.length;
             },
             destroy: function() {
                 var tabs = this.tabComponents;
                 for (var id in tabs) {
                     if (tabs.hasOwnProperty(id)) {
                         tabs[id].destroy(true);
                     }
                 }
                 this.tabIds = null;
                 this.tabComponents = null;
             }
         }
         return new TabCollection();
     },
     
     CONSTANTS: {
         TAB_DEF : "markup://ui:tab",
         TAB_ITEM_DEF : "markup://ui:tabItem"
     }
})
