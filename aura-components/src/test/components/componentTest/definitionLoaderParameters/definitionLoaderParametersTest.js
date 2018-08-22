({
    testCreatesURIDefRequestWithCustomParameter: {
        test: function (cmp) {
            var scripts = document.querySelectorAll("script");
            var URI = scripts[scripts.length-1].src;
            $A.test.assertTrue(URI.indexOf("_testFunc=something") > 0, "URI for component definition should have contained testFunc=something but was: " + URI);
        }
    }
})