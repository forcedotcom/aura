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
Test.Components.Ui.Scroller.PullToRefreshTests=function(){

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
	function initPTR(){

		function mock(plugin,_scroller){
			return Mocks.GetMocks(plugin,{
				"_mergeConfigOptions": function(config){return config;},
				"on": function(event,action){
					action.call(plugin);
				},
				scroller: _scroller,
				_resetPosition: function(){},
				ptrIcon: null,
				ptrLabel: null,
				_ptrThreshold: null,
				_ptrSnapTime: null
			});
		}

		[Fact]
		function AppendsPTRcontainerAsFirstChild(){
			var PTRplugin,
				neededMocks,
				domStubAlias=Test.Stubs.Aura.Dom,
				actual;

			windowMock(function(){
				PTRplugin = new plugins.PullToRefresh();
				PTRplugin.opts = {};

				neededMocks=mock(PTRplugin, domStubAlias.GetNode({id:'scroller'},null,
					[domStubAlias.GetNode({id:'first-child'})]));
					
				neededMocks(function(){
					PTRplugin.init();
					actual = PTRplugin.scroller.firstChild.className;
				});
			});

			Assert.Equal('pullToRefresh', actual);
		}

		[Fact]
		function AppendsPTRcontainerAsChild(){
			var PTRplugin,
				neededMocks,
				domStubAlias=Test.Stubs.Aura.Dom,
				actual;

			windowMock(function(){
				PTRplugin = new plugins.PullToRefresh();
				PTRplugin.opts = {};

				neededMocks=mock(PTRplugin, domStubAlias.GetNode({id:'scroller'}));
					
				neededMocks(function(){
					PTRplugin.init();
					actual = PTRplugin.scroller.firstChild.className;
				});
			});

			Assert.Equal('pullToRefresh',actual);
		}
	}

	[Fixture]
	function TriggerPTR(){

		var stub = Stubs.GetObject({
			_resetPosition: function(snapTime){}
		},{
			ptrDOM: {classList:{add:function(_class){},remove:function(_class){}}},
			ptrLabel: {textContent:''},
			_ptrTriggered: null,
			_ptrLoading: null
		});
		function mock(plugin){
			return Mocks.GetMocks(plugin,stub);
		}

		[Fact]
		function ExecutesPTRtrigger(){
			var PTRplugin,
				neededMocks,
				actual=false;

			windowMock(function(){
				PTRplugin = new plugins.PullToRefresh();
				PTRplugin.opts = {
					pullToRefreshConfig:{labelUpdate:''},
					onPullToRefresh: function(a,b){
						actual = true;
					}
				};
			});
			neededMocks=mock(PTRplugin);

			neededMocks(function(){
				PTRplugin._ptrExecTrigger();
			});

			Assert.True(actual);
		}

		[Fact]
		function ExecutesPTRtriggerCallback(){
			var PTRplugin,
				neededMocks,
				callback,
				prependMock,
				itemsLength=0,
				expectedPTRloading;

			windowMock(function(){
				PTRplugin = new plugins.PullToRefresh();
				PTRplugin.opts = {
					pullToRefreshConfig:{labelUpdate:''},
					onPullToRefresh: function(a,b){
						callback = arguments[0];
					}
				};

				neededMocks=mock(PTRplugin);

				neededMocks(function(){
					PTRplugin._ptrExecTrigger();
					prependMock=Mocks.GetMock(PTRplugin,"prependItems",function(items){
						itemsLength=items.length;
					});
					prependMock(function(){
						callback(0,[1,2]);
					});
					expectedPTRloading = PTRplugin._ptrLoading;
				});
			});
			

			Assert.True(itemsLength===2 && !expectedPTRloading);
		}


		[Fact]
		function NoPrependIfNoDataProvider(){
			var PTRplugin,
				neededMocks,
				callback,
				prependMock,
				prependNotCalled=true;
				
			windowMock(function(){
				PTRplugin = new plugins.PullToRefresh();
				PTRplugin.opts = {
					pullToRefreshConfig:{labelUpdate:''},
					onPullToRefresh: undefined
				};
				neededMocks=mock(PTRplugin);

				neededMocks(function(){
					prependMock=Mocks.GetMock(PTRplugin,"prependItems",function(items){
						prependNotCalled = false;
					});
					prependMock(function(){
						PTRplugin._ptrExecTrigger();
					});
				});
			});

			Assert.True(prependNotCalled && !PTRplugin._ptrLoading);
		}

		[Fact]
		function ExecutesErrorCallbackOnError(){
			var PTRplugin,
				neededMocks,
				callback,
				prependMock,
				itemsLength=0;

			windowMock(function(){
				PTRplugin = new plugins.PullToRefresh();
				PTRplugin.opts = {
					pullToRefreshConfig:{labelUpdate:''},
					onPullToRefresh: function(){
						callback = arguments[0];
					}
				};

				neededMocks=mock(PTRplugin);

				neededMocks(function(){
					PTRplugin._ptrExecTrigger();
					prependMock=Mocks.GetMock(PTRplugin,"prependItems",function(items){
						itemsLength=items.length;
					});
					prependMock(function(){
						var mockFn = Stubs.GetMethod(["err"]);
						var setErrorStateMockFn = Mocks.GetMock(PTRplugin, "_setPTRErrorState", mockFn);
						setErrorStateMockFn(function(){
							callback({labelError:'Error'});
							
							//once when err='Error' and once when setTimeout runs with err=false
							Assert.True(mockFn.Calls.length===2);
						});
					});
				});
			});
		}
	}
}