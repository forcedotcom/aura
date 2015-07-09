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
Function.RegisterNamespace("Test.Components.Ui.dragAndDropAccessibilityMenu");

[Fixture]
Test.Components.Ui.dragAndDropAccessibilityMenu.HelperTest = function(){
	var targetHelper;
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("aura-components/src/main/components/ui/dragAndDropAccessibilityMenu/dragAndDropAccessibilityMenuHelper.js",function(path,result){
		targetHelper=result;
	});
	
	var dropzoneCmp = {
		instance : "dropzone",
		exitDragOperation : false,
		enterDragOperation : false,
		getGlobalId : function(){},
		get: function(expression){ return expression}
	};
	
	var draggable = {
		instance : "draggable",
		fireDragEnd : false,
		get: function(expression){ return expression},
		getGlobalId : function(){},
		getElement : function(){
			return {
				offsetHeight: 1,
				offsetWidth: 1,
				getBoundingClientRect: function(){
					return {top:0, left:0};
				},
				focus: function(){}
			}
		}
	};
	
	var mock$A = Mocks.GetMock(Object.Global(),"$A",{
		util : {
			isUndefinedOrNull : function(value) {return value === null;},
			forEach : function(){}
		},
		dragAndDropService : {
			getContext: function(cmp){
				if(cmp.instance == "dropzone"){
					return dropzoneCmp;
				}else if(cmp.instance == "draggable"){
					return draggable;
				}
			}
		}
	});
	var mock$Window = Mocks.GetMock(Object.Global(), "window", {});
	
	//methods from dragAndDropAccessibilityHelper
	targetHelper.fireDragLeave = function(dropzone){
		dropzone[0].fireDragLeave = true;
	};
	targetHelper.fireDragEnter = function(dropzone){
		dropzone[0].fireDragEnter = true;
	};
	targetHelper.fireDragEnd = function(draggables, isValid){
		draggables[0].fireDragEnd = true;
	};
	targetHelper.exitDragOperation = function(dropzones){
		dropzones[0].exitDragOperation = true;
	};
	targetHelper.enterDragOperation = function(dropzones){
		dropzones[0].enterDragOperation = true;
	};
	targetHelper.positioningLib ={panelPositioning:{ createRelationship: function(){}, reposition:function(){}}};
	
	[Fixture]
	function startDragAndDrop(){
		
		[Fact]
		function testStartDragEvent(){
			//arrange
			var cmp = {
					set : function(key, value){
						cmp[key] = value;
					},
					find : function(key){
						return {
							getEvent : function(name){ return {fire: function(){return name;}} },
							getElement: function(){
								return {
									style :{top:0, left:0},
									getBoundingClientRect : function(){
										return {top:0, left:0};
									}
								};
							},
							set: function(){}
						};
					}
			};
			targetHelper.getDropzoneComponents = function(type){
				return [dropzoneCmp];
			};
			//action
			mock$Window(function(){mock$A(function(){
				targetHelper.startDragAndDrop(cmp, [draggable]);
			})});
			//assert
			Assert.True(dropzoneCmp.enterDragOperation);
		}
		
		[Fact]
		function testStartDragEventWithNoDropzones(){
			//arrange
			var cmp = {
				set: function(){}
			};
			targetHelper.getDropzoneComponents = function(){
				return [];
			};
			//action
			targetHelper.startDragAndDrop(cmp, [draggable]);
			//assert
			Assert.True(draggable.fireDragEnd);
		}
	}
	
	[Fixture]
	function testDropContext(){
		[Fact]
		function testAreInSameContext(){
			//arrange
			dropzoneCmp.getGlobalId = function(){return "1234";};
			draggable.getGlobalId = function(){return "1234";};
			//action
			var result;
			mock$A(function(){
				result = targetHelper.areInSameContext([draggable], dropzoneCmp);
			});
			//assert
			Assert.True(result);
		}
		
		[Fact]
		function testAreInDifferentContext(){
			//arrange
			dropzoneCmp.getGlobalId = function(){return "1234";};
			draggable.getGlobalId = function(){return "4321";};
			//action
			var result;
			mock$A(function(){
				result = targetHelper.areInSameContext([draggable], dropzoneCmp);
			});
			//assert
			Assert.False(result);
		}
	}
	
	[Fixture]
	function testMenuAction(){
		[Fact]
		function testHandleMenuFocusChange(){
			//arrange
			var previousItem = {
					fireDragLeave : false,
					fireDragEnter : false,
					get: function(){ return previousItem; }
			};
			var currentItem = {
					fireDragLeave : false,
					fireDragEnter : false,
					get: function(){ return currentItem; }
			};
			//action
			mock$A(function(){
				targetHelper.handleMenuFocusChange(previousItem, currentItem);
			});
			
			//assert
			Assert.True(previousItem.fireDragLeave && currentItem.fireDragEnter && !(previousItem.fireDragEnter || currentItem.fireDragLeave));
		}
		
		[Fact]
		function testHandleMenuCollapse(){
			//arrange
			dropzoneCmp.exitDragOperation = false;

			var cmp = {
				find: function(selector){ 
					if (selector === "menuList") {
						return { 
							get: function(){ return draggable.getElement(); },
							getElement: function(){ return { style:{top : "", left : ""} }; } 
						} 
					}
				},
				get: function(){ return [draggable];},
				set: function(){}
			};
			targetHelper.getDropzoneComponents = function(type){
				return [dropzoneCmp];
			};
			//action
			targetHelper.handleMenuCollapse(cmp);
			//assert
			Assert.True(draggable.fireDragEnd && dropzoneCmp.exitDragOperation);
		}
	}
}