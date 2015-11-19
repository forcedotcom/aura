({
    setup: function (cmp, event, helper) {
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