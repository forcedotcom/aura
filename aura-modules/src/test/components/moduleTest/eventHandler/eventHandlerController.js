({
    handleSomething: function (cmp, event) {
        var somethingName = event.getParam('somethingName');
        cmp.set('v.somethingName', somethingName);
    }
})
