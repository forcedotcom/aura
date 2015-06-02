({
    render: function(component){
        $A.Perf.mark("Rendering time for miscTest:deepIteration");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for miscTest:deepIteration");
    },

    rerender: function(component){
	$A.Perf.mark("Rerender time for miscTest:deepIteration");
        this.superRerender();
        $A.Perf.endMark("Rerender time for miscTest:deepIteration");
    }
})