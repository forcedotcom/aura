({
	init: function (cmp, evt, helper) {
		var listSize = cmp.get("v.initialSize");
		cmp._virtualItems = [];
		
		helper.generateListItems(0, listSize, function(item) {
			cmp._virtualItems.push(item);
		});
    },
    
    onLoadMore: function(cmp, callback, helper) {
    	var currentSize = cmp._virtualItems.length;
    	var tempList = document.createDocumentFragment();
    	
    	setTimeout(function() {
    		helper.generateListItems(currentSize, currentSize + 20, function(item, index) {
	    		cmp._virtualItems.push(item);
	    		tempList.appendChild(item);
	    		
	    		if (index == currentSize + 19) {
	    			cmp.find("body").getElement().appendChild(tempList);
	    			callback();
	    		}
    		})
    	}, cmp.get('v.loadDelay_ms'));
    }
})