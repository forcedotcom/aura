({
    testPropertiesOnSecureWrappersWritable: function(cmp){
        var testUtils = cmp.get("v.testUtils");
        var propValue; 
        var overrideValue;

        //raw object
        propValue = window.console;
        overrideValue = {warn : function(){}};
        window.console = overrideValue;
        testUtils.assertEquals(overrideValue, window.console, "property should have been writable");
        window.console = propValue;

        //function
        propValue = window.open;
        overrideValue = function(){};
        window.open = overrideValue;
        testUtils.assertTrue(overrideValue === window.open, "property should have been writable");
        window.open = propValue;

        //cotr
        propValue = window.Audio;
        overrideValue = function(){};
        window.Audio = overrideValue;
        testUtils.assertTrue(overrideValue === window.Audio, "property should have been writable");
        window.Audio = propValue;

        propValue = window.addEventListener;
        overrideValue = function(){};
        window.addEventListener = overrideValue;
        testUtils.assertTrue(overrideValue === window.addEventListener, "property should have been writable");
        window.addEventListener = propValue;


        propValue = window.removeEventListener;
        overrideValue = function(){};
        window.removeEventListener = overrideValue;
        testUtils.assertTrue(overrideValue === window.removeEventListener, "property should have been writable");
        window.removeEventListener = propValue;


        propValue = document.addEventListener;
        overrideValue = function(){};
        document.addEventListener = overrideValue;
        testUtils.assertTrue(overrideValue === document.addEventListener, "property should have been writable");
        document.addEventListener = propValue;


        propValue = document.removeEventListener;
        overrideValue = function(){};
        document.removeEventListener = overrideValue;
        testUtils.assertTrue(overrideValue === document.removeEventListener, "property should have been writable");
        document.removeEventListener = propValue;

        //function on SecureAura
        propValue = $A.enqueueAction;
        testUtils.assertTrue(Object.getOwnPropertyDescriptor($A, "enqueueAction").writable, "property should have been writable");
        overrideValue = function(){};
        $A.enqueueAction = overrideValue;
        testUtils.assertTrue(overrideValue === $A.enqueueAction, "property should have been writable");
        $A.enqueueAction = propValue;

        //function on SecureAura
        propValue = $A.util;
        overrideValue = function(){};
        $A.util = overrideValue;
        testUtils.assertTrue(overrideValue === $A.util, "property should have been writable");
        $A.util = propValue;

        //function on SecureComponent
        propValue = cmp.get;
        overrideValue = function(){};
        cmp.get = overrideValue;
        testUtils.assertTrue(overrideValue === cmp.get, "property should have been writable");
        cmp.get = propValue;
    },

    testPropertiesOverridesLocalizedToLocker: function(cmp){
        var testUtils = cmp.get("v.testUtils");        

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

        var propertyOverriderOtherNs = cmp.find("propertyOverriderOtherNs"); 
        propertyOverriderOtherNs.overridePropertiesOnSecureWrapper();

        testUtils.assertTrue(propValueWindowConsole === window.console, "property should have been writable"); 
        testUtils.assertTrue(propValueWindowOpen === window.open, "property should have been writable");   
        // for some reason === check on Audio returns false, so doing toString
        testUtils.assertTrue(propValueWindowAudio.toString() === window.Audio.toString(), "property should have been writable");    
        testUtils.assertTrue(propValueWindowAddEventListener === window.addEventListener, "property should have been writable");
        testUtils.assertTrue(propValueWindowRemoveEventListener === window.removeEventListener, "property should have been writable");      
        testUtils.assertTrue(propValueaddDocumentEventListener === document.addEventListener, "property should have been writable");
        testUtils.assertTrue(propValueDocumentRemoveEventListener === document.removeEventListener, "property should have been writable");
        testUtils.assertTrue(propValue$AenqueueAction === $A.enqueueAction, "property should have been writable");
        testUtils.assertTrue(propValue$Autil === $A.util, "property should have been writable");      
        testUtils.assertTrue(propValueCmpGet === cmp.get, "property should have been writable");


    }
})