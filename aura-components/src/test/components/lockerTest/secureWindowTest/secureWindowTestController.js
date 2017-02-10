({
    test$AExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureAura", window.$A.toString(), "Expected $A to return SecureAura");
    },

    testDocumentExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureDocument", window.document.toString(), "Expected window.document to"
            + " return SecureDocument");
    },

    testCircularReferenceIsSecureWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureWindow", window.window.toString(), "Expected window.window to"
            + " return SecureWindow");
    },

    testNoAccessToWindowViaSetTimeout: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        window.setTimeout(function() {
            testUtils.assertStartsWith("SecureWindow", this.toString(), "Expected 'this' inside" +
                " setTimeout callback to be SecureWidow");
            cmp.set("v.testComplete", true);
        }, 0);
    },

    testHistoryExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertDefined(window.history);
    },

    testLocationExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertDefined(window.location);
        testUtils.assertEquals("/lockerTest/secureWindowTest.cmp", window.location.pathname, "window.location not pointing to the right url");
        testUtils.assertDefined(location, "location object not defined");
        testUtils.assertEquals(location, window.location);
    },

    testNavigatorExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertStartsWith("SecureNavigator", window.navigator.toString(), "Expected navigator to return SecureNavigator");
    },

    testObjectExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        testUtils.assertDefined(Object, "Object is not exposed");
        testUtils.assertDefined(window.Object, "window.Object is not exposed");

        testUtils.assertTrue(window.Object === Object,
            "window.Object and Object should reference to same thing.");

    },

    testWhitelistedGlobalAttributeExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        testUtils.assertDefined(decodeURIComponent, "decodeURIComponent is not exposed");
        testUtils.assertDefined(window.decodeURIComponent, "window.decodeURIComponent is not exposed");

        testUtils.assertTrue(window.decodeURIComponent === decodeURIComponent,
            "window.decodeURIComponent and decodeURIComponent should reference to same thing.");
    },

    testHostedDefinedGlobalsExposedOnWindow: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        testUtils.assertDefined(alert, "alert() not exposed");
        testUtils.assertDefined(window.alert, "window.alert() not exposed");

        testUtils.assertTrue(window.alert === alert, "window.alert and alert should reference to same thing.");
    },

    testTimerReturns: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var setIntervalReturn = setInterval(function(){}, 1000);
        var setTimeoutReturn = setTimeout(function(){}, 1000);
        testUtils.assertTrue(typeof setIntervalReturn === "number", "setInterval did not return a number");
        testUtils.assertTrue(typeof setTimeoutReturn === "number", "setInterval did not return a number");
        clearInterval(setIntervalReturn);
        clearTimeout(setTimeoutReturn);
    },

    testOpen_HttpsUrl: function(cmp){
        var testUtils = cmp.get("v.testUtils");
        var url = "https://google.com";
        var gsWin = window.open(url);
        testUtils.assertNotNull(gsWin);
        var opener = gsWin.opener;
        gsWin.close();
        // Verify that what we get back is a SecureWindow
        testUtils.assertEquals(window, opener, "Expected child window to have access to only SecureWindow");
    },

    testOpen_HttpUrl: function(cmp){
        var testUtils = cmp.get("v.testUtils");
        var url = "http://google.com";
        var gWin = window.open(url);
        var opener = gWin.opener;
        gWin.close();
        testUtils.assertEquals(window, opener, "Expected child window to have access to only SecureWindow");
    },

    testOpen_RelativeUrl : function(cmp){
        var testUtils = cmp.get("v.testUtils");
        var url = "/lockerApiTest/index.app?aura.mode=DEV";
        var apiViewer = window.open(url);
        var opener = apiViewer.opener;
        apiViewer.close();
        testUtils.assertEquals(window, opener, "Expected child window to have access to only SecureWindow");
    },

    testOpen_JavascriptIsBlocked: function(cmp){
        var testUtils = cmp.get("v.testUtils");
        var scripts = [
            "javascript:window.opener.console.log(\'owned your dom \' + window.opener.document)",
            "  javascript:window.opener.console.log(\'owned your dom \' + window.opener.document)",
            "\n\tjavascript:window.opener.console.log(\'owned your dom \' + window.opener.document)",
            "\bjavascript:window.opener.console.log(\'owned your dom \' + window.opener.document)"
        ];
        scripts.forEach(function(script){
            try {
                window.open(script);
                testUtils.fail("Expect to block javascript execution using window.open():" +  script);
            } catch (e) {
                testUtils.assertEquals("SecureWindow.open supports http://, https:// schemes and relative urls. It does not support javascript: scheme!", e.message);
            }
        });
    },

    // Automation for W-3547492
    testCreateImageElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var imgCtor = new Image(25, 33);
        testUtils.assertStartsWith("SecureElement", imgCtor.toString());
        testUtils.assertEquals("IMG", imgCtor.tagName.toUpperCase(), "Failed to create <img> element using 'new Image()'");
        /* Disabling this assertion because ios 9.2 does not support height and width arguments in the ctor
         causing this test to fail in autobuilds. Enable these assertions when autobuild starts using ios 10+
         testUtils.assertEquals(25, imgCtor.width);
         testUtils.assertEquals(33, imgCtor.height);*/

        var imgFunction = document.createElement("img");
        testUtils.assertStartsWith("SecureElement", imgFunction.toString());
        testUtils.assertEquals("IMG", imgFunction.tagName.toUpperCase(), "Failed to create <img> element using document.createElement()");
    },

    testBlob: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var jsonString = JSON.stringify({hello: "world"}, null, 2);
        var blob = new Blob([jsonString], {type : 'application/json'});
        testUtils.assertNotUndefinedOrNull(blob);
        // Verify the various properties of Blob
        testUtils.assertEquals(jsonString.length, blob.size);
        testUtils.assertEquals('application/json', blob.type);
    },

    testBlob_WithScriptTagsBlocked: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var scripts = [
            "<script>alert(window)</script>",
            "<script  >alert(window)</script  >",
            "<SCRIPT>alert(window)</SCRIPT>"
        ];
        scripts.forEach(function(script){
            try {
                var blob = new Blob([script], {type:'text/html'});
                testUtils.fail("Expect to block script tags while creating Blob:"+script);
            } catch (e) {
                testUtils.assertEquals("Blob creation failed: <script> tags are blocked", e.message);
            }
        });
    },

    testFile: function(cmp) {
        var testUtils = cmp.get("v.testUtils"),
            expectedFileName = 'test.html',
            expectedFileType = 'text/html';

        var file = new File(["<div>hello World</div>"], expectedFileName, {type:expectedFileType});
        testUtils.assertNotUndefinedOrNull(file);
        // Verify the various properties of File
        testUtils.assertEquals(expectedFileName, file.name);
        testUtils.assertEquals(expectedFileType, file.type);
    },

    testFile_WithScriptTagsBlocked: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var scripts = [
            "<script>alert(window)</script>",
            "<script  >alert(window)</script  >",
            "<SCRIPT>alert(window)</SCRIPT>"
        ];
        scripts.forEach(function(script){
            try {
                var file = new File([script], 'test.html', {type:'text/html'});
                testUtils.fail("Expect to block script tags while creating File:"+script);
            } catch (e) {
                testUtils.assertEquals("File creation failed: <script> tags are blocked", e.message);
            }
        });
    },

    testModifyWindowLocation: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        window.location.href = '#view';
        testUtils.assertEquals(location, window.location);
        testUtils.assertEquals("/lockerTest/secureWindowTest.cmp", window.location.pathname);
        testUtils.assertEquals("#view", window.location.hash);
    }
})
