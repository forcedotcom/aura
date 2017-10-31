({
    render: function(cmp) {
        var ret = this.superRender();
        cmp.get('v.lifeCycleLog').push('component render');
        return ret;
    },

    afterRender: function(cmp) {
        var log = cmp.get('v.lifeCycleLog');
        log.push('interop afterRender');
        this.superAfterRender();
        log.push('component afterRender');
    }
})