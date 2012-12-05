({
    render: function(component){
    	$A.mark("performanceTest:iterateBasicData Render Time");
    	return this.superRender();
    },

    afterRender: function(component){
    	var ret = this.superAfterRender();
    	$A.measure("Rendering time for performanceTest:iterateBasicData", "performanceTest:iterateBasicData Render Time");
    	return ret;
    },

    rerender: function(component){
    	$A.mark("performanceTest:iterateBasicData Rerender Time");
    	var ret = this.superRerender();
    	$A.measure("Rerender time for performanceTest:iterateBasicData", "performanceTest:iterateBasicData Rerender Time");
    	return ret;
    }
})