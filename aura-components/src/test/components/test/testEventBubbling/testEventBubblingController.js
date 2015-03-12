({
	handlerDataChange: function (cmp, event, helper) {
        console.log('bubble!');
		cmp.set('v.bubble', true);
	}
})