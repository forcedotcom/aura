({
    provide: function(component, event, controller) {
    	var data = component.get("m.stringList"); 
		
        var dataProvider = component.getConcreteComponent();
        this.fireDataChangeEvent(dataProvider, data);
    }
})
