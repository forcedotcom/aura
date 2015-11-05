({
    render: function(component){
        return this.superRender();
    },

    afterRender: function(cmp, helper) {
        this.superAfterRender();
    },

    rerender: function(cmp, helper) {
        this.superRerender();
    },

    unrender: function(cmp, helper) {
        this.superUnrender();
    }
})
