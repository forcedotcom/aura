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
 
Function.RegisterNamespace("Test.Components.Ui.Carousel");

[Fixture]
Test.Components.Ui.Carousel.CarouselHelperTest=function(){
	var targetHelper = null;
	
	ImportJson("ui.carousel.carouselHelper",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
    function initPages(){
    	[Fact]
		function InitPagesUsingPageComponents(){
			// Arrange
			var expected = [{
				isInstanceOf : function(expression) {return true;},
				getValue : function() {
					return {
						setValue : function(label, value) {}
					}
				},
				pageIndex : 0,
				parent : null,
				width : 3,
				height : 4
			}];
			
			var targetComponent = {
				find : function(expression) {
					if (expression === "pageContainer") {
						return {
							getValue : function(expression) {
								return {
									destroy : function() {},
									setValue : function(pages) {
										actual = pages;
									}
								}
							}
						}
					}
				},
				get : function(expression) {return false;},
				_width : 450
			}
			
			var mockAura = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({}, {
				util : {
					isComponent : function(expression) {return true;}
				}
			}));
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				SHOW_SELECTED_PAGE_ONLY : true,
				getPageModels : function(value){},
				getPageComponents : function(value){return expected;},
				getSnap : function(value){}
			});
			
			var actual = null;
			
			// Act
			mockAura(function(){
				mockHelperMethods(function(){
					targetHelper.initPages(targetComponent);
				})
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
		[Fact]
		function InitPagesUsingPageModel(){
			// Arrange
			var expected = ["page from model"];
			
			var targetComponent = {
				find : function(expression) {
					if (expression === "pageContainer") {
						return {
							getValue : function(expression) {
								if (expression === "v.body") {
									return {
										destroy : function() {},
										setValue : function(pages) {
											actual = pages;
										}
									};
								}
							}
						}
					}
				},
				get : function(expression) {return false;},
				getValue : function(expression) {
					if (expression === "v.pageComponents") {
						return {
							setValue : function(value) {}
						};
					}
				},
				_width : 450
			}
			
			var mockAura = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({}, {
				componentService : {
					newComponent : function(component, locationCreation, doForce) {return expected;}
				}
			}));
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				SHOW_SELECTED_PAGE_ONLY : true,
				getPageModels : function(value) {return [{dummy : "dummy"}];},
				getPageComponents : function(value) {return [];},
				getSnap : function(value){}
			});
			
			var acutal = null;
			
			// Act
			mockAura(function(){
				mockHelperMethods(function(){
					targetHelper.initPages(targetComponent, 3, 4);
				})
			});
			
			// Assert
			Assert.Equal(expected,actual);
		}
		
    }
    
    [Fixture]
    function selectPage(){
    	[Fact]
		function CallScrollToPageIfPageIsInRange(){
			// Arrange
			var targetComponent = {};
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				getPageComponents : function(value){return ["page1", "page2", "page3"];},
				getScroller : function(value){
					return {
						scrollToPage : function(pageX, pageY, time){
							actual=true;
						}
					};
				}
			});
			
			actual = false;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.selectPage(targetComponent, 1, 0);
			});
			
			// Assert
			Assert.True(actual);
		}
		
		[Fact]
		function SelectAPageOutOfRangeDoesNothing(){
			// Arrange
			var targetComponent = {};
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				getPageComponents : function(value){return ["page1", "page2", "page3"];},
				getScroller : function(value){
					return {
						scrollToPage : function(pageX, pageY, time){
							actual=true;
						}
					};
				}
			});
			
			actual = false;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.selectPage(targetComponent, 4, 0);
			});
			
			// Assert
			Assert.False(actual);
		}
    }
    
    [Fixture]
    function selectDefaultPage(){
    	[Fact]
		function DefaultPageOnCarouselWillOverrideIsDefaultOnPage(){
			// Arrange
			var expected = 1;
			
			var targetComponent = {
				get : function(expression) {return expected;}
			};
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				getPageComponents : function(value){
					return [{
						get : function(expression) {return false;}},
					{
						get : function(expression) {return false;}},
					{
						get : function(expression) {return true;}}
					];
				},
				selectPage : function(cmp, pageIndex, time){
					actual = pageIndex;
				}
			});
			
			var actual = -1;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.selectDefaultPage(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
		function CorrectDefaultPageIsSelected(){
			// Arrange
			var expected = 2;
			var targetComponent = {get : function(expression) {}};
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				getPageComponents : function(value){
					return [{
						get : function(expression) {return false;}},
					{
						get : function(expression) {return true;}},
					{
						get : function(expression) {return false;}}
					];
				},
				selectPage : function(cmp, pageIndex, time){
					actual = pageIndex;
				}
			});
			
			var actual = -1;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.selectDefaultPage(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
		function MultiplePagesMarkedAsDefaultChooseLast(){
			// Arrange
			var expected = 3;
			var targetComponent = {get : function(expression) {}};
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				getPageComponents : function(value){
					return [{
						get : function(expression) {return true;}},
					{
						get : function(expression) {return false;}},
					{
						get : function(expression) {return true;}}
					];
				},
				selectPage : function(cmp, pageIndex, time){
					actual = pageIndex;
				}
			});
			
			var actual = -1;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.selectDefaultPage(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected, actual);
		}
		
		[Fact]
		function NoDefaultPageIsSet(){
			// Arrange
			var expected = 1;
			var targetComponent = {get : function(expression) {}};
			
			var mockHelperMethods = Mocks.GetMocks(targetHelper, {
				getPageComponents : function(value){
					return [{
						get : function(expression) {return false;}},
					{
						get : function(expression) {return false;}},
					{
						get : function(expression) {return false;}}
					];
				},
				selectPage : function(cmp, pageIndex, time){
					actual = pageIndex;
				}
			});
			
			var actual = -1;
			
			// Act
			mockHelperMethods(function(){
				targetHelper.selectDefaultPage(targetComponent);
			});
			
			// Assert
			Assert.Equal(expected, actual);
		}
    }
}