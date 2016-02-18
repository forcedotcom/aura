({
   
    setup : function(cmp, event, helper) {

    },

    run : function(cmp, event, helper) {
        // load 200 list items
        cmp.numItems = cmp.get("v.itemsToLoad");
        // keep track of how many times we're loading the next set of items in the infiniteList
        cmp.iterationCount = 0;
        cmp.done = event.getParam('arguments').done;
        cmp.finishRun = cmp.done.async();
        
        var listData = cmp.find("listData");
        
        for(i = 0 ; i < cmp.numItems/10;i++){
            // load the next set of infiniteList items
            listData.get("e.triggerDataProvider").fire();
        }
       
    },

    postProcessing : function(cmp, event, helper) {

    },
    
    // callback fired when a set of list items has finished loading
    listComplete : function(cmp, evt, helper){
        // end the perf test when the last set of list items has loaded
        if(cmp.iterationCount === (cmp.numItems/10) - 1){
            cmp.finishRun();
        }
        else{
            cmp.iterationCount++;
        }
    }

})