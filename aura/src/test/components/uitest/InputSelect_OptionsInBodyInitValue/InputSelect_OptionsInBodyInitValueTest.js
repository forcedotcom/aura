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
    testValueUndefWithNoDefault: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Undef_With_No_Default");
		var value = inputSelect.get("v.value");
		$A.test.assertEquals("Tiger", value,"ValueUndefWithNoDefault failed to initialize, by using inputSelect options in the body");
	}
    },
    testValueUndefWithDefault: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Undef_With_Default");

		var value = inputSelect.get("v.value");
		$A.test.assertEquals("Lion", value,"ValueUndefWithDefault failed to initialize, by using inputSelect options in the body");
	}
    },
    testValueDefSelectionExists: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Def_Selection_Exists");
		var value = inputSelect.get("v.value");
		$A.test.assertEquals("Bear", value,"ValueDefSelectionExists failed to initialize, by using inputSelect options in the body");
	}
    },
    testValueDefSelectionDNE: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Def_Selection_DNE");
		var value = inputSelect.get("v.value");
		$A.test.assertEquals("Tiger", value,"ValueDefSelectionDNE failed to initialize, by using inputSelect options in the body");
	}
    },
    testValueNullNoOptions: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_No_Options");
		var value = inputSelect.get("v.value");
		$A.test.assertEquals("", value,"ValueNullNoOptions failed to initialize, by using inputSelect options in the body");
	}
    },
    testValueNullWithNoNullOption: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_With_No_Null_Option");
		var value = inputSelect.get("v.value");
		$A.test.assertEquals("Tiger", value,"ValueNullWithNoNullOption failed to initialize, by using inputSelect options in the body");
	}
    },
    testValueNullWithNullOption: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_With_Null_Option");
		var value = inputSelect.get("v.value");
		$A.test.assertEquals("", value,"ValueNullWithNullOption failed to initialize, by using inputSelect options in the body");
	}
    },
    testValueNullWithDefaultAndNullOption: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_With_Default_And_Null_Option");
		var value = inputSelect.get("v.value");
		$A.test.assertEquals("", value, "ValueNullWithDefaultAndNullOption failed to initialize, by using inputSelect options in the body");
	}
    },
    testValueNullWithDefaultAndNoNullOption: {
	test : function(cmp){
		var inputSelect = cmp.find("Value_Null_With_Default_And_No_Null_Option");
		var value = inputSelect.get("v.value");
		$A.test.assertEquals("Tiger", value,"ValueNullWithDefaultAndNoNullOption failed to initialize, by using inputSelect options in the body");
	}
    }
})

