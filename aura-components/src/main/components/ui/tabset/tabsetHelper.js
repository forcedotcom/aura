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
    CONSTANTS: {
    	TAB_DEF : "markup://ui:tab",
    	TAB_ITEM_DEF : "markup://ui:tabItem"
    },
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
         if (tab) {
            // set active tabItem
            var e = cmp.find('tabBar').get('e.setActive');
            e.setParams({"index": index, "active": active}).fire();
            // activate body
            this.setActiveTabBody(cmp, {"index":index, "active": active, "tab": tab});
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
        	    this.setActiveTabBody(cmp, {"tab": newTab, "active": true});
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
        var tabList = cmp._tabCollection, tab = option.tab, evt, 
            activeTab = tabList.getActiveTab();
  
        if (!tab.isRendered() && option.active) {
            // manually render tab component instead of setting v.body to avoid rerendering of all the tabs
            this.renderTabBody(cmp, tab);
        }
        if (option.active) {
            //deactivate current tabBody
            if (cmp._activeTab && cmp._activeTab.isValid()) {
                evt = cmp._activeTab.get("e.setActive");
                evt.setParams({"active": false}).fire();
                cmp._activeTab = null;
            }
            //fire event to curent tab to update status 
            tab.get('e.setActive').setParams({active: true}).fire();
            //save current active tab
            cmp._activeTab = tab;
        } else if (cmp._activeTab === tab){
            //deactivate tab
            tab.get('e.setActive').setParams({active: false}).fire();
            cmp._activeTab = null;
        }
    },
    /**
     * @private
     */
    removeTabBody: function(cmp, index) {
    	cmp._tabCollection.removeTab(index);
    },
    /**
     * Initialize tabs
     * @private
     */
    initTabs: function(cmp) {
        var tabComponents = [], tabIds = [], tabItems = [];
        var tabConfigs = cmp.get("v.tabs");
        cmp._tabCollection = this.createTabCollection();
        if (tabConfigs.length > 0) {
            this.createTabsFromAttribute(cmp, tabConfigs);
        } else {
            //iterate v.body to find instances of ui:tab
            var result = this.getTabsFromBody(cmp);
            cmp._tabCollection.init(result.tabs, result.tabIds, result.tabNames, result.activeIndex);
            cmp.set('v.tabItems', result.tabItemConfigs);
        }
    },
    
    /**
     * @private
     */
    createTabsFromAttribute: function(cmp, tabConfigs) {
      //construct tabs from pass-in tab objects
        var tabComponents = [], tabIds = [], tabItems = [], tabNames = [], activeIndex = 0, 
            lazyRendering = cmp.get("v.lazyRenderTabs"),
            count = tabConfigs.length;
        
        var callback = function(newTab) {
            var id = newTab.getGlobalId(),
                name = newTab.get("v.name");
            
            count--;
            tabIds.push(id);
            tabComponents[id] = newTab;
            tabItems.push(this.getTabItemConfig(cmp, newTab));
            if (name) {
                tabNames[name] = {"tabId": id};
            }
            if (count === 0) {
                cmp._tabCollection.init(tabComponents, tabIds, tabNames, activeIndex);
                cmp.set('v.tabItems', tabItems);
                if (!lazyRendering) {
                    cmp.set('v.body', tabComponents);
                }
            }
        }
        for (var i=0; i<tabConfigs.length; i++) {
            this.createTabComponent(cmp, tabConfigs[i], callback);
        }
    },
    /**
     * @private
     */
    getTabsFromBody: function(cmp) {
    	var tabCmps = [], tabs = [], tabIds = [], tabItemConfigs =[], tabNames = [], 
    	    //default active tab to first tab
    	    activeTab = 0;
    	
    	// get all instances of ui:tab in the body
    	tabCmps = this.getTabComponents(cmp.get('v.body'));
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
    	var self = this, config={}, values = {},
    		compService = $A.componentService,
    		tabItemDef = this.CONSTANTS.TAB_ITEM_DEF;
    	
    		// Iterate all the attributes ui:tabItem and find the values in ui:tab component
    		var attrDefs = compService.getDef(tabItemDef).getAttributeDefs();
    		attrDefs.each(function(def){
    			var name = def.getDescriptor().getName();
    			//don't want to pass the body to tabItems
    			if (name != "body") {
    			    values[name] = self.findValue(tab, "v." + name);
    			}
    		});
    		values["ariaControlId"] = tab.getGlobalId();
    		config["attributes"] = {"values": values};
    		config["componentDef"] = tabItemDef;
    	 
    	return config;
    },
    /**
     * Find the attribute value in the given component
     * @private
     */
    findValue: function(cmp, expression) {
	    var zuper = cmp , value = null;
	    while(zuper){
	        value = zuper.get(expression);
	        if(!$A.util.isEmpty(value)) {
	            return value;
	        }
	        zuper = zuper.getSuper();
	    }
	    return value;
    },
    /**
     * @private
     */
    getTabComponents: function(body) {
        var desc = "ui:tab";
        var ret = [];
        for(var i=0;i<body.length;i++) {
            var c = body[i];
            if (c.isInstanceOf(desc)) {
                ret.push(c);
            } else if (c.isInstanceOf("aura:iteration")) {
                ret = ret.concat(this.getTabComponents(c.get('v.realBody')));
            } else {
                var result = c.find({instancesOf: desc});
                //In some use cases, only parent component contains instances of ui:tab or subclass of ui:tab
                //need to manually traverse to the top and find them
                var s = c.getSuper(); 
                if ($A.util.isEmpty(result) && s) {
                    do {                        
                        result = s.find({instancesOf: desc});
                        s = s.getSuper();
                    } while (s && !s.isInstanceOf(desc) && $A.util.isEmpty(result))
                }
                ret = ret.concat(result);
            }
        }
        return ret;
    },
    /**
     * Render tab component to tabContainer
     * @private
     */
    renderTabBody: function(cmp, tabComponent) {
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
             this.activeIndex = 0;
         };
         TabCollection.prototype = {
             init: function(tabs, tabIds, tabNames, activeIndex) {
                 this.tabComponents = tabs;
                 this.tabIds = tabIds;
                 this.tabNames = tabNames;
                 this.activeIndex = activeIndex;
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
                     if (this.tabComponents[gId]) {
                         index = this.tabComponents[gId].index;
                     }
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
                     if (tab.get("v.active")) {
                         this.activeIndex = index;
                     }
                 }
             },
             setActiveTabIndex: function(index) {
                 this.activeTabIndex = index;
             },
             getActiveTabIndex: function() {
                 return this.activeIndex;
             },
             getActiveTab: function() {
                 return this.tabIds[this.activeIndex];
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
     }
})
