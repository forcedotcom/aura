({
    handleEvent: function(cmp, event) {
        var params = event.getParams();
        var paramBag = params.paramBag;
        // only call callback if running test for this case
        if (paramBag.otherNamespaceTest) {
            var callback = params.callback;
            callback(cmp);
        }
    }
})