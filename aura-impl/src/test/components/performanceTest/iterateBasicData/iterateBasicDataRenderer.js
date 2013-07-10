({
    render: function(component){
        $A.mark("Rendering time for performanceTest:iterateBasicData");
        return this.superRender();
    },

    afterRender: function(component){
        this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:iterateBasicData");
    },

    rerender: function(component){
        $A.mark("Rerender time for performanceTest:iterateBasicData");
        this.superRerender();
        $A.endMark("Rerender time for performanceTest:iterateBasicData");
    }
})