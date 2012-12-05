({
    render: function(component){
    	$A.mark("performanceTest:inheritance Render Time");
    	return this.superRender();
    },

    afterRender: function(component){
    	var ret = this.superAfterRender();
    	$A.measure("Rendering time for performanceTest:inheritance component", "performanceTest:inheritance Render Time");
    	return ret;
    },

    rerender: function(component){
    	$A.mark("performanceTest:inheritance Rerender Time");
    	var ret = this.superRerender();
    	$A.measure("Rerender time for performanceTest:inheritance component", "performanceTest:inheritance Rerender Time");
    	return ret;
    }
})