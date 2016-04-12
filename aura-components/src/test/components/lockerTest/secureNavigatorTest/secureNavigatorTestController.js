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
    	testUtils.assertEquals(window.navigator.language, "en-US", "Expect window.navigator.language to be 'en-US'");
    }
})
