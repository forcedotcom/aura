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
    /**
     * Verify that the provided component is inputDateHtml on mobile/tablet, and inputDate on desktop
     */
    testCorrectComponentProvided: {
        test: function (cmp) {
            var isDesktop = $A.get('$Browser.formFactor').toLowerCase() === "desktop";
            var providedCmpName = cmp.getDef().getDescriptor().getQualifiedName();
            if (isDesktop) {
                $A.test.assertEquals("markup://ui:inputDate", providedCmpName, "should use inputDate on desktop");
            } else {
                $A.test.assertEquals("markup://ui:inputDateHtml", providedCmpName, "should use inputDate on desktop");
            }
        }
    },

    /**
     * Verify behavior when 'format' attribute is not assigned a value.
     */
    testDefaultFormat: {
        browsers: ['DESKTOP'],
        attributes: {displayDatePicker: 'true', value: '2012-09-10'},
        test: function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            $A.test.assertEquals("Sep 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyFormat: {
        browsers: ['DESKTOP'],
        attributes: {displayDatePicker: 'true', value: '2012-09-10', format: ''},
        test: function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            $A.test.assertEquals("Sep 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
    testInvalidFormat: {
        browsers: ['DESKTOP'],
        attributes: {displayDatePicker: 'true', format: 'KKKKKK', loadDatePicker: 'true'},
        test: [function (cmp) {
            cmp.find("datePicker").find("grid").selectToday();
        }, function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            var dt = moment().format('KKKKKK');
            $A.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }]
    },

    /**
     * Verify behavior when 'langLocale' attribute is not assigned a value.
     */
    testDefaultLangLocale: {
        browsers: ['DESKTOP'],
        attributes: {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10'},
        test: function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            $A.test.assertEquals("September 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior when 'langLocale' attribute is assigned a different value.
     * TODO: The usage is not valid anymore. Needs to change the app's locale on the server side.
     */
    _testLangLocale: {
        browsers: ['DESKTOP'],
        attributes: {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10', langLocale: 'es'},
        test: function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            $A.test.assertEquals("septiembre 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior when 'langLocale' attribute is not assigned an empty string.
     */
    testEmptyLangLocale: {
        browsers: ['DESKTOP'],
        attributes: {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10', langLocale: ''},
        test: function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            $A.test.assertEquals("September 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior when 'langLocale' attribute is not assigned an invalid value.
     */
    testInvalidLangLocale: {
        browsers: ['DESKTOP'],
        attributes: {displayDatePicker: 'true', format: 'MMMM dd, yyyy', value: '2012-09-10', langLocale: 'xx'},
        test: function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            $A.test.assertEquals("September 10, 2012", inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify behavior of Today() with default 'format' value.
     */
    testToday: {
        attributes: {displayDatePicker: 'true', format: 'MMM dd, yyyy', loadDatePicker: 'true'},
        test: [function (cmp) {
            cmp.find("datePicker").find("grid").selectToday();
        }, function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            var todayStr = cmp.find("datePicker").find("grid").get('v._today');
            var dt = moment(todayStr).format('MMM DD, YYYY');
            $A.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }]
    },

    /**
     * Verify behavior of Today() when 'format' is assigned a valid value.
     */
    testTodayDifferentFormat: {
        attributes: {displayDatePicker: 'true', format: 'DD/MM/YYYY',  loadDatePicker: 'true'},
        test: [function (cmp) {
            cmp.find("datePicker").find("grid").selectToday();
        }, function (cmp) {
            var inputDateStr = cmp.find("inputText").getElement().value;
            var todayStr = cmp.find("datePicker").find("grid").get('v._today');
            var dt = moment(todayStr).format('DD/MM/YYYY');
            $A.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }]
    },

    /**
     * Test input date picker with label set.
     */
    testDatePickerWithLabel: {
        browsers: ['DESKTOP'],
        attributes: {displayDatePicker: 'true', label: 'my date cmp', loadDatePicker: 'true'},
        test: function (cmp) {
            var datePickerOpener = cmp.find("datePickerOpener");
            $A.test.assertNotNull(datePickerOpener, "datePickerOpener anchor not present");
            var datePicker = cmp.find("datePicker");
            $A.test.assertNotNull(datePicker, "datePicker not present");
        }
    }
})//eslint-disable-line semi
