({
    rerender: function (cmp, helper) {
        this.superRerender();
        if (cmp.isDirty('v.iterationItems')) {
            cmp.getEvent('finish').fire();
        }
    }
})