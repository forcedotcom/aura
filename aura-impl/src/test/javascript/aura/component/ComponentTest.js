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
Function.RegisterNamespace("Test.Aura.Component");

[Fixture]
Test.Aura.Component.ComponentTest=function(){
	// Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
	Mocks.GetMock(Object.Global(), "exp", function() {
	})(function() {
		// #import aura.component.Component
	});

    [Fixture]
    function GetDef(){
      [Fact]
      function ReturnsNullForInvalidComponent(){
	  //Arrange
	  var target = null;
	  var mockPriv = Mocks.GetMock(Object.Global(), "ComponentPriv" , function(){});
	  mockPriv(function(){
	      target = new Component();
	      target.assertValid = function(){return false};
	  });
	  
	  //Act
	  var actual = target.getDef();
	  
	  //Assert
	  Assert.Null(actual);
      }
      
      [Fact]
      function ReturnsComponentDef(){
	  //Arrange
	  var expected = "Expected ComponentDef";
	  var target = null;
	  var mockPriv = Mocks.GetMock(Object.Global(), "ComponentPriv" , function(){});
	  mockPriv(function(){
	      target = new Component();
	      target.assertValid = function(){return true};
	      target.priv.componentDef = expected;
	  });
	  
	  //Act
	  var actual = target.getDef();
	  
	  //Assert
	  Assert.Equal(expected, actual);
      }
    }
      
}