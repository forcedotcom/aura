({
    handleClick: function (cmp, event) {
        cmp.set('v.evt', event);
    },
    handleFocus: function (cmp, event) {
        cmp.set('v.focusEvt', event);
    },
})