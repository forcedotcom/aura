/*
 * Copyright (C) 2014 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    ERR_CSS: "has-error",

    setErrors: function(cmp, errors) {
        var inputCmp = this.getInputCmp(cmp);
        inputCmp.set("v.errors", errors);
    },

    setOutputStatus: function(cmp, value) {
        cmp.find("outputStatus").set("v.value", value);
    },

    setErrorOutputStatus: function(cmp) {
        this.setOutputStatus(cmp, "Has Error");
    },

    setClearOutputStatus: function(cmp) {
        this.setOutputStatus(cmp, "No Error");
    },

    fireServerErrorAction: function(cmp, handleErrorCallback) {
        var errorAction = cmp.get("c.throwsException");
        errorAction.setParams({
            errorMsg : "Error Happens!"
        });

        errorAction.setCallback(cmp, function(action){
            if (action.getState() === "SUCCESS") {
                var retValue = action.getReturnValue();
                helper.setOutputStatus(cmp, "EXPECTED ERROR but got: " + retValue);
            } else {
                var errors = action.getError();
                handleErrorCallback(errors);
            }
        });
        $A.enqueueAction(errorAction);
    },

    createCustomErrors: function(cmp, errorMsgObjs) {
        var errorCmp = $A.componentService.createComponentFromConfig({
               "descriptor": "markup://ui:inputDefaultError",
               "attributes": {
                   "errors": errorMsgObjs
               }
        });

        var inputCmp = this.getInputCmp(cmp);
        inputCmp.set("v.errorComponent", errorCmp);
        // native errors add error css to the input, so
        // the test has a check on this.
        // Let's add it for custom error as well to keep the test simple.
        $A.util.addClass(inputCmp.getElement(), this.ERR_CSS);
        $A.rerender(inputCmp);

        var concreteCmpHelper = inputCmp.getConcreteComponent().getDef().getHelper();
        concreteCmpHelper.updateAriaDescribedBy(inputCmp, errorCmp.getGlobalId());
    },

    clearCustomErrors: function(cmp) {
        var inputCmp = this.getInputCmp(cmp);
        inputCmp.set("v.errorComponent", []);
        // Since we added the css on the top, we need to remove it here.
        $A.util.removeClass(inputCmp.getElement(), this.ERR_CSS);
        $A.rerender(inputCmp);
    },

    fireOnErrorEvent: function(cmp, errors) {
        var inputCmp = this.getInputCmp(cmp);
        var errorEvent = inputCmp.getEvent("onError");
        errorEvent.setParams({"errors" : errors});
        errorEvent.fire();
    },

    fireOnClearErrorsEvent: function(cmp) {
        var inputCmp = this.getInputCmp(cmp);
        var cleanErrorEvent = inputCmp.getEvent("onClearErrors");
        cleanErrorEvent.fire();
    },

    getInputCmp: function(cmp) {
        return cmp.find("inputCmp");
    }
})
