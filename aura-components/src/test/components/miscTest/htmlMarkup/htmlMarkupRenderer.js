({
    render: function(component){
        $A.Perf.mark("Rendering time for miscTest:htmlMarkup");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for miscTest:htmlMarkup");
    },

    rerender: function(component){
	$A.Perf.mark("Rerender time for miscTest:htmlMarkup");
        this.superRerender();
        $A.Perf.endMark("Rerender time for miscTest:htmlMarkup");
    }
})