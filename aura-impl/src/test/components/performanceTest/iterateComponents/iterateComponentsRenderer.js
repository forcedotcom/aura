({
    render: function(component){
        $A.mark("Rendering time for performanceTest:iterateComponents");
        $A.mark("Rerender time for performanceTest:iterateComponents");
        return this.superRender();
    },

    afterRender: function(component){
        var ret = this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:iterateComponents");
        return ret;
    },

    rerender: function(component){
        $A.mark("performanceTest:iterateComponents Rerender Time");
        var ret = this.superRerender();
        $A.endMark("Rerender time for performanceTest:iterateComponents");
        return ret;
    }
})