({
    handleSomething: function (cmp, event) {
        var somethingName = event.getParam('somethingName');
        cmp.set('v.somethingName', somethingName);
    },
    handleChange: function (cmp, event) {
        // onchange event doesn't have detail property attached
        // hence something is gonna be undefined
        var somethingName = event.getParam('somethingName');
        cmp.set('v.somethingName', somethingName);
    }
})
