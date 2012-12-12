({
    render: function(component){
    	$A.mark("performanceTest:iterateComponents Render Time");
    	return this.superRender();
    },

    afterRender: function(component){
    	var ret = this.superAfterRender();
    	$A.measure("Rendering time for performanceTest:iterateComponents", "performanceTest:iterateComponents Render Time");
    	return ret;
    },

    rerender: function(component){
    	$A.mark("performanceTest:iterateComponents Rerender Time");
    	var ret = this.superRerender();
    	$A.measure("Rerender time for performanceTest:iterateComponents", "performanceTest:iterateComponents Rerender Time");
    	return ret;
    }
})