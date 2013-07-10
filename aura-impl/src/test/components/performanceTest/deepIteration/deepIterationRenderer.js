({
    render: function(component){
        $A.mark("Rendering time for performanceTest:deepIteration");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:deepIteration");
    },

    rerender: function(component){
	$A.mark("Rerender time for performanceTest:deepIteration");
        this.superRerender();
        $A.endMark("Rerender time for performanceTest:deepIteration");
    }
})