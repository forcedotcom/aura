({
	 getRadioMenuSelected: function(cmp, event) {
		  var triggerCmp = cmp.find("radioMenuLabel");
	        if (triggerCmp) {
	            var source = event.getSource();
	            var label = source.get("v.label");
	            triggerCmp.setValue("v.label", label);
	        }
	 }
})
   