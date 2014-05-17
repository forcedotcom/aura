({	
	afterRender: function (cmp, hlp) {
		var ul;
		
		if (cmp.get('v.enableRowSwipe')) {
			hlp.initializeHandlers(cmp);
			ul = cmp.getElement();
	
			// Just attach the start handler, move and end is conditionally added.
			ul.addEventListener(hlp.getEventNames().start, cmp._ontouchstart, false);
		}
		
        this.superAfterRender();
	}
})