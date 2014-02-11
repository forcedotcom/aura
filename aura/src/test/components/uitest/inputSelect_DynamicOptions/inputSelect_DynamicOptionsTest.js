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
	/**
	 * Verify initial values are loaded correctly.
	 */
	testInitialOptionSelected : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("dynamicSelect");
			var optionCmps = inputSelectCmp.find("options");
			this.verifySelectedOption(optionCmps, "Option2", this.optionComponentSelected);
		}
	},
	
	testInitialOptionSelectedDOM : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("dynamicSelect");
			var optionCmps = inputSelectCmp.find("options");
			this.verifySelectedOption(optionCmps, "Option2", this.optionDOMSelected);
		}
	},
	
	/**
	 * Verify dynamic value change
	 */
	testChangeSelectionDynamic : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("dynamicSelect");
			
			inputSelectCmp.setValue("v.value", "Option4");
			
			var optionCmps = inputSelectCmp.find("options");
			this.verifySelectedOption(optionCmps, "Option4", this.optionComponentSelected);
		}
	},
	
	testChangeSelectionDynamicDOM : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("dynamicSelect");
			
			inputSelectCmp.setValue("v.value", "Option4");
			
			var optionCmps = inputSelectCmp.find("options");
			this.verifySelectedOption(optionCmps, "Option4", this.optionDOMSelected);
		}
	},
	
	verifySelectedOption : function(options, selectedLabel, predicate) {
		var selectedOptionLabel = "None Selected";
		var selectedOption = this.getSelectedOption(options, predicate.match);
		if (!$A.util.isUndefinedOrNull(selectedOption)) {
			selectedOptionLabel = selectedOption.get("v.label");
		}
		$A.test.assertEquals(selectedLabel, selectedOptionLabel, 
			"Incorrect option selected; Comparing by \"" + predicate.description + "\".");
	},
	
	getSelectedOption : function(options, match) {
		for (var i=0; i<options.length; i++) {
			if (match(options[i]) === true) {
				return options[i];
			}
		}
		return null;
	},
	
	optionComponentSelected : { match: function(option) {
									return option.get("v.value");
								},
								description: "Match by Component" },
								
	optionDOMSelected : { match: function(option) {
							return option.getElement().selected;
							},
							description: "Match by DOM Element" }
})