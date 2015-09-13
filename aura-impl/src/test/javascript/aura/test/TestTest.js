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
Function.RegisterNamespace("Test.Aura.Test");

[Fixture]
Test.Aura.TestTest = function() {
    var $A = { logger : { subscribe : function(){} }, installOverride : function() { } };
    var Aura = { 
        Test:{}, 
        Component: {},
        Utils:{Transport:function(){}} 
    };
    var window = {};

    //Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMocks(Object.Global(), {
        "$A": $A, 
        "window": window,
        "Aura": Aura,
        "AuraInstance":function(){},
        "Component": function(){},
        "TestInstance": function(){},
        "JsonTestInstance": function(){}
    })(function(){
        [Import("aura-impl/src/main/resources/aura/component/Component.js"),
        Import("aura-impl/src/main/resources/aura/test/Test.js"),
        Import("aura-impl/src/main/resources/aura/test/Test_private.js")]
    });

    var getWindowMock = function() {
        return Mocks.GetMock(Object.Global(), "window", Stubs.GetObject());
    };

    [Fixture]
    function clearExpected() {

        [Fact]
        function DoesNotClearDuplicatePreEntiresWhenExpectedMatches() { 
            var preArray = ["Mammoth", "Mammoth", "Lake Tahoe"];
            var expectedArray = ["Lake Tahoe", "Mammoth"];

            $A.test.clearExpected(preArray, expectedArray);

            Assert.Equal([undefined, "Mammoth", undefined], preArray);
        }

        [Fact]
        function DoesClearExpectedEntiresWhenExpectedMatchesOnPreDuplicates() { 
            var preArray = ["Mammoth", "Mammoth", "Lake Tahoe"];
            var expectedArray = ["Lake Tahoe", "Mammoth"];

            $A.test.clearExpected(preArray, expectedArray);

            Assert.Equal([undefined, undefined], expectedArray);
        }

        [Fact]
        function DoesNotClearMultipleExpectedEntiresWhenPreMatches() { 
            var preArray = ["Mammoth", "Lake Tahoe"];
            var expectedArray = ["Lake Tahoe", "Mammoth", "Mammoth"];

            $A.test.clearExpected(preArray, expectedArray);

            Assert.Equal([undefined, undefined, "Mammoth"], expectedArray);
        }

        [Fact]
        function DoesClearMultiplePreEntiresWhenPreMatches() { 
            var preArray = ["Mammoth", "Lake Tahoe"];
            var expectedArray = ["Lake Tahoe", "Mammoth", "Mammoth"];

            $A.test.clearExpected(preArray, expectedArray);

            Assert.Equal([undefined, undefined], preArray);
        }

        [Fact]
        function ClearsWhenPreContainsUndefinedString() {
            // This reproduces a special case in how javascript handles 'undefined'. If the pre array contains the word
            // 'undefined' then after the first entry in the expected array is cleared and set to undefined it was
            // matching future comparisons since indexOf interprets undefined as a string when it's a parameter.
            var preArray = ["undefined something", "something undefined"];
            var expectedArray = ["undefined something", "don't clear me"];

            new $A.test.clearExpected(preArray, expectedArray);
            
            Assert.Equal([undefined, "don't clear me"], expectedArray);
        }

        [Fact]
        function ClearsPreWithSameArrayForBothParams() { 
            var expected = [undefined, undefined, undefined];
            var preArray = ["Mammoth", "Lake Tahoe", "Yosemite"];
            var expectedArray = ["Mammoth", "Lake Tahoe", "Yosemite"];

            $A.test.clearExpected(preArray, expectedArray);

            Assert.Equal(expected, preArray);
        }

        [Fact]
        function ClearsExpectedWithSameArrayForBothParams() { 
            var expected = [undefined, undefined, undefined];
            var preArray = ["Mammoth", "Lake Tahoe", "Yosemite"];
            var expectedArray = ["Mammoth", "Lake Tahoe", "Yosemite"];

            $A.test.clearExpected(preArray, expectedArray);

            Assert.Equal(expected, expectedArray);
        }

        [Fact]
        function ClearsPreWithSameArrayContainingDuplicateEntiresForBothParams() { 
            var expected = [undefined, undefined, undefined, undefined];
            var preArray = ["Yosemite", "Yosemite", "Lake Tahoe", "Lake Tahoe"];
            var expectedArray = ["Yosemite", "Yosemite", "Lake Tahoe", "Lake Tahoe"];

            
            $A.test.clearExpected(preArray, expectedArray);
            
            Assert.Equal(expected, preArray);
        }

        [Fact]
        function ClearsExpectedWithSameArrayContainingDuplicateEntiresForBothParams() { 
            var expected = [undefined, undefined, undefined, undefined];
            var preArray = ["Yosemite", "Yosemite", "Lake Tahoe", "Lake Tahoe"];
            var expectedArray = ["Yosemite", "Yosemite", "Lake Tahoe", "Lake Tahoe"];

            $A.test.clearExpected(preArray, expectedArray);
            
            Assert.Equal(expected, expectedArray);
        }

        [Fact]
        function DoesNotClearWhenPreEmpty() { 
            var preArray = [];
            var expectedArray = ["Yosemite", "Lake Tahoe"];

            $A.test.clearExpected(preArray, expectedArray);
                        
            Assert.Equal(["Yosemite", "Lake Tahoe"], expectedArray);
        }

        [Fact]
        function DoesNotClearWhenExpectedEmpty() { 
            var preArray = ["Yosemite", "Lake Tahoe"];
            var expectedArray = [];

            $A.test.clearExpected(preArray, expectedArray);

            Assert.Equal(["Yosemite", "Lake Tahoe"], preArray);
        }
    }
}
