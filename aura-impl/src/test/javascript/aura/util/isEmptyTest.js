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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.isEmpty = function(){
    var Aura = {Utils:{
        Style: function() {},
        SizeEstimator: function() {},
        SecureFilters:{}
    }};

    var targetUtil;
    Mocks.GetMocks(Object.Global(), {
        Aura: Aura,
        navigator:{userAgent:''},
        window:Object.Global(),
        document:{createDocumentFragment:function() {}},
        Json:function() {}
    })(function () {
        [Import("aura-impl/src/main/resources/aura/util/Util.js")]
        targetUtil = new Aura.Utils.Util();
    });


    [Fixture]
    function isEmpty(){
        [Fact]
        function undefinedValue(){
            Assert.True(targetUtil.isEmpty(undefined));
        }

        [Fact]
        function nullValue(){
            Assert.True(targetUtil.isEmpty(null));
        }

        [Fact]
        function numberZero(){
            Assert.False(targetUtil.isEmpty(0));
        }

        [Fact]
        function numberPositive(){
            Assert.False(targetUtil.isEmpty(123));
        }

        [Fact]
        function numberNegative(){
            Assert.False(targetUtil.isEmpty(-123));
        }

        [Fact]
        function notNumber(){
            Assert.False(targetUtil.isEmpty(NaN));
        }

        [Fact]
        function stringValue(){
            Assert.False(targetUtil.isEmpty("abc"));
        }

        [Fact]
        function zeroLengthString(){
            Assert.True(targetUtil.isEmpty(""));
        }

        [Fact]
        function emptyArray(){
            Assert.True(targetUtil.isEmpty([]));
        }

        [Fact]
        function arrayOfUndefined(){
            Assert.False(targetUtil.isEmpty([undefined]));
        }

        [Fact]
        function arrayOfNull(){
            Assert.False(targetUtil.isEmpty([null]));
        }

        [Fact]
        function arrayOfZeroLengthString(){
            Assert.False(targetUtil.isEmpty([""]));
        }

        [Fact]
        function arrayOfNumbers(){
            Assert.False(targetUtil.isEmpty([1,2,3]));
        }

        [Fact]
        function emptyObject(){
            Assert.True(targetUtil.isEmpty({}));
        }

        [Fact]
        function objectWithStringKey(){
            Assert.False(targetUtil.isEmpty({"abc": "def"}));
        }

        [Fact]
        function objectWithNullKey(){
            Assert.False(targetUtil.isEmpty({null: undefined}));
        }
    }
}

