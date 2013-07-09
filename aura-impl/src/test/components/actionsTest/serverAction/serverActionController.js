({
	cExecuteInForeground : function(component) {
		var serverAction = component.get("c.executeInForeground");
		
		serverAction.setCallback(this, function(action) {
			//no-op
		});
		
		$A.enqueueAction(serverAction);
	},
	cExecuteInForegroundWithReturn : function(component) {
		var serverAction = component.get("c.executeInForegroundWithReturn");
		serverAction.setParams({ i : 0 });
		serverAction.setCallback(this, function(action) {
			//no-op
		});
		
		$A.enqueueAction(serverAction);
	},
	cExecuteInBackground : function(component) {
		var serverAction = component.get("c.executeInBackground");
		
		serverAction.setCallback(this, function(action) {
			//no-op
		});
		
		$A.enqueueAction(serverAction);
	},
	cExecuteInBackgroundWithReturn : function(component) {
		var serverAction = component.get("c.executeInBackgroundWithReturn");
		serverAction.setParams({ i : 0 });
		
		serverAction.setCallback(this, function(action) {
			//no-op
		});
		
		$A.enqueueAction(serverAction);
	}
})
