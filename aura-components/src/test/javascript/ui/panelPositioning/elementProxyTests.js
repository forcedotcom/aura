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
Test.Components.Ui.PanelPositioning.elementProxyTest = function() {
	"use strict";
	var targetHelper,
		positioningNS,
		windowMock=Test.Mocks.NeededMocks.getWindowMock();

		windowMock.scrollX = 0;
		windowMock.scrollY = 0;
		windowMock.getComputedStyle = function(e) {
			return e.computedStyle;
		};

		windowMock.MutationObserver = function() {
			this.observe = function() {};
		}

	windowMock(function(){
		ImportJson("aura-components/src/main/components/ui/panelPositioningLib/elementProxy.js", function(path, result) {
			var obj = result(windowMock);
			positioningNS = obj;

		});
	});

	var mockWindow=Mocks.GetMock(Object.Global(),"window",windowMock);

	function MockElement(dims, offsetParent, computedStyle) {
		var dimensions = dims || {
			top: 2,
			left: 2,
			right: 2,
			bottom:2,
			width:2,
			height:2
		};

		if(computedStyle) {
			this.computedStyle = computedStyle;
		} else {
			this.computedStyle = {
				top:"auto",
				left:"auto"
			};
		}

		this.offsetParent = offsetParent || false;
		this.offsetLeft = dimensions.left;
		this.offsetTop = dimensions.top;
		this._dimensions = dimensions;

	}

	MockElement.prototype.getBoundingClientRect = function() {
		return this._dimensions;
	}

	MockElement.prototype.style = {};

	function getMockElement(id, dims, computedStyle) {
		var el = new MockElement(dims, null, computedStyle);
		el.id = id;
		el.parentNode = {
			tagName: 'body'
		}
		return el;
	}

	[Fixture]
	function InitializeElement() {

		[Fact]
		function objectRegistered() {
			Assert.NotEmpty(positioningNS.ElementProxy);
		}

		[Fact]
		function instantiation() {
			var expected = getMockElement("foo");
			var proxy = new positioningNS.ElementProxy(expected, "foo");

			var actual = proxy.getNode();
			
			Assert.Equal(expected, proxy.getNode());
		}

		[Fact]
		function instantiationWithWindowCalculatesWidth() {
			var el = windowMock;
			windowMock.innerWidth = 415;
			windowMock.document = {
				documentElement : {
					clientWidth: 415,
					clientHeight: 200
				}
			}

			var proxy = new positioningNS.ElementProxy(el, "foo");
			
			Assert.Equal(415, proxy.width);
		}

		[Fact]
		function instantiationWithWindowSetsNodeAsWindow() {
			var el = windowMock;
			windowMock.innerWidth = 415;
			windowMock.document = {
				documentElement : {
					clientWidth: 415,
					clientHeight: 200
				}
			}

			var proxy = new positioningNS.ElementProxy(el, "foo");
			
			Assert.Equal(el, proxy.getNode());
		}

		[Fact] 
		function throwsIfElementIsMissing() {
			var el;
			var caught = false;

			var expected = "Element missing";

			var actual = Record.Exception(function() {
				new positioningNS.ElementProxy(el, "foo");
			});

			Assert.Equal(expected, actual);

		}
	}

	[Fixture]
	function SetValues() {
		
		[Fact]
		function setLeft() {
			var el = getMockElement("foo");
			var proxy = new positioningNS.ElementProxy(el, "foo");

			proxy.set("left", 413);

			Assert.Equal(413, proxy.left);
		}

		[Fact]
		function SettingValueMakesProxyDirty() {
			var el = getMockElement("foo");
			var proxy = new positioningNS.ElementProxy(el, "foo");

			proxy.set("left", 413);

			Assert.True(proxy.isDirty(), "Proxy should be dirty");
		}
	}


	[Fixture]
	function Refresh() {

		[Fact]
		function ElementProxyParsesLeftProperty() {
			var el = getMockElement("foo", {top: 0, left:1, right:500, bottom:500, width:500, height:500});

			var proxy = new positioningNS.ElementProxy(el, "bar");

			Assert.Equal(1, proxy.left);
		}

		[Fact]
		function ElementProxyRefreshReparsesElementLeftProperty() {
			var el = getMockElement("foo", {top: 0, left:1, right:500, bottom:500, width:500, height:500});
			var proxy = new positioningNS.ElementProxy(el, "bar");

			el._dimensions.left = 25;
			proxy.refresh();

			Assert.Equal(25, proxy.left);
		}
	}

	[Fixture]
	function Baking() {

		[Fact]
		function bakeLeft() {
			var el = getMockElement("foo",
				{
					top:0, 
					left:0, 
					width:20, 
					height: 20
				}, 
				{
					left: "0px",
					top: "0px"
			});
			var expected = {"top":"0px", "left":"314px"};
			
			var proxy = new positioningNS.ElementProxy(el, "foo");
			proxy.set("left", 314);
			proxy.bake();
			var actual = {"top":el.style.top, "left":el.style.left};

			Assert.Equal(expected, actual);
		}

		[Fact]
		function bakeTop() {
			var el = getMockElement("foo", {top:0, left:0, width:20, height: 20},{
				top: "0px",
				left: "0px"
			});
			var expected = {"top":"314px", "left": "0px"};

			var proxy = new positioningNS.ElementProxy(el, "foo");
			proxy.set("top", 314);
			proxy.bake();
			var actual = {"top": el.style.top, "left": el.style.left };

			Assert.Equal(expected, actual);
		}

		[Fact]
		function bakeDeepInDom() {
			var body = new MockElement({top:0, left:0, width:600, height:800});
			var wrapper = new MockElement({top:100,left:400, width:600, height: 800 }, body);
			var el = new MockElement({top:200, left: 800, width:400, height:400}, wrapper, {
				left: "400px",
				top: "100px"
			});
			var expected = {"left": "-380px", "top": "-80px"};

			el.id = "foo";
			var proxy = new positioningNS.ElementProxy(el, "foo");
			proxy.set("top", 20);
			proxy.set("left", 20)
			proxy.bake();
			var actual = {"left": el.style.left, "top": el.style.top }; 

			Assert.Equal(expected, actual);
		}

		[Fact]
		function backSetsProxyToClean() {
			var el = getMockElement("foo",
				{
					top:0, 
					left:0, 
					width:20, 
					height: 20
				}, 
				{
					left: "0px",
					top: "0px"
			});
			
			var proxy = new positioningNS.ElementProxy(el, "foo");
			proxy.set("left", 314);
			proxy.bake();

			Assert.False(proxy.isDirty());
		}

	}

	[Fixture]
	function isInDom() {

		[Fact]
		function documentFragmentNotInDom() {
			var el = getMockElement("foo");
			delete el.parentNode.tagName;
			var actual = positioningNS.isInDom(el)
			
			Assert.Equal(false, actual);
		}
	}

}