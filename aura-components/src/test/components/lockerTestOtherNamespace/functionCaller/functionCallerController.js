({
    callPassedFunction: function(cmp, event) {
        var params = event.getParam('arguments');
        var getter = params.getter;
        var key = params.key;
        getter(key);
    },

    callPassedFunctionNewParams: function(cmp, event) {
        var params = event.getParam('arguments');
        var func = params.func;
        func({ windowKey: window }, document, "foo");
    },
})