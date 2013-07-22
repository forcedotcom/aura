({
	showMore: function(component, event, helper) {
		var currentPageValue = component.get("v.currentPage"); 
	
    	var currentPage = parseInt(currentPageValue, 10);
		var targetPage = currentPage + 1;
        
        component.getValue("v.currentPage").setValue(targetPage, true);
        
        helper.triggerDataProvider(component.getSuper());
	}
})