({
    render: function(cmp) {
    	var dom       = this.superRender();

    	cmp.set("v.rendered", true);

    	return dom;
	}
})
