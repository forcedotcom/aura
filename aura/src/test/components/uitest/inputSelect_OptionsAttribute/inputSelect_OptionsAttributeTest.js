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
	 * Verify initial values are loaded correctly from model. 
	 */
	testInitialOptionSelected : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectOptions");
			var optionCmps = inputSelectCmp.find("options");
			this.verifySelectedOption(optionCmps, "Option2");
		}
	},
	
	/**
	 * Verify can change selected option to another option. 
	 */
	testChangeSelection : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectOptions");
			var optionCmps = inputSelectCmp.find("options");
			
			// deselect selected option
			var selectedOption = this.getSelectedOption(optionCmps);
			$A.test.assertFalse($A.util.isUndefinedOrNull(selectedOption),
				"Expected option to be selected");
			selectedOption.getAttributes().setValue("value", false);
			
			// select 1st option
			optionCmps[0].getAttributes().setValue("value", true);
			
			// fire change event;
			inputSelectCmp.get("e.change").fire();
			
			this.verifySelectedOption(optionCmps, "Option1");
		}
	},
	
	verifySelectedOption : function(options, selectedLabel) {
		var selectedOptionLabel = "None Selected";
		var selectedOption = this.getSelectedOption(options);
		if (!$A.util.isUndefinedOrNull(selectedOption)) {
			selectedOptionLabel = selectedOption.get("v.label");
		}
		$A.test.assertEquals(selectedLabel, selectedOptionLabel, 
			"Incorrect option selected");
	},
	
	getSelectedOption : function(options) {
		for (var i=0; i<options.length; i++) {
			if (options[i].get("v.value") === true) {
				return options[i];
			}
		}
		return null;
	}
})