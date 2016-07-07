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
        createComponent(cmp, helper);
    },

    createComponent: function (cmp, helper) {
        var input = cmp.find('input').getElement();
        $A.createComponent(input.value, {}, function(newCmp, status, errorMsg) {
            if (status === "SUCCESS") {
                console.log('Component Created successfully! ', newCmp + '');
            } else {
                console.log('BOoOoM!, Component blew up!');
            }
        });
    }
})