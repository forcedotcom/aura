({
    doDestroy: function (cmp, evt, hlp) {
        // Get the cmp with test to mark if the destroy handler is called
        rootComponent = $A.getRoot();
        rootComponent.set("v.childCmpDestroyed", true);
    }
})

