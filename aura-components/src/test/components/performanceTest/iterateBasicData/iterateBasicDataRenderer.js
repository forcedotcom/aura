({
    render: function(component){
        $A.Perf.mark("Rendering time for performanceTest:iterateBasicData");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for performanceTest:iterateBasicData");
    },

    rerender: function(component){
        $A.Perf.mark("Rerender time for performanceTest:iterateBasicData");
        this.superRerender();
        $A.Perf.endMark("Rerender time for performanceTest:iterateBasicData");
    }
})