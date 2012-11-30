/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    /*
     * These tests moved here due to bug W-1465202 - value attribute as empty string must be set in markup.
     * 
     * TODO: Once bug is fixed, remove these tests and re-enable tests on components themselves.
     */
    testOutputDateEmptyStringValue: {
        test: function(component){
            $A.test.assertEquals("", component.find('date').getElement().textContent, "Expected an empty span for outputDate.");
        }
    },

    testOutputCurrencyEmptyStringValue: {
        test: function(component){
            $A.test.assertEquals("", component.find('currency').getElement().textContent, "Expected an empty span for outputCurrency.");
        }
    },

    testOutputDateTimeEmptyStringValue: {
        test: function(component){
            $A.test.assertEquals("", component.find('dateTime').getElement().textContent, "Expected an empty span for outputDateTime.");
        }
    },

    testOutputNumberEmptyStringValue: {
        test: function(component){
            $A.test.assertEquals("", component.find('number').getElement().textContent, "Expected an empty span for outputNumber.");
        }
    },

    testOutputPercentEmptyStringValue: {
        test: function(component){
            $A.test.assertEquals("", component.find('percent').getElement().textContent, "Expected an empty span for outputPercent.");
        }
    },
})