({
    render: function(component){
        $A.mark("Rendering time for performanceTest:inheritance component");
        $A.mark("Rerender time for performanceTest:inheritance component");
        return this.superRender();
    },

    afterRender: function(component){
        var ret = this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:inheritance component");
        return ret;
    },

    rerender: function(component){
        $A.mark("performanceTest:inheritance Rerender Time");
        var ret = this.superRerender();
        $A.endMark("Rerender time for performanceTest:inheritance component");
        return ret;
    }
})