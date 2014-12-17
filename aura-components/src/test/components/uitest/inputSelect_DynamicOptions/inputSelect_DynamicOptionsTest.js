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
	OPTS : [{ "label": "Option1", "value": "Option1", "class": "option" },
	            { "label": "Option2", "value": "Option2", "class": "option", selected: true },
	            { "label": "Option3", "value": "Option3", "class": "option" },
	            { "label": "Option4", "value": "Option4", "class": "option" }],
	OPTS2 : [{ "label": "OptionA", "value": "OptionA", "class": "option", selected: true },
		            { "label": "OptionB", "value": "OptionB", "class": "option" }], 
	
    /**
     * Checking to make sure that going from 0 options to some options (set of 4 in this case) work correctly
     */
	testNoneToOptions : {
		attributes : {"whichOption" : 0},
		test: [function(cmp) {
			this.setOptions(cmp, this.OPTS);
		},
		function(cmp){
			this.verifyElements(cmp.find("dynamicSelect"), this.OPTS);
		}]
	},
	
    /**
     * Checking to make sure that going from 4 options to some smaller set of options (set of 2 in this case) work correctly
     */
	testOptionsToSmallerSet : {
		attributes : {"whichOption" : 4},
		test: [function(cmp) {
			this.setOptions(cmp, this.OPTS2);
		},
		function(cmp){
			this.verifyElements(cmp.find("dynamicSelect"), this.OPTS2);
		}]
	},
	
	/**
     * Checking to make sure that going from 2 options to0 options work correctly
     */
	testOptionsToNone : {
		attributes : {"whichOption" : 2},
		test: [function(cmp) {
			this.setOptions(cmp, []);
		},
		function(cmp){
			this.verifyElements(cmp.find("dynamicSelect"), []);
		}]
	},
	
	/**
     * Overall Test Of Flow. Going from 2 options to 4, to 0, and back to 2
     */
	testflow : {
		attributes : {"whichOption" : 2},
		test: [function(cmp) {
			this.setOptions(cmp, this.OPTS);
		},
		function(cmp){
			this.verifyElements(cmp.find("dynamicSelect"), this.OPTS);
			this.setOptions(cmp, []);
		},
		function(cmp){
			this.verifyElements(cmp.find("dynamicSelect"), []);
			this.setOptions(cmp, this.OPTS2);
		},
		function(cmp){
			this.verifyElements(cmp.find("dynamicSelect"), this.OPTS2);
		}]
	},
	
	/**
	 * Verify can change selected option to another option.
	 */
	testInputSelectWithIterationChangeOption : {
		test : function(cmp) {
			var inputSelectCmp = cmp.find("inputSelectIteration");

			this.changeSelection(inputSelectCmp, "2");
			this.verifySelectedOptions(inputSelectCmp, "2");

			this.changeSelection(inputSelectCmp, "3");
			this.verifySelectedOptions(inputSelectCmp, "3");
		}
	},
	
	verifyElements : function(inputSelect, expectedOptions){
		var actualOptions = inputSelect.getElement().getElementsByTagName("option");
		var expectedOption = "", actualOption = "" ;
		$A.test.assertEquals(expectedOptions.length, actualOptions.length, "There amount of options expected was incorrect");
		for(var i = 0; i < expectedOptions.length; i++){
			expectedOption = expectedOptions[i];
			actualOption   = actualOptions[i];
			
			$A.test.assertEquals(expectedOption["label"], actualOption["label"], "Options do not have the same label");
		}
	},
	
	setOptions : function(cmp, opts){
		cmp.find("dynamicSelect").set("v.options", opts);
	},
	
	changeSelection : function(inputSelectCmp, newOptionsText, doNotDeselectTheseOptions) {
		var optionCmps = this.getOptions(inputSelectCmp);

		// de-select option(s)
		var selectedOptions = this.getSelectedOptions(optionCmps);
		for (var i=0; i<selectedOptions.length; i++) {
			// dont have any options that should be ignored for deselect so
			// go ahead and deselect
			if ($A.util.isUndefinedOrNull(doNotDeselectTheseOptions)) {
				selectedOptions[i].set("v.value", false);
			} else {
				// there are some options that should not be deselected
				// if this selected option is NOT in
				// doNotDeselectTheseOptions list deselect
				if (!this.isOptionRestricted(selectedOptions[i], doNotDeselectTheseOptions)) {
					selectedOptions[i].set("v.value", false);
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
					optionCmps[k].set("v.value", true);
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