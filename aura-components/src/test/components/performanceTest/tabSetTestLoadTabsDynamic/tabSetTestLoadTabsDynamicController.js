({

    setup : function(cmp, event, helper) {

    },

    run : function(cmp, event, helper) {
        
        var done = event.getParam('arguments').done;
        var finishRun = done.async(); 
        
        var NUM_TABS = 10;

        for (var i = 0; i < NUM_TABS; i++) {
            var e = cmp.find("myTabSet").get("e.addTab");
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
                    if(tabObj.tab.$attributeSet$.values.title === "Tab " + (NUM_TABS-1)){
                        finishRun();
                    }
                }
            });
            e.fire();
        }
    },

    postProcessing : function(cmp, event, helper) {

    }

})