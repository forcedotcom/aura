({
    testLocationAccessorsEquality: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertEquals(location, window.location, "location not equal to window.location");
        testUtils.assertEquals(location, document.location, "location not equal to document.location");
    },

    testAssignJavascriptBypass: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        // Firefox has a bug where CSP may not catch the following line
        location.assign('javascript:throw new Error("location.assign exploit enabled");');
        window.location.assign('javascript:throw new Error("window.location.assign exploit enabled");');
        document.location.assign('javascript:throw new Error("document.location.assign exploit enabled");');
    }
})
