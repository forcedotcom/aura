({
    render: function(component){
        $A.mark("Rendering time for performanceTest:inheritance component");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:inheritance component");
    },

    rerender: function(component){
	$A.mark("Rerender time for performanceTest:inheritance component");
        this.superRerender();
        $A.endMark("Rerender time for performanceTest:inheritance component");
    }
})