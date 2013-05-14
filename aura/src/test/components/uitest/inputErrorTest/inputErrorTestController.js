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
 {
 	doServerError : function(component, event) {
		var a = component.get("c.throwsException");
		a.setParams({
            errorMsg : "Error Happens!"
        });
		
        a.setCallback(component, function(action){
        	if (action.getState() === "SUCCESS") {
        		var retValue = action.getReturnValue();
	        	component.find("outputStatus").getAttributes().setValue("value", "EXPECTED ERROR but got: " + retValue);
	        } else {
	        	var errors = action.getError();
	        	var inputCmp = component.find("inputCmp");
	    		var value = inputCmp.getValue("v.value");
	        	
	        	value.setValid(false);
                value.addErrors(errors);
                
                component.find("outputStatus").getAttributes().setValue("value", "Got Error");
	        }
        });
        
        $A.enqueueAction(a);
	},
	
	doErrorNoEventFire : function(component) {
		var value = component.find("inputCmp").getValue("v.value");
		value.setValid(false);
		value.addErrors([{message:"Error Happens!"}]);
		component.find("outputStatus").getAttributes().setValue("value", "Got Error");
	},
	
	clearErrorNoEventFire : function(component) {
		var value = component.find("inputCmp").getValue("v.value");
	    value.setValid(true);
	   	component.find("outputStatus").getAttributes().setValue("value", "Cleared error");
	},
	
	doErrorNoErrorMsg : function(component) {
		var value = component.find("inputCmp").getValue("v.value");
		value.setValid(false);
		component.find("outputStatus").getAttributes().setValue("value", "Got Error");
	},
	
	clearErrorNullErrorMsg : function(component) {
		var value = component.find("inputCmp").getValue("v.value");
	    value.setValid(true);
	    value.addErrors(null);
	   	component.find("outputStatus").getAttributes().setValue("value", "Cleared error");
	}
}
