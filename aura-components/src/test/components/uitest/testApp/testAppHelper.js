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
        var submitCount = component.get("v.submitCount");
        if (!submitCount) {
            submitCount = 0
        }

        component.find("outSubmitCount").set("v.value", ++submitCount);

        component.set("v.submitCount", submitCount);
    },

    goToServer : function(controller, component, event, cmpName, inValue) {
        var action = component.get("c.echo" + cmpName);

        action.setParams({
            inVar : inValue
        });

        $A.log("Going to server...")
        action.setCallback(component, function(response){
            if (response.getState() === "SUCCESS") {
                $A.log("Success!\nValue from server:");
                var retValue = response.getReturnValue();
                $A.log(retValue);
                component.find("out" + cmpName).set("v.value", "**" + retValue + "**");

                var inCmp = component.find("in" + cmpName);
                inCmp.set("v.errors", null);

                var cleanErrorEvent = component.find("in" + cmpName).getEvent("onClearErrors");
                cleanErrorEvent.fire();

            } else {
                $A.log("Fail: " + response.getError()[0].message);

                var inCmp = component.find("in" + cmpName);
                var errors = response.getError();
                inCmp.set("v.errors", errors);

                var errorEvent = inCmp.getEvent("onError");
                errorEvent.setParams({ "errors" : errors});
                errorEvent.fire();
            }
        });

        $A.enqueueAction(action);
    }
})
