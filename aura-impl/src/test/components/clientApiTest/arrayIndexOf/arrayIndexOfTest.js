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

    TEST_ARRAY : ['red',
                  'green',
                  'blue',
                  'green',
                  'yellow'],

    EMPTY_ARRAY : [],

    testArrayIndex : {
        test : function(cmp) {
            $A.test.assertTrue($A.util.arrayIndexOf(this.TEST_ARRAY, 'red') === 0, "Wrong index for first array element returned");
            $A.test.assertTrue($A.util.arrayIndexOf(this.TEST_ARRAY, 'yellow') === 4, "Wrong index for last array element returned");
            $A.test.assertTrue($A.util.arrayIndexOf(this.TEST_ARRAY, 'nonexistent') === -1, "Element not found in array should return -1");
            $A.test.assertTrue($A.util.arrayIndexOf(this.TEST_ARRAY, '') === -1, "Index returned on search for empty string");
            $A.test.assertTrue($A.util.arrayIndexOf(this.TEST_ARRAY, null) === -1, "Index returned on search for null");
            $A.test.assertTrue($A.util.arrayIndexOf(this.TEST_ARRAY, undefined) === -1, "Index returned on search for undefined");
        }
    },

    testArrayIndexOnEmptyArray : {
        test : function(cmp) {
            $A.test.assertTrue($A.util.arrayIndexOf(this.EMPTY_ARRAY, 'red') === -1, "Element found in empty array");
            $A.test.assertTrue($A.util.arrayIndexOf(this.EMPTY_ARRAY, '') === -1, "Element found in empty array");
        }
    },

    testArrayIndexOnNullArray : {
        test : function(cmp) {
            try {
                $A.util.arrayIndexOf(null, 'red');
                $A.test.fail("Attempting to access null array should throw exception");
            } catch (e) {}
        }
    },

    testArrayIndexOnArrayFromComponent : {
        test : function(cmp) {
            var array = cmp.getValue("v.array").unwrap();
            $A.test.assertTrue($A.util.arrayIndexOf(array, 'red') === 0, "Wrong index for first array element returned");
            $A.test.assertTrue($A.util.arrayIndexOf(array, 'yellow') === 4, "Wrong index for last array element returned");
            $A.test.assertTrue($A.util.arrayIndexOf(array, 'nonexistent') === -1, "Element not found in array should return -1");
            $A.test.assertTrue($A.util.arrayIndexOf(array, '') === -1, "Index returned for empty search");
            $A.test.assertTrue($A.util.arrayIndexOf(array, null) === -1, "Index returned for null search");
            $A.test.assertTrue($A.util.arrayIndexOf(array, undefined) === -1, "Index returned for undefined search");

        }
    }
})

