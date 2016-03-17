({
    getWrapperFromController: function(cmp) {
        cmp.set("v.log", cmp);
    },

    getElementTest: function(cmp) {
        cmp.set("v.log", cmp.getElement());
    },

    getEventTest: function(cmp) {
        cmp.set("v.log", cmp.getEvent("press"));
    }
})