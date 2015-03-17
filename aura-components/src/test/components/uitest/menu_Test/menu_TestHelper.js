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
	handleUpdateTriggerLabel: function(cmp, event,triggerId) {
		var triggerCmp = cmp.find(triggerId);
        if (triggerCmp) {
            var source = event.getSource();
            var label = source.get("v.label");
            triggerCmp.set("v.label", label);
        }
    },
    menuSelect: function(cmp, event,triggerId) {
    	var menuCmp = cmp.find(triggerId);
        var menuItems = menuCmp.get("v.childMenuItems");
        var values = [];
        for (var i = 0; i < menuItems.length; i++) {
            var c = menuItems[i];
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        var resultCmp = cmp.find(triggerId + "Result");
        resultCmp.set("v.value", values.join(","));
    }
})