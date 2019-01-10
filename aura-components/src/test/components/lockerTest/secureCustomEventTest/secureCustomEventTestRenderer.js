({
    afterRender: function(cmp) {
        var div1 = cmp.find('aura-listening').getElement();
        div1.addEventListener('aura-event-foo', function(event) {
            cmp.set('v.auraEventTarget', event.target + '') ; 
        });

        var div2 = cmp.find('lwc-listening').getElement();
        div2.addEventListener('lwc-event-foo', function(event) {
            cmp.set('v.lwcEventTarget', event.target + '') ; 
        });

        this.superAfterRender();
    }
})