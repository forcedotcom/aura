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

[ Fixture ]
Test.Aura.AuraTest = function() {
	Mocks.GetMock(Object.Global(), "exp", function() {
	})(function() {
		// #import aura.AuraEventService
	});
	
	function getStubMethod(args, returnValue){
		return Stubs.GetMethod(args, returnValue);	
	}
	
	[Fixture]
	function StartFiring() {
		function setUpGlobalMock(stubMethod){
			return Mocks.GetMocks(Object.Global(), {
						"$A" : {
							clientService : {
								pushStack : stubMethod
							}
						},
						EventDefRegistry : function(){},
						exp : function(){}
					})
		}
		
		[ Fact ]
		function CallsClientServicePushStack() {
			//Arrange
			var expected = "$A.eventServices.fire";
			var stubMethod = getStubMethod("name", null);
			var mockGlobal = setUpGlobalMock(stubMethod);
			
			//Act
			mockGlobal(function(){
				new AuraEventService().startFiring();
			})
			
			//Assert
			Assert.Equal(expected, stubMethod.Calls[0].Arguments.name);
		}
		
		[ Fact ]
		function NameParameterToStartFiringIgnored(){
			//Arrange
			var expected = "$A.eventServices.fire";
			var param = "FooBared"
			var stubMethod = getStubMethod("name", null);
			var mockGlobal = setUpGlobalMock(stubMethod);
			
			//Act
			mockGlobal(function(){
				new AuraEventService().startFiring(param);
			})
			
			//Assert
			Assert.Equal(expected, stubMethod.Calls[0].Arguments.name);
		}
	}
	
	[ Fixture ]
	function FinishFiring(){
		var mockGlobal = Mocks.GetMocks(Object.Global(),{
							EventDefRegistry : function(){},
							exp : function(){}
						});

		[ Fact ]
		function CallsPopStackIfCheckPublicPopTrue(){
			//Arrange
			var stubMethod = getStubMethod("name", null);
			var mockAuraClientService = Mocks.GetMocks(Object.Global(),{
				"$A" : {
					clientService : {
						popStack : stubMethod,
						checkPublicPop : function(){ return true; }
					}
				},
			});
			var expected = "$A.eventServices.fire";
			
			//Act
			mockGlobal(function(){
				mockAuraClientService(function(){
					new AuraEventService().finishFiring();
				})
			});

			//Assert
			Assert.Equal(expected, stubMethod.Calls[0].Arguments.name);
		}
		
		[ Fact ]
		function DoesNotCallPopStackIfCheckPublicPopTrue(){
			//Arrange
			var stubMethod = getStubMethod("name", null);
			var mockAuraClientService = Mocks.GetMocks(Object.Global(),{
				"$A" : {
					clientService : {
						popStack : stubMethod,
						checkPublicPop : function(){ return false; }
					}
				},
			});
			var expected = "$A.eventServices.fire";
			
			//Act
			mockGlobal(function(){
				mockAuraClientService(function(){
					new AuraEventService().finishFiring();
				})
			});

			//Assert
			Assert.Equal(0, stubMethod.Calls.length);
		}
	}
}
