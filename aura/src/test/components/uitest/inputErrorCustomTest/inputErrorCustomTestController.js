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
 	handleError: function(component, event){
        var inputCmp = component.find("inputCmp");
        var errorsObj = event.getParam("errors");
     
        if (errorsObj) {
            var errMsgs = [];
            for (var i = 0; i < errorsObj.length; i++) {
                errMsgs.push("Custom Error Msg: " + errorsObj[i].message);
            }
         
            // uncomment after bug: W-1412621
            /*
            errorCmp = $A.componentService.newComponent({
                "componentDef": "markup://ui:inputDefaultError",
                "attributes": {
                    "values": {
                        "value" : errMsgs
                    }
                }
            });
            
            inputCmp.setValue("v.errorComponent", errorCmp);
            $A.rerender(inputCmp);
            
            // test infrastructure expects error css set
            var element = inputCmp.getElement();
        	var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        	var valueProvider = htmlCmp.getAttributes().getComponentValueProvider();
            valueProvider.addClass("inputError");
            */
            component.getValue("v.errorMessage").setValue(errMsgs.join(";"));
            component.find("outputStatus").getAttributes().setValue("value", "Got Error");
        }
    },
 
    handleClearError: function(component, event) {
        var inputCmp = component.find("inputCmp");
        // uncomment after bug: W-1412621
        /*
        inputCmp.setValue("v.errorComponent", "");
        
        // test infrastructure expects error css cleared
        var element = inputCmp.getElement();
        var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
        var valueProvider = htmlCmp.getAttributes().getComponentValueProvider();
        valueProvider.removeClass("inputError");
        
        $A.rerender(inputCmp);
        */
        component.getValue("v.errorMessage").setValue("");
        component.find("outputStatus").getAttributes().setValue("value", "Cleared error");
    },
    
    doServerErrorFireOnErrorEvent : function(component, event) {
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
	        	
	        	var errorEvent = inputCmp.getEvent("onError");
	        	errorEvent.setParams({ "errors" : errors});
                errorEvent.fire();
	        }
        });
        
        this.runAfter(a);
	},
	
	clearErrorFireOnClearErrorsEvent : function(component, event) {
		var inputCmp = component.find("inputCmp");
		var cleanErrorEvent = inputCmp.getEvent("onClearErrors");
	    cleanErrorEvent.fire();
	}
}