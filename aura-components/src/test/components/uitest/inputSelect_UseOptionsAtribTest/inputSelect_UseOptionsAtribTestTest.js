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
	 * Verify dynamic value change in init
	 */
	testChangeSelectionDynamic : {
		test : [function(cmp) {
			        this.setComponentOption(cmp.find("dynamicSelect"), "Option4");
		        }, function(cmp) {
			        this.validateComponentOptions(cmp.find("dynamicSelect"), "Option4");
		        }]
	},
	/**
	 * Verify value change through model. In this case the component should have everything when it 
	 * is actually hit the first time
	 */
	testChangeSelectionDynamicUsingModel : {
		test :  [function(cmp) {
		            this.setComponentOption(cmp.find("dynamicSelectModel"), "Option1");
                }, function(cmp) {
			 		this.validateComponentOptions(cmp.find("dynamicSelectModel"), "Option1");
		        }]
	},
	setComponentOption : function(cmp, option){
		cmp.set("v.value", option);
	},
	
	validateComponentOptions : function(cmp, option) {
		var optionCmps = cmp.getElement().children;
		this.verifySelectedOption(optionCmps, option);
	},
	verifySelectedOption : function(options, selectedLabel) {
		var selectedOptionLabel = "None Selected";
		var selectedOption = this.getSelectedOption(options);
		if (!$A.util.isUndefinedOrNull(selectedOption)) {
			selectedOptionLabel = $A.test.getText(selectedOption);
		}
		$A.test.assertEquals(selectedLabel, selectedOptionLabel, 
			"Incorrect option selected; Comparing by \"Match by DOM Element\".");
	},

	getSelectedOption : function(options){
		for (var i=0; i<options.length; i++) {
			if (options[i].selected) {
				return options[i];
			}
		}
		return null;
	}
})