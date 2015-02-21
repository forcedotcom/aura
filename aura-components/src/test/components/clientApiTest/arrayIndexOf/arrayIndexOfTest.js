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

    TEST_ARRAY : ['red',
                  'green',
                  'blue',
                  'green',
                  'yellow'],

    EMPTY_ARRAY : [],

    testArrayIndex : {
        test : function(cmp) {
            $A.test.assertTrue(this.TEST_ARRAY.indexOf('red') === 0, "Wrong index for first array element returned");
            $A.test.assertTrue(this.TEST_ARRAY.indexOf('yellow') === 4, "Wrong index for last array element returned");
            $A.test.assertTrue(this.TEST_ARRAY.indexOf('nonexistent') === -1, "Element not found in array should return -1");
            $A.test.assertTrue(this.TEST_ARRAY.indexOf('') === -1, "Index returned on search for empty string");
            $A.test.assertTrue(this.TEST_ARRAY.indexOf(null) === -1, "Index returned on search for null");
            $A.test.assertTrue(this.TEST_ARRAY.indexOf(undefined) === -1, "Index returned on search for undefined");
        }
    },

    testArrayIndexOnEmptyArray : {
        test : function(cmp) {
            $A.test.assertTrue(this.EMPTY_ARRAY.indexOf('red') === -1, "Element found in empty array");
            $A.test.assertTrue(this.EMPTY_ARRAY.indexOf('') === -1, "Element found in empty array");
        }
    },

    testArrayIndexOnArrayFromComponent : {
        test : function(cmp) {
            var array = cmp.get("v.array");
            $A.test.assertTrue(array.indexOf('red') === 0, "Wrong index for first array element returned");
            $A.test.assertTrue(array.indexOf('yellow') === 4, "Wrong index for last array element returned");
            $A.test.assertTrue(array.indexOf('nonexistent') === -1, "Element not found in array should return -1");
            $A.test.assertTrue(array.indexOf('') === -1, "Index returned for empty search");
            $A.test.assertTrue(array.indexOf(null) === -1, "Index returned for null search");
            $A.test.assertTrue(array.indexOf(undefined) === -1, "Index returned for undefined search");

        }
    }
})

