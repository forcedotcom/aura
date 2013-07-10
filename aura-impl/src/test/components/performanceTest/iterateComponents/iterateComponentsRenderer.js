({
    render: function(component){
        $A.mark("Rendering time for performanceTest:iterateComponents");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:iterateComponents");
    },

    rerender: function(component){
        $A.mark("Rerender time for performanceTest:iterateComponents");
        this.superRerender();
        $A.endMark("Rerender time for performanceTest:iterateComponents");
    }
})