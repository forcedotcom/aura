({
    getFacet: function(cmp) {
        // facet is from another namespace so a SecureComponentRef instead of a SecureComponent object will be returned
        var facet = cmp.find("facet");
        cmp.set("v.log", facet);
    }
})