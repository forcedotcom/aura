({
    render: function(component){
        $A.Perf.mark("Rendering time for performanceTest:iterateComponents");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for performanceTest:iterateComponents");
    },

    rerender: function(component){
        $A.Perf.mark("Rerender time for performanceTest:iterateComponents");
        this.superRerender();
        $A.Perf.endMark("Rerender time for performanceTest:iterateComponents");
    }
})