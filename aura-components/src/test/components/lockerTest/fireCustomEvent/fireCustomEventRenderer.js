({
    afterRender: function(cmp) {
        var div = cmp.find('aura-firing').getElement();
        div.dispatchEvent(new CustomEvent('aura-event-foo', { bubbles: true, composed: true }));    
    }
})