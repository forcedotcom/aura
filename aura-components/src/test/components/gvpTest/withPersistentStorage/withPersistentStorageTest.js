({
    // WebSQL is supported in only these modern browsers: http://caniuse.com/sql-storage
    // TODO(W-1766465): Currently we hardcode the size of the websql database. This pops up a box in Safari(Desktop, Iphone & Ipad) that we
    //                  can't accept or override from the test. Once this bug is fixed, the below list of browsers can be enabled.
    // browsers:["GOOGLECHROME", "IPAD", "IPHONE", "ANDROID_PHONE", "ANDROID_TABLET"],
	browsers:["GOOGLECHROME", "ANDROID_PHONE", "ANDROID_TABLET"],
    setUp : function(cmp) {
        $A.test.overrideFunction($A.storageService, "selectAdapter", function() {
            return "websql";
        });
        //clearStorageOnInit set to false
        $A.storageService.initStorage("actions", false, true, 1024, 200, 300, true, false);
    },

    /**
     * Verify that GVPs are stored in aura storage named "actions" when available and persist across apps.
     */
    testGvpsPersistInStorage:{
        test: function(cmp) {
            //Fetch the label using gvp, which causes a server action
            $A.test.setTestTimeout(15000);

            $A.get("$Label" + ".Related_Lists" + ".task_mode_today");
            $A.test.assertTrue($A.test.isActionPending(),
                "Test Setup Failure: test expects the label to be fetched from server");
            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function(){
                    //Verify that label is available
                    $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                        "Failed to fetch label from server dynamically");
                    //Check for GVPs in Storage
                    var storage = $A.storageService.getStorage("actions");
                    $A.test.assertDefined(storage, "Test setup failure: storage name actions required");
                    storage.get("globalValueProviders")
                        .then(function(item) {
                        cmp._foundGvps = true;
                        //Setup for step 2, change one of the labels
                        item.value[0].values["Related_Lists"]["task_mode_today"] = "Yesterday";
                        storage.put("globalValueProviders", item.value);
                    });
                }
            );
            $A.test.addWaitForWithFailureMessage(
                true,
                function(){return cmp._foundGvps},
                "Failed to store global value providers in storage"
            );
        }
    }
})