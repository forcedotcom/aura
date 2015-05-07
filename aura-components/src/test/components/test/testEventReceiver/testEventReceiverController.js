({
	handlerDataChange: function (cmp, event, helper) {
		event.stopPropagation();
		cmp.set('v.bubble', true);
	}
})