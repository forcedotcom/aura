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
    testGetValueAcrossCommitRollback:{
	test:function(component){
	    	/**A Value object Which has a set of values inside it.
		 * 
		 */
		var valueObj = $A.expressionService.create(null, {boolean : true});
		$A.test.assertNotNull(valueObj);
		//Initial Value is TRUE
		$A.test.assertTrue(valueObj.getValue("boolean").getValue(), 
			"1: At initialization, both getValue and previousValue should reflect same value");
		$A.test.assertTrue(valueObj.getValue("boolean").getPreviousValue(), 
			"2: At initialization, both getValue and previousValue should reflect same value");
		//Set value to FALSE
		valueObj.getValue("boolean").setValue(false);
    
		$A.test.assertTrue(valueObj.getValue("boolean").getPreviousValue(), "Before commit, getPreviousValue should not reflect new value");
		$A.test.assertFalse(valueObj.getValue("boolean").getValue(), "getValue should reflect latest value");
		$A.test.assertTrue(valueObj.getValue("boolean").isDirty(),"Dirty Flag not set after setvalue")
		//Rollback to TRUE
		valueObj.getValue("boolean").rollback();
		$A.test.assertFalse(valueObj.getValue("boolean").isDirty(),"Dirty Flag not set after rollback")
		$A.test.assertTrue(valueObj.getValue("boolean").getValue(), "On Rollback, both getValue and previousValue should reflect same value");
		$A.test.assertTrue(valueObj.getValue("boolean").getPreviousValue(), "2: At initialization, both getValue and previousValue should reflect same value");
		
		//Set to FALSE and COMMIT the value
		valueObj.getValue("boolean").setValue(false);
		valueObj.getValue("boolean").commit();
		$A.test.assertFalse(valueObj.getValue("boolean").isDirty(),"Dirty Flag not set after commit")
		$A.test.assertFalse(valueObj.getValue("boolean").getPreviousValue(), "After commit, getPreviouValue should reflect new value");
		$A.test.assertFalse(valueObj.getValue("boolean").getValue(), "getValue should reflect latest value");
	}
    },
    testValueGetValue: {
	test: [function(component){
	    	var valueObj = $A.expressionService.create(null, {
				boolean : true,
				integer : 123,
				string : "Model"
		});
		$A.test.assertNotNull(valueObj);
		//Try setting boolean values
		$A.test.assertTrue(valueObj.getValue("boolean").getValue(), "Boolean: Failed to initialize the value object");
		valueObj.getValue("boolean").setValue(false);
		$A.test.assertFalse(valueObj.getValue("boolean").getValue(), "Boolean: Failed to get most recent value");
		
		//Try setting Interger Values
		$A.test.assertEquals(123, valueObj.getValue("integer").getValue(), "Integer: Failed to initialize the value object");
		valueObj.getValue("integer").setValue(789);
		$A.test.assertEquals(789,valueObj.getValue("integer").getValue(), "Integer: Failed to get most recent value");
		
		//Try setting String Values
		$A.test.assertEquals("Model", valueObj.getValue("string").getValue(), "String: Failed to initialize the value object");
		valueObj.getValue("string").setValue("newString");
		$A.test.assertEquals("newString", valueObj.getValue("string").getValue(), "String: Failed to get most recent value");
	},function(component){
	    var valueObj = $A.expressionService.create(null, "literal");
	    $A.test.assertNotNull(valueObj);
	    $A.test.assertEquals("literal", valueObj.getValue(), "Failed to initialize the value object");
	    $A.test.assertEquals("literal", valueObj.getValue(undefined), "Failed to initialize the value object");
	    $A.test.assertEquals("literal", valueObj.getValue(""), "Failed to initialize the value object");
	}
	]
    },
    testSetValue:{
	test:[function(component){
	    	/**
		 * A Value object that stores a single wrapped Value
		 */
		//Test Case 1
		var valueObj = $A.expressionService.create(null, "literal");
		valueObj.setValue('blah')
		//This has made the wrapped value a compound Value object
		$A.test.assertEquals("blah", valueObj.getValue(), 
			"Value does not have the newly inserted value");
		valueObj.commit();
		$A.test.assertEquals("blah", valueObj.getPreviousValue(), "getPreviousValue does not reflect the new values after commit");
		//Test Case 2			
		valueObj.setValue(undefined);
		$A.test.assertUndefinedOrNull(valueObj.getValue(), "Wrapped value cannot be assigned an undefined value");
		valueObj.commit();
		$A.test.assertUndefinedOrNull(valueObj.getPreviousValue(), "Wrapped value cannot be assigned an undefined value");
	}]
    },
    _testVerifyTypeChecking:{
	test:function(component){
		//TODO: W-795089
		var booleanValue = $A.expressionService.create(null, true);;
		try{
			booleanValue.setValue('blah');
			aura.test.assertTrue(booleanValue.getValue()=== 'blah', "setValue() is not doing any type checking");
			aura.test.fail("Should not be able to set a boolean value to a string");
		}catch(e){
			if(e.message==="Should not be able to set a boolean value to a string"){
				aura.test.fail("Should not be able to set a boolean value to a string");
			}
		}
	}
    }
})