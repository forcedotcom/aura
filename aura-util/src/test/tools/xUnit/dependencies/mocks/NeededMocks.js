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
Function.RegisterNamespace("Test.Mocks");

Test.Mocks.NeededMocks={
	getWindowMock:function(){
		return Mocks.GetMock(Object.Global(),"window",
			Stubs.GetObject({
				getTitle:function(){return "xUnit Test"},
				/* methods */
				getComputedStyle:function(element){
					return element.CSSStyleDeclaration;
				},
				setTimeout:function(fn,delay){
					fn();
					return Date.now();
				},
				clearTimeout:function(id){
					return true;
				},
				addEventListener:function(type,fn,capture){},
				removeEventListener:function(type,fn,capture){},
				requestAnimationFrame:function(callback){
					callback();
					return Date.now();
				},
				cancelAnimationFrame:function(id){},
				appendChild:function(c){}
			},{
				/* properties */
				document:{
					location:{hash:''},
					documentElement:{
						style:{}
					},
					createElement:function(tagName){
						return Stubs.Dom.GetNode({
							classList:{add:function(className){}},
							style:{height:'',width:''},
							tagName:tagName,
							getElementsByClassName:function(_class){
								return [];
							}
						});
					},
					createDocumentFragment:function(){
						return Stubs.Dom.GetNode({style:{height:'',width:''}});
					},
					querySelector:function(s){
						return {};
					}
				},
				navigator:{
					msPointerEnabled:{}
				},
				console:{
					log:function(){}
				},
				DEBUG:{
					log:function(){}
				}
				//pull this __S.support out into respective file from here
				//__S:{
				//	support:{}
				//}

			})
		);
	}
};