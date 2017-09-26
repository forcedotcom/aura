({
    handleChange: function(component, event) {
        var src = event.getSource();
        component.set('v.eventSource', src.type);
        component.set('v.eventValue', src.get('v.value'));
    }
})