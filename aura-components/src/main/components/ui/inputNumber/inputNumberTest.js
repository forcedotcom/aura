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
     * Test when value is not assigned.
     */
    testUnassigned: {
    	attributes : {testCmpName : "UnsetNumber"},
        test : function(component) {
            var attr = component.getValue("v.value");
            $A.test.assertEquals('SimpleValue', attr.toString());
            $A.test.assertEquals(undefined, attr.getValue());
        }
    },

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
     * Assign Negative value for attribute 'value' and special negative format
     */
    testNegativeValueWithNegativeFormat:{
        attributes: {value : -123.936, format:"#.0#;(#.0#)"},
        test: function(component){
        	var value = component.getElement().value;
            aura.test.assertEquals(-123.936, component.get("v.value"), "Cmp value: Negative values not displayed correctly.");
            aura.test.assertEquals('(123.94)', value, "Element value: Negative values not displayed correctly.");
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
    },
    
    /**
    * Positive test case: Assign nothing to format value and verify default precision used to display decimal.
    */
   testDefaultDecimalPrecision: {
       attributes : {value : 123.450},
       test: function(component){
    	   var value = component.getElement().value;
           aura.test.assertEquals(123.45, component.get("v.value"), "Cmp value not displayed as expected when format is not specified.");
           aura.test.assertEquals("123.45", value, " Element value not displayed as expected when format is not specified.");
       }
   },
   
   /**
    * Verify Rounding up of lots of 9s
    */
   testRoundingLotsOfNines: {
       attributes : {value : 999999.9, format : '#,##0'},
       test: function(component){
    	   var value = component.getElement().value;
           aura.test.assertEquals(999999.9, component.get("v.value"), "Cmp value: Nines were not rounded up correctly");
           aura.test.assertEquals('1,000,000', value, "Element value: Nines were not rounded up correctly");
       }
   },
   /**
    * Verify Rounding up of lots of 9s with extra zero padding
    */
   testRoundingLotsOfNinesAndZeroPadding: {
       attributes : {value : 999999.9, format : '00000000'},
       test: function(component){
    	   var value = component.getElement().value;
           aura.test.assertEquals(999999.9, component.get("v.value"), "Cmp value: Nines were not round up correctly");
           aura.test.assertEquals('01000000', value, "Element value: Nines were not round up correctly");
       }
   },
   /**
    * Verify Rounding up of decimal part of value.
    */
   testFormat2DecimalPlaces_RoundUp: {
       attributes : {value : 3.1459, format : '.00'},
       test: function(component){    	   
    	   var value = component.getElement().value;
           aura.test.assertEquals(3.1459, component.get("v.value"), "Cmp value: Decimal part of value was not rounded up based on format.");
           aura.test.assertEquals('3.15', value, "Element value: Decimal part of value was not rounded up based on format.");
       }
   },
   /**
    * Verify Rounding down of decimal part of value.
    */
   testFormat2DecimalPlaces_RoundDown: {
       attributes : {value : 3.14159, format : '.00'},
       test: function(component){
    	   var value = component.getElement().value;
           aura.test.assertEquals(3.14159, component.get("v.value"), "Cmp value: Decimal part of value was not rounded down based on format.");
           aura.test.assertEquals('3.14', value, "Element value: Decimal part of value was not rounded down based on format.");
       }
   },
   /**
    * Verify Rounding functionality when length of integer part is restricted by format.
    */
   testFormatDoesNotRestrictIntegerValue: {
       attributes : {value : 22.7, format : '0.0'},
       test: function(component){
    	   var value = component.getElement().value;
           aura.test.assertEquals(22.7, component.get("v.value"), "Cmp value: Should have displayed full value but was probably truncated.");
           aura.test.assertEquals('22.7', value, "Element value: Should have displayed full value but was probably truncated.");
       }
   },
   /**
    * Verify that zeros are appended to decimal value to match format.
    */
   testAppendingZeroToMatchFormat: {
       attributes : {value : 22.7, format : '.000'},
       test: function(component){
    	   var value = component.getElement().value;
           aura.test.assertEquals(22.7, component.get("v.value"), "Cmp value: Should have appended two zeros to match format.");
           aura.test.assertEquals('22.700', value, "Element value: Should have appended two zeros to match format.");
       }
   },
   /**
    * Test big value that is too large for a js number and is represented instead by a string
    */    
   testBigDecimal:{
       attributes : {value : '1234567890123456789012345678901234567890.12', format : '.00'},
       test: function(component){
    	   var value = component.getElement().value;
           aura.test.assertEquals('1234567890123456789012345678901234567890.12', component.get("v.value"), "Cmp value: Unexpected value.");
           aura.test.assertEquals('1234567890123456789012345678901234567890.12', value, "Element value: Unexpected value.");
       }
   },
   
   /**
    * Verify that when the value changes it is rerendered with the unformated new value
    */
   testUpdateValue: {
       attributes : {value : 22.7, format : '##,#0,00.00#####'},
       test: function(component){
    	   var value = component.getElement().value;
    	   aura.test.assertEquals(22.7, component.get("v.value"), "Cmp: Value not formatted correctly.");
           aura.test.assertEquals('0,22.70', value, "Element: Value not formatted correctly.");
           component.getValue("v.value").setValue(49322);
           $A.rerender(component);
           value = component.getElement().value;
    	   aura.test.assertEquals(49322, component.get("v.value"), "Cmp: Value not formatted correctly.");
           aura.test.assertEquals('49322', value, "Element: Value not formatted correctly.");           
       }
   },
   
   /**
    * Verify that when the format changes it is not rerendered with the new format
    */
   testUpdateFormat: {
       attributes : {value : 22.7, format : '##,#0,00.00#####'},
       test: function(component){
    	   var value = component.getElement().value;
    	   aura.test.assertEquals(22.7, component.get("v.value"), "Cmp: Value not formatted correctly.");
           aura.test.assertEquals('0,22.70', value, "Element: Value not formatted correctly.");
           component.getValue("v.format").setValue('.000');
           $A.rerender(component);
           value = component.getElement().value;
    	   aura.test.assertEquals(22.7, component.get("v.value"), "Cmp: Value not formatted correctly.");
           aura.test.assertEquals('0,22.70', value, "Element: Value not formatted correctly.");           
       }
   }
})
