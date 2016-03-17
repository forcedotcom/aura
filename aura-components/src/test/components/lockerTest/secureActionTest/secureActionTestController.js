({
    getSecureAction: function(cmp) {
        var action = cmp.get("c.getString");
        cmp.set("v.log", action);
    }
})
