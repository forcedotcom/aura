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
	 * Test to verify radioItems works when interacting with attribute value directly
	 * using AURA API  
	 */
	owner:"ronak.shah",
	
	testToggleRadioMenu:{
		test: [function(cmp) {
				var defaultStringValue = this.getValue(cmp, "String");
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
				this.toggleRadio(cmp, booleanValue);
			},function(cmp){
				booleanValue = this.getValue(cmp, "Boolean");
				this.verifyInputRadioButton(cmp, booleanValue);
			}
		]
	},

	/**
	 * Get value for cmp attribute
	 */
    getValue: function(cmp, attribute){
    	var exp = "v.myValue" + attribute;
    	return cmp.get(exp);
    },
    
    /**
     * Toggle radio button by firing press event
     */
    toggleRadio: function(cmp, booleanValue){
    	if(booleanValue){
    		var nopeButton = cmp.find("nope");
    		this.pressButtonAndVerify(cmp, nopeButton, booleanValue)
    	}
    	else{
    		var yupButton = cmp.find("yup");
    		this.pressButtonAndVerify(cmp, yupButton)
    	}
    },
    
    /**
     * Firing the event and verify the attribute is set correctly
     */
    pressButtonAndVerify: function(cmp, buttonToPress, booleanValue){
    	buttonToPress.get("e.press").fire();
	    $A.test.addWaitForWithFailureMessage(!booleanValue, function(){return cmp.get("v.myValueBoolean");}, "Boolean value should be changed to false after button was pressed");
	},
	
	/**
	 * Verify inputRadio button are set correctly
	 */
	verifyInputRadioButton: function(cmp, booleanValue){
		var inputRadioYupWithStringExp = this.getRadioButtonElement(cmp, "expYup");
    	var inputRadioYupWithBooleanExp = this.getRadioButtonElement(cmp, "booleanYup");
    	var inputRadioNopeWithStringExp = this.getRadioButtonElement(cmp, "expNope");
    	var inputRadioNopeWithBooleanExp = this.getRadioButtonElement(cmp, "booleanNope");
    	if(booleanValue){
        	aura.test.assertTrue(inputRadioYupWithStringExp.checked, "Yup Radio Element with value Expression should be checked");
	        aura.test.assertTrue(inputRadioYupWithBooleanExp.checked, "Yup Radio Element with boolean Expression should be checked");
	        aura.test.assertFalse(inputRadioNopeWithStringExp.checked, "Nope Radio Element with value Expression should be un-checked");
	        aura.test.assertFalse(inputRadioNopeWithBooleanExp.checked, "Nope Radio Element with boolean Expression should be un-checked");
		}
    	else{
    		aura.test.assertFalse(inputRadioYupWithStringExp.checked, "Yup Radio Element with value Expression should be un-checked");
	        aura.test.assertFalse(inputRadioYupWithBooleanExp.checked, "Yup Radio Element with boolean Expression should be un-checked");
	        aura.test.assertTrue(inputRadioNopeWithStringExp.checked, "Nope Radio Element with value Expression should be checked");
	        aura.test.assertTrue(inputRadioNopeWithBooleanExp.checked, "Nope Radio Element with boolean Expression should be checked");
    	}
    },
    
    /*
     * get inputRadio button given localId
     */
    getRadioButtonElement: function(cmp, cmpLocalId){
    	return cmp.find(cmpLocalId).find("radio").getElement();
    }
    
})
