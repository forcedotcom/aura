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
Test.Components.Ui.Scroller.Raf=function(){

	var windowMock=Test.Mocks.NeededMocks.getWindowMock();
	
	[Fixture]
	function RequestsAnimationFrame(){

		[Fact]
		function ExecutesCallBackIfRafNotDefined(){
			var element={property:"false"};

			windowMock(function(){	
				window.requestAnimationFrame(function(){
					element.property=true;
				},element);
			});

			Assert.True(element.property);
		}

		[Fact]
		function ClearsTimeout(){
			var cancelAnimationFrameMock,id,actual;

			windowMock(function(){	
				id=window.requestAnimationFrame(function(){});
				cancelAnimationFrameMock=Mocks.GetMock(window,"cancelAnimationFrame",function(id){
					return window.clearTimeout(id);	
				});
				cancelAnimationFrameMock(function(){
					actual=window.cancelAnimationFrame(id);
				});
				
			});

			Assert.True(actual);
		}
	}
}
