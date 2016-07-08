({
    handleEvent : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event, cmp.get("v.logId") + 'Super');
    }
})