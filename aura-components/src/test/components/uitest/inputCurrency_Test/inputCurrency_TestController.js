({
    setNewValueAsNumber : function (cmp) {
        cmp.find('input').set('v.value', 1234);
    },
    setNewValueAsString : function (cmp) {
        cmp.find('input').set('v.value', '5678');
    },
    setNewValueAsWellFormatted : function (cmp) {
        cmp.find('input').set('v.value', '$5,678.00');
    },
    setNewValueIncorrect : function (cmp) {
        cmp.find('input').set('v.value','35Aai#i');
    },
    handleChange: function(component, event) {
        var src = event.getSource();
        component.set('v.eventSource', src.type);
        component.set('v.eventValue', src.get('v.value'));
    }
})