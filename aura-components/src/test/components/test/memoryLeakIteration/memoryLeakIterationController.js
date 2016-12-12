({
    newItems: function(cmp) {
        cmp.set("v.items", Array.apply(null, {length: 50}).map(function() {
            return "item " + Math.round(Math.random() * 10000);
        }));
    },
    changeItem0: function(cmp) {
        cmp.set("v.items.0", "item " + Math.round(Math.random() * 10000) );
    }
})
