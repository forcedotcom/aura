({
    clientExecuteInBackground : function(component) {
    },

    clientExecuteInForeground : function(component) {
        component.set("v.value", "clientExecuteInForeground");
    },

    clientExecuteInFOREGROUND : function(component) {
        component.set("v.value", "clientExecuteInFOREGROUND");
    },

    clientSideAction : function(component) {
        // foo
    },

    throwsAnError : function(cmp) {
        throw new Error("intentional error");
    }
})
