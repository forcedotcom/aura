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
	generateItemTemplates: function(cmp) {
	    var itemTemplates = {
	            "ui:outputText": {
	                "componentDef": {
	                    descriptor: "markup://ui:outputText"
	                },
	                "attributes": {
	                    "values": {
	                        "class": "listItem",
	                        "value": $A.expressionService.create(null, "{!item.record.value}")
	                    }
	                }
	            },
	            
	            "ui:outputURL": {
	                "componentDef": {
	                    descriptor: "markup://ui:outputURL"
	                },
	                "attributes": {
	                    "values": {
	                        "class": "listItem",
	                        "value": $A.expressionService.create(null, "{!item.record.url}"),
	                        "label": $A.expressionService.create(null, "{!item.record.label}")
	                    }
	                }
	            }
	    };
	    
	    cmp.set("v.templateMap", itemTemplates);
	},
	
	getButtonTemplate: function(cmp) {
	    var buttonTemplate = cmp.get("v.buttonTemplate");
	    
	    if (!buttonTemplate) {
	        buttonTemplate = {
	                "ui:button": {
	                    "componentDef": {
	                        descriptor: "markup://ui:button"
	                    },
	                    "attributes": {
	                        "values": {
	                            "class": "listItem",
	                            "label": $A.expressionService.create(null, "{!item.record.label}")
	                        }
	                    }
	                }
	        };
	        
	        cmp.set("v.buttonTemplate", buttonTemplate);
	    }

	    return buttonTemplate;
	},
	
	initializeLists: function(cmp) {
	    var list = cmp.find("multiTemplate");
	    list.set("v.templateMap", cmp.get("v.templateMap"));
	    
	    this.refreshItems(cmp, "singleTemplate");
	    this.refreshItems(cmp, "multiTemplate");
	},
	
	generateItems: function(count, startIndex, isButton) {
	    var items = [];
	    
	    startIndex = startIndex || 0;
	    
	    for (var i = 0; i < count; i++) {
	        var key = (isButton ? 'ui:button' : 
	                    (((startIndex + i) % 3 === 0) ? 'ui:outputURL' : 'ui:outputText'));
	        
	        items.push({
	            record: {
	                id: startIndex + i,
	                type: ((startIndex + i) % 2 === 0) ? 'URL' : 'Text',
	                value: "Value " + (startIndex + i),
	                url: "http://www.google.com",
	                label: "Google " + (startIndex + i)
	            },
	            actions: {},
	            key: key
	        });
	    }
	    return items;
	},
	
	refreshItems: function(cmp, targetId) {
	    cmp.find(targetId).set("v.items", this.generateItems(10));
	},
	
	appendItems: function(cmp, targetId) {
	    var list = cmp.find(targetId);
	    list.appendItems(this.generateItems(10));
	},
	
	updateItem: function(cmp, index, targetId) {
	    var list = cmp.find(targetId);
	    var item = this.generateItems(1, 990, true)[0];
	    var buttonTemplate = this.getButtonTemplate(cmp);
	    
	    list.addTemplate('ui:button', buttonTemplate['ui:button']);
	    list.updateItem(item, index);
	}
})

