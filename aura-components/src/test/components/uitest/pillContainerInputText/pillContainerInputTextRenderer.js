({
    afterRender: function (component, helper) {
        helper.lib.interactive.addDomEvents(component);
        return this.superAfterRender();
    }
})