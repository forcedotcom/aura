({
    render: function(component){
    	$A.mark("performanceTest:deepIteration Render Time");
    	return this.superRender();
    },

    afterRender: function(component){
    	var ret = this.superAfterRender();
    	$A.measure("Rendering time for performanceTest:deepIteration", "performanceTest:deepIteration Render Time");
    	return ret;
    },

    rerender: function(component){
    	$A.mark("performanceTest:deepIteration Rerender Time");
    	var ret = this.superRerender();
    	$A.measure("Rerender time for performanceTest:deepIteration", "performanceTest:deepIteration Rerender Time");
    	return ret;
    }
})