({
    init : function (cmp, event, helper) {
        // Setting default value to map of callbacks
        var EMPTY_OBJECT = {};
        cmp.set('v.map',EMPTY_OBJECT);
    },
    register : function (cmp, event, helper) {
        var callback = event.getParam('callback');
        var action   = event.getParam('action');
        var map      = cmp.get('v.map');

        if (typeof callback === 'function' && typeof action === 'string') {
            map[action] = callback;
        }
    }
})