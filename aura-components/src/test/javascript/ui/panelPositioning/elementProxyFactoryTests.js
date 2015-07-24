/*jshint asi:true,expr:true,unused:false,newcap:false*/
/*global Fixture,Fact,Skip,Trait,Async,Data,Assert,Mocks,Test,Record,Stubs,Import,ImportJson,MockedImport*/
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
Function.RegisterNamespace("Test.Components.Ui.PanelPositioning");	

[Fixture]
Test.Components.Ui.PanelPositioning.elementProxyFactoryTest=function(){

	var targetHelper,
		proxyFactory,
		globalId = 0,
		proxyCount = 0,
		bakedMap = {},
		windowMock = {};

	var mockAura = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({}, {
			assert : function(exp, msg) {
				if(!exp) {
					throw msg;
				}
			}
		}));

	
	var callback = function (path, fn) {fn();};
	[ImportJson("aura-components/src/main/components/ui/panelPositioningLib/elementProxyFactory.js", function(path, result) {

		var ElementProxy = function(el) {
			this.id = el.id;
			proxyCount++;
		};

		ElementProxy.prototype.setReleaseCallback = function(cb, scope) {
			var scopeObj = scope || this;
			this._cb = cb.bind(scopeObj);
		};

		ElementProxy.prototype.isDirty = function() {
			return true;
		};

		ElementProxy.prototype.bake = function() {
			bakedMap[this.id] = true;
		};

		ElementProxy.prototype.release = function() {
			if(this._cb) {
				this._cb(this);
			}
		};

		windowMock.$A = {};
		windowMock.$A.getComponent = function() {
			return {
				getGlobalId: function() {
					return globalId;
				}
			};
		};

	

		var obj = result({ElementProxy:ElementProxy}, windowMock);
		proxyFactory = obj;
	})]


	[Fixture]
	function getElement() {

		[Fact] 
		function methodsArePresent() {
			Assert.NotEmpty(proxyFactory.getElement);
		}

		[Fact]
		function getElementReturnsProxy() {
			var el = {id:'foo', nodeType: 1};
			var prox;
			mockAura(function() {
				prox = proxyFactory.getElement(el);
			});
			Assert.NotEmpty(prox);
		}

		[Fact]
		function returnsSameElementForId() {
			proxyFactory.resetFactory();
			var el = {id:'foo', nodeType: 1};
			proxyCount = 0;

			mockAura(function() {
				var prox = proxyFactory.getElement(el);
				prox = proxyFactory.getElement(el);
			});

			var expected = 1;
			var actual = proxyCount;

			Assert.Equal(expected, actual);
		}

		[Fact]
		function exceptionForNullElement() {
			proxyFactory.resetFactory();
			var el = null;
			var prox;
			var actual;
			proxyCount = 0;

			mockAura(function() {
				try {
					prox = proxyFactory.getElement(el);
				} catch (e) {
					actual = e.toString();
				}
			})
			//null element should result in null response
			

			var expected = "Element Proxy requires an element";
			Assert.Equal(expected, actual);
		}

		[Fact]
		function exceptionForOnNonElement() {
			proxyFactory.resetFactory();
			var el = {id:1};
			var prox, actual;
			proxyCount = 0;
			
			//null element should result in null response
			//
			mockAura(function() {
				try {
					prox = proxyFactory.getElement(el);
				} catch (e) {
					actual = e.toString();
				}
				
			});

			var expected = "Element Proxy requires an element";
			Assert.Equal(expected, actual);
		}
	}

	[Fixture]
	function baking() {

		[Fact]
		function bakeOne() {
			proxyFactory.resetFactory();
			var el = {id:'foo1', nodeType: 1};
			var prox;
			mockAura(function() {
				prox = proxyFactory.getElement(el);
				proxyFactory.bakeOff();
			});
			
			Assert.True(bakedMap.foo1);
		}

		[Fact]
		function bakeMany() {
			bakedMap = {};
			proxyFactory.resetFactory();
			var el = {id:'foo1', nodeType: 1};
			var el2 = {id:'foo2', nodeType: 1};
			var el3 = {id:'foo3', nodeType: 1};
			var prox;
			
			mockAura(function() {
				prox = proxyFactory.getElement(el);
				proxyFactory.getElement(el2);
				proxyFactory.getElement(el3);
				proxyFactory.bakeOff();
			});
			
			Assert.True(bakedMap.foo1);
			Assert.True(bakedMap.foo2);
			Assert.True(bakedMap.foo3);
		}

	}

	[Fixture]
	function garbageCollection() {

		[Fact]
		function countInc() {
			proxyFactory.resetFactory();
			var el = {id:'bas', nodeType: 1};
			var prox, prox2, actual;

			mockAura(function() {
				prox = proxyFactory.getElement(el);
				prox2 = proxyFactory.getElement(el);
				actual = proxyFactory.getReferenceCount(el);
			})
			
			var expected = 2;

			Assert.Equal(expected, actual);
		}

		[Fact]
		function eviction() {
			proxyFactory.resetFactory();
			var el = {id:'bas', nodeType: 1};
			var prox, prox2, actual;

			mockAura(function() {
				prox = proxyFactory.getElement(el);
				prox2 = proxyFactory.getElement(el);
				prox.release();
				prox2.release();
				actual = proxyFactory.getReferenceCount(el);
			});

			

			var expected = 0;

			Assert.Equal(0, proxyFactory.getReferenceCount(el));

		}

	}


};
