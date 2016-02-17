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
    initialize : function (cmp, event, helper) {
        var formatter = cmp.get('v.format');
        var value = cmp.get('v.value');

        if ($A.util.isUndefinedOrNull(value)) {
            cmp.set('v.value','');
            value = cmp.get('v.value');
        }

        if (!formatter) {
            formatter = $A.get("$Locale.currencyFormat");
            cmp.set('v.format',formatter);
        }

        cmp.set('v.updateOnDisabled', true);

        if (helper.isValueValid(value, formatter)) {
            helper.handleNewValue(cmp);
        } else {
            helper.setInvalidValueError(cmp, value);
        }
    },
    handleInputChange : function (cmp, event, helper) {
        var inputValue = event.target.value;
        var lib = helper.inputNumberLibrary.number;
        var formatter = cmp.get('v.format');

        if (lib.isFormattedNumber(inputValue,formatter) && helper.isNumberInRange(inputValue, cmp)) {
            helper.setValue(cmp, lib.unFormatNumber(inputValue));
        } else {
            event.target.value = cmp.get('v.lastValue');
        }
    },
    handleOnBlur : function (cmp, event, helper) {
        helper.setAttributes(cmp);
    },
    valueHasChanged : function (cmp, event, helper) {
        helper.handleNewValue(cmp);
    }
});