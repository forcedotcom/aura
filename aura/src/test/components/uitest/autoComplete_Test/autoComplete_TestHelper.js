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
    handleInputChange: function(cmp, event, autoCompleteCmpName) {
    	var acCmp = cmp.find(autoCompleteCmpName);
        if (acCmp) {
            var matchEvt = acCmp.get("e.matchText");
            matchEvt.setParams({
                keyword: event.getParam("value")
            });
            matchEvt.fire();
        }
    },

    handleSelectOption: function(cmp, event, autoCompleteCmpName) {
    	var optionCmp = event.getParam("option");
    	var accCmp = cmp.find(autoCompleteCmpName);
        var input = accCmp.find("input");
        var list = accCmp.find("list");
        var value = "";

        if (optionCmp.isInstanceOf("uitest:autoComplete_CustomTemplate")) {
        	value = optionCmp.get("v.value");
        } else if (optionCmp.isInstanceOf("ui:autocompleteOption")) {
        	value = optionCmp.get("v.label");
        }
        input.set("v.value", value);
        list.set("v.visible", false);
    },

    handleMatchDone: function(cmp, event, autoCompleteCmpName) {
    	var input = cmp.find(autoCompleteCmpName + "MatchSize");
    	input.set("v.value", event.getParam("size"));
        console.log("For " + autoCompleteCmpName + " There are " + event.getParam("size") + " matched options.");
    },
    
    matchFuncShowAll: function(cmp, event, autoCompleteCmpName) {
        var autocomplete = cmp.find(autoCompleteCmpName);
        var list = autocomplete.find("list");
        var keyword = list.get("v.keyword");
        var items = list.get("v.items");
        for (var i = 0; i < items.length; i++) {
            items[i].keyword = keyword;
            items[i].visible = true;
        }
        list.set("v.items", items);
    },
    
    handleToggleAction: function(cmp, event, autoCompleteCmpName) {
		var autocomplete = cmp.find(autoCompleteCmpName);
		var list = autocomplete.find("list");
		if (list.get("v.visible")) {
			list.set("v.visible", false);
		} else {
			var matchEvt = autocomplete.get("e.inputChange");
			var params = {
				value : ""
			};
			matchEvt.setParams(params);
			matchEvt.fire();
		}
    }
})
