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
        if (['input','change','keypress','keydown','keyup'].indexOf(cmp.get('v.updateOn')) === -1) {
            cmp.set('v.updateOn','change');
        }
    },
    isNumberInRange: function (cmp) {
        var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991
          , MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991
          , lib              = this.inputNumberLibrary.number
          , formatter        = cmp.get('v.format')
          , number           = cmp.get('v.inputValue');
        number = lib.isNumber(number) ? number : lib.unFormatNumber(number, formatter);

        return number <= MAX_SAFE_INTEGER && number >= MIN_SAFE_INTEGER;
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
        var eventMap = {
            input : 'input',
            keypress : 'input',
            keyup : 'input',
            keydown : 'input',
            change  : 'change'
        };
        return eventMap[cmp.get('v.updateOn').toLowerCase()] === eventType;
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
            //Framework allows attribute of type Decimal to set to String number
            if (typeof value === "string" && !$A.util.isEmpty(value)){
                cmp.set("v.value", Number(value));
            }
            
            this.formatInputValue(cmp);
            this.updateLastInputValue(cmp);
        } else {
            this.setValueEmpty(cmp);
            $A.logger.warning('Invalid value was passed(' + value + ')');
        }
    },
    setValueEmpty : function (cmp) {
        if (cmp.get('v.value') !== null) {
            cmp.set('v.value', null);
            this.fireChangeEvent(cmp);
        }
    },
    formatInputValue : function (cmp) {
        var lib = this.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');
        var newInputValue = lib.formatNumber(this.getScaledValue(cmp), formatter);
            newInputValue = this.hasInputElementFocus(cmp) ? this.removeSymbols(newInputValue) : newInputValue;

        cmp.set('v.inputValue', newInputValue);
    },
    convertInputValueToInternalValue : function (cmp) {
        var lib        = this.inputNumberLibrary.number;
        var formatter  = cmp.get("v.format");
        var inputValue = cmp.get("v.inputValue");
        return this.getUnScaledValue(cmp, lib.unFormatNumber(inputValue, formatter));
    },
    getScaledValue : function (cmp) {
        // number.js's formatNumber handles %, so no need to worry about it here
        return  Number(cmp.get('v.value') + 'e' + cmp.get('v.valueScale'));
    },
    getUnScaledValue : function (cmp, inputValue) {
        var valueScale = cmp.get('v.valueScale');
        if (this.isPercentStyle(cmp)) {
            // is cmp is implementing percent, it should convert value back base on the scale
            // .5 is 50% => scale 0 == -2 in back operation
            return Number(inputValue + 'e' + (-valueScale - 2));
        } else {
            return Number(inputValue + 'e' + (-valueScale));
        }
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
        var inputValue = cmp.get('v.inputValue');
        if (!inputValue.length) {
            this.setValueEmpty(cmp);
            return;
        }
        var newValue = this.convertInputValueToInternalValue(cmp);
        if (cmp.get('v.value') !== newValue) {
            cmp.set('v.value', newValue);
            this.fireChangeEvent(cmp);
        }
    },
    fireChangeEvent : function (cmp) {
        cmp.getEvent('change').fire();
    },
    hasChangedValue : function (cmp) {
        var value = String(cmp.get('v.value'));
        var inputValue = cmp.get("v.inputValue");
        
        // convertInputValueToInternalValue() returns 0 whenever inputValue is ""
        return String(this.convertInputValueToInternalValue(cmp)) !== value || (inputValue === "" && value === "0");
    },
    removeSymbols : function (string) {
        var decimalSeparator  = $A.get("$Locale.decimal");
        var groupingSeparator = $A.get("$Locale.grouping");

        // case where parenthesis means negative
        string = string.replace(/(^\()(.+)(\)$)/,'-$2');

        var reg = '[^\\' + groupingSeparator + '\\' + decimalSeparator +'\\d\+\-]';
            reg = new RegExp(reg,'g');
        return string.replace(reg,'');
    }
});
