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
    testMax: {
        attributes : {max : 9876.54321},
        test : function(component){
            $A.test.assertEquals(9876.54321, component.get("v.max"), "max does not equal expected");
        }
    },

    testMin: {
        attributes : {min : 0.0003},
        test : function(component){
            $A.test.assertEquals(0.0003, component.get("v.min"), "min does not equal expected");
        }
    },

    testStep: {
        attributes : {step : 1.23},
        test : function(component){
            $A.test.assertEquals(1.23, component.get("v.step"), "step does not equal expected");
        }
    },

    testDisabled: {
        attributes : {disabled : true},
        test : function(component){
            $A.test.assertTrue(component.get("v.disabled"), "disable should be true");
        }
    },

    testValue: {
        attributes : {value : 567},
        test : function(component){
            $A.test.assertEquals(567, component.get("v.value"), "value does not equal expected");
        }
    },

    testDecimalValue: {
        attributes : {value : 0.00000000009, interval: 0.00000000001},
        test : function(component){
            $A.test.assertEquals(0.00000000009, component.get("v.value"), "value does not equal expected");
        }
    },

    testIntValue: {
        attributes : {value : 100},
        test : function(component){
            $A.test.assertEquals(100, component.get("v.value"), "value does not equal expected");
        }
    },

    testNegativeValue: {
        attributes : {value : -5},
        test : function(component){
            $A.test.assertEquals(-5, component.get("v.value"), "value does not equal expected");
        }
    },

    testSmallValue: {
        attributes : {value : 0.00000000005, interval : 0.00000000001},
        test : function(component){
            $A.test.assertEquals(0.00000000005, component.get("v.value"), "value does not equal expected");
        }
    },

    testLargeValue: {
        attributes : {value : 99999999999999},
        test : function(component){
            $A.test.assertEquals(99999999999999, component.get("v.value"), "value does not equal expected");
        }
    },

    testZeroValue: {
        attributes : {value : 0},
        test : function(component){
            $A.test.assertEquals(0, component.get("v.value"), "value does not equal expected");
        }
    },

    testEmptyValue: {
        attributes : {value : ""},
        test : function(component){
            $A.test.assertEquals(undefined, component.get("v.value"), "value does not equal expected");
        }
    },
})
