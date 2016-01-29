({
    isNumberInRange: function (number, cmp) {
        var lib = this.inputNumberLibrary.number;
        var min = +cmp.get('v.min');
        var max = +cmp.get('v.max');
        var formatter = cmp.get('v.format');

        number = lib.isNumber(number) ? number : lib.unFormatNumber(number, formatter);

        return number <= max && number >= min;
    },
    isValueValid: function (number, formatter) {
        var lib = this.inputNumberLibrary.number;
        return lib.isNumber(number) || number === '' || lib.formatNumber(lib.unFormatNumber(number, formatter), formatter) === number;
    },
    handleNewValue: function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var isFromOutSide = cmp.get('v.updateWasFromOutside');
        var value = cmp.get('v.value');

        if (this.isValueValid(value, formatter)) {
            this.removeErrors(cmp);
            if (isFromOutSide) {
                this.setAttributes(cmp);
                cmp.set('v.updateWasFromOutside', true);
            } else {
                cmp.set('v.last_value', this.getElementInput(cmp).value);
            }
        } else {
            this.setValueNull(cmp);
            this.setInvalidValueError(cmp, value);
        }
    },
    setAttributes: function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var value = cmp.get('v.value') ? lib.formatNumber(cmp.get('v.value'), formatter) : cmp.get('v.value');

        cmp.set('v.input_value', value);
        cmp.set('v.last_value', value);
    },
    getElementInput: function (cmp) {
        return cmp.getElement().getElementsByTagName('input')[0];
    },
    setInvalidValueError: function (cmp, value) {
        cmp.set('v.errors', [{
            message: 'Invalid value was pass.' + (value ? ' - ' + value : '')
        }]);
    },
    removeErrors: function (cmp) {
        cmp.set('v.errors', []);
    },
    setValueNull: function (cmp) {
        cmp.set('v.value', '');
    }
})