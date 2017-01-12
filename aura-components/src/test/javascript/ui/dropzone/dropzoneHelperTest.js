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

Function.RegisterNamespace("Test.Components.Ui.Dropzone");

[Fixture]
Test.Components.Ui.Dropzone.HelperTest = function(){
	var targetHelper;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("aura-components/src/main/components/ui/dropzone/dropzoneHelper.js",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
	function dragEnterTests(){
		
		[Fact]
        function testDragEventParams(){
			//Arrange
			var expectedRenderingComponent = "someComponent";
			var event = Stubs.Aura.GetEvent();
			var dropComponent = Stubs.Aura.GetComponent({
				"v.types":"move", 
				"v.dragOverClass": "",
				"v.dragOverAccessibilityClass":"",
				"v.class":""}, {}, {
					"getEvent": function(eventName) {
						if(eventName == "dragEnter") {
							return event;
						}
					}
			});
			var targetEvent = {
				target : expectedRenderingComponent,
				dataTransfer : {effectAllowed : "move", dropEffect : null}
			};
			var auraMock = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({},{
				util : {
					isEmpty : function(value) {return true;}
				}
			 }));
			 var expected = {
				 dropComponent : dropComponent,
				 dropComponentTarget : expectedRenderingComponent,
				 isInAccessibilityMode : false
			 };
			 var actual;
			 //Act
			 auraMock(function(){
				 targetHelper.handleDragEnter(dropComponent, targetEvent);
				 actual = event.getParams();
			 });
			 //Assert
			 Assert.Equal(expected, actual);
		}
		
		[Fact]
        function testDragEventIsFired(){
			//Arrange
			var expectedRenderingComponent = "someComponent";
			var actual;

			var event = Stubs.Aura.GetEvent();
			var dropComponent = Stubs.Aura.GetComponent({
				"v.types":"move", 
				"v.dragOverClass": "",
				"v.dragOverAccessibilityClass":"",
				"v.class":""}, {}, {
					"getEvent": function(eventName) {
						if(eventName == "dragEnter") {
							return event;
						}
					}
			});
			var domEvent = {
				target : expectedRenderingComponent,
				dataTransfer : {effectAllowed : "move", dropEffect : null}
			};
			var auraMock = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({},{
				util : {
					isEmpty : function(value) {return true;}
				}
			 }));

			 //Act
			 auraMock(function(){
				 targetHelper.handleDragEnter(dropComponent, domEvent);
			 });
			 //Assert
			 Assert.Equal(1, event.fire.Calls.length);
		}
	}
	
	[Fixture]
	function dragOverTests(){		
		var expectedTypes = "match";
		var targetComponent = {
			get : function(expression){
				if(expression == "v.types"){return expectedTypes;}
				if(expression == "v.dragOverInterval"){return 500;}
			}
		};
		var targetEvent = {
			dataTransfer:{
				effectAllowed : "",
				dropEffect : null
			},
			preventDefault : false,
			preventDefault : function(){fired = true;}
		};
		var fired;
		var mock$A = Mocks.GetMock(Object.Global(),"$A",{
			util : {
				isNumber : function(value) {return true;}
			},
			componentService : {
				getRenderingComponentForElement : function(element) {return null;}
			} 
		});
		var setTimeoutMock = Mocks.GetMock(Object.Global(), "setTimeout", function(callback, interval) {});
		var fireDragOverMock = Mocks.GetMock(targetHelper, "fireDragOver", function(targetComponent, element) {});
		
		[Fact]
        function testResultDropzoneTypeEqualsAll(){
			//Arrange
			var expectedEffectAllowed = "all";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;

			//Act
			var result;
			mock$A(function() {
				setTimeoutMock(function() {
					fireDragOverMock(function() {
						result = targetHelper.handleDragOver(targetComponent, targetEvent);
					});
				});
			});

			//Assert
			Assert.Equal(targetEvent.dataTransfer.dropEffect, expectedEffectAllowed);
		}

		[Fact]
        function testResultDropzoneTypeIsInvalid(){
			//Arrange
			var expectedEffectAllowed = "all";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;

			//Act
			var result;
			mock$A(function() {
				setTimeoutMock(function() {
					fireDragOverMock(function() {
						result = targetHelper.handleDragOver(targetComponent, targetEvent);
					});
				});
			});

			//Assert
			Assert.False(result);
		}
		
		[Fact]
        function testResultDropzoneTypeMatch(){
			//Arrange
			var expectedEffectAllowed = "match";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;

			//Act
			var result;
			mock$A(function() {
				setTimeoutMock(function() {
					fireDragOverMock(function() {
						result = targetHelper.handleDragOver(targetComponent, targetEvent);
					});
				});
			});

			//Assert
			Assert.Equal(targetEvent.dataTransfer.dropEffect, expectedEffectAllowed);
		}
		
		[Fact]
        function testResultDropzoneTypeMatchIsInvalid(){
			//Arrange
			var expectedEffectAllowed = "match";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;

			//Act
			var result;
			mock$A(function() {
				setTimeoutMock(function() {
					fireDragOverMock(function() {
						result = targetHelper.handleDragOver(targetComponent, targetEvent);
					});
				});
			});

			//Assert
			Assert.False(result);
		}
		
		[Fact]
        function testPreventDefault(){
			//Arrange
			var expectedEffectAllowed = "match";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;
			//Act
			var result;
			mock$A(function() {
				setTimeoutMock(function() {
					fireDragOverMock(function() {
						result = targetHelper.handleDragOver(targetComponent, targetEvent);
					});
				});
			});
			//Assert
			Assert.True(fired);
		}
		
		[Fact]
        function testResultDropzoneTypeNonMatch(){
			//Arrange
			var expectedEffectAllowed = "different";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;
			//Act
			var result;
			mock$A(function() {
				setTimeoutMock(function() {
					fireDragOverMock(function() {
						result = targetHelper.handleDragOver(targetComponent, targetEvent);
					});
				});
			});
			//Assert
			Assert.True(result);
		}		
	}
	
	[Fixture]
	function dragLeaveTests(){
		
		[Fact]
		function testDragEventParams(){
			//Arrange
			var expectedRenderingComponent = "someComponent";
			var dragEvent = Stubs.Aura.GetEvent();
			var targetComponent = {
				getEvent : function(expression){
					if(expression == "dragLeave"){return dragEvent;}
				},
				get : function(expression){
					if(expression == "v.class"){return "";}
					if(expression == "v.dragOverClass"){return "";}
					if(expression == "v.dragOverAccessibilityClass"){return "";}
				},
				set : function(expression, value){}
			};
			var targetEvent = {
				target : expectedRenderingComponent
			};
			var auraMock = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({},{
				util : {
					isEmpty : function(value) {return true;}
				}
			}));
			var fired;
			var actual;
			var expected = {
				dropComponent : targetComponent,
				dropComponentTarget : expectedRenderingComponent,
				isInAccessibilityMode : false
			};
			//Act
			auraMock(function(){
				targetHelper.handleDragLeave(targetComponent, targetEvent);
				actual = dragEvent.getParams();
			});
			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
		function handleDragLeaveFiresDragLeaveEvent(){
			//Arrange
			var expectedRenderingComponent = "someComponent";
			var dragEvent = Stubs.Aura.GetEvent();
			var targetComponent = {
				getEvent : function(expression){
					if(expression == "dragLeave"){return dragEvent;}
				},
				get : function(expression){
					if(expression == "v.class"){return "";}
					if(expression == "v.dragOverClass"){return "";}
					if(expression == "v.dragOverAccessibilityClass"){return "";}
				},
				set : function(expression, value){}
			};
			var targetEvent = {
				target : expectedRenderingComponent
			};
			var auraMock = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({},{
				util : {
					isEmpty : function(value) {return true;}
				}
			}));
			var fired;
			var actual;
			var expected = {
				dropComponent : targetComponent,
				dropComponentTarget : expectedRenderingComponent,
				isInAccessibilityMode : false
			};
			
			//Act
			auraMock(function(){
				targetHelper.handleDragLeave(targetComponent, targetEvent);
			});

			//Assert
			Assert.Equal(1, dragEvent.fire.Calls.length);
		}
	}
	
	[Fixture]
	function dropTests(){		
		var dragCmpAuraId = "auraId";
		var supportTypes = "";
		var expectedOperationType = "move";
		var expectedRenderingComponent = "someComponent";
		var expectedDataTransfer = {};
		var fired;
		var propagationStopped;
		var actual;
		var targetComponent = {
			get : function(expression){
				if(expression == "v.types"){return supportTypes;}
				if(expression == "v.class"){return {trim : function() {return {trim : function() { }}}}}
				if(expression == "v.dragOverClass"){return {trim : function() {}}}
				if(expression == "v.dragOverAccessibilityClass"){return {trim : function() {}}}
			},
			set : function(expression , value){
				if(expression == "v.theClass"){}
			},
			getEvent : function(expression){
				if(expression == "drop"){return dragEvent;}
			}
		};
		var parsedText;
		var targetEvent = {
			stopPropagation : true,
			stopPropagation : function(){propagationStopped = true;},
			dataTransfer : {
				getData : function(expression){},
				types : [],
				effectAllowed : expectedOperationType
			},
			target : expectedRenderingComponent
		};
		var targetEventIE = {
			stopPropagation : true,
			stopPropagation : function(){propagationStopped = true;},
			dataTransfer : {
				getData : function(expression){
					if(expression == "Text") {
						parsedText = true;
					} else {
						throw new Error("Unsupported");
					}
				},
				types : [],
				effectAllowed : expectedOperationType
			},
			target : expectedRenderingComponent
		};
		var dragComponent = {
			get : function(expression){
				if(expression == "v.type"){return expectedOperationType;}
				if(expression == "v.dataTransfer"){return expectedDataTransfer;}
			},
			isValid : function(){return true;},
			isInstanceOf : function(exp){return exp === "ui:draggable";},
			setDropStatus : function() {}
		};
		var dragEvent = {
			setParams : function(arg){actual = arg;},
			fire : function(){fired = true;}
		};
		var expectedRenderingComponent = "someComponent";
		var auraMock = Mocks.GetMock(Object.Global(), "$A", {
			getCmp : function(value){
				return dragComponent;},
			util : {
				forEach : function(value, func){},
				isUndefinedOrNull : function(expression) {
					return expression === undefined || expression === null;
				},
				isEmpty : function(value) {return true;}
			}
		});
		
		[Fact]
		function testStopPropagation(){
			//Act
			auraMock(function(){
				targetHelper.handleDrop(targetComponent, targetEvent);
			});
			//Assert
			Assert.True(propagationStopped);
		}
		
		[Fact]
		function testResultDropzoneHasNonSupportedType(){
			//Arrange
			var supportTypes = "copy";
			var result;
			//Act
			auraMock(function(){
				result = targetHelper.handleDrop(targetComponent, targetEvent);
			});
			//Assert
			Assert.False(result);
		}
		
		[Fact]
		function testSupportedTypeWithIEUsesJSONParse(){
			//Arrange
			supportTypes = expectedOperationType;
			var auraMock = Mocks.GetMock(Object.Global(), "$A", {
				getCmp : function(value){
					return dragComponent;},
				componentService : {
					getRenderingComponentForElement:function(value){
						return expectedRenderingComponent;
					}
				},
				util : {
					forEach : function(value, func){},
					isUndefinedOrNull : function(expression) {return true;},
					isEmpty : function(value) {return true;},
					isIE : true
				}
			});
			var parseFired;
			var mockJSON = Mocks.GetMock(Object.Global(), "JSON", {
				parse : function(expression){
					parseFired = true;
					return {"aura/id" : "someId"}
				}
			});
			//Act
			auraMock(function(){
				mockJSON(function(){
					targetHelper.handleDrop(targetComponent, targetEventIE);
				});
			});
			//Assert
			Assert.True(parseFired);
		}		
		[Fact]
		function testSupportedTypeWithIE(){
			//Arrange
			supportTypes = expectedOperationType;
			var auraMock = Mocks.GetMock(Object.Global(), "$A", {
				getCmp : function(value){
					return dragComponent;},
				componentService : {
					getRenderingComponentForElement:function(value){
						return expectedRenderingComponent;
					}
				},
				util : {
					forEach : function(value, func){},
					isUndefinedOrNull : function(expression) {return true;},
					isEmpty : function(value) {return true;},
					isIE : true
				}
			});
			var mockJSON = Mocks.GetMock(Object.Global(), "JSON", {
				parse : function(expression){
					return {"aura/id" : "someId"}
				}
			});
			//Act
			auraMock(function(){
				mockJSON(function(){
					targetHelper.handleDrop(targetComponent, targetEventIE);
				});
			});
			//Assert
			Assert.True(parsedText);
		}
		
		[Fact]
		function testDragEventParamsDropzoneHasSupportedType(){
			//Arrange
			supportTypes = expectedOperationType;
			var expected = {
				type : expectedOperationType,
				dragComponent : dragComponent,
				dropComponent : targetComponent,
				dropComponentTarget : expectedRenderingComponent,
				data : expectedDataTransfer,
				isInAccessibilityMode : false
			}
			//Act
			auraMock(function(){
				targetHelper.handleDrop(targetComponent, targetEvent);
			});
			//Assert
			Assert.Equal(expected, actual);
		}
	}
	
}