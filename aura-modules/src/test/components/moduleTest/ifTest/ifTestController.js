({
    show: function (cmp, event, helper) {
        cmp.set('v.readyToRender', true);
    },

    hide: function (cmp, event, helper) {
        cmp.set('v.readyToRender', false);
    }
})
