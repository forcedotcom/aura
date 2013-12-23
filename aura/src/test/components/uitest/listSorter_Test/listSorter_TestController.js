({
	applyPressed: function(cmp, list, helper){
		//if list contains "-" then its descending order
		var desc = "-";
		list = list.toString();
		var sortOrder;
		//ascending order
		if(!list.indexOf(desc) != -1){
			list = list.replace("-","");
			sortOrder = list + " : Z-A"
		}
		else{
			sortOrder = list + " : A-Z"
		}
		var resultCmp = cmp.find("defaultListSorterResult");
        resultCmp.setValue("v.value", sortOrder);
	},
	
	cancelPressed: function(cmp){
		cmp.getValue("v.cancelEventFired").setValue(true);
	}
})