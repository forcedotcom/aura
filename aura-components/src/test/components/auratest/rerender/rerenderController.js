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
	locationChanged: function(cmp, event, helper) {
		var token = event.getParam("token");
		if(!token) {
			return;
		}

		var container = cmp.find("layoutTarget");
		var callback = function(newBody) {
			container.set("v.body", newBody);
		};
		switch(token) {
			case "def":
				//<auratest:rerenderChild aura:id="layoutItem" title="def layout item">
				$A.createComponent("auratest:rerenderChild", { "aura:id": "layoutItem", "title": "def layout item"}, callback);
				break;
			case "death":
				//<auratest:rerenderChild aura:id="layoutItem" title="death layout item"/>
				$A.createComponent("auratest:rerenderChild", { "aura:id": "layoutItem", "title": "death layout item"}, callback);
				break;
			case "empty":
				//<aura:unescapedHtml aura:id="layoutItem" value=""/>
				$A.createComponent("aura:unescapedHtml", { "aura:id": "layoutItem", "value":""}, callback);
				break;
		}
	},
	
	pushText : function(cmp) {
		var whichArray = cmp.get("v.whichArray");
		var array = cmp.get(whichArray);
		if (!array) {
			return;
		}

		$A.createComponent("aura:text", { value : "PUSHED." }, function(newcmp) {
			array.push(newcmp);
			cmp.set(whichArray, array);
		});
	},

	pushComponent : function(cmp) {
		var whichArray = cmp.get("v.whichArray");
		var array = cmp.get(whichArray);
		if (!array) {
			return;
		}

		$A.createComponent("auratest:rerenderChild", { title : new Date().getTime() }, function(newcmp) {
			array.push(newcmp);
			cmp.set(whichArray, array);
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
