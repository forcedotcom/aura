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
        $A.log("Calling server side echo api:"+"c.echo" + cmpName);
        var a = component.get("c.echo" + cmpName);
        a.setParams({
            inVar : inValue
        });

        $A.log("Going to server...")
        a.setCallback(component, function(action){
            if (action.getState() === "SUCCESS") {
                var retValue = action.getReturnValue();
                var outputCmpName = "out" + cmpName;
                $A.log("Success! Value from server:"+retValue+" typeof(value):"+typeof(retValue));

                component.find(outputCmpName).getAttributes().setValue("value", retValue);

            } else {
                $A.test.fail("Fail: " + action.getError().message);
            }
        });

        $A.enqueueAction(a);
    }
})
