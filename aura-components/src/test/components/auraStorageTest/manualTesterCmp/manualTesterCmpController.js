({
    start: function(cmp, event, helper) {
        helper.start(cmp);
    },

    stop: function(cmp, event, helper) {
        helper.log({"action": "stop - manually stopped"});
        cmp.set("v.stopper", true);
    }
})