({
    testBlockLinkElementImportAttribute: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var linkElement = document.createElement("link");

        ["import", "IMPORT", " import ", "abc import xyz", ";/abc/import/xyz"].forEach(function(test) {
            linkElement.rel = test;
            testUtils.assertEquals(null, linkElement.getAttribute("rel"), "The 'rel' attribute cannot be changed to the 'import' value!");
        });

        linkElement.rel = "stylesheet";
        linkElement.href = "test.css";

        testUtils.assertEquals("stylesheet", linkElement.getAttribute("rel"), "The 'rel' attribute can be changed to the 'stylesheet' value!");
        testUtils.assertEquals("test.css", linkElement.getAttribute("href"), "The 'href' attribute can be changed to any value!");
    }
})