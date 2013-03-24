({
    render: function(component){
        $A.mark("Rendering time for performanceTest:iterateBasicData");
        $A.mark("Rerender time for performanceTest:iterateBasicData");
        return this.superRender();
    },

    afterRender: function(component){
        var ret = this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:iterateBasicData");
        return ret;
    },

    rerender: function(component){
        $A.mark("performanceTest:iterateBasicData Rerender Time");
        var ret = this.superRerender();
        $A.endMark("Rerender time for performanceTest:iterateBasicData");
        return ret;
    }
})