({
	handler: function(cmp, event, helper) {
		if(!cmp.counter) {
			cmp.counter = 0;
		}
		cmp.counter++;
	}
})