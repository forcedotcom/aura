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
    incermentSubmitCount : function(component) {
        // calculate and save number of times submit has been clicked
        var submitCountCmp = component.getAttributes().getValue("submitCount");
        var submitCount = submitCountCmp.getValue("value");
        if (!submitCount) {
            submitCount = 0
        }
        component.find("outSubmitCount").getAttributes().setValue("value", ++submitCount);
        submitCountCmp.setValue(submitCount);
    },

    goToServer : function(controller, component, event, cmpName, inValue) {
        var a = component.get("c.echo" + cmpName);

        a.setParams({
            inVar : inValue
        });

        $A.log("Going to server...")
        a.setCallback(component, function(action){
            if (action.getState() === "SUCCESS") {
                $A.log("Success!\nValue from server:");
                var retValue = action.getReturnValue();
                $A.log(retValue);
                component.find("out" + cmpName).getAttributes().setValue("value", "**" + retValue + "**");

                var value = component.find("in" + cmpName).getValue("v.value");
                value.setValid(true);
                var cleanErrorEvent = component.find("in" + cmpName).getEvent("onClearErrors");
                cleanErrorEvent.fire();
            } else {
                $A.log("Fail: " + action.getError()[0].message);

                var inCmp = component.find("in" + cmpName);
                var errors = action.getError()
                var value = inCmp.getValue("v.value");
                value.setValid(false);
                value.addErrors(errors);
                var errorEvent = inCmp.getEvent("onError");
                errorEvent.setParams({ "errors" : errors});
                errorEvent.fire();
            }
        });

        $A.enqueueAction(a);
    }
})
