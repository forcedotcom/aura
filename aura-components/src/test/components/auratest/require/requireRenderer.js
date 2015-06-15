({
    render: function(cmp, helper) {
        var version = cmp.getVersion();
        cmp.set("v.versionInRender", version);
        return this.superRender();
    },

    rerender: function(cmp, helper) {
        var version = cmp.getVersion();
        cmp.set("v.versionInRerender", version);
        return this.superRerender();
    },

    afterRender: function(cmp, helper) {
        var version = cmp.getVersion();
        cmp.set("v.versionInAfterRender", version);
        return this.superAfterRender();
    },

    unrender: function(cmp, helper) {
        helper.updateVersion(cmp, cmp.getVersion());
        return this.superUnrender();
    }
})
