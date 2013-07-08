({
    render: function(component){
        $A.mark("Rendering time for performanceTest:htmlMarkup");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:htmlMarkup");
    },

    rerender: function(component){
	$A.mark("Rerender time for performanceTest:htmlMarkup");
        this.superRerender();
        $A.endMark("Rerender time for performanceTest:htmlMarkup");
    }
})