({
    setNewValueAsNumber : function (cmp) {
        cmp.find('inputCurrency').set('v.value', 1234);
    },
    setNewValueAsString : function (cmp) {
        cmp.find('inputCurrency').set('v.value', '5678');
    },
    setNewValueAsWellFormatted : function (cmp) {
        cmp.find('inputCurrency').set('v.value', '5,678.00');
    },
    setNewValueIncorrect : function (cmp) {
        cmp.find('inputCurrency').set('v.value','35Aai#i');
    }
})