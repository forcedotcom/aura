({
	showTarget : function(component) {
		var evt = $A.get('e.ui:popupTargetToggle');
		evt.setParams({
			component : component,
			show : true
		});
		evt.fire();
	},
	
	hideTarget : function(component) {
		var evt = $A.get('e.ui:popupTargetToggle');
		evt.setParams({
			component : component,
			show : false
		});
		evt.fire();
	}
})