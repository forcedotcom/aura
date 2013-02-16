({
	setUp : function(component){
    	$A.storageService.getStorage("actions").clear();
    },
    
    testStorageOfServerAction:{
        test:function(cmp){
        	var storage = $A.storageService.getStorage("actions");
        	
			cmp.find("button").getEvent("press").fire();

			for (var n = 1; n <= 10; n++) {
				(function() {
					var action;
					var key = "java://org.auraframework.java.controller.ServerStorableActionController/ACTION$storedAction:{\"message\":\"some really cool message #" + n + "\"}";
					var expected = "[from server] some really cool message #" + n;
	
					$A.test.addWaitFor(true, function() {
						// Wait until ServerStorableActionController.storedAction is present in storage
						storage.get(key, function(item) {
							action = item;
						});
						
						return action !== undefined;
					}, function() {
						$A.test.assertEquals(expected, action["returnValue"]);
					});
				})();
			}
        }
    }
})