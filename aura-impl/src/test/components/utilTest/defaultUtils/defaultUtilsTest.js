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
    setUp: function() {
        this._arrayInput = ["A", "B", "C"];
        this._thisObject = "THIS_OBJECT";
        this._expectedArray = ["THIS_OBJECTA0", "THIS_OBJECTB1", "THIS_OBJECTC2"];
    },
    
    /**
     * Tests to ensure that forEach works cross-browser.
     */
    testForEach: {
        test : function() {
            var result = [];
            $A.util.forEach(this._arrayInput, function(value, index) {
                result.push(this + value + index);
            }, this._thisObject);
            this.validateArray(result);
        }
    },
    
    /**
     * Tests to ensure that map works cross-browser.
     */
    testMap: {
        test : function() {
            this.validateArray($A.util.map(this._arrayInput, function(value, index) {
                return this + value + index;
            }, this._thisObject));
        }
    },
    
    /**
     * Tests to ensure that map works cross-browser.
     */
    testReduce: {
        test : function() {
            var prefix = this._thisObject;
            // reduce does not have a 'this' arg:
            this.validateArray($A.util.reduce(this._arrayInput, function(current, value, index) {
                current.push(prefix + value + index);
                return current;
            }, []));
        }
    },
    
    /**
     * Tests to ensure that map works cross-browser.
     */
    testBind: {
        test : function() {
            function addAToBToC(a, b, c) {
                return a + b + c;
            }
            
            var add6ToBToC = $A.util.bind(addAToBToC, null, 6);
            
            
            $A.test.assertEquals(7, add6ToBToC(1, 0));
            $A.test.assertEquals("6 things!", add6ToBToC(" things", "!"));
            $A.test.assertEquals(-6, add6ToBToC(-6, -6));
            
            var add6ToBobToC = $A.util.bind(add6ToBToC, null, "bob");
            
            $A.test.assertEquals("6bob6", add6ToBobToC(6));
            $A.test.assertEquals("6bob!", add6ToBobToC("!"));
        }
    },
    
    testEvery: {
        test : function() {
            var values = [5, 10, 17, 44, 6];
            
            $A.test.assertTrue($A.util.every(values, function(value) {
                return value > 0;
            }));
            
            $A.test.assertFalse($A.util.every(values, function(value) {
                return value > 7;
            }));    
        }
    },
    
    testSome: {
        test : function() {
            var values = [5, 10, 17, 44, 6];
            
            $A.test.assertTrue($A.util.some(values, function(value) {
                return value > 0;
            }));
            
            $A.test.assertTrue($A.util.some(values, function(value) {
                return value > 40;
            }));
            
            $A.test.assertFalse($A.util.some(values, function(value) {
                return value > 50;
            }));    
        }
    },
    
    testFilter: {
        test : function() {
            var values = [5, 10, 17, 44, 6];
            
            $A.test.assertEquals([17, 44].join(), $A.util.filter(values, function(value) {
                return value >= 17;
            }).join());
            
            $A.test.assertEquals([10, 44, 6].join(), $A.util.filter(values, function(value) {
                return value % 2 === 0;
            }).join());   
        }
    },
    
    testKeys: {
        test : function() {
            var object = { I: 0, have: 1, four: 2, keys: 3 };
            var keys = $A.util.keys(object);
            $A.test.assertEquals("I have four keys", keys.join(" "));
        }
    },
    
    testMerge: {
        test : function() {
            var array1 = ["I", "will", "be", "merged"];
            var array2 = ["with", "me"];
            var array3 = ["and", "me!"];
            
            $A.util.merge(array1, array2, array3);
            $A.test.assertEquals("I will be merged with me and me!", array1.join(" "));
        }
    },
    
    validateArray: function(array) {
        var i;
        for(i = 0; i < array.length; i++) {
            $A.test.assertEquals(this._expectedArray[i], array[i]);
        }
    }
})