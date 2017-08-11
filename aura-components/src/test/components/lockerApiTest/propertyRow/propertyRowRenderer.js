({
	render : function(component) {

		var ret = component.superRender();
		var tr = component.find("tr").getElement();
		var prop = component.get("v.prop");

		var className;
		switch(prop.status) {
			case "warning":
				className = "slds-theme_warning slds-text-color_inverse";
				break;
			case "fail":
				className = "slds-theme_error";
				break;
		}
		
		tr.innerHTML = '<td><a target="blank" href="#">' + prop.object + '</a></td>' + 
						'<td class="' + className + '">' + prop.objectType + '</td>' + 
						'<td class="' + className + '">' + prop.secureObjectType + '</td>';
				
		return ret;
	}
})