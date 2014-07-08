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
	assertChangeEvent: function(component, value){
	    $A.test.assertTrue(undefined !== component._log, "change handler not invoked");
	    $A.test.assertEquals(1, component._log.length, "unexpected number of change events recorded");
	    $A.test.assertEquals(value , component._log[0].value, "unexpected value of change");
	    component._log = undefined; // reset log
	},
	//TODO ##$$: RJ Refactor this test case after halo work, the "halo" branch has the correct code
    testCreateSimpleValue:{
		test:[function(component){
			var value = $A.expressionService.create(null, true);
			$A.test.assertNotNull(value);
			
			//Initial Value is TRUE
			//$A.test.assertTrue(value); ##$$ uncomment this line
			$A.test.assertTrue(value.unwrap());//##$$ Remove this line
			component.set("v.booleanValue", false);
			//Set value to FALSE
			$A.test.assertFalse(component.get("v.booleanValue"), "get() should reflect latest value");
		},function(component){
		    var val = $A.expressionService.create(null, undefined);
		    //$A.test.assertUndefined(val, "expected undefined as value"); ##$$ uncomment this line
		    $A.test.assertUndefined(val.unwrap(), "expected undefined as value"); //##$$ Remove this line
		    val = $A.expressionService.create(null, null);
		    //$A.test.assertNull(val, "expected null as value"); ##$$ uncomment this line
		    $A.test.assertNull(val.unwrap(), "expected null as value"); //##$$ Remove this line
		}]
    },
    testGetSetSimpleValues: {
    	attributes : {
    		booleanValue : true, integerValue : 180 , stringValue : "Tesla"
    	},
		test: [function(component){
			//Try setting Boolean Values
			$A.test.assertTrue(component.get("v.booleanValue"), "Boolean: Failed to initialize the value object");
			component.set("v.booleanValue", false);
			this.assertChangeEvent(component, false)
			$A.test.assertFalse(component.get("v.booleanValue"), "Boolean: Failed to get most recent value");
			
			//Try setting Integer Values
			$A.test.assertEquals(180, component.get("v.integerValue"), "Integer: Failed to initialize the value object");
			component.set("v.integerValue", 789);
			this.assertChangeEvent(component, 789)
			$A.test.assertEquals(789, component.get("v.integerValue"), "Integer: Failed to get most recent value");
			
			//Try setting String Values
			$A.test.assertEquals("Tesla", component.get("v.stringValue"), "String: Failed to initialize the value object");
			component.set("v.stringValue", "newString");
			this.assertChangeEvent(component, "newString")
			$A.test.assertEquals("newString", component.get("v.stringValue"), "String: Failed to get most recent value");
		},function(component){
			component.set("v.booleanValue", undefined);
			this.assertChangeEvent(component, undefined)
		    $A.test.assertUndefined(component.get("v.booleanValue"), "expected undefined as value");
		    component.set("v.booleanValue", null);
		    this.assertChangeEvent(component, null)
		    $A.test.assertNull(component.get("v.booleanValue"), "expected null as value");
		}]
    },
    //W-2251248
    _testVerifyTypeChecking:{
    	attributes:{
    		integerValue : 180
    	},
    	test:function(component){
    		$A.test.assertEquals(180, component.get("v.integerValue"), "Integer: Failed to initialize the value object");
    		try{
				//TODO: W-795089 & W-2251248
	    		component.set("v.integerValue", "String");
	    		$A.test.fail("Should have validation to check that a string cannot be assigned to integer attribute");
    		}catch(e){
    			
    		}
		}
    }
})
