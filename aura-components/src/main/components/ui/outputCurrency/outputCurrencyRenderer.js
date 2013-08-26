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
    render: function outputNumberRender(cmp, helper) {
        var span = this.superRender()[0];
        var f = cmp.get("v.format");
        var num = cmp.get("v.value");
        var currencyCode = cmp.get("v.currencyCode");
        var currencySymbol = cmp.get("v.currencySymbol") || currencyCode;
        var formatted;
        if ($A.util.isNumber(num) || $A.util.isString(num)) {
            var hasFormat = !$A.util.isEmpty(f);
            if (hasFormat || currencySymbol) {
                var nf;
                try {
                    var symbols;
                    if (currencySymbol) {
                        symbols = {
                            currencyCode: currencyCode,
                            currency: currencySymbol,
                            decimalSeparator: $A.get("$Locale.decimal"),
                            groupingSeparator: $A.get("$Locale.grouping"),
                            zeroDigit: $A.get("$Locale.zero")
                        };
                    }
                    if (!hasFormat) {
                        f = $A.get("$Locale.currencyFormat");
                    }
                    nf = $A.localizationService.getNumberFormat(f, symbols);
                } catch (e) {
                    formatted = "Invalid format attribute";
                    $A.log(e);
                }
                if (nf) {
                    formatted = nf.format(num);
                }
            } else {
                formatted = $A.localizationService.formatCurrency(num);
            }
            span.textContent = span.innerText = formatted;
        }
        return span;
    },

    rerender: function outputNumberRerenderer(cmp, helper) {
        var val = cmp.getValue("v.value");
        var f = cmp.getValue("v.format");
        var currencyCode = cmp.getValue("v.currencyCode");
        var currencySymbol = cmp.getValue("v.currencySymbol");
        if (val.isDirty() || f.isDirty() || currencyCode.isDirty() || currencySymbol.isDirty()) {
            var formatted = '';
            f = f.unwrap();
            val = val.unwrap();
            currencyCode = currencyCode.unwrap();
            currencySymbol = currencySymbol.unwrap() || currencyCode;
            if ($A.util.isNumber(val) || $A.util.isString(val)) {
                var hasFormat = !$A.util.isEmpty(f);
                if (hasFormat || currencySymbol) {
                    var nf;
                    try {
                        var symbols;
                        if (currencySymbol) {
                            symbols = {
                                currencyCode: currencyCode,
                                currency: currencySymbol,
                                decimalSeparator: $A.get("$Locale.decimal"),
                                groupingSeparator: $A.get("$Locale.grouping"),
                                zeroDigit: $A.get("$Locale.zero")
                            };
                        }
                        if (!hasFormat) {
                            f = $A.get("$Locale.currencyFormat");
                        }
                        nf = $A.localizationService.getNumberFormat(f, symbols);
                    } catch (e) {
                        formatted = "Invalid format attribute";
                        $A.log(e);
                    }
                    if (nf) {
                        formatted = nf.format(val);
                    }
                } else {
                    formatted = $A.localizationService.formatCurrency(val);
                }
            }
            var span = cmp.find("span");
            span.getElement().textContent = span.getElement().innerText = formatted;
        }
    }
})