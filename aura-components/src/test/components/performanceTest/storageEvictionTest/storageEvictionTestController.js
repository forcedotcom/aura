({
    setup: function (cmp, event, helper) {
        var storage = $A.storageService.initStorage(
                "actions",    // name
                true,         // persistent
                false,        // secure
                1024*1024,    // maxSize in bytes
                60*60*24,     // expiration in seconds for half a year.
                60*60*12,     // defaultAutoRefreshInterval in seconds
                true,         // debugLoggingEnabled
                false         // clearStorageOnInit
        );
    },
    // --- Performance framework lifecycle
    run: function (cmp, event, helper) {
        $A.metricsService.onTransactionEnd(function (t) {
            if (t.id === 'AURAPERF:newDefs') {
                console.log('>>>>> Component Defs Fetched: ', t.context.componentDefs);
                window._lastComponentDefs = t.context.componentDefs;
            }
        });
    },

    clearActionStorage: function (cmp, helper) {
        $A.storageService.deleteStorage('actions');
    },
    clearDefStorage: function (cmp, helper) {
        $A.storageService.deleteStorage('ComponentDefStorage');
    },

    fetchCmp: function (cmp, helper) {
        var action = $A.get("c.aura://ComponentController.getComponent");
        var input = cmp.find('input').getElement();
        action.setParams({ name: input.value });
        action.setStorable();

        action.setCallback(this, function () {
            try {
                var newCmp = $A.createComponentFromConfig(action.getReturnValue());
                console.log('>>>>>>>> Component fetched and created successfully! \n', newCmp + '');
            } catch (e) {
                console.log('BOoOoM!, Component blew up!');
                console.log(e);
            }
        });

        $A.enqueueAction(action);
    },

    newCmpDeprecated: function (cmp, helper) {
        var input = cmp.find('input').getElement();
        try {
            var newCmp = $A.newCmpDeprecated(input.value);
            if (newCmp) {
                console.log('Component Created successfully! ', newCmp + '');
            }

        } catch (e) {
            console.log('BOoOoM!, Component blew up!');
        }
    },

    createComponent: function (cmp, helper) {
        var input = cmp.find('input').getElement();
        try {
            $A.createComponent(input.value, {}, function(newCmp) {
                if (newCmp) {
                    console.log('Component Created successfully! ', newCmp + '');
                } else {
                    console.log('BOoOoM!, Component blew up!');
                }
            });
        } catch (e) {
            console.log('$A.createComponent() threw!', e);
        }
    }
})