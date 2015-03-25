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
    doInit : function(cmp) {
    	// Initialize input select options
        var opts = [
            { "class": "optionClass", label: "Option1", value: "opt1", selected: "true" },
            { "class": "optionClass", label: "Option2", value: "opt2" },
            { "class": "optionClass", label: "Option3", value: "opt3" }

        ];
        cmp.find("InputSelectDynamic").set("v.options", opts);
        
    },

	onSingleSelectChange: function(cmp, evt) {
         var selectCmp = cmp.find("InputSelectSingle");
         resultCmp = cmp.find("singleResult");
         resultCmp.set("v.value", selectCmp.get("v.value"));
	 },

	 onMultiSelectChange: function(cmp, evt) {
         var selectCmp = cmp.find("InputSelectMultiple");
         resultCmp = cmp.find("multiResult");
         resultCmp.set("v.value", selectCmp.get("v.value"));
	 },
	 
	 onChange: function(cmp, evt) {
		 var dynamicCmp = cmp.find("InputSelectDynamic");
		 resultCmp = cmp.find("dynamicResult");
		 resultCmp.set("v.value", dynamicCmp.get("v.value"));
	 }
	 
})
