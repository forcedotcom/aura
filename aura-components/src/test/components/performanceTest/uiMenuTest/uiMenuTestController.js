({

    setup: function(cmp, event, helper) {
        cmp.NUM_ITEMS = 1400;
        cmp.newActionMenuItemComponents = [];
    },

    run: function(cmp, event, helper) {

        var done = event.getParam('arguments').done;
       
        if (cmp.get("v.testManyItems")) {
            var finishRun = done.async();
            
            $A.getDefinition("ui:actionMenuItem", function() {
                for (var i = 0; i < cmp.NUM_ITEMS; i++) {
                    $A.createComponent("ui:actionMenuItem", {
                        'aura:id': 'item' + 12 + i,
                        'label': 'D' + (i + 1)
                    }, function(actionMenuItem, status, statusMessagesList) {
                        cmp.newActionMenuItemComponents.push(actionMenuItem);
                        if (cmp.newActionMenuItemComponents.length == cmp.NUM_ITEMS - 1) {
                            cmp.find("actionMenu").set("v.body", cmp.newActionMenuItemComponents);
                            finishRun();
                        }
                    })
                }
            });
        }
        else{
            done.immediate();
        }
    },

    postProcessing: function(cmp, event, helper) {

    }

})