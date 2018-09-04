({
    flipColor: function(cmp) {
        if (cmp.get("v.color") === "blue") {
            cmp.set("v.color", "red");
        } else {
            cmp.set("v.color", "blue");
        }
    },

    plusOne: function(cmp) {
        cmp.set("v.counter", cmp.get("v.counter") + 1);
    }

})
