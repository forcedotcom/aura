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
    owner:"sle",

    CSS_SELECTOR:{
        uiDatePicker : '.uiDatePicker',
        uiDayInMonthCell : '.uiDayInMonthCell'
    },

    //test small dimension date picker
    testSmallDatepicker: {
        attributes : {"dimensionSize" : "small"},
        test: function(cmp) {
            var el = cmp.getElement();
            var uiDatepicker = el.querySelector(this.CSS_SELECTOR.uiDatePicker);
            var uiDayInMonthCell = el.querySelector(this.CSS_SELECTOR.uiDayInMonthCell);


            //must contains these classes
            this.verifyContainClass(
                uiDatepicker,
                'small'
            );
            this.verifyContainClass(
                uiDayInMonthCell,
                'small'
            );

            //not containing these classes
            this.verifyNotContainClass(
                uiDatepicker,
                'medium'
            );
            this.verifyNotContainClass(
                uiDatepicker,
                'medium'
            );

            //verifying that popping stuff up, doesnt change selected date
            this.verifySelectedDateUndefined(cmp);
        }
    },

    //test medium dimension date picker
    testMediumDatepicker: {
        attributes : {"dimensionSize" : "medium"},
        test: function(cmp) {
            var el = cmp.getElement();
            var uiDatepicker = el.querySelector(this.CSS_SELECTOR.uiDatePicker);
            var uiDayInMonthCell = el.querySelector(this.CSS_SELECTOR.uiDayInMonthCell);


            //must contains these classes
            this.verifyContainClass(
                uiDatepicker,
                'medium'
            );
            this.verifyContainClass(
                uiDayInMonthCell,
                'medium'
            );

            //not containing these classes
            this.verifyNotContainClass(
                uiDatepicker,
                'small'
            );
            this.verifyNotContainClass(
                uiDayInMonthCell,
                'small'
            );

            //verifying that popping stuff up, doesnt change selected date
            this.verifySelectedDateUndefined(cmp);
        }
    },


    //test large dimension date picker
    testLargeDatepicker: {
        attributes : {"dimensionSize" : "large"},
        test: function(cmp) {
            var el = cmp.getElement();
            var uiDatepicker = el.querySelector(this.CSS_SELECTOR.uiDatePicker);
            var uiDayInMonthCell = el.querySelector(this.CSS_SELECTOR.uiDayInMonthCell);


            //must contains these classes

            //not containing these classes
            this.verifyNotContainClass(
                uiDatepicker,
                'small'
            );
            this.verifyNotContainClass(
                uiDayInMonthCell,
                'small'
            );
            this.verifyNotContainClass(
                uiDatepicker,
                'medium'
            );
            this.verifyNotContainClass(
                uiDayInMonthCell,
                'medium'
            );

            //verifying that popping stuff up, doesnt change selected date
            this.verifySelectedDateUndefined(cmp);
        }
    },

    //helper
    //verify if an element el contains css class name
    verifyContainClass: function(el, cssClassName){
        $A.test.assertTrue(
            $A.util.hasClass(el, cssClassName),
            'Datepicker should have "' + cssClassName + '" style: classList=' + el.className
        );
    },


    //verify if an element el doesn't contain css class name
    verifyNotContainClass: function(el, cssClassName){
        $A.test.assertFalse(
            $A.util.hasClass(el, cssClassName),
            'Datepicker should NOT have "' + cssClassName + '" style: classList=' + el.className
        );
    },


    //verify if selected date value is undefined
    verifySelectedDateUndefined: function(cmp){
        $A.test.assertUndefinedOrNull(
            cmp.get('v.selectedDate.value'),
            'selected date value should be undefined'
        );
    },


    //verify if selected date value is defined
    verifySelectedDateDefined: function(cmp){
        $A.test.assertTrue(
            cmp.get('v.selectedDate.value').length > 0,
            'Today date needs to be defined after clicking on today button'
        );
    }
});