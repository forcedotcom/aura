({   
	doInit: function(component) {
	   	var val = $A.localizationService.formatDate(component.get("m.text"), 'MMM DD, YYYY', 'fr');	        	
		component.getValue('m.text').setValue(val);
    },

	getVal: function(component) {
	   	var val = $A.localizationService.formatDate(component.get("m.text"), 'MMM DD, YYYY', 'fr');	        	
		return val;
    }
})
