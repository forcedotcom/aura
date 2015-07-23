({
	render: function(cmp, helper) {
		var dom = this.superRender(),
			fragment = document.createDocumentFragment();
		
		for (var i = 0; i < cmp._virtualItems.length; i++) {
			fragment.appendChild(cmp._virtualItems[i]);
		}
		
		cmp.find("body").getElement().appendChild(fragment);
		return dom;
	},
	
	afterRender: function(cmp, helper) {
		return this.superAfterRender();
	},
	
	rerender: function(cmp, helper) {
		var dom = this.superRerender(),
			fragment = document.createDocumentFragment();
		
		for (var i = 0; i < cmp._virtualItems.length; i++) {
			fragment.appendChild(cmp._virtualItems[i]);
		}
		
		var body = cmp.find("body").getElement();
		
		while (body.firstChild) {
			body.removeChild(body.firstChild);
		}
		body.appendChild(fragment);
		
		return dom;
	}
})