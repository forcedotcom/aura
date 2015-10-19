({
    handleSystemError: function (cmp, event, helper) {
        // set handleSystemError to true when testing custom handler
        if(!cmp.get("v.handleSystemError")) {
            return;
        }

        var message = event.getParam("message");
        var error = event.getParam("error");
        var auraError = event.getParam("auraError");

        if(cmp.get("v.useFriendlyErrorMessageFromData") && auraError.data) {
            message = auraError.data["friendlyMessage"];
        }

        cmp.set("v.message", message);

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

    throwAuraErrorFromClientController: function(cmp) {
        throw new AuraError("AuraError from app client controller");
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
        cmp.destroy(false);
    }
})
