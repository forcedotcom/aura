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
Function.RegisterNamespace("Test.Aura.Storage.Adapters");

[ Fixture ]
Test.Aura.Storage.Adapters.SizeEstimatorTest = function() {
    var auraMock=function(delegate){
        Mocks.GetMocks(Object.Global(),{
            exp:function() {},
            window:Object.Global(),
            document:{createDocumentFragment:function() {}},
            Json:function() {},
            Transport:function() {},
            Style:function() {},
            Bitset:{},
            NumberFormat:{},
            $A:{util:{isArray:function(value) { return Array.isArray(value); }}},
            navigator:{userAgent:''}
        })(function(){
            // #import aura.storage.adapters.SizeEstimator
            delegate();
        });
    }

    var checkEstimateSize = function(value, expectedSize) {
        var result;

        auraMock(function() {
            var target = new SizeEstimator();
            result = target.estimateSize(value);
        });
        
        Assert.Equal(expectedSize, result);
    }

    var OBJECT_ENTRY_OVERHEAD = 8;
    var ARRAY_ENTRY_OVERHEAD = 16;
    // Object overhead is entry overhead + size('__es_mark__') + size(boolean) 
    var OBJECT_OVERHEAD = OBJECT_ENTRY_OVERHEAD+11*2;


    [Fixture]
    function estimateSize() {
        [Fact]
        function estimateBoolean() {
            var value = true;
            var expected = 4;
        }

        [Fact]
        function estimateInteger() {
            var value = 1;
            var expected = 8;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateFloat() {
            var value = 1e8;
            var expected = 8;
            checkEstimateSize(value, expected);
        }
        
        [Fact]
        function estimateNull() {
            var value = null;
            var expected = 0;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateUndefined() {
            var value = undefined;
            var expected = 0;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateString6() {
            var value = "123456";
            var expected = 12;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateString10() {
            var value = "1234567890";
            var expected = 20;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateArray2() {
            var value = [ 1, 3 ];
            var expected = ARRAY_ENTRY_OVERHEAD*2+8+8;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateArray4() {
            var value = [ 1, "a", "b", 3 ];
            var expected = ARRAY_ENTRY_OVERHEAD*4+8+2+2+8;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateArrayCycle() {
            var value = [ 1, 3 ];
            value.push(value);
            var expected = ARRAY_ENTRY_OVERHEAD*3+8+8;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateArrayCycleBadCheater() {
            var value = [ 1, 3 ];
            value.push(value);
            var expected = ARRAY_ENTRY_OVERHEAD*3+8+8;
            var result;

            auraMock(function() {
                var target = new SizeEstimator();
                result = target.estimateSize(value, "not a list");
            });
            
            Assert.Equal(expected, result);
        }

        [Fact]
        function estimateArrayCycleSneakyCheater() {
            var value = [ 1, 3 ];
            value.push(value);
            var expected = 0;
            var result;

            auraMock(function() {
                var target = new SizeEstimator();
                result = target.estimateSize(value, [ value ]);
            });
            
            Assert.Equal(expected, result);
        }

        [Fact]
        function estimateSimpleObject() {
            var value = { "a":"a" };
            var expected = OBJECT_OVERHEAD+OBJECT_ENTRY_OVERHEAD*1+(2+2);
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateSimpleCycle() {
            var value = { "a":"a" };
            value["b"] = value;
            var expected = OBJECT_OVERHEAD+OBJECT_ENTRY_OVERHEAD*2+(2+2)+(2+8);
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateComplexCycle() {
            var value = { "a":"a" };
            var array = [ value ];
            var value2 = { "a":"a", "b":array };
            var array2 = [ value2 ];
            value["b"] = array2;
            // ugh.... 2 objects, each with 2 entries, but one will not be counted. and 2 arrays.
            var expected = OBJECT_OVERHEAD*2+OBJECT_ENTRY_OVERHEAD*4+(2+2)*2+(2+8)+2+ARRAY_ENTRY_OVERHEAD*2;
            checkEstimateSize(value, expected);
        }

        [Fact]
        function estimateFunction() {
            var value = function() {
                return null;
            };
            var expected = 8;
            checkEstimateSize(value, expected);
        }
    }
}
