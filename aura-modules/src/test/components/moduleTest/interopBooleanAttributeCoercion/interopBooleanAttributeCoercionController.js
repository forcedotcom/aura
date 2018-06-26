({
    handleSystemError: function(cmp, event) {
        cmp.set('v.errorMessageReceived', event.getParam('auraError').message);
    }
})