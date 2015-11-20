({
    setup : function(cmp, event, helper) {

    },

    run : function(cmp, event, helper) {
        event.getParam('arguments').done.immediate();  
    }
})