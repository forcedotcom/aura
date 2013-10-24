({
    toggle: function (cmp) {
        var isClosed = cmp.getValue('v.item.isClosed');
        isClosed.setValue(!isClosed.getValue());

        console.log('setting to  ' + isClosed.getValue())
    }
})