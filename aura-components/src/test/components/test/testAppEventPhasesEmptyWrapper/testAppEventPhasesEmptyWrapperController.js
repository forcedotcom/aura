({
    handleCommand : function(cmp, event, helper) {
        helper.lib.Test.runCommand(cmp, event, cmp.get("v.logId") + 'EmptyWrapper');
    },

    handleEvent : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event);
    }
})