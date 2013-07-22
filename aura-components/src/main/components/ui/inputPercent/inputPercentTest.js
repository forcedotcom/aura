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
	 * Test percent formated correctly. 
	 */
	testPercentDisplayed: {
    	attributes : {value : .12},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(0.12, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("12%", value, "Element value does not equal expected");
    	}
    },
    
    /**
	 * Test percent formated correclty with value scale 
	 */
    testValueScale: {
    	attributes : {value : .12, valueScale : "5"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(0.12, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("1,200,000%", value, "Element value does not equal expected");
    	}
    },
    
    /**
	 * Test percent formated correctly when value scale is a negative value
	 */
    _testValueScaleNegative: {
    	attributes : {value : .12, valueScale : "-5"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(0.12, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("0.00012%", value, "Element value does not equal expected");
    	}
    },
    
    /**
	 * Test percent formated correctly with custom format
	 */
    testValueScaleWithFormat: {
    	attributes : {value : .12,  valueScale : "5", format : "#,###.00%"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(0.12, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("1,200,000.00%", value, "Element value does not equal expected");
    	}
    },
    
    testPositiveValueWithFormat: {
        attributes : {value : 1.145, format : '0000.0%'},
        test: function(component){
        	var value = component.getElement().value;
        	aura.test.assertEquals(1.145, component.get("v.value"), "Cmp: Percentage not correct");
            aura.test.assertEquals('0114.5%', value, "Element: Percentage not correct");
        }
    },

    testNegativeValueWithFormat: {
        attributes : {value : -0.14, format : '.000%'},
        test: function(component){
        	var value = component.getElement().value;
        	aura.test.assertEquals(-0.14, component.get("v.value"), "Cmp: Percentage not correct");
            aura.test.assertEquals('-14.000%', value, "Element: Percentage not correct");
        }
    },
    
    testInvalidFormat: {
        attributes : {value : 30, format: ',,'},
        test: function(component){
        	var value = component.getElement().value;
        	aura.test.assertEquals(30, component.get("v.value"), "Expected error message");
            aura.test.assertEquals('Invalid format attribute', value, "Expected error message");
        }
    },

    testRounding: {
        attributes : {value : 0.14566, format: '0.00%'},
        test: function(component){
        	var value = component.getElement().value;
        	aura.test.assertEquals(0.14566, component.get("v.value"), "Cmp: Rounding not correct");
            aura.test.assertEquals('14.57%', value, "Element: Rounding not correct");
        }
    },

    testPrecision: {
        attributes : {value : .05, format : '.0%'},
        test: function(component){
        	var value = component.getElement().value;
        	aura.test.assertEquals(.05, component.get("v.value"), "Cmp: Percentage not correct");
            aura.test.assertEquals('5.0%', value, "Element: Percentage not correct");
        }
    },
    
    /**
     * Verify that when the value changes it is rerendered with the unformated new value
     */
    testUpdateValue: {
        attributes : {value : .227},
        test: function(component){
        	var value = component.getElement().value;
        	aura.test.assertEquals(.227, component.get("v.value"), "Cmp: Value not formatted correctly");
            aura.test.assertEquals('23%', value, "Element: Value not formatted correctly");
            component.getValue("v.value").setValue(965.21);
            $A.rerender(component);
            value = component.getElement().value;
        	aura.test.assertEquals(965.21, component.get("v.value"), "Cmp: Value not formatted correctly");
            aura.test.assertEquals('965.21', value, "Element: Value not formatted correctly");            
        }
    },
    
    /**
     * Verify that when the format changes it is not rerendered using the new format
     */
    testUpdateFormat: {
        attributes : {value : .227, format : '#0.#%'},
        test: function(component){
        	var value = component.getElement().value;
        	aura.test.assertEquals(.227, component.get("v.value"), "Cmp: Value not formatted correctly");
            aura.test.assertEquals('22.7%', value, "Element: Value not formatted correctly");            
            component.getValue("v.format").setValue("000.00 %");
            $A.rerender(component);
            value = component.getElement().value;
        	aura.test.assertEquals(.227, component.get("v.value"), "Cmp: Value not formatted correctly");
            aura.test.assertEquals('22.7%', value, "Element: Value not formatted correctly");
        }
    }
})
