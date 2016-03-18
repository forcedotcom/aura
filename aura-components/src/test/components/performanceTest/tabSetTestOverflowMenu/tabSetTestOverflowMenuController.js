({
    setup : function(cmp, event, helper) {
        cmp.tabs = [];
        for (var i = 0; i < cmp.get("v.NUM_TABS"); i++) {
            var tab = {
                "title" : "Tab " + i,
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
            }
            cmp.tabs.push(tab)
        }
    },

    run : function(cmp, event, helper) {    
        var done = event.getParam('arguments').done;
        var finishRun = done.async();

        $A.createComponent("ui:tabset", {
            "aura:id" : "myTabSet",
            "useOverflowMenu" : true,
            "lazyRenderTabs" : false,
            "tabs" : cmp.tabs
        }, function(tabset) {
            cmp.find("tabsetContainer").set("v.body", tabset);
            finishRun();
        });       
    }
})