({
    getScript: function(cmp) {
        var script =  document.createElement("script");
        script.src = "foo.js";
        cmp.set("v.log", script);
    }
})