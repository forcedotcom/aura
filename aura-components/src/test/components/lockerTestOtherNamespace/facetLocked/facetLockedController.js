({
    handleDocumentQuerySelector: function(cmp, event, helper) {
        var args = event.getParam("arguments");
        helper.querySelector(document, args.selectors, args.results);
    },
    handleElementQuerySelector: function(cmp, event, helper) {
        var args = event.getParam("arguments");
        helper.querySelector(cmp.getElement(), args.selectors, args.results);
    }
})