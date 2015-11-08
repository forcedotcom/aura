({
    handleSystemError :function(cmp) {
        if(cmp.get("v.handleSystemError")) {
            cmp.set('v.debuggingMessage',
                'SystemError event is handled,  you should not see error box.');

            event["handled"] = true;
        }
    }
})
