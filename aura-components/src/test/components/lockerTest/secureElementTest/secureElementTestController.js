({
    testElementProperties: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var elementPropertiesWhitelist = event.getParam("arguments").elementPropertiesWhitelist;
        var elementProperitesBlacklist = event.getParam("arguments").elementPropertiesBlacklist;
        var element = cmp.find("title").getElement();

        elementPropertiesWhitelist.forEach(function(name) {
            testUtils.assertTrue(name in element, "Expected property '" + name + "' to be a property on SecureElement");
        });
        elementProperitesBlacklist.forEach(function(name) {
            testUtils.assertFalse(name in element, "Expected property '" + name + "' to not be exposed on SecureElement");
        });
    },

    testHtmlProperties: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var htmlPropertiesWhitelist = event.getParam("arguments").htmlPropertiesWhitelist;
        var htmlPropertiesBlacklist = event.getParam("arguments").htmlPropertiesBlacklist;
        var element = cmp.find("title").getElement();

        htmlPropertiesWhitelist.forEach(function(name) {
            testUtils.assertTrue(name in element, "Expected property '" + name + "' to be a property on SecureElement");
        });
        htmlPropertiesBlacklist.forEach(function(name) {
            testUtils.assertFalse(name in element, "Expected property '" + name + "' to not be exposed on SecureElement");
        });
    },

    testExposedMethods: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var methodsWhitelist = event.getParam("arguments").methodsWhitelist;
        var element = cmp.find("title").getElement();

        methodsWhitelist.forEach(function(name) {
            testUtils.assertDefined(element[name]);
        });
    },
    
    testFramesBlocked: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        
        try {
        	document.createElement("frame");
        	testUtils.fail("Should not have ben able to create a FRAME element");
    	} catch(e) {
    		testUtils.assertEquals(e.toString(), "The deprecated FRAME element is not supported in LockerService!");
    	}
    }
})