({
	handleDataChange: function(component, event, helper) {
		component.getValue("v.items").setValue(event.getParam("data"));
	},
	
	init: function(component, event, helper) {
		helper.init(component);
	}
})