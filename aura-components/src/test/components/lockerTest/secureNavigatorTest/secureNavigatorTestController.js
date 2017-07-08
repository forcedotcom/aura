({  
    testPropertiesExposed: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        ["appCodeName", "appName", "appVersion", "cookieEnabled", "geolocation", 
         "language", "onLine", "platform", "product", "userAgent"].forEach(function(name) {
            testUtils.assertTrue(name in window.navigator, "Expected window.navigator." + name + " to be exposed as a property");
         });
    },

    testLanguage: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertEquals("en-us", window.navigator.language.toLowerCase(), "Unexpected window.navigator.language value");
    },

    testMediaDevicesBlocked: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertUndefined(window.navigator.mediaDevices, "navigator.mediaDevices not exposed to lockerized components");
    }
})
