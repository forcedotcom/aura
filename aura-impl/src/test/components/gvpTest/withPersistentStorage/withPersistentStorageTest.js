({
    //WebSQL is supported in only these modern browsers. http://caniuse.com/sql-storage
    browsers:["GOOGLECHROME", "SAFARI", "IPAD", "IPHONE", "ANDROID_PHONE", "ANDROID_TABLET"],
    setUp : function(cmp) {
	$A.test.overrideFunction($A.storageService, "selectAdapter", function() {
		return "websql";});
	//clearStorageOnInit set to false
	$A.storageService.initStorage("actions", false, true, 1024, 200, 300, true, false);
    },
    
    /**
     * Verify that GVPs are stored in aura storage named "actions" when available and persist across apps.
     */
    testGvpsPersistInStorage:{
	test:[
	      //Fetch the label using gvp, which causes a server action
	      function(cmp){
		  $A.test.setTestTimeout(15000);
    		    var gvp = $A.getGlobalValueProviders();
    		    gvp.get("$Label" + ".Related_Lists" + ".task_mode_today");
    		    $A.test.assertTrue($A.test.isActionPending(), 
    	            	"Test Setup Failure: test expects the label to be fetched from server");
    		    $A.test.addWaitFor(
    		                false,
    		                $A.test.isActionPending,
    		                function(){
    		                    //Verify that label is available
    		                    $A.test.assertEquals("Today", gvp.get("$Label.Related_Lists.task_mode_today"), 
    		                	    "Failed to fetch label from server dynamically");
    		                    //Check for GVPs in Storage
    		                    var storage = $A.storageService.getStorage("actions");
    		                    $A.test.assertDefined(storage, "Test setup failure: storage name actions required");
    		                    storage.get("globalValueProviders", function(item) {
    		                	cmp._foundGvps = true;
    		                	//Setup for step 2, change one of the labels
    		                	item[0].values["Related_Lists"]["task_mode_today"] = "Yesterday";
    		                	storage.put("globalValueProviders", item);
    		                    });
    		                }
    		    );
    		    $A.test.addWaitForWithFailureMessage(
    			    true, 
    			    function(){return cmp._foundGvps},
    			    "Failed to store global value providers in storage"
    		    );
	      },
	      function(cmp){
		  var gvp = $A.getGlobalValueProviders();
		  //Force the loading of GVPs from storage service
		  gvp.loadFromStorage();
		  $A.test.addWaitForWithFailureMessage(
			  "Yesterday", 
			  function(){ return gvp.get("$Label.Related_Lists.task_mode_today")},
			  "Failed to load GVPs from storage"
			  );
		  
	      }
	]
    }
    
})