({
    render: function(cmp) {
    	var dom       = this.superRender();

    	cmp.set("v.rendered", true);
    	console.log(cmp.get("v.rendered"));

    	return dom;
	}
})
