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
Test.Components.Ui.Scroller.EndlessPluginTests=function(){

	var targetHelper,
		plugins,
		windowMock=Test.Mocks.NeededMocks.getWindowMock();

	windowMock(function(){
		ImportJson("ui.scroller.scrollerHelper",function(path,result){
			targetHelper=result;
		});
		plugins=targetHelper.getScrollerNamespace().plugins;
	});

	[Fixture]
	function Initialize(){
		[Fact]
		function EndlessPropertyDefinedAfterInit(){
			var endlessPlugin,
				endless;
			
			windowMock(function(){
				endlessPlugin = new plugins.Endless();	
			});

			Assert.Undefined(endlessPlugin.endless);
		}

		[Fact]
		function SetsEndlessTrueAfterInit(){
			var endlessPlugin,
				endless;
			
			windowMock(function(){
				endlessPlugin = new plugins.Endless();
				endlessPlugin.init();
			});

			Assert.True(endlessPlugin.endless);
		}
	}


	[Fixture]
	function ActiveOffset(){
		[Fact]
		function WrapperHeightAsOffset(){
			var endlessPlugin,
				activeOffsetValue;

			windowMock(function(){
				endlessPlugin = new plugins.Endless();
				endlessPlugin.scrollVertical=true;
				endlessPlugin.wrapperHeight=50;
				endlessPlugin.wrapperWidth=100;

				activeOffsetValue=endlessPlugin._setActiveOffset();
			});

			Assert.Equal(endlessPlugin.activeOffset,45);
		}


		[Fact]
		function WrapperWidthAsOffset(){
			var endlessPlugin,
				activeOffsetValue;

			windowMock(function(){
				endlessPlugin = new plugins.Endless();
				endlessPlugin.scrollVertical=false;
				endlessPlugin.wrapperHeight=50;
				endlessPlugin.wrapperWidth=100;

				activeOffsetValue=endlessPlugin._setActiveOffset();
			});

			Assert.Equal(endlessPlugin.activeOffset,95);
		}
	}


	[Fixture]
	function GetBoundaries(){

		[Fact]
		function ReturnsBoundaries(){
			var endlessPlugin,
				actual,
				expected={
					top: 40,
					bottom: -10
				};

			windowMock(function(){
				endlessPlugin = new plugins.Endless();
				endlessPlugin.activeOffset=-10;

				actual=endlessPlugin._getBoundaries(-20,-20);
			});

			Assert.Equal(expected,actual);
		}
	}
}