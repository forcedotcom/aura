({
    handleSystemError: function (cmp, event, helper) {
        if(!cmp.get("v.handleSystemError")) {
            return;
        }

        var message = event.getParam("message");
        var error = event.getParam("error");
        var auraError = event.getParam("auraError");

        cmp.set("v.message", message);
        cmp.set("v.eventHandled", true);

        event["handled"] = true;
    },

    init: function(cmp) {
        if(cmp.get("v.throwErrorFromInit") === true) {
            throw Error("Error from component init");
        }
    },

    throwErrorFromClientController: function() {
        throw new Error("Error from component client controller");
    },

    throwErrorFromServerActionCallback: function(cmp) {
        var action = cmp.get("c.doSomething");
        action.setCallback(this, function() {
                throw Error("Error from component server action callback");
            });
        $A.enqueueAction(action);
    },

    throwErrorFromCreateComponentCallback: function(cmp) {
        $A.createComponent("aura:text",{value:"test"},function(targetComponent){
                throw Error("Error from createComponent callback in component");
            });
    },

    throwErrorFromFunctionWrappedInGetCallback: function(cmp) {
        var callback = $A.getCallback(function() {
                    throw Error("Error from function wrapped in getCallback in component");
                });
        setTimeout(callback, 0);
    },

    throwErrorFromLibraryCode: function(cmp, event, helper) {
        helper.ErrorHandlingLib.ErrorService.throwAnError();
    },

    throwErrorFromCallbackFunctionInLibrary: function(cmp, event, helper) {
        helper.ErrorHandlingLib.ErrorService.throwAnErrorFromCallback();
    },

    throwErrorFromPromiseInLibrary: function(cmp, event, helper) {
        helper.ErrorHandlingLib.ErrorService.throwAnErrorInPromise();
    },

    throwErrorFromRerender: function(cmp) {
        cmp.set("v.throwErrorFromRerender", true);
        cmp.set("v.message", "trigger rerender.");
    },

    throwErrorFromUnrender: function(cmp) {
        cmp.set("v.throwErrorFromUnrender", true);
        cmp.destroy();
    }
})
