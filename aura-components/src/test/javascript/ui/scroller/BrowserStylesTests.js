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
Function.RegisterNamespace("Test.Components.Ui.Scroller");

[Fixture]
Test.Components.Ui.Scroller.BrowserStyles=function(){

	var targetHelper,
		styles,
		windowMock=Test.Mocks.NeededMocks.getWindowMock();

	windowMock(function(){
		ImportJson("ui.scroller.scrollerHelper",function(path,result){
			targetHelper=result;
		});
		styles=targetHelper.getScrollerNamespace().styles;
	});

	[Fixture]
	function GetsElementHeight(){
		
		[Fact,Data(
			{value:{marginTop:"5px",marginBottom:"20px",offsetHeight:-10,offsetWidth:-20},expected:15},
			{value:{marginTop:"0px",marginBottom:"0px",offsetHeight:0,offsetWidth:0},expected:0}
		)]
		function ReturnsHeightForValidElement(data){
			//Arrange
			var actual, expected=data.expected;
			var el=Stubs.GetObject({},{
				CSSStyleDeclaration:{
					marginTop:data.value.marginTop,
					marginBottom:data.value.marginBottom
				},
				offsetHeight:data.value.offsetHeight,
				offsetWidth:data.value.offsetWidth
			});
			
			//Act
			windowMock(function(){
				actual=styles.getHeight(el);
			});

			//Assert
			Assert.Equal(expected,actual);
		}
	}

	[Fixture]
	function GetsElementWidth(){
		
		[Fact,Data(
			{value:{marginRight:"5px",marginLeft:"20px",offsetHeight:-10,offsetWidth:-20},expected:5},
			{value:{marginRight:"0px",marginLeft:"0px",offsetHeight:0,offsetWidth:0},expected:0}
		)]
		function ReturnsWidthForValidElement(data){
			//Arrange
			var actual, expected=data.expected;
			var el=Stubs.GetObject({},{
				CSSStyleDeclaration:{
					marginRight:data.value.marginRight,
					marginLeft:data.value.marginLeft
				},
				offsetHeight:data.value.offsetHeight,
				offsetWidth:data.value.offsetWidth
			});
			
			//Act
			windowMock(function(){
				actual=styles.getWidth(el);
			});

			//Assert
			Assert.Equal(expected,actual);
		}
	}	
}