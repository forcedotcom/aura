({
    twoActions: function (component) {
        var serverAction = component.get("c.executeInForeground");
        serverAction.setCallback(this, function(action) { });
        $A.enqueueAction(serverAction);

        serverAction = component.get("c.executeInForegroundWithReturn");
        serverAction.setParams({ i : 0 });
        serverAction.setCallback(this, function(action) {});

        $A.enqueueAction(serverAction);

    },
    cExecuteInForeground : function(component) {
        var serverAction = component.get("c.executeInForeground");

        serverAction.setCallback(this, function(action) {
            //no-op
        });

        $A.enqueueAction(serverAction);
    },
    cErrorInForeground : function(component) {
             var serverAction = component.get("c.errorInForeground");
             serverAction.setCallback(this, function(action) {
                 component.set("v.errorMessage", action.error[0].message);
             });

             $A.enqueueAction(serverAction);
        },
    cExecuteInForegroundWithReturn : function(component) {
        var serverAction = component.get("c.executeInForegroundWithReturn");
        serverAction.setParams({ i : 0 });
        serverAction.setCallback(this, function(action) {
            //no-op
        });

        $A.enqueueAction(serverAction);
    },
    cExecuteInBackground : function(component) {
        var serverAction = component.get("c.executeInBackground");

        serverAction.setCallback(this, function(action) {
            //no-op
        });

        $A.enqueueAction(serverAction);
    },
    cExecuteInBackgroundWithReturn : function(component) {
        var serverAction = component.get("c.executeInBackgroundWithReturn");
        serverAction.setParams({ i : 0 });

        serverAction.setCallback(this, function(action) {
            //no-op
        });

        $A.enqueueAction(serverAction);
    },

    updateTextWithCallingDescrptor : function(component) {
        var action = component.get("c.currentCallingDescriptor");
        action.setCallback(component, function(result) {
            var state = result.getState();
            if(state === "SUCCESS") {
                component.set("v.text", result.getReturnValue());
            } else if(state === "INCOMPLETE" || state === "ERROR") {
                throw new $A.auraError("Failed to get calling descriptor from server: "+result.getError());
            }
        });
        $A.enqueueAction(action);
    }
})
