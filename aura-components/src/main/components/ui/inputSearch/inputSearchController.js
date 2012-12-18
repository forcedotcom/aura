({
    clearSearchTerm: function(component, event, helper) {
        var searchCmp = component.find("search");
        var el = searchCmp.getElement();
        if (el) {
            el.value = "";
            component.getValue("v.value").setValue("");
            helper.toggleClearButton(component);
        }
        var e = component.getEvent("search");
        e.setParams({
            searchTerm: ""
        });
        e.fire();
    },
    
    input: function(component, event, helper) {
        helper.toggleClearButton(component);
    }
})