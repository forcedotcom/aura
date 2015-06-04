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
Test.Components.Ui.Dropzone = function(){
	var targetHelper;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.dropzone.dropzoneHelper",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
	function dragEnterTests(){
		
		[Fact]
        function testDragEventParams(){
			//Arrange
			var expectedRenderingComponent = "someComponent";
			var dragEvent = {
				setParams : function(arg){actual = arg;},
				fire : function(){fired = true;}
			};
			var targetComponent = {
				getEvent : function(expression){
					if(expression == "dragEnter"){return dragEvent;}
				},
				get : function(expression){
					if(expression == "v.types"){return "move";}
					if(expression == "v.dragOverClass"){return {trim : function() { }}}
					if(expression == "v.dragOverAccessibilityClass"){return {trim : function() { }}}
					if(expression == "v.class"){return {trim : function() {return {trim : function() { }}}}}
				},
				set : function(expression, value){
					if(expression == "v.theClass"){}
				}
			};
			var targetEvent = {
				target : null,
				dataTransfer : {effectAllowed : "move", dropEffect : null}
			};
			var auraMock = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({},{
				 componentService : {
					 getRenderingComponentForElement : function(value){
						 return expectedRenderingComponent;
					 }
				 },
				util : {
					isEmpty : function(value) {return true;}
				}
			 }));
			 var expected = {
				 dropComponent : targetComponent,
				 dropComponentTarget : expectedRenderingComponent,
				 isInAccessibilityMode : false
			 };
			 var actual;
			 var fired;
			 //Act
			 auraMock(function(){
				 targetHelper.handleDragEnter(targetComponent, targetEvent);
			 });
			 //Assert
			 Assert.Equal(expected, actual);
			 Assert.True(fired);
		}
	}
	
	[Fixture]
	function dragOverTests(){		
		var expectedTypes = "match";
		var targetComponent = {
			get : function(expression){
				if(expression == "v.types"){return expectedTypes;}
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
		
		[Fact]
        function testResultDropzoneTypeEqualsAll(){
			//Arrange
			var expectedEffectAllowed = "all";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;
			//Act
			var result = targetHelper.handleDragOver(targetComponent, targetEvent);
			//Assert
			Assert.False(result);
			Assert.Equal(targetEvent.dataTransfer.dropEffect, expectedEffectAllowed);
		}
		
		[Fact]
        function testResultDropzoneTypeMatch(){
			//Arrange
			var expectedEffectAllowed = "match";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;
			//Act
			var result = targetHelper.handleDragOver(targetComponent, targetEvent);
			//Assert
			Assert.False(result);
			Assert.Equal(targetEvent.dataTransfer.dropEffect, expectedEffectAllowed);
		}
		
		[Fact]
        function testPreventDefault(){
			//Arrange
			var expectedEffectAllowed = "match";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;
			//Act
			targetHelper.handleDragOver(targetComponent, targetEvent);
			//Assert
			Assert.True(fired);
		}
		
		[Fact]
        function testResultDropzoneTypeNonMatch(){
			//Arrange
			var expectedEffectAllowed = "different";
			targetEvent.dataTransfer.effectAllowed = expectedEffectAllowed;
			//Act
			var result = targetHelper.handleDragOver(targetComponent, targetEvent);
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
			var dragEvent = {
				setParams : function(arg){actual = arg;},
				fire : function(){fired = true;}
			};
			var targetComponent = {
				getEvent : function(expression){
					if(expression == "dragLeave"){return dragEvent;}
				},
				get : function(expression){
					if(expression == "v.class"){return {trim : function() {return {trim : function() { }}}}}
					if(expression == "v.dragOverClass"){return {trim : function() {}}}
					if(expression == "v.dragOverAccessibilityClass"){return {trim : function() {}}}
				},
				set : function(expression, value){
					if(expression == "v.theClass"){}
				}
			};
			var targetEvent = {
				target : null
			};
			var auraMock = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({},{
				componentService : {
					getRenderingComponentForElement:function(value){
						return expectedRenderingComponent;
					}
				},
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
			Assert.Equal(expected, actual);
			Assert.True(fired);
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
		var targetEvent = {
			stopPropagation : true,
			stopPropagation : function(){propagationStopped = true;},
			dataTransfer : {
				getData : function(expression){},
				types : [],
				effectAllowed : expectedOperationType
			},
			target : null
		};
		var dragComponent = {
			get : function(expression){
				if(expression == "v.type"){return expectedOperationType;}
				if(expression == "v.dataTransfer"){return expectedDataTransfer;}
			},
			isValid : function(){return true;}
		};
		var dragEvent = {
			setParams : function(arg){actual = arg;},
			fire : function(){fired = true;}
		};
		var expectedRenderingComponent = "someComponent";
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
			supportTypes = "copy";
			var result;
			//Act
			auraMock(function(){
				result = targetHelper.handleDrop(targetComponent, targetEvent);
			});
			//Assert
			Assert.False(result);
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
			Assert.True(fired);
		}
	}
	
	[Fixture]
	function dropOperationTests(){

		
		[Fact]
		function testEnterDragAriaDropEffectValue(){
			//Arrange
			var targetComponent = {
				get : function(expression){
					if(expression == "v.types"){return ["move"];}
				},
				set : function(expression, value){
					if(expression == "v.ariaDropEffect"){actual = value;}
				}
			};
			var actual;
			var expected = "move";
			//Act
			targetHelper.enterDragOperation(targetComponent);
			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
		function testExitDragAriaDropEffectValue(){
			//Arrange
			var targetComponent = {
				get : function(expression){
					if(expression == "v.type"){return "move";}
					if(expression == "v.class"){return {trim : function() {return {trim : function() { }}}}}
					if(expression == "v.dragOverClass"){return {trim : function() {}}}
					if(expression == "v.dragOverAccessibilityClass"){return {trim : function() {}}}
				},
				set : function(expression, value){
					if(expression == "v.ariaDropEffect"){actual = value;}
				}
			};
			var auraMock = Mocks.GetMock(Object.Global(), "$A", {
				util : {
					forEach : function(value, func){},
					isUndefinedOrNull : function(expression) {},
					isEmpty : function(value) {return true;}
				}
			});
			var actual;
			var expected = "none";
			//Act
			auraMock(function(){
				targetHelper.exitDragOperation(targetComponent);
			});
			//Assert
			Assert.Equal(expected, actual);
		}
	}
}