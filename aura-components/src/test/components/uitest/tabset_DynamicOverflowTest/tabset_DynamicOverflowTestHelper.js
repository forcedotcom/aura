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
	loadTabs: function(cmp, postFix) {
		var containerName = postFix == 1 ? "testTabContainer" : "testTabContainer"+postFix;
		var tabsetContainer = cmp.find(containerName);
        var numberOfTabs = cmp.get("v.numTabs");
        var maxItemWidth = cmp.get("v.headerWidth");
        var isCloseable = $A.util.getBooleanValue(cmp.get("v.isCloseable"));
        var isNested = $A.util.getBooleanValue(cmp.get("v.isNestedTabs"));
        
        var tabs = [];
        var nestedTabs = [];

        // create some tabs that will be nested
        if (isNested) {
        	for (var n=1; n <= numberOfTabs; n++) {
            	nestedTabs = {
            		"title": "nestedTitle " + n,
            		"closeable": isCloseable,
            		"body": [{
            			"componentDef": { descriptor:"markup://aura:text" },
                        "attributes": {
                            "values": {
                                "value": "nested content " + n
                            }
                        }
            		}]
            	}
            };
        };
        
        for (var i=1; i <= numberOfTabs; i++) {
            var tab = {
                //"title": "tabTitle " + i + (i % 2 ? " Long title here because i'm odd" : ""),
            	"title": "tabTitle " + i + (i % 4 ? "" : " Long title here because i'm odd"),
                "closable": isCloseable
            };
            
            // if test asks for nested tabs only set first two tabs with nested
            // tabs. Do not need every tab in tabset with nested tabset.
            if (isNested && (i == 1 || i == 2)) {
            	tab["body"] = [$A.createComponent("ui:tabset", {
                    "useOverflowMenu": true,
                    "lazyRenderTabs": true,
                    "tabItemMaxWidth": maxItemWidth,
                    "tabs": nestedTabs
                }, function(){})];
            } else {
            	tab["body"] = [{
                    "componentDef": { descriptor:"markup://aura:text" },
                    "attributes": {
                        "values": {
                            "value": "tab content " + i
                        }
                    }
                }];
            }
            tabs.push(tab);
        }
        
        // reset body
        tabsetContainer.set("v.body", []);
        
        // create tabs to test
        $A.createComponent("ui:tabset", {
        	"aura:id": "testTabSet",
            "useOverflowMenu": true,
            "lazyRenderTabs": false,
            "tabItemMaxWidth": maxItemWidth,
            "tabs": tabs
        }, function(tabset){
        	tabsetContainer.set("v.body", tabset);
        	tabsetContainer.getElement().style.display = "block";
        	cmp.find("dynamicTabControlls").getElement().style.display = "block";
        	cmp.find("testControlls").getElement().style.display = "block";
        });
	},
	
	addTab: function(cmp, containerName) {
		var index = cmp.get("v.indexAddRemove");
    	var title = cmp.get("v.titleOfAddTab");
    	var isCloseable = $A.util.getBooleanValue(cmp.get("v.isCloseable"));
    	index = $A.util.isUndefinedOrNull(index) ? 0 : index;
    	title = $A.util.isUndefinedOrNull(title) ? "Dynamic-"+(index+1) : title+(index+1);
    	
    	var addEvt = cmp.find(containerName).get("v.body")[0].get("e.addTab");
    	addEvt.setParams({
        	tab: {
	    	    "title": title,
	            "closable": isCloseable,
	            "active": true,
	            "body": [{
	                "componentDef": { descriptor:"markup://aura:text" },
	                "attributes": {
	                    "values": {
	                        "value": "Dynamic tab " + title + " added at index=" + index 
	                    }
	                }
	            }]},
            "index": index});
    	addEvt.fire();
	},
	
	removeTab: function(cmp, containerName) {
    	var index = cmp.get("v.indexAddRemove");
    	var removeEvt = cmp.find(containerName).get("v.body")[0].get("e.removeTab");
    	removeEvt.setParams({"index": index});
    	removeEvt.fire();
    },
    
    changeHeaderTitle: function(cmp, containerName) {
    	var newTitle = cmp.get("v.newHeaderTitle");
    	var newTitleIndex = cmp.get("v.newHeaderTitleIndex");
    	newTitle = $A.util.isUndefinedOrNull(newTitle) ? "" : newTitle;
    	newTitleIndex = $A.util.isUndefinedOrNull(newTitleIndex) ? 0 : newTitleIndex;
    	
    	var tabset = cmp.find(containerName).get("v.body")[0];
    	var tabs = tabset.get("v.tabs");
    	var tab = tabs[newTitleIndex];
    	tab.title = newTitle;
    	$A.rerender(tabset);
    },
    
    updateTargetContainer: function(cmp, inputName) {
    	var newTargetContainer = cmp.find(inputName).get("v.value");
    	cmp.set("v.targetContainer", newTargetContainer);
    }
})