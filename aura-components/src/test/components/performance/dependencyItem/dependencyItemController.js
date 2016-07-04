({
    press: function (cmp, event) {
        cmp.get('e.press').setParams({ domEvent: event }).fire();
    }
})