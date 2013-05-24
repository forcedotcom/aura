({
	cExecuteInForeground : function(component) {
		var serverAction = component.get("c.executeInForeground");
		
		serverAction.setCallback(this, function(action) {
			//no-op
		});
		
		serverAction.runAfter(serverAction);
	},
	cExecuteInForegroundWithReturn : function(component) {
		var serverAction = component.get("c.executeInForegroundWithReturn");
		serverAction.setParams({ i : 0 });
		serverAction.setCallback(this, function(action) {
			//no-op
		});
		
		serverAction.runAfter(serverAction);
	},
	cExecuteInBackground : function(component) {
		var serverAction = component.get("c.executeInBackground");
		
		serverAction.setCallback(this, function(action) {
			//no-op
		});
		
		serverAction.runAfter(serverAction);
	},
	cExecuteInBackgroundWithReturn : function(component) {
		var serverAction = component.get("c.executeInBackgroundWithReturn");
		serverAction.setParams({ i : 0 });
		
		serverAction.setCallback(this, function(action) {
			//no-op
		});
		
		serverAction.runAfter(serverAction);
	},
	clientSideAction : function(component) {
	    //foo
	}
})