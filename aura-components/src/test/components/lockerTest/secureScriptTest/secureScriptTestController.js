({
    testScriptSrcExposed: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var script =  document.createElement("script");
        script.src = "foo.js";
        testUtils.assertEquals("foo.js", script.src, "Unexpected script source");
    }
})