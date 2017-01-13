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
    
    /**
     * ui:inputNumber renders zero when initial value is set 
     * to an attribute of value 0
     * Bug: W-3568421
     */
    testInputNumberWhenValueSetToZeroDuringInit: {
        attributes: {setValueToZeroDuringInit: "true", testInputCmp: "inputNumber"},
        test: function (cmp) {
            this.assertCmpElemValues(cmp, 0, "0");
        }
    },
    
    testInputCurrencyWhenValueSetToZeroDuringInit: {
        attributes: {setValueToZeroDuringInit: "true", testInputCmp: "inputCurrency"},
        test: function (cmp) {
            this.assertCmpElemValues(cmp, 0, "$0.00");
        }
    },
    
    testInputPercentWhenValueSetToZeroDuringInit: {
        attributes: {setValueToZeroDuringInit: "true", testInputCmp: "inputPercent"},
        test: function (cmp) {
            this.assertCmpElemValues(cmp, 0, "0%");
        }
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
    
    testInputPercentHandleUpdate : {
    	attributes: {testInputCmp: "inputPercent"},
    	test: [function(cmp) {	
    		this.inputValue("12345");
    	}, function(cmp) {
    		this.triggerUpdateCmpElmValues();
    	}, function(cmp) {
    		this.assertCmpElemValues(cmp, 123.45, "12,345%");
    	}]
    },

    /**********************
     * Helper Functions
     **********************/

    getInputElement: function (cmp) {
        return $A.test.select('input')[0];
    },
    
    // set element value and fire appropriate events to simulate what happens
    // when user types in input box
    inputValue: function(value) {
        var inputElm = this.getInputElement();
        inputElm.value = value;
        $A.test.fireDomEvent(inputElm, "input");
    },
    
    // fire blur event to update v.value and format elem value
    triggerUpdateCmpElmValues: function() {
        var inputElm = this.getInputElement();
        $A.test.fireDomEvent(inputElm, "change");
        $A.test.fireDomEvent(inputElm, "blur");
    },

    // check correct events were fired the correct number of times
    assertEventFired: function (cmp, eventName, eventCounter) {
        $A.test.assertEquals(eventName, cmp.get('v.eventFired').getName(),
                'The last fired event was ' + eventName);
        $A.test.assertEquals(eventCounter, cmp.get('v.eventList').length,
                'The event counter doesn\'t match');
    },
    
    // check component's internal v.value and displayed value on the input box
    assertCmpElemValues: function (component, expectedCmpVal, expectedElemVal) {
    	$A.test.assertEquals(expectedCmpVal, component.find("input").get("v.value"),
                "Cmp value doesn't equal to expected");
        $A.test.assertEquals(expectedElemVal, this.getInputElement().value,
                "Element value is not displayed/formatted correctly.");
    }
})