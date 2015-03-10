({
    init: function(cmp) {
        if (cmp.get("v.setIndexesInInit")) {
            cmp.set("v.start", 1);
            cmp.set("v.end", 3);
        }
    }
})
