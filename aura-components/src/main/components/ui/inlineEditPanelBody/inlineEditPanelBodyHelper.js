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
	submit : function(cmp) {
		var values = {};
		var updateMap = cmp.get("v.updateMap");
		if (updateMap) {
			// Construct the map of name : updated input values
			for (var name in updateMap) {
				var value = cmp.get("v.inputComponent")[0].get("v." + updateMap[name]);
				this.updateValueMap(values, name, value);
			}
		}

		cmp.get("e.submit").setParams({
			payload : {
				index : cmp.get("v.index"),
				values : values
			}
		}).fire();
	},
	
	updateValueMap : function(inputMap, name, value) {
		var keys = name.split(".");
		var map = inputMap;
		
		// In case the name is in dot notation (ex. record.Account.Name), we need to create nested mappings
		for (var i = 0; i < keys.length - 1; i++) {
			var key = keys[i];
			map[key] = map[key] || {};
			map = map[key];
		}
		map[keys[keys.length - 1]] = value;
	}
})// eslint-disable-line semi