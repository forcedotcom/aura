({
    handleSystemError: function (cmp, event, helper) {
        if(cmp.get("v.throwErrorInHandler")) {
            throw Error("Error from error handler");
        }

        // set handleSystemError to true when testing custom handler
        if(!cmp.get("v.handleSystemError")) {
            return;
        }

        var message = event.getParam("message");
        var errorName = event.getParam("error");
        var auraError = event.getParam("auraError");

        if(cmp.get("v.useFriendlyErrorMessageFromData") && auraError.data) {
            message = auraError.data["friendlyMessage"];
        }

        cmp._errorName = errorName;
        cmp._auraError = auraError;
        cmp.set("v.message", message);
        cmp.set("v.errorId", auraError.id);
        cmp.set("v.severity", auraError.severity);
        cmp.set("v.eventHandled", true);

        event["handled"] = true;
    },

    init: function(cmp) {
        if(cmp.get("v.throwErrorFromInit") === true) {
            throw Error("Error from app init");
        }
    },

    throwErrorFromClientController: function() {
        throw new Error("Error from app client controller");
    },

    failAssertInClientController: function(cmp) {
        $A.assert(false, "Assert failed in app client controller");
    },

    throwAuraFriendlyErrorFromClientController: function(cmp) {
        var afe = new $A.auraFriendlyError("AuraFriendlyError from app client controller");
        afe.data = {"friendlyMessage": "Friendly Error Message from data"};
        throw afe;
    },

    throwErrorFromServerActionCallback: function(cmp) {
        var action = cmp.get("c.doSomething");
        action.setCallback(this, function() {
                throw Error("Error from server action callback in app");
            });
        $A.enqueueAction(action);
    },

    throwErrorFromServerActionCallbackWrappedInGetCallback: function(cmp) {
        var action = cmp.get("c.doSomething");
        action.setCallback(this, $A.getCallback(function() {
                throw Error("Error from server action callback wrapped in $A.getCallback");
            }));
        $A.enqueueAction(action);
    },

    throwErrorFromNestedGetCallbackFunctions: function(cmp) {
        var callback = $A.getCallback(function() {
                    var targetCmp = cmp.find("containedCmp");
                    targetCmp.throwErrorFromFunctionWrappedInGetCallback();
                });
        setTimeout(callback, 0);
    },

    throwErrorFromCreateComponentCallback: function(cmp) {
        $A.createComponent("aura:text",{value:"test"},function(targetComponent){
                throw Error("Error from createComponent callback in app");
            });
    },

    throwErrorFromFunctionWrappedInGetCallback: function(cmp) {
        var callback = $A.getCallback(function() {
                    throw Error("Error from function wrapped in getCallback in app");
                });
        setTimeout(callback, 0);
    },

    throwErrorFromRerender: function(cmp) {
        cmp.set("v.throwErrorFromRerender", true);
        // to trigger rerender
        cmp.set("v.message", "trigger rerender.");
    },

    throwErrorFromUnrender: function(cmp) {
        cmp.set("v.throwErrorFromUnrender", true);
        cmp.destroy();
    },

    throwErrorFromAuraMethodHandler: function(cmp) {
        cmp.throwErrorFromClientController();
    },

    throwErrorFromAuraMethodHandlerWithCallback: function(cmp) {
        cmp.throwErrorFromServerActionCallback();
    },

    throwErrorFromContainedCmpController: function(cmp) {
        var targetComponent = cmp.find("containedCmp");
        targetComponent.throwErrorFromClientController();
    },

    throwErrorFromContainedCmpCallback: function(cmp) {
        var targetComponent = cmp.find("containedCmp");
        targetComponent.throwErrorFromFunctionWrappedInGetCallback();
    },

    throwErrorFromPromise: function(cmp) {
        var promise = new Promise(function(resolve, reject) {
            reject(new Error("an error from promise"));
        });
    },

    throwErrorFromAError: function(cmp) {
        $A.error(null, new Error("Intended error through $A.error()"));
    },

    fireTestEvent: function(cmp) {
        cmp.get("e.testEvt").fire();
    },

    doServerAction: function(cmp) {
        var action = cmp.get("c.doSomething");
        action.setCallback(this, function() {
            cmp.set("v.actionDone", true);
        });
        $A.enqueueAction(action);
    },

    noop: function(cmp) {
        // no-op
    }
})
