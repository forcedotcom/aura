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
	function FetchData(){

		[Fact]
		function ExecutesDataProvider(){
			var infiniteLoadingPlugin,
				expected=false;

			windowMock(function(){
				infiniteLoadingPlugin = new plugins.InfiniteLoading();	
				infiniteLoadingPlugin.opts={
					infiniteLoadingConfig:{
						dataProvider:function(){expected=true;}	
					}
				};
				infiniteLoadingPlugin.fetchData();
			});

			Assert.True(expected);
		}

		[Fact]
		function CanExecuteTriggerCallbackToAppendItems(){
			var infiniteLoadingPlugin,
				callback,
				appendItemsMock,
				itemsLength;

			windowMock(function(){
				infiniteLoadingPlugin = new plugins.InfiniteLoading();	
				infiniteLoadingPlugin.opts={
					infiniteLoadingConfig:{
						dataProvider:function(a,b){
							callback=arguments[0];
						}	
					}
				};
				infiniteLoadingPlugin.fetchData();
			});
			appendItemsMock=Mocks.GetMock(infiniteLoadingPlugin, "appendItems", function(items){
				itemsLength=items.length;
			});

			appendItemsMock(function(){
				callback(0,[1,2]);
			});

			Assert.True(itemsLength===2);
		}

		[Fact]
		function LocksFetchDataIfNoItems(){
			var infiniteLoadingPlugin,
				callback,
				appendItemsMock;

			windowMock(function(){
				infiniteLoadingPlugin = new plugins.InfiniteLoading();
				infiniteLoadingPlugin._ilNoMoreData = false;
				infiniteLoadingPlugin.opts={
					infiniteLoadingConfig:{
						dataProvider:function(a,b){
							callback=arguments[0];
						}	
					}
				};
				infiniteLoadingPlugin.fetchData();
			});
			appendItemsMock=Mocks.GetMock(infiniteLoadingPlugin, "appendItems", function(items){});

			appendItemsMock(function(){
				callback(0,[]);
			});

			Assert.True(infiniteLoadingPlugin._ilNoMoreData);
		}
	}
}