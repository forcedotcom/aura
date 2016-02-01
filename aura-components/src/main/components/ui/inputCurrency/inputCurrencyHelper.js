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
        // we accept how VALID values
        // - primitive Number
        // - any not NaN (number strings, empty string or null)
        // - right formatted string numbers like 3,500.00
        return lib.isNumber(number) || !isNaN(number) || lib.formatNumber(lib.unFormatNumber(number, formatter), formatter) === number;
    },
    handleNewValue: function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var isFromOutSide = cmp.get('v.updateWasFromOutside');
        var value = cmp.get('v.value');

        if (this.isValueValid(value, formatter)) {

            if (isFromOutSide) {
                this.removeErrors(cmp);
                // case is a valid formatted string number
                // 1,234.00
                if (isNaN(value)) {
                    this.setValue(cmp,lib.unFormatNumber(value));
                    return;
                }

                this.setAttributes(cmp);
            } else {
                cmp.set('v.lastValue', this.getElementInput(cmp).value);
                cmp.set('v.updateWasFromOutside', true);
            }
        } else {
            this.setInvalidValueError(cmp, value);
        }
    },
    setAttributes: function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var value = cmp.get('v.value') ? lib.formatNumber(cmp.get('v.value'), formatter) : cmp.get('v.value');

        cmp.set('v.inputValue', value);
        cmp.set('v.lastValue', value);
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
        if (cmp.get('v.errors').length) {
            cmp.set('v.errors', []);
        }
    },
    setValue : function (cmp, newValue, isFromOutside) {
        cmp.set('v.updateWasFromOutside', !!isFromOutside);
        cmp.set('v.value', String(newValue), true);
    }
})