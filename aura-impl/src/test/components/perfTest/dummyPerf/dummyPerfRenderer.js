({
    afterRender: function (cmp, evt, hlp) {
        var el = cmp.getElement();
        setTimeout(function () {
            $A.util.addClass(el, 'highlight');    
        }, 0);
        
    }
})