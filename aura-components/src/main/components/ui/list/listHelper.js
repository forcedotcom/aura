({
 	init: function(component) {
		var dataProvider = component.getValue("v.dataProvider").unwrap();
		
		if (dataProvider && dataProvider.length && dataProvider.length > 0) {
			dataProvider = dataProvider[0];
			dataProvider.addHandler("onchange", component, "c.handleDataChange");
			console.log("Firing data provide");
			dataProvider.get("e.provide").fire();
		}
	}
})