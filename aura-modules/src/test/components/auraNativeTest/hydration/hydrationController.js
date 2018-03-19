({
    primeAnAction: function (cmp) {
        var primer = cmp.find('primer');
        var actionToPrime = cmp.get('c.createComponentsOnServer');
        actionToPrime.setParams({ descriptors: ['ui:label'] });

        primer.primeAuraActions([actionToPrime]);
    },

    primeLabel: function (cmp) {
        var primer = cmp.find('primer');
        var actionToPrime = $A.get("c.aura://LabelController.getLabel");
        actionToPrime.setParams({ section :"Related_Lists", name : "task_mode_today" });
        primer.primeAuraActions([actionToPrime]);
    },

    runAction: function (cmp) {
        var action = cmp.get('c.createComponentsOnServer');
        action.setStorable();
        action.setParams({ descriptors: ['ui:label'] });

        action.setCallback(this, function (action) {
            console.log('>> DONE');
        });

        $A.enqueueAction(action);
    },

    runPrimedLabel: function (cmp) {
        var GPV = '$Label';
        var label = $A.get(GPV + ".test.task_mode_today");
        cmp.set('v.currentLabelValue', label);
    },

    runLabel: function (cmp) {
        var GPV = '$Label';
        var label = $A.get(GPV + ".Related_Lists.task_mode_today");
        cmp.set('v.otherLabel', label);
    },
    
    submitErrorToPrimingService: function (cmp) {
        var primer = cmp.find('primer');
        primer.submitError().then(function(errResult){
            cmp.set('v.error', errResult);
        });
    },
    
    submitErrorWithNoTokenToPrimingService: function (cmp) {
        var primer = cmp.find('primer');
        primer.submitErrorWithNoToken().then(function(errResult){
            cmp.set('v.error', errResult);
        });
    },

    showErrorResult: function (cmp) {
        cmp.set('v.stringifiedError', JSON.stringify(cmp.get('v.error')));
    }
})