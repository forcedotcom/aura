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
Test.Components.Ui.PanelPositioning.panelPositioningTest=function(){

	var lib, constraint = {};

	var mockWindow = {
		addEventListener: function() {},
		removeEventListener: function() {}
	};

	var mock$A = Mocks.GetMock(Object.Global(), "$A", {
		assert: function(val, msg) {

			if(!val) {
				throw msg;
			}
		},
		util: {
			copy:function(obj) {
				return obj;
			}
		}
	}); 

	function getConstraintMock(ns, cb) {
		return Mocks.GetMock(Object.Global(),'Constraint', cb);
	}

	var mockUtils = {
		getScrollableParent: function() {
			return null;
		}
	};

	// just return it for inspection
	var elementProxyFactory =  {
		getElement: function(el) {
			return el;
		}
	}



	[ImportJson("aura-components/src/main/components/ui/panelPositioningLib/panelPositioning.js", function(path, result) {
		
			lib = result;
		
	})]

	[Fixture]
	function createRelationship() {

		[Fact]
		function returnsObjectWithMethods() {
			var constMock = getConstraintMock(constraint, function() {
				
			});
			mock$A(function() {
				constMock(function() {
					constraint.Constraint = Constraint;
					var myLib;
					myLib = lib(constraint, elementProxyFactory, mockUtils, mockWindow);

					var actual = myLib.createRelationship({
						element:{
							nodeType: 1
						},
		                target:{
		                	nodeType: 1
		                },
		                align:'left top',
		                targetAlign: 'left top',
		                enable: true
					});


					// Not the best test, but just verify the interface looks right
					Assert.Equal(Object.keys(actual), ['disable', 'enable', 'destroy']);
				})
				
			});
		}

		[Fact]
		function ThrowsIfInvalidDirection() {
			var constMock = getConstraintMock(constraint, function() {
				
			});
			mock$A(function() {
				constMock(function() {
					constraint.Constraint = Constraint;
					var myLib;
					myLib = lib(constraint, elementProxyFactory, mockUtils, mockWindow);
					
					var actual=Record.Exception(function(){
						var retObj = myLib.createRelationship({
							element:{
								nodeType: 1
							},
			                target:{
			                	nodeType: 1
			                },
			                align:'left side',
			                targetAlign: 'left top',
			                enable: true
						});

					 });

					Assert.NotNull(actual, 'Should throw an exception for invalid directions');
				})
				
			});
		}

		[Fact]
		function ThrowsIfOnlyOneDirection() {
			var constMock = getConstraintMock(constraint, function() {
				
			});
			mock$A(function() {
				constMock(function() {
					constraint.Constraint = Constraint;
					var myLib;
					myLib = lib(constraint, elementProxyFactory, mockUtils, mockWindow);
					
					var actual=Record.Exception(function(){
						var retObj = myLib.createRelationship({
							element:{
								nodeType: 1
							},
			                target:{
			                	nodeType: 1
			                },
			                align:'left side',
			                targetAlign: 'left',
			                enable: true
						});

					 });

					Assert.NotNull(actual, 'Should throw an exception for invalid directions');
				})
				
			});
		}

	}


};
