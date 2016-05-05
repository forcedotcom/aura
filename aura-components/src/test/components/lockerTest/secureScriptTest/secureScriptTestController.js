({
    testScriptSrcExposed: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var script =  document.createElement("script");
        
        script.src = "foo.js";
        testUtils.assertEquals("foo.js", script.src, "Unexpected script source");
        testUtils.assertEquals("foo.js", script.getAttribute("src"), "Unexpected script source");
        
        script.setAttribute("src", "foo2.js");
        testUtils.assertEquals("foo2.js", script.src, "Unexpected script source");
    },
    
    testGetSetAttribute: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        
        var script =  document.createElement("script");

        script.setAttribute("data-foo", "bar");
        testUtils.assertEquals("bar", script.getAttribute("data-foo"), "Unexpected attribute value");        
    }
})