({

    setup : function(cmp, event, helper) {
        
        var done = event.getParam('arguments').done;
        var finishSetup = done.async();
        
        var NUM_ITEMS = 100;
        cmp.newActionMenuItemComponents = [];

        for (var i = 0; i < NUM_ITEMS; i++) {
            $A.createComponent("ui:actionMenuItem", {
                'aura:id' : 'item' + 12 + i,
                'label' : 'D' + (i + 1)
            }, function(actionMenuItem, status, statusMessagesList) {
                cmp.newActionMenuItemComponents.push(actionMenuItem);
                if(cmp.newActionMenuItemComponents.length == NUM_ITEMS - 1){
                    finishSetup();
                }
            });
        }

    },

    run : function(cmp, event, helper) {
        if (cmp.get("v.testManyItems")) {
            cmp.find("actionMenu").set("v.body",
                    cmp.find("actionMenu").get("v.body").concat(cmp.newActionMenuItemComponents));
        }
        event.getParam('arguments').done.immediate();
    },

    postProcessing : function(cmp, event, helper) {

    }

})