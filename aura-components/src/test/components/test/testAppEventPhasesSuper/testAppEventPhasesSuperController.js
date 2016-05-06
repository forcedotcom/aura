({
    handleEventCapture : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "CAPTURE", cmp.get("v.logId") + 'Super');
    },

    handleEventBubble : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "BUBBLE", cmp.get("v.logId") + 'Super');
    },

    handleEvent : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, "BROADCAST", cmp.get("v.logId") + 'Super');
    }
})