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

    var exponentByPrefix = {
        'k': 3,
        'm': 6,
        'b': 9,
        't': 12
    };

    function isNoZeroLeadingNumber(string) {
        var decimalSeparator = $A.get("$Locale.decimal");
        var reg = new RegExp('(^\\s*(\\+|\\-)?\\s*)\\' + decimalSeparator + '\\d*(K|B|M|T)?$');
        return reg.test(string);
    }

    function injectZeroBeforeDecimalSeparator (string) {
        var decimalSeparator = $A.get("$Locale.decimal");
        var numberParts = string.split(decimalSeparator);
        return numberParts[0] + '0' + decimalSeparator + numberParts[1];
    }

    return {
        formatNumber: function (number, formatter) {
            var numberFormat = this.getNumberFormat(formatter);

            if (!$A.util.isUndefinedOrNull(number) && !isNaN(number)) {
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
            if (this.isNumber(string)) {
                return string;
            }

            var decimalSeparator = $A.get("$Locale.decimal");
            var currencySymbol   = $A.get("$Locale.currency");
            var stringOriginal = string;
            
            string = string.replace(currencySymbol, '');
                     
            if (isNoZeroLeadingNumber(string)) {
                string = injectZeroBeforeDecimalSeparator(string);
            }
                      
            if (decimalSeparator !== '.') {
                string = string.replace(/\./g, '').replace(decimalSeparator, '.');
            }

            var numberOnlyPart = string.replace(/[^0-9\.]+/g, '');
            var value = 
                    (((string.split('-').length + Math.min(string.split('(').length - 1, string.split(')').length - 1)) % 2) ? 1 : -1) *
                    Number(numberOnlyPart);

            // find if contains kmtb.
            var exponentKey = Object.keys(exponentByPrefix).find(function(abbreviation) {
                var regExp = new RegExp('[^a-zA-Z]' + abbreviation + '(?:\\)|(\\' + currencySymbol + ')?(?:\\))?)?$', 'i');
                return stringOriginal.match(regExp);
            }); 

            if (exponentKey) {   
                var exponent = exponentByPrefix[exponentKey];            
                // W-4606483
                // to avoid 4.1 * 1000000 = 4099999.9999999995
                var decimalSeparatorIndex = numberOnlyPart.indexOf('.');
                var fractionalDigitsNeeded = decimalSeparatorIndex >= 0 ? (numberOnlyPart.length - (decimalSeparatorIndex + exponent + 1)) : 0;
                if (fractionalDigitsNeeded < 0) { 
                    fractionalDigitsNeeded = 0; 
                }
            
                return parseFloat(((value * Math.pow(10, exponent)).toFixed(fractionalDigitsNeeded)));    
            } else {            
                return value;
            }
        },

        isNumber: function (number) {
            return $A.util.isNumber(number);
        },

        isFormattedNumber: function (string) {
            var decimalSeparator  = $A.get("$Locale.decimal");
            var groupingSeparator = $A.get("$Locale.grouping");

            var const1 = '(?!(K|B|M|T))';

            // This regexp math with any formatted number or any possible formatted number
            // Match with :
            // never start with letter(k,b,m,t,(decimalSeparator))
            // everything that start with ( space* (+|-) spaces* )
            // any repeat of #{1}(groupingSeparator)#{0,n}
            // follow decimalSeparator #{0,maxFractionDigits} (not required)
            // ended by any shortcut (K|B|M|T)
            // it not case sensitive
            var regString = '^' + const1 + '((\\s*(\\+|\\-)?\\s*)' + const1 + ')?' +
                            '(\\d*(\\' + groupingSeparator + '\\d*)*)*' +
                            '(\\' + decimalSeparator + '\\d*)?' +
                            '(K|B|M|T)?$';

            var reg = new RegExp(regString, 'i');
            return reg.test(string);
        }
    };
}

