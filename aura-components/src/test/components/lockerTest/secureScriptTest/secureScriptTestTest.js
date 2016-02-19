({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    testScriptSrcExposed: {
        test: function(cmp) {
            cmp.getScript();
            var script = cmp.get("v.log");
            $A.test.assertEquals("foo.js", script.src, "Unexpected script source");
        }
    }
})