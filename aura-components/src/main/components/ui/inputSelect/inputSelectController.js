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
    doInit: function(cmp, evt, helper) {    
        var currentValue = cmp.getValue("v.value");

        if (currentValue.isDefined()) {
            // if a "value" attribute is specified on initial render, it should win over what the individual options report
            helper.updateOptionsFromValue(cmp);
        } else {
            // otherwise update the "value" attribute based on the options that claim to be selected
            helper.updateValueFromOptions(cmp);
        }
    },

    valueChange: function(cmp, evt, helper) {
        helper.updateOptionsFromValue(cmp);
    },

    optionsChange: function(cmp, evt, helper) {
        helper.updateValueFromOptions(cmp);
    }
})
