({
    overridePropertiesOnSecureWrapper: function(cmp){
        var overrideValue;

        overrideValue = {warn : function(){}};
        window.console = overrideValue;

        overrideValue = function(){};
        window.open = overrideValue;
        window.Audio = overrideValue;
        window.addEventListener = overrideValue;
        window.removeEventListener = overrideValue;
        document.addEventListener = overrideValue;
        document.removeEventListener = overrideValue;
        $A.enqueueAction = overrideValue;
        $A.util = overrideValue;
        cmp.get = overrideValue;
    }
})