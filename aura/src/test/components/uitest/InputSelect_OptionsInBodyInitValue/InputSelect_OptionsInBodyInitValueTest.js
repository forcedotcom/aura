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
 * WITHOUT WARRANTIES OR CONDITIOloNS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    /**
     * Checking for case when no default value is given in inputSelect, 
     *  and not inputSelectOption is chosen result should Tiger is default
     *  element chosen
     */
    testValueUndefWithNoDefault: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Undef_With_No_Default");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "Tiger", "ValueUndefWithNoDefault");
	}
    },
    /**
     * Checking for case when no default value is given in inputSelect, 
     *  and inputSelectOption is set to true for Lion. Lion should be chosen
     */
    testValueUndefWithDefault: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Undef_With_Default");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "Lion", "ValueUndefWithDefault");
	}
    },
    /**
     * Checking for case when default for input select is Bear, result 
     * should be bear is the initial item shown
     */
    testValueDefSelectionExists: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Def_Selection_Exists");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "Bear", "ValueDefSelectionExists");
	}
    },
    /**
     *  Checking for case when default for input select is Moose, result 
     *  should be Moose but it doesn't exist as an option so default goes 
     *  to the first element
     */
    testValueDefSelectionDNE: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Def_Selection_DNE");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "Tiger", "ValueDefSelectionDNE");
	}
    },
    /**
     * Checking for case when default for input select is null, and there are no inputSelectOptions
     * result should be that nothing is selected
     */
    testValueNullNoOptions: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_No_Options");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "", "ValueNullNoOptions");
	}
    },
    /**
     * Checking for case when default for input select is Null, result 
     * should be the first element is selected
     */
    testValueNullWithNoNullOption: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_With_No_Null_Option");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "Tiger", "ValueNullWithNoNullOption");
	}
    },
    /**
     *  Checking for case when default for input select is Null, result 
     *  should be the first element is selected, where first elements text is null
     */
    testValueNullWithNullOption: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_With_Null_Option");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "", "ValueNullWithNullOption");
	}
    },
    /**
     *  Checking for case when default for input select is Null, and an inputSelectOption
     *  is selected, result should be the first element is selected
     */
    testValueNullWithDefaultAndNullOption: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_With_Default_And_Null_Option");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "", "ValueNullWithDefaultAndNullOption");
	}
    },
    /**
     * Checking for case when default for input select is Null, and an inputSelectOption
     * is selected, result should be the first element is selected
     */
    testValueNullWithDefaultAndNoNullOption: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_With_Default_And_No_Null_Option");
		var value = inputSelect.get("v.value");
		this.checkAuraValueMatchesAttributeValue(inputSelect.getElement().value, value, "Tiger", "ValueNullWithDefaultAndNoNullOption");
	}
    },
    
    /**
     * Asserting that the value we expected is in the select and also that the value that 
     * in the value attribute of the component is the same as what is in the select 
     */
    checkAuraValueMatchesAttributeValue : function(selElmVal, value, itemThatShouldBeSelected, testName) {
	$A.test.assertEquals(selElmVal, value, testName+" Item that is present in select is different from what is stored in v.value");
	$A.test.assertEquals(itemThatShouldBeSelected, value, testName+" failed to initialize, by using inputSelect options in the body");
    }
})

