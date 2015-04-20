({
	fireEvent: function (cmp, event, helper) {
		var onChangeEvent = cmp.get('e.notifyUp'); // ui:refresh
		onChangeEvent.fire();
	}
})