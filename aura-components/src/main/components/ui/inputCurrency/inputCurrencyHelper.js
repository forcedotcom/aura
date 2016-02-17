/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        return cmp.find("input").getElement();
    },
    setInvalidValueError: function (cmp, value) {
        cmp.set('v.errors', [{
            message: 'Invalid value was passed.' + (value ? ' - ' + value : '')
        }]);
    },
    removeErrors: function (cmp) {
        var errors = cmp.get('v.errors');
        if ($A.util.isArray(errors) && errors.length) {
            cmp.set('v.errors', []);
        }
    },
    setValue : function (cmp, newValue, isFromOutside) {
        cmp.set('v.updateWasFromOutside', !!isFromOutside);
        cmp.set('v.value', String(newValue));
    }
});
