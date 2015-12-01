({

    setup : function(cmp, event, helper) {
        cmp.modelCopy = cmp.get("m.data").slice();
    },

    run : function(cmp, event, helper) {
        // clear the model
        cmp.set("m.data", []);
        // set the model with the same data
        cmp.set("m.data", cmp.modelCopy);
        event.getParam('arguments').done.immediate();
    },

    postProcessing : function(cmp, event, helper) {

    }

})