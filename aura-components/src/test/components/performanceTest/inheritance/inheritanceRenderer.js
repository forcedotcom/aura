({
    render: function(component){
        $A.Perf.mark("Rendering time for performanceTest:inheritance component");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for performanceTest:inheritance component");
    },

    rerender: function(component){
	$A.Perf.mark("Rerender time for performanceTest:inheritance component");
        this.superRerender();
        $A.Perf.endMark("Rerender time for performanceTest:inheritance component");
    }
})