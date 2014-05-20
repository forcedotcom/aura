({
	
	onInitChild: function(component) {
		var serverAction = component.get("c.increaseCounter");
		serverAction.setCallback(this, function(action) {
			component.set("v.childCounter",action.getReturnValue());
		});
		
		$A.enqueueAction(serverAction);
	}
})