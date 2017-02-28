({
    /**
     * Note that this test spot checks a subset of properties on secureWrapper based on their types
     * and reported use cases. List can be expanded as needed.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testPropertiesOnSecureWrappersWritable: {
        test: function(cmp) {
            cmp.testPropertiesOnSecureWrappersWritable();
        }
    },

    testPropertiesOverridesLocalizedToLocker: {
        test: function(cmp) {
            var propValueWindowConsole = window.console; 
            var propValueWindowOpen = window.open;  
            var propValueWindowAudio = window.Audio;    
            var propValueWindowAddEventListener = window.addEventListener;
            var propValueWindowRemoveEventListener = window.removeEventListener;      
            var propValueaddDocumentEventListener = document.addEventListener;
            var propValueDocumentRemoveEventListener = document.removeEventListener;
            var propValue$AenqueueAction = $A.enqueueAction;
            var propValue$Autil = $A.util;      
            var propValueCmpGet = cmp.get;

            //this method ensures when properties overrides are localized to a locker
            cmp.testPropertiesOverridesLocalizedToLocker();

            var testUtils = $A.test;
            //Ensuring that property overrides don't make it to underlying raw objects
            testUtils.assertTrue(propValueWindowConsole === window.console, "property on raw object should not have been updated"); 
            testUtils.assertTrue(propValueWindowOpen === window.open, "property on raw object should not have been updated");   
            // for some reason === check on Audio returns false, so doing toString
            testUtils.assertTrue(propValueWindowAudio.toString() === window.Audio.toString(), "property on raw object should not have been updated");    
            testUtils.assertTrue(propValueWindowAddEventListener === window.addEventListener, "property on raw object should not have been updated");
            testUtils.assertTrue(propValueWindowRemoveEventListener === window.removeEventListener, "property on raw object should not have been updated");      
            testUtils.assertTrue(propValueaddDocumentEventListener === document.addEventListener, "property on raw object should not have been updated");
            testUtils.assertTrue(propValueDocumentRemoveEventListener === document.removeEventListener, "property on raw object should not have been updated");
            testUtils.assertTrue(propValue$AenqueueAction === $A.enqueueAction, "property on raw object should not have been updated");
            testUtils.assertTrue(propValue$Autil === $A.util, "property on raw object should not have been updated");      
            testUtils.assertTrue(propValueCmpGet === cmp.get, "property on raw object should not have been updated");
        }
    }
})
