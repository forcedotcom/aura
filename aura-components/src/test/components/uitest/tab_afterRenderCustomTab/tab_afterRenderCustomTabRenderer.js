({
    afterRender: function(cmp) {
        var ret = this.superAfterRender();

        var element = cmp.getElement();
        if ( element ){
            var boundingRect = element.getBoundingClientRect();
            cmp.set('v._afterRenderWidth', boundingRect.width);
            cmp.set('v._afterRenderHeight', boundingRect.height);
            cmp.set('v._isDomPresent', true);
        }
        else{
            cmp.set('v._isDomPresent', false);
        }

        return ret;
    }
})