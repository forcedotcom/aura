({
    render: function(component){
        $A.Perf.mark("Rendering time for miscTest:iterateBasicData");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for miscTest:iterateBasicData");
    },

    rerender: function(component){
        $A.Perf.mark("Rerender time for miscTest:iterateBasicData");
        this.superRerender();
        $A.Perf.endMark("Rerender time for miscTest:iterateBasicData");
    }
})