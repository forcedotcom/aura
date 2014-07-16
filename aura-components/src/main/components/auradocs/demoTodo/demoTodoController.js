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
	clearDone : function(cmp){
		var items = cmp.get("m.items");
		for(var i = items.length-1; i >= 0; i--){
			if(items[i].selected===true){
				items.splice(i, 1);
			};
		};
		cmp.set("m.items", items);
	},

	createNewTodo : function(cmp, event){
		var keyCodeValue =  event.getParam("keyCode");
		if(keyCodeValue===13){
			var items = cmp.get("m.items");
			var input = cmp.find("newTodo");
			var text = input.get("v.value");
			var newTodo = {
					label: text,
					name: text,
					selected: false,
					value: text,
					disabled: false
			};
			items.push(newTodo);
			input.set("v.value", "");
			cmp.set("m.items", items);
		};
	},

	crossout : function(cmp, event){
		var elem = event.getSource().getElement();
		$A.util.toggleClass(elem, "done");
	}
})
