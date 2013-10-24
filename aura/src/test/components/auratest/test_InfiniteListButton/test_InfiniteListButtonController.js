({
    toggle: function (cmp) {
        var isClosed = cmp.getValue('v.item.isClosed');
        isClosed.setValue(!isClosed.getValue());

        $A.log('setting to  ' + isClosed.getValue())
    }
})