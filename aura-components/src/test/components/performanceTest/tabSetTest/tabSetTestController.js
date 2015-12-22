({

    setup : function(cmp, event, helper) {

    },

    run : function(cmp, event, helper) {

        var NUM_TABS = 10;

        // test lazyRenderTabs functionality
        // from the ui:tabset documentation: 
        // 'If [lazyRenderTabs is] true, contained ui:tab components are rendered only when they are activated.'
        // As such, this test gets the metrics of looping through all the tabs and activating each one.
        // using done.immediate() since this is not done asynchronously 
        if (cmp.get("v._lazyRenderTabs") === true) {
            
            for (var i = 0; i < NUM_TABS; i++) {
                cmp.find("myTabset").get("e.activateTab").setParams({
                    "index" : i
                }).fire();
            }
            event.getParam('arguments').done.immediate();
        }

        else if (cmp.get("v.testDynamicTabLoading") === true) {
            
            var done = event.getParam('arguments').done;
            var finishRun = done.async(); 

            for (var i = 0; i < NUM_TABS; i++) {
                var e = cmp.find("myTabset").get("e.addTab");
                e.setParams({
                    tab : {
                        "title" : "Tab " + i,
                        "name" : "Name",
                        "body" : [ {
                            "componentDef" : {
                                descriptor : "markup://aura:text"
                            },
                            "attributes" : {
                                "values" : {
                                    "value" : "Content"
                                }
                            }
                        } ]
                    },
                    index : 0,
                    callback: function(tabObj){
                        if(tabObj.tab.get("v.title") === "Tab " + (NUM_TABS-1)){
                            finishRun();
                        }
                    }
                });
                e.fire();
            }
        }
    },

    postProcessing : function(cmp, event, helper) {

    }

})