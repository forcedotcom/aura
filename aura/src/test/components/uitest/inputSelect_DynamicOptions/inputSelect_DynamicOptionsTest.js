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
	
	/****************************************HELPER FUNCTIONS***************************************************************/
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
	}
})