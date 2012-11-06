/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    doAction : function(component) {
        var inputCmp = component.find("inputCmp");
        var simplevalue = inputCmp.getValue("v.value");
        var value = simplevalue.getValue("v.value");

        // is input numeric?
        if (isNaN(value)) {
            // fire event that will set error
            var errorEvent = inputCmp.getEvent("onError");
            errorEvent.setParams({ "errors" : [{message:"Input not a number: " + value}]});
            errorEvent.fire();
        } else {
            // fire event that will clear error
            if (!simplevalue.isValid()) {
                var clearErrorEvent = inputCmp.getEvent("onClearErrors");
                clearErrorEvent.fire();
            }
        }
    },

    handleError: function(component, event){
        var inputCmp = component.find("inputCmp");
        var simplevalue = component.find("inputCmp").getValue("v.value");
        var errorsObj = event.getParam("errors");

        /* do any custom error handling
         * logic desired here */

        // set error using default error component
        simplevalue.setValid(false);
        simplevalue.addErrors(errorsObj);
        var updateErrorEvent = inputCmp.getEvent("updateError");
        updateErrorEvent.fire();
    },

    handleClearError: function(component, event) {
        var inputCmp = component.find("inputCmp");
        var simplevalue = inputCmp.getValue("v.value");

        /* do any custom error handling
         * logic desired here */

        // clear error using default error component
        simplevalue.setValid(true);
        var updateErrorEvent = inputCmp.getEvent("updateError");
        updateErrorEvent.fire();
    }
}
