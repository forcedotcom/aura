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

Function.RegisterNamespace("Test.Components.Ui.Draggable");

[Fixture]
Test.Components.Ui.Draggable.HelperTest = function(){
	var targetHelper;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("aura-components/src/main/components/ui/draggable/draggableHelper.js",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
	function dragStartTests(){
		var expectedType = "move";
		var expectedDataTransfer = "someData";
		var expectedGlobalId = "someId";
		var expectedDragImageClass = "someDragImageClass";
		var fired;
		var actual;
		var dragEvent = {
			setParams : function(arg){actual = arg;},
			fire : function(){fired = true;}
		};
		var setDragImageFired;
		var targetEvent = {
			dataTransfer : {
				data : {},
				effectAllowed : null,
				setData : function(key, value){
					this.data[key] = value;
				},
				getData : function(key) {
					return this.data[key];
				},
				setDragImage : function() {setDragImageFired = true;}
			}, 
			target : "targetEvent"
		};
		var targetEventIE = {
			dataTransfer : {
				data : {},
				effectAllowed : null,
				setData : function(key, value){
					if (key !== "Text") {
						throw new Error("Unsupported");
					}
					this.data[key] = value;
				},
				getData : function(key) {
					return this.data[key];
				}
			}, 
			target : "targetEventIE"
		};
		var targetComponent = {
			get : function(expression){
				if(expression == "v.type"){return expectedType;}
				if(expression == "v.dataTransfer"){return expectedDataTransfer;}	
				if(expression == "v.dragImageClass") {return expectedDragImageClass;}
			},
			set : function(attribute, value){},
			getEvent : function(expression){
				if(expression == "dragStart"){return dragEvent;}
			},
			getGlobalId : function(){return expectedGlobalId;}
		};
		var enterDragOperationMock = Mocks.GetMock(targetHelper, "enterDragOperation", function(targetComponent) {});
		var mock$A = Mocks.GetMock(Object.Global(),"$A",{
			util : {
				isUndefinedOrNull : function(value) {return expectedDataTransfer === null;},
				isString : function(value) {return (typeof expectedDataTransfer) === "string";},
				isEmpty: function(value) {return true;},
				isIE : true
			}
		});
		var expectedStringified = "stringified";
		var actualDataTransfer;
		var mockJSON = Mocks.GetMock(Object.Global(),"JSON",{
			stringify : function(value) {
				actualDataTransfer = value;
				return expectedStringified;
			}
		});

		[Fact]
        function testDragEventParams(){
			//Arrange			
			var expected = {
				type : expectedType,				
				dragComponent : targetComponent,
				dragComponentTarget : "targetEvent",
				data : expectedDataTransfer,
				isInAccessibilityMode : false
			};		
			
			//Act
			mock$A(function() {
				mockJSON(function() {
					enterDragOperationMock(function() {
						targetHelper.handleDragStart(targetComponent, targetEvent);
					});
				});
			});

			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
        function testIESerialization(){	
			//Arrange
			targetEventIE.dataTransfer.data = {};			
			//Act
			mock$A(function() {
				mockJSON(function() {
					enterDragOperationMock(function() {
						targetHelper.handleDragStart(targetComponent, targetEventIE);
					});
				});
			});
			//Assert
			Assert.Equal(targetEventIE.dataTransfer.getData("Text"), expectedStringified);
		}
		
		[Fact]
        function testIEDataTransfer(){
			//Arrange
			var expected = {
				"text/plain": expectedDataTransfer,
				"aura/id" : expectedGlobalId
			};
			targetEventIE.dataTransfer.data = {};
			//Act
			mock$A(function() {
				mockJSON(function() {
					enterDragOperationMock(function() {
						targetHelper.handleDragStart(targetComponent, targetEventIE);
					});
				});
			});
			//Assert
			Assert.Equal(expected, actualDataTransfer);
		}
		
		[Fact]
        function testNonIEDataTransfer(){	
			//Arrange
			var expected = {
				"text/plain": expectedDataTransfer,
				"aura/id" : expectedGlobalId
			};
			var mock$ANonIE = Mocks.GetMock(Object.Global(),"$A",{
				util : {
					isUndefinedOrNull : function(value) {return expectedDataTransfer === null;},
					isString : function(value) {return (typeof expectedDataTransfer) === "string";},
					isEmpty: function(value) {return true;},
					isIE : false
				}
			});
			targetEvent.dataTransfer.data = {};
			//Act
			mock$ANonIE(function() {
				enterDragOperationMock(function() {
					targetHelper.handleDragStart(targetComponent, targetEvent);
				});
			});
			//Assert
			Assert.Equal(expected, targetEvent.dataTransfer.data);
		}
		
		[Fact]
		function testSetDragImage() {
			//Arranges
			var createDragImageMock = Mocks.GetMock(targetHelper, "createDragImage", function(component, pageX, pageY, offsetX, offsetY) {});
			var mock$AIsEmpty = Mocks.GetMock(Object.Global(),"$A",{
				util : {
					isUndefinedOrNull : function(value) {return expectedDataTransfer === null;},
					isString : function(value) {return (typeof expectedDataTransfer) === "string";},
					isEmpty: function(value) {return expectedDragImageClass == "";},
					isIE : true
				}
			});
			//Act
			mock$AIsEmpty(function() {
				createDragImageMock(function(){
					enterDragOperationMock(function() {
						targetHelper.handleDragStart(targetComponent, targetEvent);
					});
				});
			});
			//Assert
			Assert.True(setDragImageFired);
		}
	}
	
	[Fixture]
	function dragEndTests(){
		var fired;
		var actual;
		var expectedType = "";
		var targetComponent = {
			isValid : function(){return true},
			getEvent : function(expression){
				if(expression == "dragEnd"){return dragEvent;}
			},
			get : function(expression){
				if(expression == "v.type"){return "move";}
				if(expression == "v.class"){return {trim : function() {return {trim : function() { }}}}}
				if(expression == "v.dragClass"){return {trim : function() {}}}
				if(expression == "v.dragAccessibilityClass"){return {trim : function() {}}}
			},
			set : function(attribute, value){}
		};
		var dragEvent = {
			setParams : function(arg){actual = arg;},
			fire : function(){fired = true;}
		};
		
		[Fact]
        function testDragEventParamsDraggableTypeNonMatch(){
			//Arrange
			var expected = {
				type : "move",
				dragComponent : targetComponent,
				dragComponentTarget : "targetEvent"
			};
			var targetEvent = {
				dataTransfer : {
					dropEffect : "copy"
				},
				target: "targetEvent"
			};
			var auraMock = Mocks.GetMock(targetHelper, "exitDragOperation", function(targetComponent) {fired = true;});
			//Act
			auraMock(function(){
				targetHelper.handleDragEnd(targetComponent, targetEvent);
			});
			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
        function testDragEventParamsDraggableTypeMatch(){
			//Arrange
			var targetEvent = {
				dataTransfer : {
					dropEffect : "move"
				}
			};
			var updated;
			var auraMock$A = Mocks.GetMock(Object.Global(), "$A", {
				util : {
					isEmpty : function(value) {return true;}
				}
			});
			var auraMock = Mocks.GetMock(targetHelper, "updateDropOperationStatus", function(cmp, expression, evt) {updated = true;});
			//Act
			auraMock$A(function(){
				auraMock(function(){
					targetHelper.handleDragEnd(targetComponent, targetEvent);
				});
			});
			//Assert
			Assert.True(updated);
		}		
	}
	
	[Fixture]
	function dropOperationStatusTests(){		
		var expectedDropEffect = "move";
		var expectedDropComponent = "dropComponent";
		var expectedDropComplete = true;
		var expectedDataTransfer = "data";	
		var actual;
		var fired;
		var targetComponent = {
			getEvent:function(expression){
				if(expression == "dragEnd"){return dragEvent;}
			},
			get:function(expression){
				if(expression == "v.dataTransfer"){return expectedDataTransfer;}
				if(expression == "v.type"){return expectedDropEffect;}
			}
		};
		var dragEvent = {
			setParams:function(arg){actual = arg;},
			fire:function(){fired = true;}
		};
		var targetEvent = {
			dataTransfer:{
				dropEffect:expectedDropEffect
			},
			getParam:function(expression){
				if(expression == "dropComponent"){return expectedDropComponent;}
				if(expression == "dropComplete"){return expectedDropComplete;}
			}
		};
		var isDragOperationNull = true;
		var auraMock$A = Mocks.GetMock(Object.Global(), "$A", {
			util : {
				isUndefinedOrNull : function(value) {return isDragOperationNull;}
			}
		});
		
		[Fact]
		function testDropOperationWhenDragOperationStatusIsNotNull(){
			//Arrange
			var expected = {
				getDragEndStatus : function() {return null;},
				getDropCompleteStatus : function() {return null;}
			};
			targetComponent.$dragOperation$ = {$dropOperationStatus$ : expected};
			var targetEventType = "nonMatch";		
			var actual;
			isDragOperationNull = false;
			//Act
			auraMock$A(function(){
				targetHelper.updateDropOperationStatus(targetComponent, targetEventType, targetEvent);
				actual = targetComponent.$dragOperation$.$dropOperationStatus$;
			});			
			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
		function testDropOperationWhenDragOperationStatusIsNull(){
			//Arrange
			var expected = targetHelper.newDropOperationStatus();
			var targetEventType = "nonMatch";		
			var actual;
			isDragOperationNull = true;
			//Act
			auraMock$A(function(){
				targetHelper.updateDropOperationStatus(targetComponent, targetEventType, targetEvent);
				actual = targetComponent.$dragOperation$.$dropOperationStatus$;
			});			
			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
        function testDragEventParamsWhenDragEndAndDropCompleteOperationStatusAreNotNull(){
			//Arrange
			var expectedDataTransfer = "data";
			var targetComponent = {
				$dragOperation$ : null,
				getEvent:function(expression){
					if(expression == "dragEnd"){return dragEvent;}
				},
				get:function(expression){
					if(expression == "v.dataTransfer"){return expectedDataTransfer;}
					if(expression == "v.type"){return expectedDropEffect;}
				}
			};
			var expected = {
				type : expectedDropEffect,
				dragComponent : targetComponent,
				dragComponentTarget : targetComponent,
				dropComponent : expectedDropComponent,
				data : expectedDataTransfer,
				dropComplete : expectedDropComplete
			};
			var auraMock$A = Mocks.GetMock(Object.Global(), "$A", {
				util : {
					isUndefinedOrNull : function(value) {return targetComponent.$dragOperation$ == null;}
				}
			});
			//Act
			auraMock$A(function(){
				var targetEventType = "dragEnd";
				targetHelper.updateDropOperationStatus(targetComponent, targetEventType, { "dragTarget" :  targetComponent});
				targetEventType = "dropComplete";
				targetHelper.updateDropOperationStatus(targetComponent, targetEventType, { "dropCompleteEvent" : targetEvent});
			});
			//Assert
			Assert.Equal(expected, actual);
		}
	}
	
	[Fixture]
	function isDropSuccessfulTests() {
		var getDropStatusFired;
		var targetComponent = {
			get : function(expression) {
				if(expression == "v.type") {return "move"};
			},
			isValid : function() {return true;},
			$dragOperation$ : {
				$dropOperationStatus$: {
					getDropStatus : function() {
						getDropStatusFired = true; 
						return true;
					}
				}
			}
		};
		var targetEvent = {
			dataTransfer : {
				dropEffect : "move"
			}
		};
		var auraMock$A = Mocks.GetMock(Object.Global(), "$A", {
			util : {
				isIE : true
			}
		});
		
		[Fact]
		function testIEAndDropEffectNoneUsesGetDropStatus(){
			//Arrange
			var targetEvent = {
				dataTransfer : {
					dropEffect : "none"
				}
			};

			//Act
			auraMock$A(function(){
				targetHelper.isDropEventSuccessful(targetComponent, targetEvent);
			});			

			//Assert
			Assert.True(getDropStatusFired);
		}

		[Fact]
		function testIEAndDropEffectNoneIsUnsuccessful(){
			//Arrange
			var targetEvent = {
				dataTransfer : {
					dropEffect : "none"
				}
			};
			var result;

			//Act
			auraMock$A(function(){
				result = targetHelper.isDropEventSuccessful(targetComponent, targetEvent);
			});			

			//Assert
			Assert.True(result);
		}
		
		[Fact]
		function testInvalidComponent(){
			//Arrange
			var result;
			var targetComponent = {
				isValid : function() {return false;}
			};

			//Act
			auraMock$A(function(){
				result = targetHelper.isDropEventSuccessful(targetComponent, targetEvent);
			});		

			//Assert
			Assert.False(result);
		}
		
		[Fact]
		function testNonIEDropEventWithTypeMove(){
			var result; 

			//Act
			auraMock$A(function(){
				result = targetHelper.isDropEventSuccessful(targetComponent, targetEvent);
			});	

			//Assert
			Assert.True(result);
		}
	}
}