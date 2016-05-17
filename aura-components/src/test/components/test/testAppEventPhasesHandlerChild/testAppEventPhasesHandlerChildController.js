({
    handleCommand : function(cmp, event, helper) {
        helper.lib.Test.runCommand(cmp, event, cmp.get("v.logId") + 'Child');
    },

    handleEventCapture : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "CAPTURE", cmp.get("v.logId") + 'Child');
    },

    handleEventBubble : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "BUBBLE", cmp.get("v.logId") + 'Child');
    },

    handleEvent : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "BROADCAST", cmp.get("v.logId") + 'Child');
    }
})