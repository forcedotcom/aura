({
    addCookie: function(cmp, event, helper) {
        var key = event.getParam("arguments").key;
        document.cookie = key + "=valueChild";
    }
})
