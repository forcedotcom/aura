({
    /**
     * Create a new component with labels.
     * Any subsequent requests to these labels using Global Value Providers(GVP) should return the label.
     */
    testNewLabelsInDynamicComponent:{
    test:function(cmp){
        var gvp = $A.getGlobalValueProviders();
        var a = cmp.get('c.getComponentWithLabelInBody');
        $A.run(function(cmp){a.runDeprecated(a)});
        $A.test.addWaitFor(
                    true,
                    $A.test.allActionsComplete,
                    function(){
                        $A.test.assertEquals("Today", gvp.get("$Label.Related_Lists.task_mode_today"),
                            "Failed to add Labels from dynamically created components");
                        $A.test.assertEquals("Today1", gvp.get("$Label.Related_Lists.task_mode_today1"),
                               "Failed to add all labels from dynamically created components");
                        $A.test.assertFalse($A.test.isActionPending(),
                            "Subsequent requests for existing label should not cause server roundtrip");
                    }
                );
    }
    },
    /**
     * Prefetch label using GVP and load a new component with the label.
     */
    testFetchLabelAndLoadComponentWithLabel:{
    test:[
      //Fetch the label using gvp, which causes a server action
      function(cmp){
        var gvp = $A.getGlobalValueProviders();
        var tempLabel = gvp.getValue("$Label" + ".Related_Lists" + ".task_mode_today");
        $A.test.assertEquals("[Related_Lists.task_mode_today]", tempLabel.getValue());
        $A.test.assertTrue($A.test.isActionPending(),
                "Test Setup Failure: test expects the label to be fetched from server");
        $A.test.addWaitFor(
                    true,
                    $A.test.allActionsComplete,
                    function(){
                        //Verify that label is available
                        $A.test.assertEquals("Today", gvp.get("$Label.Related_Lists.task_mode_today"), 
                    	    "Failed to fetch label from server dynamically");
                        //Varify that temporary label value is updated once the actual label is fetched from server 
                        $A.test.assertEquals("Today", tempLabel.getValue(), 
                    	    "LabelValueProvider did not update temp label value");
                    }
                );
    },
      //Load a new component which refers to same label
      function(cmp){
        var gvp = $A.getGlobalValueProviders();
        var a = cmp.get('c.getComponentWithLabelInBody');
        $A.run(function(cmp){a.runDeprecated(a)});
        $A.test.addWaitFor(
                    true,
                    $A.test.allActionsComplete,
                    function(){
                        //Nothing should have changed
                        $A.test.assertEquals("Today", gvp.get("$Label.Related_Lists.task_mode_today"),
                            "Failed to fetch label");
                        //New label should have been merged into LabelValueProvider
                        $A.test.assertEquals("Today1", gvp.get("$Label.Related_Lists.task_mode_today1"),
                               "Failed to merge labels from dynamically created components");
                    }
                );
      }
    ]
    }
})
