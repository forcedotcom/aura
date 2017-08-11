({
    button: function(cmp, event, helper) {
    	var id = parseInt(event.target.dataset.id, 10);
    	var tabs = cmp.find("tab");
    	var buttons = cmp.find("button");

    	for (var i = 0; i < tabs.length; i++) {
    		var tab = tabs[i].getElement();
    		var button = buttons[i].getElement();
    		var selected = (i === id);
    		
    		$A.util.toggleClass(tab, "slds-hide", !selected);
    		$A.util.toggleClass(tab, "slds-show", selected);
    		$A.util.toggleClass(button, "slds-is-active", selected);
    	}
    }
})