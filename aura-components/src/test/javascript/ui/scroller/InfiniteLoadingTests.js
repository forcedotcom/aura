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
		var callback = function (path, fn) {fn();};
		ImportJson("aura-components/src/main/components/ui/scrollerLib/bootstrap.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/browserSupport.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/browserStyles.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/helpers.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/CubicBezier.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/ScrollerJS.js", callback);
		ImportJson("aura-components/src/main/components/ui/scrollerLib/InfiniteLoading.js", callback);

		ImportJson("aura-components/src/main/components/ui/scroller/scrollerHelper.js",function(path,result){
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
				infiniteLoadingPlugin._setState = function(){};
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
				infiniteLoadingPlugin._setState = function(){};
				infiniteLoadingPlugin.appendItems = function(items) {
					itemsLength = items.length;
				}
				infiniteLoadingPlugin.fetchData();
			});

			callback([1,[2,3]]);

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
				infiniteLoadingPlugin._setState = function(){};
				infiniteLoadingPlugin.fetchData();
			});
			appendItemsMock=Mocks.GetMock(infiniteLoadingPlugin, "appendItems", function(items){});

			appendItemsMock(function(){
				callback('nomoredata');
			});

			Assert.True(infiniteLoadingPlugin._ilNoMoreData);
		}
	}
}