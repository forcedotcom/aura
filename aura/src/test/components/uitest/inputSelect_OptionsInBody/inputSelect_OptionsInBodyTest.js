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
	 * Verify initial values are loaded correctly for single select inputSelect. 
	 */
	testSingleSelectInitialOption : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectSingle");
			this.verifySelectedOptions(inputSelectCmp, "Lion");
		}
	},
	
	/**
	 * Verify inputSelect option is disabled.
	 */
	testOptionDisabled : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectSingle");
			var optionCmps = this.getOptions(inputSelectCmp);
			$A.test.assertTrue(optionCmps[6].get("v.disabled"), 
				"Option '" + optionCmps[6].get("v.Text") + "' should be disabled");
		}
	},
	
	/**
	 * Verify can change selected option to another option. 
	 */
	testChangeSelection : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectSingle");
			
			this.changeSelection(inputSelectCmp, "Bear");
			this.verifySelectedOptions(inputSelectCmp, "Bear");
			
			this.changeSelection(inputSelectCmp, "Dragonfly");
			this.verifySelectedOptions(inputSelectCmp, "Dragonfly");
		}
	},
	
	/**
	 * Verify initial values are loaded correctly for multi-select inputSelect. 
	 */
	testMultiSelectInitialOption : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectMultiple");
			this.verifySelectedOptions(inputSelectCmp, ["Lion","Bear"]);
		}
	},
	
	/**
	 * On multi-select change only one of the selected options.
	 */
	testChangeSelectionForMultiSelectOneOptionChanged : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectMultiple");
			
			// Lion and Bear are selected. Keep Bear selected, then
			// select Ant and Dragonfly
			this.changeSelection(inputSelectCmp, ["Emmet", "Dragonfly"], "Bear");
			this.verifySelectedOptions(inputSelectCmp, ["Bear", "Emmet", "Dragonfly"]);
		}
	},
	
	/**
	 * On multi-select change all of the selected options to new ones.
	 */
	testChangeSelectionForMultiSelectAllOptionsChanged : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectMultiple");
			
			// Lion and Bear are selected. Deslect selected, then  
			// select Dragonfly and Tiger
			this.changeSelection(inputSelectCmp, ["Dragonfly", "Tiger"]);
			this.verifySelectedOptions(inputSelectCmp, ["Dragonfly", "Tiger"]);
		}
	},
	
	/**
	 * On multi-select change selection to a single option selected.
	 */
	testChangeSelectionForMultiSelectSingleOptionSelected : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectMultiple");
			
			// Lion and Bear are selected. Deselect selected, then
			// select Butterfly
			this.changeSelection(inputSelectCmp, "Butterfly");
			this.verifySelectedOptions(inputSelectCmp, "Butterfly");
		}
	},
	
	/**
	 * On multi-select deselect all options.
	 */
	testDeselectAllOptionsForMultiSelect : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("InputSelectMultiple");
			
			// Lion and Bear are selected. Deselect all
			this.changeSelection(inputSelectCmp, []);
			this.verifySelectedOptions(inputSelectCmp, []);
		}
	},
	
	changeSelection : function(inputSelectCmp, newOptionsText, doNotDeselectTheseOptions) {
		var optionCmps = this.getOptions(inputSelectCmp);
		
		// de-select option(s)
		var selectedOptions = this.getSelectedOptions(optionCmps);
		for (var i=0; i<selectedOptions.length; i++) {
			// dont have any options that should be ignored for deselect so 
			// go ahead and deselect
			if ($A.util.isUndefinedOrNull(doNotDeselectTheseOptions)){
				selectedOptions[i].getAttributes().setValue("value", false);
			} else {
			// there are some options that should not be deselected
				// if this selected option is NOT in 
				// doNotDeselectTheseOptions list deselect
				if (!this.isOptionRestricted(selectedOptions[i], doNotDeselectTheseOptions)) {
					selectedOptions[i].getAttributes().setValue("value", false);
				}
			}
		}
			
		// select new option(s)
		if (!(newOptionsText instanceof Array)) {
			newOptionsText = [newOptionsText];
		}
		// for all options that need to be selected find it in list of all
		// options in select then select it
		for (var j=0; j<newOptionsText.length; j++) {
			// going through all options in select 
			for (var k=0; k<optionCmps.length; k++) {
				if (newOptionsText[j] == optionCmps[k].get("v.text")) {
					// found new option to seleact in list of all options so select
					optionCmps[k].getAttributes().setValue("value", true);
					break;
				}
			}
		}
			
		// fire change event;
		inputSelectCmp.get("e.change").fire();
	},
	
	isOptionRestricted : function(option, restrictedOptions) {
		if (!(restrictedOptions instanceof Array)) {
			restrictedOptions = [restrictedOptions];
		}
		
		// go through list of restricted options if this option
		// is in the list then return true
		for (var i=0; i<restrictedOptions.length; i++) {
			if (option.get("v.text") == restrictedOptions[i]) {
				return true;
			}
		}
		return false;
	},
	
	verifySelectedOptions : function(inputSelectCmp, expectedOptionsText) {
		var optionCmps = this.getOptions(inputSelectCmp);
		var selectedOptions = this.getSelectedOptions(optionCmps);
		
		if (!(expectedOptionsText instanceof Array)) {
			expectedOptionsText = [expectedOptionsText];
		}		
		
		// there were no selected options
		if ($A.util.isUndefinedOrNull(selectedOptions)) {
			// there were no selected options was this expected?
			$A.test.assertEquals(expectedOptionsText.length, 0, 
				"Expected zero selected options but got some");
		} else {
		// we have selected options to verify		
			$A.test.assertEquals(expectedOptionsText.length, selectedOptions.length, 
				"Expected number of options selected do not match actual number of options selected");
			
			// for all options we expect to be selected go
			// through all selected options and verify it
			// appears in selected list
			for (var i=0; i<expectedOptionsText.length; i++) {
				var found = false;
				for (var j=0; j<selectedOptions.length; j++) {
					if (expectedOptionsText[i] == selectedOptions[j].get("v.text")) {
						found = true;
						break;
					}
				}
				$A.test.assertTrue(found, "Expected option '" + 
					expectedOptionsText[i] + "' to be selected but was not");
			}
		}
	},
	
	getSelectedOptions : function(options) {
		var selectedOptions = [];
		for (var i=0; i<options.length; i++) {
			if (options[i].get("v.value") === true) {
				selectedOptions.push(options[i]);
			}
		}
		return selectedOptions;
	},
	
	getOptions : function(inputSelectCmp) {
		var options = []
		var inputSelectBody = inputSelectCmp.get("v.body");
		for (var i=0; i<inputSelectBody.length; i++) {
			var groupBody = inputSelectBody[i].get("v.body");
			for (var j=0; j<groupBody.length; j++) {
				options.push(groupBody[j]);
			}
		}
		return options;
	}
})