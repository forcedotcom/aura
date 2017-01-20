({
    /**
     * Dynamically create component on server and verify labels in markup of created component are present.
     */
    testNewLabelsInDynamicComponent:{
        test:function(cmp){
            $A.createComponent(
                "gvpTest:newLabels", {},
                function(newCmp){
                    // Component should be sent back from server with necessary labels
                    $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                        "Failed to add Labels from dynamically created components");
                    $A.test.assertEquals("Today + Overdue", $A.get("$Label.Related_Lists.task_mode_today_overdue"),
                        "Failed to add all labels from dynamically created components");
                    cmp.find("container").set("v.body", newCmp);
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
            $A.createComponent(
                "gvpTest:newLabels", {},
                function(newCmp) {
                    // Component should be sent back from server with necessary labels
                    $A.test.assertEquals("Tomorrow", $A.get("$Label.Related_Lists.task_mode_tomorrow"),
                        "Failed to add labels from inner cmp on dynamically created component");
                    cmp.find("container").set("v.body", newCmp);
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
            $A.createComponent(
                "gvpTest:newLabels", {},
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

    testLoadDynamicLabelFromServer: {
        test: function(cmp) {
            var actualLabel;
            var labelSection = ".Related_Lists";
            var labelName = ".task_mode_today";
            var placeholder = $A.get("$Label" + labelSection + labelName, function(label) {
                actualLabel = label;
            });
            // if the label doesn't exist in client, return a placeholder with section and name
            // if this fails, perhaps the label is preloaded to client.
            $A.test.assertEquals("[Related_Lists.task_mode_today]", placeholder);

            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    $A.test.assertEquals("Today", actualLabel, "Failed to fetch label from server.");
                });
        }
    },

    testLabelExistsOnClientAfterLoadedFromServer: {
        test: function(cmp){
            var labelName = "task_mode_today";
            var placeholder = $A.get("$Label.Related_Lists." + labelName);
            $A.test.assertEquals("[Related_Lists.task_mode_today]", placeholder);

            $A.test.addWaitFor(false, $A.test.isActionPending,
                function(){
                    // the server action is done. it means the label is loaded to client.
                    var actualLabel = $A.get("$Label.Related_Lists." + labelName);
                    $A.test.assertEquals("Today", actualLabel,
                            "The label doesn't exist in client LabelValueProvider.");
                });
        }
    },

    testLabelIsLoadedToClientWhenCreatingComponent: {
        test: function(cmp){
            $A.createComponent("gvpTest:newLabels", null, function(newCmp, state) {
                $A.test.assertEquals("SUCCESS", state);
            });

            $A.test.addWaitFor(false, $A.test.isActionPending,
                function() {
                    // since the label is loaded to client when creating component,
                    // the label should be directly returned.
                    var actualLabel = $A.get("$Label.Related_Lists.task_mode_today_overdue");
                    $A.test.assertEquals("Today + Overdue", actualLabel,
                            "The label doesn't exist in client LabelValueProvider.");
                }
            );
        }
    }
})
