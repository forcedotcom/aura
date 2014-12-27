({
    setOutput: function(c, evt, field) {
    	var msg = evt.preventDefault ? 'DOM event' : 'Aura Event';
    	c.set("v."+field, msg);
    }
})