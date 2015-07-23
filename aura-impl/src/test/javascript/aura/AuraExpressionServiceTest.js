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
Test.Aura.AuraExpressionServiceTest = function(){
    var $A = { ns : {} };
    var Aura = { Services:{} };

    Mocks.GetMocks(Object.Global(), {
        "exp": function(){}, 
        "$A":$A, 
        Aura: Aura})
    (function(){
        [Import("aura-impl/src/main/resources/aura/AuraExpressionService.js")]
    });
    
    [Fixture]
    function normalize(){
    	[Fact]
        function trimString(){
    		var targetService = new AuraExpressionService();
            // Arrange
            var expected = "something";
            var actual;

            // Act
            actual = targetService.normalize("   {!  something   }    ");

            // Assert : make sure spaces in 4 places get trim
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function trimStringEscapeCharactor(){
    		var targetService = new AuraExpressionService();
            // Arrange
            var expected = "abcdef";
            var actual;

            // Act
            actual = targetService.normalize("  abcdef\n   ");

            // Assert : \n get trim also, we don't do escape here
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function passInNonString(){
    		var targetService = new AuraExpressionService();
            // Arrange
    		var someObj = {};
            var expected = someObj;
            var actual;

            // Act
            actual = targetService.normalize(someObj);

            // Assert : we do nothing when passing in non-String
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function passByValue(){
    		var targetService = new AuraExpressionService();
            // Arrange
            var expected = "m.something";
            var actual;

            // Act
            actual = targetService.normalize("{#m.something}");

            // Assert : pass by value "{!#...}" should work
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function arrayNotation(){
    		var targetService = new AuraExpressionService();
            // Arrange
            var expected = "v.something.0.  1  ";
            var actual;

            // Act
            actual = targetService.normalize("{!v.something[0][  1  ]}");

            // Assert : arr[key] should become arr.key, and we DONNOT trim the space
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function arrayNotationBadInput(){
    		var targetService = new AuraExpressionService();
            // Arrange
            var expected = "v.something..";
            var actual;

            // Act
            actual = targetService.normalize("{!v.something[][]}");

            // Assert : some bad input shouldn't blow up the app
            // also if we have unbalanced bracket, we get error like "expecting a positive integer, found xxx instead"
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function arrayNotationNestedInput(){
    		var targetService = new AuraExpressionService();
            // Arrange
            var expected = "v.something.bla[key]";
            var actual;

            // Act
            actual = targetService.normalize("{!v.something[bla[key]]}");

            // Assert : we don't convert nested brace
            Assert.Equal(expected, actual);
        }
    }
}
