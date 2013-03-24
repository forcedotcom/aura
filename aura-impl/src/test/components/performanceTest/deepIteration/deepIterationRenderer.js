({
    render: function(component){
        $A.mark("Rendering time for performanceTest:deepIteration");
        $A.mark("Rerender time for performanceTest:deepIteration");
        return this.superRender();
    },

    afterRender: function(component){
        var ret = this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:deepIteration");
        return ret;
    },

    rerender: function(component){
        $A.mark("performanceTest:deepIteration Rerender Time");
        var ret = this.superRerender();
        $A.endMark("Rerender time for performanceTest:deepIteration");
        return ret;
    }
})