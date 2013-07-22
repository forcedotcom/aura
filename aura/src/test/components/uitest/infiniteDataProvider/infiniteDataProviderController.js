({
    provide: function(component, event, helper){
    	component = component.getConcreteComponent();
        var currentPage = component.get("v.currentPage");
        var pageSize = component.get("v.pageSize");
        
        var start = (currentPage - 1) * pageSize;
        
        var data = [];
        
        for (var i=start; i < start+pageSize; i++) {
			data.push({
				index: i+1,
				char: String.fromCharCode(65 + (i%26))
			});        	
        }
        
        // TODO: figure out why this server hit is necessary to get the parent scroller to refresh...
        
    	var action = component.get("c.justHitTheServer");
    	action.setCallback(this, function(action) {
			// we don't actually care--we just want the server action lifecycle to fire so the scroller will refresh...
		    
        	helper.fireDataChangeEvent(component, data); 
    	});
    	this.runAfter(action);

		// this should be all that's needed...        
        //helper.fireDataChangeEvent(component, data);
    }
})