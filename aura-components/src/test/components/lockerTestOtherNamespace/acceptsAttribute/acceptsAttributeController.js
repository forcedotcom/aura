({
    init: function(cmp) {
        var attribute = cmp.get("v.obj");
        var cmpRef = attribute.getCmpRef();
        cmp.set("v.output", cmpRef.toString());
    }
})