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
function () {

    var lib = {
        /**
         * helper function for formatting a number
         */
        formatValue: function(cmp, helper, defaultFormatter) {
            if (!$A.util.isEmpty(cmp.get("v.value"))) {
                // number fields only format the initial value
                //todo helper.setAttribute(cmp, { key: 'doFormat', value: false, commit: true });
                var el = helper.getInputElement(cmp);
                if (!$A.util.isUndefinedOrNull(el)) {
                    var num = helper.getNumber(cmp);
                    if (!$A.util.isUndefinedOrNull(num)) {
                        var formatter = cmp.get("v.format");
                        if (!$A.util.isEmpty(formatter)) {
                            var numberFormat;
                            try {
                                numberFormat = $A.localizationService.getNumberFormat(formatter);
                            } catch (e) {
                                el.value = "Invalid format attribute";
                            }
                            if (numberFormat && numberFormat.format) {
                                el.value = numberFormat.format(num);
                            }
                        } else {
                            el.value = defaultFormatter.format(num);
                        }
                    }
                }
            }
        }
    };

    return lib;
}
