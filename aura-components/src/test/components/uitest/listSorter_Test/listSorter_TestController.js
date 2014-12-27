({
	handleApplyPressed: function(cmp, list, helper){
		helper.handleApplyPressed(cmp, list, "defaultListSorterResult");
	},

	handleApplyPressedForLargeList: function(cmp, list, helper){
		helper.handleApplyPressed(cmp, list, "largeListSorterResult");
	},

	handleCancelPressed: function(cmp){
		cmp.set("v.cancelEventFired", true);
	}
})