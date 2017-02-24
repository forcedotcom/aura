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
    testInitialValue: {
        attributes : {value: "2016-01-22"},
        test: function(cmp){
            $A.test.addWaitForWithFailureMessage(true, function() {
                var inputDateStr = cmp.find("inputDateHtml").getElement().value;
                return inputDateStr === "2016-01-22";
            }, "Dates are not the same and they should be");
        }
    },

    testInitialValueWithoutPad: {
        attributes : {value: "2016-1-2"},
        test: function(cmp){
            $A.test.addWaitForWithFailureMessage(true, function() {
                var inputDateStr = cmp.find("inputDateHtml").getElement().value;
                return inputDateStr === "2016-01-02";
            }, "Dates are not the same and they should be");
        }
    },

    testInitialValueInUTCSameDay: {
        attributes : {value: "2016-01-22T01:00:00.000Z", timezone: 'GMT'},
        test: function(cmp){
            $A.test.addWaitForWithFailureMessage(true, function() {
                var inputDateStr = cmp.find("inputDateHtml").getElement().value;
                return inputDateStr === "2016-01-22";
            }, "Dates are not the same and they should be");
        }
    },

    testInitialValueInUTCDifferentDay: {
        attributes : {value: "2016-01-22T01:00:00.000Z", timezone: 'America/Toronto'},
        test: function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var inputDateStr = cmp.find("inputDateHtml").getElement().value;
                return inputDateStr === "2016-01-21";
            }, "Dates are not the same and they should be");
        }
    },

    testInitialValueThenClear: {
        attributes : {value: "2016-01-22T01:00:00.000Z", timezone: 'America/Toronto'},
        test: [function(cmp){
            $A.test.addWaitForWithFailureMessage(true, function() {
                var inputDateStr = cmp.find("inputDateHtml").getElement().value;
                return $A.test.contains(inputDateStr, "2016-01-21");
            }, "Initial value for input was not set properly");
        }, function (cmp) {
            cmp.set("v.value", "");
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var inputDateStr = cmp.find("inputDateHtml").getElement().value;
                return $A.util.isEmpty(inputDateStr);
            }, "Dates are not the same and they should be");
        }]
    },

    testEmptyValue: {
        test: function(cmp){
            var inputDateStr = cmp.find("inputDateHtml").getElement().value;
            $A.test.assertTrue($A.util.isEmpty(inputDateStr), "Dates are not the same and they should be");
        }
    }
})// eslint-disable-line semi
