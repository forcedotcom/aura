({
    render: function(component){
        $A.mark("Rendering time for performanceTest:htmlMarkup");
        $A.mark("Rerender time for performanceTest:htmlMarkup");
        return this.superRender();
    },

    afterRender: function(component){
        var ret = this.superAfterRender();
        $A.endMark("Rendering time for performanceTest:htmlMarkup");
        return ret;
    },

    rerender: function(component){
        $A.mark("performanceTest:htmlMarkup Rerender Time");
        var ret = this.superRerender();
        $A.endMark("Rerender time for performanceTest:htmlMarkup");
        return ret;
    }
})