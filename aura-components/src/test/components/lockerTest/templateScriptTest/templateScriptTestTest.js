({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testScriptInAppIsBlocked: {
        test: function(cmp) {
            cmp.testScriptInAppIsBlocked();
            // verify here as well to verify script didn't run in system mode
            $A.test.assertUndefined(window._appWindow, "Expected <script> tag in .app file to be blocked by CSP");
        }
    },

    testScriptsInTemplateExecuted: {
        test: function(cmp) {
            cmp.testScriptsInTemplateExecuted();
            $A.test.assertUndefined(window._templateWindow, "<script> run in custom template should not set value on system mode window");
            $A.test.assertUndefined(window._iifeWindow, "<script> executing IIFE in custom template should not set value on system mode window");
        }
    },

    testScriptsInTemplatePreInitBlock: {
        test: function(cmp) {
            cmp.testScriptsInTemplatePreInitBlock();
            $A.test.assertUndefined(window._preInitBlockWindow, "<script> run in custom template preInitBlock should not set value on system mode window");
        }
    },

    // FIXME(W-3722281): would be nice to have this test run in user mode
    testDomInCustomTemplate: {
        test: function(cmp) {
            var templateDivs = document.getElementsByClassName("templateDiv");
            var div = document.getElementById("betweenScripts");
            $A.test.assertEquals(3, templateDivs.length, "Not all divs inside custom template available in DOM");
            $A.test.assertEquals("Some HTML inbetween scripts", div.textContent, "Unexpected text on div in custom template");
        }
    },

    testAppHtmlRendered: {
        test: function(cmp) {
            var html = cmp.find("appHtml").getElement();
            $A.test.assertEquals("In .app", html.textContent);
        }
    }
})
