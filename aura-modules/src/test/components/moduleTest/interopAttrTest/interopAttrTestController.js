({
    handleChange: function(cmp, event, helper) {
        cmp.set('v.result', event.getParam('value'));
    },

    handleRadioInputChange: function(cmp, event, helper) {
        var value = cmp.find('inputRadio').get('v.checked');
        cmp.set('v.radioChecked', value);
    }
})