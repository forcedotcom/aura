({
    buttonPress : function(cmp, event, helper) {
        var ret = helper.superSuperZ();
        cmp.set("v.attr", ret);
    }
})