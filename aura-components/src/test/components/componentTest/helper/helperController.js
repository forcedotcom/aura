({
    updateWithMessageFromHelper: function(cmp, event, helper) {
        var message = event.getParam('arguments').newMessage;
        cmp.set("v.message", helper.getMessage(message));
    }
})
