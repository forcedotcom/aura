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
    setDefaultAttrs : function (cmp) {
        this.setDefaultStyle(cmp);
        this.setDefaultFormat(cmp);
        this.setDefaultUpdateOn(cmp);
    },
    setDefaultStyle : function (cmp) {
        var style = cmp.get('v.style');
        if (['number','currency','percent'].indexOf(style.toLowerCase()) !== -1) {
            cmp.set('v.style',style.toLowerCase());
        } else {
            cmp.set('v.style','number');
        }
    },
    setDefaultFormat : function (cmp) {
        var formatter = cmp.get('v.format');
        try {
            $A.localizationService.getNumberFormat(formatter);
        } catch (e) {
            switch (cmp.get('v.style')) {
                case 'number':
                    cmp.set('v.format', $A.get("$Locale.numberFormat"));
                    break;
                case 'currency':
                    cmp.set('v.format', $A.get("$Locale.currencyFormat"));
                    break;
                case 'percent':
                    cmp.set('v.format', $A.get("$Locale.percentFormat"));
                    break;
            }
        }
    },
    setDefaultUpdateOn : function (cmp) {
        if (['input','change'].indexOf(cmp.get('v.updateOn')) === -1) {
            cmp.set('v.updateOn','change');
        }
    },
    isNumberInRange: function (cmp) {
        var lib =       this.inputNumberLibrary.number;
        var min =      +cmp.get('v.min');
        var max =      +cmp.get('v.max');
        var formatter = cmp.get('v.format');
        var number =    cmp.get('v.inputValue');

        number = lib.isNumber(number) ? number : lib.unFormatNumber(number, formatter);

        return number <= max && number >= min;
    },
    isValidValue: function (number, formatter) {
        var lib = this.inputNumberLibrary.number;
        // we accept how VALID values
        // - primitive Number
        // - any not NaN (number strings, empty string)
        // - right formatted string numbers like 3,500.00

        return !$A.util.isUndefinedOrNull(number) &&
            (lib.isNumber(number) || !isNaN(number) || this.isFormattedValue(number, formatter));
    },
    isInputValueValid : function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var inputValue = cmp.get('v.inputValue');

        return lib.isFormattedNumber(inputValue, formatter) && this.isNumberInRange(cmp);
    },
    isFormattedValue : function (string, formatter) {
        var lib = this.inputNumberLibrary.number;
        return lib.formatNumber(lib.unFormatNumber(string, formatter), formatter) === string;
    },
    isPercentStyle : function (cmp) {
        return cmp.get('v.format').indexOf('%') !== -1;
    },
    hasInputElementFocus : function (cmp) {
       return this.getElementInput(cmp) ===  document.activeElement;
    },
    weHaveToUpdate : function (cmp, eventType) {
        return cmp.get('v.updateOn') === eventType;
    },
    handleNewValue: function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var value = cmp.get('v.value');

        if ($A.util.isUndefinedOrNull(value)) {
            cmp.set('v.inputValue','');
            this.updateLastInputValue(cmp);
            return;
        }

        if (this.isValidValue(value, formatter)) {

            if (this.isFormattedValue(value,formatter)) {
                cmp.set('v.value',lib.unFormatNumber(value,formatter));
                return;
            }

            this.formatInputValue(cmp);
            this.updateLastInputValue(cmp);
        } else {
            this.setValueEmpty(cmp);
            $A.logger.warning('Invalid value was passed(' + value + ')');
        }
    },
    setValueEmpty : function (cmp) {
        cmp.set('v.value',undefined);
    },
    formatInputValue : function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var newInputValue = lib.formatNumber(this.getScaledValue(cmp), formatter);
            newInputValue = this.hasInputElementFocus(cmp) ? this.removeSymbols(newInputValue) : newInputValue;

        cmp.set('v.inputValue', newInputValue);
    },
    getScaledValue : function (cmp) {
        return  Number(cmp.get('v.value') + 'e' + cmp.get('v.valueScale'));
    },
    updateLastInputValue : function (cmp) {
        cmp.set('v.lastInputValue',cmp.get('v.inputValue'));
    },
    restoreLastInputValue : function (cmp) {
        cmp.set('v.inputValue', cmp.get('v.lastInputValue'));
    },
    getElementInput: function (cmp) {
        return cmp.find("input").getElement();
    },
    setNewValue : function (cmp) {
        var lib        = this.inputNumberLibrary.number;
        var formatter  = cmp.get('v.format');
        var inputValue = cmp.get('v.inputValue');
        var valueScale = cmp.get('v.valueScale');

        if (!inputValue.length) {
            this.setValueEmpty(cmp);
            return;
        }

        var newValue = lib.unFormatNumber(inputValue, formatter);
            // is cmp is implementing percent, it should convert value back base on the scale
            // 'cause .5 is 50% => scale 0 == -2 in back operation.
            newValue = this.isPercentStyle(cmp) ? Number(newValue + 'e' + (-valueScale - 2)) : newValue;

        cmp.set('v.value',newValue);
    },
    hasChangedValue : function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var inputValue = cmp.get('v.inputValue');

        return String(lib.unFormatNumber(inputValue, formatter)) !== String(cmp.get('v.value'));
    },
    removeSymbols : function (string) {
        var decimalSeparator  = $A.get("$Locale.decimal");
        var groupingSeparator = $A.get("$Locale.grouping");
        var reg = '[^\\' + groupingSeparator + '\\' + decimalSeparator +'\\d\+\-]';
            reg = new RegExp(reg,'g');
        return string.replace(reg,'');
    }
});
