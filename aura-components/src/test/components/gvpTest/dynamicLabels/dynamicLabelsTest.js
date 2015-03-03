({
    /**
     * Dynamically create component on server and verify labels in markup of created component are present.
     */
    testNewLabelsInDynamicComponent:{
        test:function(cmp){
            $A.componentService.newComponentAsync(
                this,
                function(newCmp){
                    // Component should be sent back from server with necessary labels
                    $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                        "Failed to add Labels from dynamically created components");
                    $A.test.assertEquals("Today + Overdue", $A.get("$Label.Related_Lists.task_mode_today_overdue"),
                        "Failed to add all labels from dynamically created components");
                    cmp.find("container").set("v.body", newCmp);
                },
                {
                    componentDef: "gvpTest:newLabels"
                }
            );

            // Wait for component creation to complete
            $A.test.addWaitFor(
                true,
                function() {
                    return cmp.find("container").get("v.body").length > 0;
                }
            );
        }
    },

    /**
     * Dynamically create component on server and verify labels on inner cmp of created component are present.
     */
    testNewLabelsInInnerComponent: {
        test:function(cmp) {
            $A.componentService.newComponentAsync(
                this,
                function(newCmp) {
                    // Component should be sent back from server with necessary labels
                    $A.test.assertEquals("Tomorrow", $A.get("$Label.Related_Lists.task_mode_tomorrow"),
                        "Failed to add labels from inner cmp on dynamically created component");
                    cmp.find("container").set("v.body", newCmp);
                },
                {
                    componentDef: "gvpTest:newLabels"
                }
            );

            // Wait for component creation to complete
            $A.test.addWaitFor(
                true,
                function() {
                    return cmp.find("container").get("v.body").length > 0;
                }
            );
        }
    },
    
    /**
     * Dynamically create component on server and verify labels declared dependency cmp of created component are present.
     */
    testNewLabelsInDependencyComponent: {
        test:function(cmp) {
            $A.componentService.newComponentAsync(
                this,
                function(newCmp) {
                    // Component should be sent back from server with necessary labels
                    $A.test.assertEquals("Controller", $A.get("$Label.Section1.controller"),
                        "Failed to add Labels from dynamically created components");
                    $A.test.assertEquals("Helper", $A.get("$Label.Section1.helper"),
                       "Failed to add all labels from dynamically created components");
                    $A.test.assertEquals("Provider", $A.get("$Label.Section1.provider"),
                        "Failed to add labels from inner cmp on dynamically created component");
                    $A.test.assertEquals("Renderer", $A.get("$Label.Section1.renderer"),
                        "Failed to add labels from declared dependency on dynamically created component");
                    cmp.find("container").set("v.body", newCmp);
                },
                {
                    componentDef: "gvpTest:newLabels"
                }
            );

            // Wait for component creation to complete
            $A.test.addWaitFor(
                true,
                function() {
                    return cmp.find("container").get("v.body").length > 0;
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
            var tempLabel = $A.get("$Label" + ".Related_Lists" + ".task_mode_today");
            $A.test.assertEquals("[Related_Lists.task_mode_today]", tempLabel);
            $A.test.assertTrue($A.test.isActionPending(),
                    "Test Setup Failure: test expects the label to be fetched from server");
            $A.test.addWaitFor(
                        false,
                        $A.test.isActionPending,
                        function(){
                            //Verify that label is available
                            $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                                "Failed to fetch label from server dynamically");
                        }
                    );
        },
        //Load a new component which refers to same label
        function(cmp){
            $A.componentService.newComponentAsync(
                    this,
                    function(newCmp){
                        cmp.find("container").set("v.body", newCmp);
                    },
                    {
                        componentDef: "gvpTest:newLabels"
                    }
                );
            $A.test.addWaitFor(
                        false,
                        $A.test.isActionPending,
                        function(){
                            //Nothing should have changed
                            $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                                "Failed to fetch label");
                            //New label should have been merged into LabelValueProvider
                            $A.test.addWaitForWithFailureMessage("Today + Overdue", function(){return $A.get("$Label.Related_Lists.task_mode_today_overdue")},
                                   "Failed to merge labels from dynamically created components");
                        }
                    );
        }]
    }
})
