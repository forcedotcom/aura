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
 
Function.RegisterNamespace("Test.Components.Ui.AutocompleteList");

[Fixture]
Test.Components.Ui.AutocompleteList.AutocompleteListHelperTest=function(){
	var targetHelper = null;
	
	ImportJson("ui.autocompleteList.autocompleteListHelper",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
    function matchText(){
    	[Fact]
		function MatchTextWithExactlyOneMatch(){
			// Arrange
			var testItems = [{label : "target one", keyword : "", visible : "false"},
				{label : "target two", keyword : "", visible : "false"}];
				
			var expected = [{label : "target one", keyword : "target o", visible : "true"},
				{label : "target two", keyword : "target o", visible : "false"}];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "target o";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					}
				},
				setValue : function(expression, value) {
					if (expression === "v.items") {
						actual = value;	
					}
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){}
			});
			
			var actual = null;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
    	[Fact]
		function MatchTextWithMultipleMatches(){
			// Arrange
			var testItems = [{label : "target one", keyword : "", visible : "false"},
				{label : "target two", keyword : "", visible : "false"}];
				
			var expected = [{label : "target one", keyword : "target", visible : "true"},
				{label : "target two", keyword : "target", visible : "true"}];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "target";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					}
				},
				setValue : function(expression, value) {
					if (expression === "v.items") {
						actual = value;	
					}
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){}
			});
			
			var actual = null;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
		[Fact]
		function MatchTextWithZeroMatches(){
			// Arrange
			var testItems = [{label : "target one", keyword : "", visible : "false"},
				{label : "target two", keyword : "", visible : "false"}];
				
			var expected = [{label : "target one", keyword : "xxx", visible : "false"},
				{label : "target two", keyword : "xxx", visible : "false"}];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "xxx";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					}
				},
				setValue : function(expression, value) {
					if (expression === "v.items") {
						actual = value;	
					}
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){}
			});
			
			var actual = null;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
		[Fact]
		function MatchTextWithZeroItemsToSearch(){
			// Arrange
			var testItems = [];
				
			var expected = [];
			
			var targetComponent = {			 
				get : function(expression) {
					if (expression === "v.keyword") {
						return "target";
					} else if (expression === "v.items") {
						return testItems;
					} else if (expression === "v.visible") {
						return true;
					}
				},
				setValue : function(expression, value) {
					if (expression === "v.items") {
						actual = value;	
					}
				}
			}
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				toggleListVisibility : function(cmp, value){}
			});
			
			var actual = null;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.matchText(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
    }
}