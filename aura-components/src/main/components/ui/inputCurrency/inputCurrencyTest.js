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
	 * Test currency formated correctly. 
	 */
	testCurrency: {
    	attributes : {value : 1234},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(1234, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("$1,234.00", value, "Element value does not equal expected");
    	}
    },
    
    /**
	 * Test currency formated correctly with custom format. 
	 */
    testCurrencyWithFormat: {
    	attributes : {value : 1234, format : "$#,###.0000"},
    	test : function(component){
    		var value = component.getElement().value;
    		$A.test.assertEquals(1234, component.get("v.value"), "Cmp value does not equal expected");
    		$A.test.assertEquals("$1,234.0000", value, "Element value does not equal expected");
    	}
    },
    
    /**
     * Verify that when the value changes it is rerendered with the unformated new value
     */
    testUpdateValue: {
    	attributes : {value : 1234, format : "$#,###.0000"},
        test: function(component){
     	   var value = component.getElement().value;
     	   $A.test.assertEquals(1234, component.get("v.value"), "Cmp value does not equal expected");
     	   $A.test.assertEquals("$1,234.0000", value, "Element value does not equal expected");
           component.getValue("v.value").setValue(5678);
           $A.rerender(component);
           value = component.getElement().value;
           $A.test.assertEquals(5678, component.get("v.value"), "Cmp value does not equal expected");
     	   $A.test.assertEquals("5678", value, "Element value does not equal expected");           
        }
    },
    
    /**
     * Verify that when the format changes it is not rerendered with the new format
     */
    testUpdateFormat: {
    	attributes : {value : 1234, format : "$#,###.0000"},
        test: function(component){
     	   var value = component.getElement().value;
     	   $A.test.assertEquals(1234, component.get("v.value"), "Cmp value does not equal expected");
     	   $A.test.assertEquals("$1,234.0000", value, "Element value does not equal expected");
           component.getValue("v.format").setValue('£#,###.00');
           $A.rerender(component);
           value = component.getElement().value;
           $A.test.assertEquals(1234, component.get("v.value"), "Cmp value does not equal expected");
     	   $A.test.assertEquals("$1,234.0000", value, "Element value does not equal expected");           
        }
    }
})
