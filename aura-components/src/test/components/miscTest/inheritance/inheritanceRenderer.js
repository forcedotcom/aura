({
    render: function(component){
        $A.Perf.mark("Rendering time for miscTest:inheritance component");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for miscTest:inheritance component");
    },

    rerender: function(component){
	$A.Perf.mark("Rerender time for miscTest:inheritance component");
        this.superRerender();
        $A.Perf.endMark("Rerender time for miscTest:inheritance component");
    }
})