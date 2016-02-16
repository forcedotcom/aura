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
            var inputDateStr = cmp.find("inputDateHtml").getElement().value;
            $A.test.assertEquals("2016-01-22", inputDateStr, "Dates are not the same and they should be");
        }
    },

    testInitialValueWithoutPad: {
        attributes : {value: "2016-1-2"},
        test: function(cmp){
            var inputDateStr = cmp.find("inputDateHtml").getElement().value;
            $A.test.assertEquals("2016-01-02", inputDateStr, "Dates are not the same and they should be");
        }
    },

    testInitialValueInUTC: {
        attributes : {value: "2016-01-22T01:00:00.000Z"},
        test: function(cmp){
            var inputDateStr = cmp.find("inputDateHtml").getElement().value;
            $A.test.assertEquals("2016-01-22", inputDateStr, "Dates are not the same and they should be");
        }
    },

    testEmptyValue: {
        test: function(cmp){
            var inputDateStr = cmp.find("inputDateHtml").getElement().value;
            $A.test.assertTrue($A.util.isEmpty(inputDateStr), "Dates are not the same and they should be");
        }
    }
})// eslint-disable-line semi
