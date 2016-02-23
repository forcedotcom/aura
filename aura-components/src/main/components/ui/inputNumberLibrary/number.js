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

function lib() { // eslint-disable-line no-unused-vars

    var abbreviations = {
        thousand : 'k',
        million  : 'm',
        billion  : 'b',
        trillion : 't'
    };

    function getMaxFractionDigits (pattern, symbols) {
        var decimalSeparator = symbols && symbols.decimalSeparator ? symbols.decimalSeparator : '.';
        var zero = symbols && symbols.zero ? symbols.zero : '0';
        var patternSplit = pattern.split(decimalSeparator);
        var reg = new RegExp('[^(#'+ zero + ']','g');
        if (patternSplit.length > 1) {
            return patternSplit[1].replace(reg,'').length;
        }
        return 0;
    }


    return {
        formatNumber: function (number, formatter) {
            var numberFormat = this.getNumberFormat(formatter);
            if (number) {
                return numberFormat.format(number);
            }
            return '';
        },
        getNumberFormat: function (formatter) {
            if (typeof formatter === 'string') {
                try {
                    return $A.localizationService.getNumberFormat(formatter);
                } catch (e) {
                    // invalid number format error
                    // use default instead and show a warning on console
                    return $A.localizationService.getDefaultNumberFormat();
                }
            }
            return $A.localizationService.getDefaultNumberFormat();
        },
        unFormatNumber: function (string ) {
            var decimalSeparator = $A.get("$Locale.decimal");
            var currencySymbol   = $A.get("$Locale.currency");

            var stringOriginal = string,
                thousandRegExp,
                millionRegExp,
                billionRegExp,
                trillionRegExp;

            if (this.isNumber(string)) {
                return string;
            }

            if (decimalSeparator !== '.') {
                string = string.replace(/\./g, '').replace(decimalSeparator, '.');
            }

            // see if abbreviations are there so that we can multiply to the correct number
            thousandRegExp = new RegExp('[^a-zA-Z]' + abbreviations.thousand + '(?:\\)|(\\' + currencySymbol + ')?(?:\\))?)?$', 'i');
            millionRegExp  = new RegExp('[^a-zA-Z]' + abbreviations.million  + '(?:\\)|(\\' + currencySymbol + ')?(?:\\))?)?$', 'i');
            billionRegExp  = new RegExp('[^a-zA-Z]' + abbreviations.billion  + '(?:\\)|(\\' + currencySymbol + ')?(?:\\))?)?$', 'i');
            trillionRegExp = new RegExp('[^a-zA-Z]' + abbreviations.trillion + '(?:\\)|(\\' + currencySymbol + ')?(?:\\))?)?$', 'i');
            // do some math to create our number
            return ((stringOriginal.match(thousandRegExp)) ? Math.pow(10, 3) : 1) *
                   ((stringOriginal.match(millionRegExp))  ? Math.pow(10, 6) : 1) *
                   ((stringOriginal.match(billionRegExp))  ? Math.pow(10, 9) : 1) *
                   ((stringOriginal.match(trillionRegExp)) ? Math.pow(10, 12) : 1) *
                   ((string.indexOf('%') > -1) ? 0.01 : 1) *
                   (((string.split('-').length + Math.min(string.split('(').length - 1, string.split(')').length - 1)) % 2) ? 1 : -1) *
                   Number(string.replace(/[^0-9\.]+/g, ''));
        },
        isNumber: function (number) {
            return $A.util.isNumber(number);
        },
        isFormattedNumber: function (string, formatter) {
            var zero              = $A.get("$Locale.zero");
            var decimalSeparator  = $A.get("$Locale.decimal");
            var groupingSeparator = $A.get("$Locale.grouping");
            var maxFractionDigits = getMaxFractionDigits(formatter, { decimalSeparator : decimalSeparator, zero : zero});

            var const1 = '(?!(K|B|M|T|\\' + decimalSeparator + '))';

            // This regexp math with any formatted number or any possible formatted number
            // Match with :
            // never start with letter(k,b,m,t,(decimalSeparator))
            // everything that start with ( space* (+|-) spaces* )
            // any repeat of #{1}(groupingSeparator)#{0,n}
            // follow decimalSeparator #{0,maxFractionDigits} (not required)
            // ended by any shortcut (K|B|M|T)
            // it not case sensitive
            var regString = '^' + const1 + '((\\s*(\\+|\\-)?\\s*)' + const1 + ')?' +
                            '(\\d+(\\' + groupingSeparator + '\\d*)*)*' +
                            '(\\' + decimalSeparator + '\\d{0,' + maxFractionDigits + '})?' +
                            '(K|B|M|T)?\\s*$';


            var reg = new RegExp(regString, 'i');
            return reg.test(string);
        }
    };
}

