({
    render: function(component){
        $A.Perf.mark("Rendering time for performanceTest:deepIteration");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for performanceTest:deepIteration");
    },

    rerender: function(component){
	$A.Perf.mark("Rerender time for performanceTest:deepIteration");
        this.superRerender();
        $A.Perf.endMark("Rerender time for performanceTest:deepIteration");
    }
})