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
 
Function.RegisterNamespace("Test.Components.Ui.InputCurrency");

[Fixture]
Test.Components.Ui.InputCurrency.InputCurrencyHelperTest=function(){
	var targetHelper = null;
	
	ImportJson("ui.inputCurrency.inputCurrencyHelper",function(path,result){
		targetHelper=result;
	});
	
	var inputValue = "$1234";
	var outputValue = "1234";
	var currencyCode = "$";
	
	[Fixture]
    function doUpdate(){
    	[Fact]
		function RemoveCurrencySymbolFromInputValue(){
			// Arrange
			var actual = null;
			
			var targetComponent = {			 
				setValue : function(expression, value) {
					if (expression === "v.value") {
						actual = value;	
					}
				}
			}
			
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				get: function(val){
	            	if(val == "$Locale.currency") return currencyCode;
	            }
	        });		
			
			// Act
			mockUtil(function(){
				targetHelper.doUpdate(targetComponent,inputValue);
			});
			
			// Assert
			Assert.Equal(outputValue,actual);
		}
    	
    	[Fact]
		function InputValueWithoutCurrencySymbol(){
			// Arrange
			var actual = null;
			var inValue = "1234";
			
			var targetComponent = {			 
				setValue : function(expression, value) {
					if (expression === "v.value") {
						actual = value;	
					}
				}
			}
			
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				get: function(val){
	            	if(val == "$Locale.currency") return currencyCode;
	            }
	        });		
			
			// Act
			mockUtil(function(){
				targetHelper.doUpdate(targetComponent,inValue);
			});
			
			// Assert
			Assert.Equal(outputValue,actual);
		}
	}
}