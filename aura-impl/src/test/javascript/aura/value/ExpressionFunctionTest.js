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
Function.RegisterNamespace("Test.Aura.Value");

[Fixture]
Test.Aura.Value.ExpressionFunctionsTest = function(){
	var $A = {};
    var Aura = {
    		Value: {}, 
    		Utils: {
		    	Util:{
		    		prototype:{
		    			isEmpty: function(object){ 
		    				 return (object === undefined || object === null || object.length == 0) ? true: false;
		    			}
		    		}
		    	}
    		}	
    };
    var Importer = Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        "Aura": Aura,
        "ExpressionFunctions": function(){}
    });
    Importer(function(){
        [Import("aura-impl/src/main/resources/aura/value/ExpressionFunctions.js")]
    });
    
    [Fixture]
    function join(){
    	[Fact]
        function JoinReturnsEmptyStringForNull(){
    		// Arrange
            var expected = "";
            var actual;
            var expressionFunctions = new Aura.Value.ExpressionFunctions();
            Importer(function() {
            	actual = expressionFunctions.join(null);
            });
            // Assert returns empty string if its null
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
    	function JoinReturnsEmptyStringForUndefined(){
    		// Arrange
            var expected = "";
            var actual;
            var expressionFunctions = new Aura.Value.ExpressionFunctions();
            Importer(function() {
            	actual = expressionFunctions.join(undefined);
            });
            // Assert returns empty string if its undefined
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
    	function JoinArrayUsingSeperator(){
    		// Arrange
            var expected = "Snow;Wind,Rain,Fire;Rain";
            var actual;
            var expressionFunctions = new Aura.Value.ExpressionFunctions();
            Importer(function() {
            	var value1 = 'Snow';
            	var array = ['Wind', 'Rain', 'Fire'];
            	var value2 = "Rain";
            	actual = expressionFunctions.join(";",value1, array, value2);
            });
            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
    	function JoinParamsUsingSeperator(){
    		// Arrange
            var expected = "Wind;Rain;Fire";
            var actual;
            var expressionFunctions = new Aura.Value.ExpressionFunctions();
            Importer(function() {
            	actual = expressionFunctions.join(";" ,"Wind" ,"Rain" ,"Fire");
            });
            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
    	function JoinParamsWithNullUsingSeperator(){
    		// Arrange
            var expected = "Wind,Fire";
            var actual;
            var expressionFunctions = new Aura.Value.ExpressionFunctions();
            Importer(function() {
            	actual = expressionFunctions.join("," ,"Wind" ,null ,"Fire");
            });
            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
