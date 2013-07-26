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
      * Test class value. 
      */
      testClass: {
	  browsers:["IPAD", "IPHONE"], 
        attributes : {class : "Hello"}, 
        test : function(component){
            $A.test.assertEquals("Hello", component.get("v.class"), "class does not equal expected");
        }
     },
     /**
      * Test required value. 
      */
      testRequired: {
	  browsers:["IPAD", "IPHONE"],  
        attributes : {required : "true"}, 
        test : function(component){
            $A.test.assertEquals(true, component.get("v.required"), "required does not equal expected");
	}
     },    
    /**
     * Test max value. 
     */
    testMax: {
	browsers:["IPAD", "IPHONE"],  
        attributes : {max : "2016-07-24"},
        test : function(component){
            $A.test.assertTrue($A.test.contains(component.get("v.max"),"2016-07-24"), 'Expected max {"2016-07-24"} is not contained with actual{"'+component.get("v.max")+'"}');
        }
    },
    
    /**
     * Test min value.
     */
    testMin: {
	browsers:["IPAD", "IPHONE"],  
        attributes : {min : "2011-07-24"},
        test : function(component){
            $A.test.assertTrue($A.test.contains(component.get("v.min"),"2011-07-24"), 'Expected max {"2011-07-24"} is not contained with actual{"'+component.get("v.min")+'"}');
        }
    },

    /**
     * Test step. 
     */
    testStep: {
	browsers:["IPAD", "IPHONE"],  
        attributes : {step : 3},
        test : function(component){
            $A.test.assertEquals(3, component.get("v.step"), "step does not equal expected");
        }
    },

    /**
     * Test disabled. 
     */
    testDisabled: {
	browsers:["IPAD", "IPHONE"],  
        attributes : {disabled : true},
        test : function(component){
            $A.test.assertTrue(component.get("v.disabled"), "disable should be true");
        }
    },

    /**
     * Test value. 
     */
    testValue: {
	browsers:["IPAD", "IPHONE"],  
        attributes : {value : "2011-07-24"},
        test : function(component){
            $A.test.assertEquals("2011-07-24", component.get("v.value"), "value does not equal expected");
        }
    }
})
