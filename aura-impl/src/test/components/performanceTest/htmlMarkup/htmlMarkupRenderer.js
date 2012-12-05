({
    render: function(component){
    	$A.mark("performanceTest:htmlMarkup Render Time");
    	return this.superRender();
    },

    afterRender: function(component){
    	var ret = this.superAfterRender();
    	$A.measure("Rendering time for performanceTest:htmlMarkup", "performanceTest:htmlMarkup Render Time");
    	return ret;
    },

    rerender: function(component){
    	$A.mark("performanceTest:htmlMarkup Rerender Time");
    	var ret = this.superRerender();
    	$A.measure("Rerender time for performanceTest:htmlMarkup", "performanceTest:htmlMarkup Rerender Time");
    	return ret;
    }
})