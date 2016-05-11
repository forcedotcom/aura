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
    /**********************
     * InputNumber Tests
     **********************/

    testInputNumberCopyEvent: {
        attributes: {testInputCmp: "inputNumber"},
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'copy');
        },function (cmp) {
            this.assertEventFired(cmp, 'copy', 1);
        }]
    },

    testInputNumberPasteEvent: {
        attributes: {testInputCmp: "inputNumber"},
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'paste');
        },function (cmp) {
            this.assertEventFired(cmp, 'paste', 1);
        }]
    },

    /**********************
     * InputCurrency Tests
     **********************/

    testInputCurrencyCopyEvent: {
        attributes: {testInputCmp: "inputCurrency"},
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'copy');
        },function (cmp) {
            this.assertEventFired(cmp, 'copy', 1);
        }]
    },

    testInputCurrencyPasteEvent: {
        attributes: {testInputCmp: "inputCurrency"},
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'paste');
        },function (cmp) {
            this.assertEventFired(cmp, 'paste', 1);
        }]
    },

    /**********************
     * InputPercent Tests
     **********************/

    testInputPercentCopyEvent: {
        attributes: {testInputCmp: "inputPercent"},
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'copy');
        },function (cmp) {
            this.assertEventFired(cmp, 'copy', 1);
        }]
    },

    testInputPercentPasteEvent: {
        attributes: {testInputCmp: "inputPercent"},
        test: [function (cmp) {
            var elem = this.getInputElement(cmp);
            $A.test.fireDomEvent(elem, 'paste');
        },function (cmp) {
            this.assertEventFired(cmp, 'paste', 1);
        }]
    },

    /**********************
     * Helper Functions
     **********************/

    getInputElement: function (cmp) {
        return $A.test.select('input')[0];
    },

    assertEventFired: function (cmp, eventName, eventCounter) {
        $A.test.assertEquals(eventName, cmp.get('v.eventFired').getName(),
                'The last fired event was ' + eventName);
        $A.test.assertEquals(eventCounter, cmp.get('v.eventList').length,
                'The event counter doesn\'t match');
    }
})