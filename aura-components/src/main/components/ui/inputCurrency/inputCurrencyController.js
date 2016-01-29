/*
 * Copyright (C) 2016 salesforce.com, inc.
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
        cmp.set('v.updateOnDisabled', true);
        helper.handleNewValue(cmp);
    },
    handleInputChange : function (cmp, event, helper) {
        var input_value = event.target.value;
        var lib = helper.inputNumberLibrary.number;

        // is input empty ?
        if (!input_value) {
            helper.setValueNull(cmp);
            return;
        }

        if (lib.isFormattedNumber(input_value) && helper.isNumberInRange(input_value, cmp)) {
            cmp.set('v.updateWasFromOutside',false);
            cmp.set('v.value'      , lib.unFormatNumber(input_value));
        } else {
            event.target.value = cmp.get('v.last_value');
        }
    },
    handleOnBlur : function (cmp, event, helper) {
        helper.setAttributes(cmp);
    },
    valueHasChanged : function (cmp, event, helper) {
        helper.handleNewValue(cmp);
    }
})