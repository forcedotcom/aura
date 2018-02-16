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
    submit : function(component) {

        var cmpType = component.get("v.cmpType");
        var inputCmpValue = component.get('v.ref');

        try {
            var action = component.get("c.echo" + cmpType);

            action.setParams({
                inVar : inputCmpValue
            });

            action.setCallback(component, function(response){
                var retValue;
                var errors;

                if (response.getState() === "SUCCESS") {
                    retValue = response.getReturnValue();
                } else {
                    retValue = "Got Error!";
                    errors = response.getError();
                }

                component.find("outputValue").set("v.value", retValue);

                var inputCmp = $A.getRoot().getSuper().getConcreteComponent().find(cmpType);
                if (!inputCmp) {
                    inputCmp = $A.getRoot().get("v.target").find(cmpType);
                }
                inputCmp.set("v.errors", errors);
            });

            $A.enqueueAction(action);

        } catch(e) {
            $A.test.fail("Test fail! Unexpected error: " + e.message);
        }
    }
})
