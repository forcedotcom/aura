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
Test.Components.Ui.Draggable = function(){
	var targetHelper;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.draggable.draggableHelper",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
	function dragStartTests(){
		var expectedType = "move";
		var expectedDataTransfer = null;
		var fired;
		var actual;
		var dragEvent = {
			setParams : function(arg){actual = arg;},
			fire : function(){fired = true;}
		};
		var targetEvent = {
			dataTransfer : {
				effectAllowed : null,
				setData : function(key, value){}
			}
		};	
		var targetComponent = {
			get : function(expression){
				if(expression == "v.type"){return expectedType;}
				if(expression == "v.dataTransfer"){return expectedDataTransfer;}	
			},
			set : function(attribute, value){},
			getEvent : function(expression){
				if(expression == "dragStart"){return dragEvent;}
			},
			getGlobalId : function(){}
		};
		var auraMock = Mocks.GetMock(targetHelper, "enterDragOperation", function(targetComponent) {});
		var mock$A = Mocks.GetMock(Object.Global(),"$A",{
			util : {
				isUndefinedOrNull : function(value) {return true;}
			}
		});

		[Fact]
        function testDragEventParams(){
			//Arrange			
			var expected = {
				type : expectedType,				
				dragComponent : targetComponent,
				data : expectedDataTransfer,
				isInAccessibilityMode : false
			};		
			//Act
			mock$A(function(){
				auraMock(function(){
					targetHelper.handleDragStart(targetComponent, targetEvent);
				});
			});
			//Assert
			Assert.Equal(expected, actual);
			Assert.True(fired);
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
				dragComponent : targetComponent
			};
			var targetEvent = {
				dataTransfer : {
					dropEffect : "copy"
				}
			};
			var auraMock = Mocks.GetMock(targetHelper, "exitDragOperation", function(targetComponent) {fired = true;});
			//Act
			auraMock(function(){
				targetHelper.handleDragEnd(targetComponent, targetEvent);
			});
			//Assert
			Assert.Equal(expected, actual);
			Assert.True(fired);
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
		
		[Fact]
        function testDropOperationWhenDropOperationStatusIsNull(){
			//Arrange
			targetHelper.$dropOperationStatus$ = null;
			var targetEventType = "nonMatch";
			var expected = {
				dragEnd : null,
				dropComplete : null
			};
			var actual;
			//Act
			targetHelper.updateDropOperationStatus(targetComponent, targetEventType, targetEvent);
			actual = targetHelper.$dropOperationStatus$;
			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
        function testDropOperationStatusWhenEventTypeDragEnd(){
			//Arrange
			targetHelper.$dropOperationStatus$ = null;
			var targetEventType = "dragEnd";
			var expected = {
				type : expectedDropEffect
			};
			var actual;
			//Act
			targetHelper.updateDropOperationStatus(targetComponent, targetEventType, targetEvent);
			actual = targetHelper.$dropOperationStatus$["dragEnd"];
			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
        function testDropOperationStatusWhenEventTypeDropComplete(){
			//Arrange
			targetHelper.$dropOperationStatus$ = null;
			var targetEventType = "dropComplete";
			var expected = {
				dragEnd : null,
				dropComplete : {
					dropComponent : expectedDropComponent,
					status : expectedDropComplete
				}
			};
			var actual;
			//Act
			targetHelper.updateDropOperationStatus(targetComponent, targetEventType, targetEvent);
			actual = targetHelper.$dropOperationStatus$;
			//Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
        function testDragEventParamsWhenDragEndAndDropCompleteOperationStatusAreNotNull(){
			//Arrange
			targetHelper.$dropOperationStatus$ = null;
			var expectedDataTransfer = "data";
			var targetEventType = "dragEnd";
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
			var expected = {
				type : expectedDropEffect,
				dragComponent : targetComponent,
				dropComponent : expectedDropComponent,
				data : expectedDataTransfer,
				dropComplete : expectedDropComplete
			};
			var actual;
			var fired;
			//Act
			targetHelper.updateDropOperationStatus(targetComponent, targetEventType, targetEvent);
			targetEventType = "dropComplete";
			targetHelper.updateDropOperationStatus(targetComponent, targetEventType, targetEvent);
			//Assert
			Assert.Equal(expected, actual);
			Assert.True(fired);
		}
	}
}