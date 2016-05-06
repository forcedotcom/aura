({
    handleCommand : function(cmp, event, helper) {
        helper.lib.Test.runCommand(cmp, event);
    },
        
    handleEventCapture : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "CAPTURE");
    },

    handleEventBubble : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "BUBBLE");
    },

    handleEvent : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "BROADCAST");
    }
})