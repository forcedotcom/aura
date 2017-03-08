({
    testScriptInAppIsBlocked: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        testUtils.assertUndefined(window._appWindow, "Expected <script> tag in .app file to be blocked by CSP");
    },

    testScriptsInTemplateExecuted: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var templateWindow = window._templateWindow;
        var templateDocument = window._templateDocument;
        var iifeWindow = window._iifeWindow;

        testUtils.assertDefined(templateWindow, "<script> tag that sets window expando not present in user mode");
        testUtils.assertDefined(iifeWindow, "<script> tag that sets window expando inside IIFE not present in user mode");

        testUtils.assertEquals(0, templateWindow.indexOf("SecureWindow"), "<script> inside custom template did not get reference to SecureWindow");
        testUtils.assertEquals(0, templateDocument.indexOf("SecureDocument"), "<script> inside custom template did not get reference to SecureDocument");
        testUtils.assertEquals(0, iifeWindow.indexOf("SecureWindow"), "<script> executing IIFE inside custom template did not get reference to SecureWindow");
    },

    testScriptsInTemplatePreInitBlock: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var preInitBlockWindow = window._preInitBlockWindow;

        testUtils.assertDefined(preInitBlockWindow, "<script> tag from template preInitBlock that sets window expando not present in user mode");

        testUtils.assertEquals(0, preInitBlockWindow.indexOf("SecureWindow"), "<script> inside custom template preInitBlock did not get reference to SecureWindow");
    }
})