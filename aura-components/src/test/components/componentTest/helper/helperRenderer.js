({
    render: function(cmp, helper) {
        if(cmp.get("v.callsHelperMethodInRender")) {
            cmp.set("v.message", helper.getMessage());
        }
        return this.superRender();
    },

    afterRender: function(cmp, helper) {
        this.superAfterRender();
        if(cmp.get("v.callsHelperMethodInAfterRender")) {
            cmp.set("v.message", helper.getMessage());
        }
    },

    rerender: function(cmp, helper) {
        this.superRerender();
        if(cmp.get("v.callsHelperMethodInRerender")) {
            cmp.set("v.message", helper.getMessage());
        }
    },

    unrender: function(cmp, helper) {
        this.superUnrender();
        if(cmp.get("v.callsHelperMethodInRerender")) {
            cmp.set("v.message", helper.getMessage());
        }
    }
})
