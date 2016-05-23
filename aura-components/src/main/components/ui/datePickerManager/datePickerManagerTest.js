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
    testLoadDatePickerTrue: {
        attributes: {loadDatePicker: "true"},
        test: function() {
            $A.test.assertEquals(1, $A.test.select(".uiDatePicker").length,
                "When loadDatePicker=true, datePickerManager should render a hidden datePicker");
        }
    },

    testLoadDatePickerFalse: {
        test: function(cmp) {
            $A.test.assertFalse(cmp.get("v.loadDatePicker"), "loadDatePicker should default to 'false'");
            $A.test.assertEquals(0, $A.test.select(".uiDatePicker").length,
                "When loadDatePicker=false, datePickerManager should not render a hidden datePicker");
        }
    }
})// eslint-disable-line semi
