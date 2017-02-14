({

    setup : function(cmp, event, helper) {

    },

    run : function(cmp, event, helper) {
        event.getParam('arguments').done.immediate();
    },

    postProcessing : function(cmp, event, helper) {

    },
    
    loadMore: function(cmp, callback, helper) {
    },

})