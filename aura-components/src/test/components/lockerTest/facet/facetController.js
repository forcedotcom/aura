({
    setCallback: function(cmp, event) {
        var params = event.getParam('arguments');
        var callback = params.callback;
        cmp.set("v.callback", callback);
    },

    executeCallback: function(cmp) {
        var callback = cmp.get("v.callback");
        callback();
    }
})