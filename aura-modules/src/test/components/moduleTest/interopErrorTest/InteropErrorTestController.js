({
    handleSystemError: function (cmp, event, helper) {
        cmp['_auraError'] = event.getParam("auraError");
        event["handled"] = true;
    }
})
