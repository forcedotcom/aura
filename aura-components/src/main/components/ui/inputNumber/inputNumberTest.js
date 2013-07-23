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
	 * Test max value. 
	 */
    testMax: {
        attributes : {max : 9876.54321},
        test : function(component){
            $A.test.assertEquals(9876.54321, component.get("v.max"), "max does not equal expected");
        }
    },

    /**
     * Test min value.
     */
    testMin: {
        attributes : {min : 0.0003},
        test : function(component){
            $A.test.assertEquals(0.0003, component.get("v.min"), "min does not equal expected");
        }
    },

    /**
     * Test step. 
     */
    testStep: {
        attributes : {step : 1.23},
        test : function(component){
            $A.test.assertEquals(1.23, component.get("v.step"), "step does not equal expected");
        }
    },

    /**
     * Test disabled. 
     */
    testDisabled: {
        attributes : {disabled : true},
        test : function(component){
            $A.test.assertTrue(component.get("v.disabled"), "disable should be true");
        }
    },

    /**
     * Test value. 
     */
    testValue: {
        attributes : {value : 567},
        test : function(component){
            $A.test.assertEquals(567, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test decimal value. 
     */
    testDecimalValue: {
        attributes : {value : 10.3249},
        test : function(component){
            $A.test.assertEquals(10.3249, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test integer value 
     */
    testIntValue: {
        attributes : {value : 100},
        test : function(component){
            $A.test.assertEquals(100, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test negative value. 
     */
    testNegativeValue: {
        attributes : {value : -5},
        test : function(component){
            $A.test.assertEquals(-5, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test small decimal value. 
     */
    testSmallValue: {
        attributes : {value : 0.000005},
        test : function(component){
            $A.test.assertEquals(0.000005, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test large number 
     */
    testLargeValue: {
        attributes : {value : 99999999999999},
        test : function(component){
            $A.test.assertEquals(99999999999999, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test zero value. 
     */
    testZeroValue: {
        attributes : {value : 0},
        test : function(component){
            $A.test.assertEquals(0, component.get("v.value"), "value does not equal expected");
        }
    },

    /**
     * Test when value is empty string 
     */
    testEmptyValue: {
        attributes : {value : ""},
        test : function(component){
            $A.test.assertEquals(undefined, component.get("v.value"), "value does not equal expected");
        }
    },
    
    /**
     * Test number formated correctly. 
     */
    testNumberFormat: {
    	attributes : {value : 123, format : "#,#"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(123, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("1,2,3", value, "Element value does not equal expected");
    	}
    },
    
    /**
     * Test number formated correctly when format is empty. 
     */
    testNumberFormatEmptyString: {
    	attributes : {value : 123, format : ""},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(123, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("123", value, "Element value does not equal expected");
    	}
    },
    
    /**
     * Test number formated correctly when format is invalid. 
     */
    testNumberFormatInvalidFormat: {
    	attributes : {value : 123, format : "#.#,0"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(123, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("Invalid format attribute", value, "Element value does not equal expected");
    	}
    },
    
    /**
     * Test number formated correctly when format is not of a recognizable type. 
     */
    testNumberFormatUnrecognizedFormat: {
    	attributes : {value : 123, format : "xyz"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(123, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("123", value, "Element value does not equal expected");
    	}
    }
})
