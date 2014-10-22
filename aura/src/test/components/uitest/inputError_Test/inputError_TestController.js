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
 	doServerError : function(component, event) {
		var a = component.get("c.throwsException");
		a.setParams({
            errorMsg : "Error Happens!"
        });
		
        a.setCallback(component, function(action){
        	if (action.getState() === "SUCCESS") {
        		var retValue = action.getReturnValue();
	        	component.find("outputStatus").set("v.value", "EXPECTED ERROR but got: " + retValue);
	        } else {
	        	var errors = action.getError();
	        	var inputCmp = component.find("inputCmp");
	    		inputCmp.setValid("v.value", false);
                inputCmp.addErrors("v.value", errors);
                
                component.find("outputStatus").set("v.value", "Got Error");
	        }
        });
        
        $A.enqueueAction(a);
	},
	
	doErrorNoEventFire : function(component) {
		var inputCmp = component.find("inputCmp");
		inputCmp.setValid("v.value", false);
		inputCmp.addErrors("v.value", [{message:"Error Happens!"}]);
		component.find("outputStatus").set("v.value", "Got Error");
	},
	
	clearErrorNoEventFire : function(component) {
		var inputCmp = component.find("inputCmp");
		inputCmp.clearErrors("v.value");
		component.find("outputStatus").set("v.value", "Cleared error");
	},
	
	doErrorNoErrorMsg : function(component) {
		var inputCmp = component.find("inputCmp");
		inputCmp.setValid("v.value", false);
		component.find("outputStatus").set("v.value", "Got Error");
	},

	// TODO(tbliss): Adding a null error here still adds an entry to the errors object so the error is not cleared.
	clearErrorNullErrorMsg : function(component) {
		var inputCmp = component.find("inputCmp");
		inputCmp.clearErrors("v.value");
	   	component.find("outputStatus").set("v.value", "Cleared error");
	}
})
