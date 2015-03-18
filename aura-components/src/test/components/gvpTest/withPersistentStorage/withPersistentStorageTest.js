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
    
    tearDown : function(cmp) {
    	//back to normal
    	$A.test.setServerReachable(true);
    },
    
    /**
     * Verify that GVPs are stored in aura storage named "actions" when available and persist across apps.
     * add step3 for W-2486716
     */
    testGvpsPersistInStorage:{
        test: [function(cmp) {
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
                        //Setup for stage 3, change one of the labels
                        for(var i=0; i<item.value.length; i++) {
                        	var vi = item.value[i];
                        	if(vi.values && vi.values["Related_Lists"] && vi.values["Related_Lists"]["task_mode_today"]) {
                        		vi.values["Related_Lists"]["task_mode_today"] = "Yesterday";
                        	}
                        }
                        storage.put("globalValueProviders", item.value);
                    });
                }
            );
            $A.test.addWaitForWithFailureMessage(
                true,
                function(){return cmp._foundGvps},
                "Failed to store global value providers in storage"
            );
        }, function(cmp) {
        	//$A.test.setTestTimeout(600000);
        	//go offline
        	$A.test.setServerReachable(false);
        	//now we should still be able to get the label from globalValueProvider
        	$A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                "Failed to fetch label from aura context");
        }, function(cmp) {
        	//TODO: W-2497478. This blockRequests is work-around.
        	//even with CSP allow http://offline, there is still issue where aura GET blocking 
        	//persist storage from updating the value. this doesn't happen everytime though.
        	$A.test.blockRequests();
        	//if we don't pull what's in storage into globalValueProvider
        	$A.getContext().clearGlobalValueProvider(false);
        	//label is not available
        	$A.test.assertEquals("[Related_Lists.task_mode_today]", 
        			$A.get("$Label.Related_Lists.task_mode_today"),
        			"we shouldn't have label in globalValueProvider");
        //},function(cmp) {
        	//now let's update globalValueProvider with what storage has
        	$A.getContext().clearGlobalValueProvider(true);
        	//we should still be able to get the label from storage
        	//getting storage is async, we need to wait on it 
        	$A.test.addWaitForWithFailureMessage(
        		"Yesterday",
        		function() { return $A.get("$Label.Related_Lists.task_mode_today"); },
        		"fail to get Label from storage",
        		function() {
        			$A.test.setServerReachable(true);
        			//TODO: W-2497478. remove this when it's solved
        			$A.test.releaseRequests();
        		}
		     );
        }
        ]
    }
})