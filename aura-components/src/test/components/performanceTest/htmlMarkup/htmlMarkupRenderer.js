({
    render: function(component){
        $A.Perf.mark("Rendering time for performanceTest:htmlMarkup");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for performanceTest:htmlMarkup");
    },

    rerender: function(component){
	$A.Perf.mark("Rerender time for performanceTest:htmlMarkup");
        this.superRerender();
        $A.Perf.endMark("Rerender time for performanceTest:htmlMarkup");
    }
})