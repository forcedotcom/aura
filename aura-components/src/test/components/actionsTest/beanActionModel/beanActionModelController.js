({
	onInit : function(component) {
		var serverAction = component.get("c.increaseCounter");
		serverAction.setCallback(this, function(action) {
			component.set("v.counter",action.getReturnValue());
		});
		
		$A.enqueueAction(serverAction);
	}
})