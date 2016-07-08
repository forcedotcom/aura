({
    handleCommand : function(cmp, event, helper) {
        helper.lib.Test.runCommand(cmp, event);
    },

    handleEvent : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event);
    }
})