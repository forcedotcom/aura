({
	updateGvpValue: function(cmp, event, helper) {
		// $A.test.addCleanup(function(){
		//     var action = cmp.get("c.setContextVPValue");
		//     action.setParams(event.getParams());
		//     $A.test.callServerAction(action, true);
		// });

	    var action = cmp.get("c.setContextVPValue");
	    action.setParams(event.getParam("arguments"));
		$A.enqueueAction(action);
	}
})