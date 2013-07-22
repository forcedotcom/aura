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
    }
})
