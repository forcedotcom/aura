({
    init: function (cmp, event, helper) {
        setTimeout($A.getCallback(function () {
            $A.createComponent('markup://moduleTest:appEventsInteropContainer', {}, function (container) {
                cmp.set('v.slot', container);
            });
        }, 0));
    },
    handleEvent : function(cmp, event, helper) {
        helper.lib.Test.handle(cmp, event);
    }
})