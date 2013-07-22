({
	handleDataChange: function(component, event) {
		var newData = event.getParam("data");
        var items = component.getConcreteComponent().getValue("v.items");
        
        for (var i=0, len=newData.length; i<len; i++) {
        	items.push(newData[i]);
        }
	}
})