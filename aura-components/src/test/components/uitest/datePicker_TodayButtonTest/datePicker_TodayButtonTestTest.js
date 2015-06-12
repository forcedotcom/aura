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
        todayButton : '.calToday.uiButton',
        uiDatePicker : '.uiDatePicker',
    },


    //test to check if the Today Button is visible (showToday=true)
    //clicking on the today button should populate the datepicker to today date
    testShowTodayDatepickerFlag: {
        attributes : {"showToday" : "true"},
        test: function(cmp) {
            var el = cmp.getElement();
            var uiDatepicker = $A.test.select(this.CSS_SELECTOR.uiDatePicker)[0];

            //should be visible
            this.verifyContainClass(
                uiDatepicker,
                'visible'
            );
            

            //at first selected date should be empty
            $A.test.assertUndefinedOrNull(
                cmp.get('v.selectedDate.value'),
                'At first : selected date value should be undefined'
            );

            //verify that today button is visible
            this.verifyTodayButtonVisible(true);

            //click on today button
            $A.test.clickOrTouch(
                $A.test.select(this.CSS_SELECTOR.todayButton)[0]
            );

            //assert the today date
            this.verifySelectedDateDefined(cmp);

            //date picker should not visible after clicking on the today button
            this.verifyNotContainClass(
                el,
                'visible'
            );
        }
    },


    //test to check if the Today Button is not visible (showToday=false)
    testHideTodayDatepickerFlag: {
        attributes : {"showToday" : "false"},
        test: function(cmp) {
            var el = cmp.getElement();
            var uiDatepicker = $A.test.select(this.CSS_SELECTOR.uiDatePicker)[0];

            this.verifyTodayButtonVisible(false);//verify that today button is not visible
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
    },

    //verify if today button is visible
    verifyTodayButtonVisible: function(isTodayButtonVisible){
        $A.test.assertEquals(
            isTodayButtonVisible ? 1 : 0,
            $A.test.select(this.CSS_SELECTOR.todayButton).length,
            isTodayButtonVisible ? 'Today button needs to be VISIBLE' : 'Today button needs to be HIDDEN'
        );
    }
});
