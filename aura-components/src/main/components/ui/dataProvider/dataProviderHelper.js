({ 
    fireDataChangeEvent: function (dataProvider, data) {
    	var dataChangeEvent = dataProvider.getEvent("onchange");
    	dataChangeEvent.setParams({
    		data : data
    	}).fire();
    },
	
    invokeProvide:function(component){
        component.getConcreteComponent().get("c.provide").run();
    }
})