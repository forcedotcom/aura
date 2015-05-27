({
    render: function(component){
        $A.Perf.mark("Rendering time for miscTest:iterateComponents");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.Perf.endMark("Rendering time for miscTest:iterateComponents");
    },

    rerender: function(component){
        $A.Perf.mark("Rerender time for miscTest:iterateComponents");
        this.superRerender();
        $A.Perf.endMark("Rerender time for miscTest:iterateComponents");
    }
})