({
    testLocationAccessorsEquality: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertEquals(location, window.location, "location not equal to window.location");
        testUtils.assertEquals(location, document.location, "location not equal to document.location");
    },

    /**
     * Attempts to use location.assign() to execute a block of Javascript using the javascript: scheme.
     * This attempt should raise an exception from within lockerservice SecureLocation.js
     */
    testJavascriptPseudoScheme: function(component, event, helper) {
        var testUtils = component.get('v.testUtils');
        var errorMessage = '';
        
        // attempt an invalid window.location.assign() call - it SHOULD be sanitized
        try {
          location.assign('javascript:console.log(new XMLHttpRequest())');
        } catch (error) {
          errorMessage = error.message;
        }

        testUtils.assertEquals(errorMessage, 'SecureLocation.assign only supports http://, https:// schemes.', 'a javascript: pseudo scheme was not correctly sanitized');
    },

    /**
     * Attempts to use location.assign() to modify the current URL.
     * This should be permitted and whitelisted by locker since the URL is valid.
     */
     testLocationAssign: function(component, event, helper) {
         var testUtils = component.get('v.testUtils');
         location.assign('#success');
         testUtils.assertEquals('#success', location.hash, 'Failed to assign a new hash using location.assign()');
     }
})
