({
    handleCommand : function(cmp, event, helper) {
        helper.lib.Test.runCommand(cmp, event, cmp.get("v.logId") + 'Handler');
    },
        
    handleEventCapture : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "CAPTURE", cmp.get("v.logId") + 'Handler');
    },

    handleEventBubble : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "BUBBLE", cmp.get("v.logId") + 'Handler');
    },

    handleEvent : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "BROADCAST", cmp.get("v.logId") + 'Handler');
    }
})