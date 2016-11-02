({
    afterRender: function (component, helper) {
        helper.lib.interactive.addDomEvents(component);
        return this.superAfterRender();
    },

    unrender: function (component, helper) {
        helper.lib.interactive.removeDomEventsFromMap(component);
        this.superUnrender();
    }

})