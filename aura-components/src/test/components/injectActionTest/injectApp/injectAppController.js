({
    init: function (cmp, event, helper) {
        cmp._trigger = true;
        helper.triggerAction(cmp);
    },
    storableAction: function (cmp, event, helper) {
        if (!cmp._trigger) {
            helper.triggerAction(cmp);
        }
    }
})