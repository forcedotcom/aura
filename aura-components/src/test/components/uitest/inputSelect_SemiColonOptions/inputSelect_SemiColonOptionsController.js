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
   
	init : function(cmp) {
		var opts =[{ "label" : "1 ;", "value" : "1 ;", "class" : "option" },
		           { "label" : "2 ;;", "value" : "2 ;;", "class" : "option" },
		           { "label" : "; 3", "value" : "; 3", "class" : "option" },
		           { "label" : "4;4", "value" : "4;4", "class" : "option" },
		           { "label" : "5;;5;;5 i am special with different value", "value" : "5;;", "class" : "option" },
		           { "label" : ";;;", "value" : ";;;", "class" : "option", disabled: true }];
		
		var selectedIdx = 1;
		opts[selectedIdx].selected = true;
		
		cmp.find("inputSelectSemicolon").set("v.options", opts);
		
		
		//trigger first onselect change
		cmp.set("v.selectedValue", opts[selectedIdx].value);
	},
	onSelectChange : function(cmp, event, helper) {
	    var selected = cmp.find("inputSelectSemicolon").get("v.value");
	    cmp.set("v.selectedValue", selected);
	}
})