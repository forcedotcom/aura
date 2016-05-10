({
    start: function(cmp, event, helper) {
        helper.start(cmp);
    },

    stop: function(cmp) {
        cmp.set("v.stopper", true);
    },

    closeTabs: function(cmp, event, helper) {
        helper.closeTabs(cmp);
    }
})