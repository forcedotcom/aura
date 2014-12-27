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
	pushText : function(cmp) {
		var whichArray = cmp.get("v.whichArray");
		var array = cmp.get(whichArray);
		if (!array) {
			return;
		}

		$A.componentService.newComponentAsync(this, function(newcmp) {
			array.push(newcmp);
			cmp.set(whichArray, array);
		}, {
			"componentDef" : {
				"descriptor" : "markup://aura:text"
			},

			"attributes" : {
				"values" : {
					"value" : "PUSHED."
				}
			}
		});
	},

	pushComponent : function(cmp) {
		var whichArray = cmp.get("v.whichArray");
		var array = cmp.get(whichArray);
		if (!array) {
			return;
		}

		$A.componentService.newComponentAsync(this, function(newcmp) {
			array.push(newcmp);
			cmp.set(whichArray, array);
		}, {
			"componentDef" : {
				"descriptor" : "markup://auratest:rerenderChild"
			},

			"attributes" : {
				"values" : {
					"title" : new Date().getTime()
				}
			}
		});
	},

	pop : function(cmp) {
		var whichArray = cmp.get("v.whichArray");
		var array = cmp.get(whichArray);
		if (!array) {
			return;
		}

		array.pop();
		cmp.set(whichArray, array);
	},

	reverse : function(cmp) {
		var whichArray = cmp.get("v.whichArray");
		var array = cmp.get(whichArray);
		if (!array) {
			return;
		}
		
		array.reverse();
		cmp.set(whichArray, array);
	},

	clear : function(cmp) {
		var whichArray = cmp.get("v.whichArray");
		if(!whichArray){
			return;
		}
		cmp.set(whichArray, []);
	}
})
