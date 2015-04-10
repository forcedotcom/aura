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
({
	/*
	 * Tests to verify componentClass give us same render/reRender/afterRender/unRender method as componentDef
	*/
	getMethodBody : function(methodString) {
		return methodString.split('{')[1];
	},
	
	testRenderDefAreTheSame : {
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("auratest$componentClassParent");
			var cmpDef = testCmp.getDef();
			var fromComponentClass = cc.prototype.render;
			var fromComopnentDef = cmpDef.getRendererDef()["renderMethod"];
			$A.test.assertTrue((fromComponentClass === fromComopnentDef),
					"render function from componentClass and componentDef should be the same");
		}
	},
	
	testReRenderDefAreTheSame : { 
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("auratest$componentClassParent");
			var cmpDef = testCmp.getDef();
			
			var fromComponentClass = cc.prototype.rerender;
			var fromComopnentDef = cmpDef.getRendererDef()["rerenderMethod"];
			$A.test.assertTrue((fromComponentClass === fromComopnentDef),
					"rerender function from componentClass and componentDef should be the same");
		}
	},
	
	testAfterRenderDefAreTheSame : { 
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("auratest$componentClassParent");
			var cmpDef = testCmp.getDef();
			
			var fromComponentClass = cc.prototype.afterrerender;
			var fromComopnentDef = cmpDef.getRendererDef()["afterrenderMethod"];
			$A.test.assertTrue((fromComponentClass === fromComopnentDef),
					"afterrender function from componentClass and componentDef should be the same");
		}
	},
	
	testUnRenderDefAreTheSame : { 
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("auratest$componentClassParent");
			var cmpDef = testCmp.getDef();
			
			var fromComponentClass = cc.prototype.unrender;
			var fromComopnentDef = cmpDef.getRendererDef()["unrenderMethod"];
			$A.test.assertTrue((fromComponentClass === fromComopnentDef),
					"unrender function from componentClass and componentDef should be the same");
		}
	},
	
	/*
	 * Tests with CSCC interface 
	 * $A.componentService.createComponent(type, attributes, callback) returns a component of instanceof type
	 * $A.componentService.createComponents(components, callback) returns an array of components of instanceof type
	 * $A.componentService.newComponent(config, avp, localCreation, doForce) returns a component of instanceof type
	 * $A.componentService.newComponentDeprecated(config, avp, localCreation, doForce) returns a component of instanceof type
	 * $A.componentService.newComponentAsync(callbackScope, callback, config, avp) returns a component of instanceof type
	 * $A.componentService.requestComponent(callbackScope, callback, config, avp, index, returnNullOnError) returns a component of instanceof type
	 * 
	 * the last one is not public, hence, no test
	 */
	//$A.ns.AuraComponentService.prototype.createComponent = function(type, attributes, callback){
	testCreateComponentReturnCorrectType : {
		test: function(testCmp) {
			var type="aura:text";
			var attributes = null;
            $A.createComponent(type, attributes, function(targetComponent){
            	var cmpFromComponentClass = $A.componentService.getComponentClass(type);
            	$A.test.assertTrue(targetComponent instanceof cmpFromComponentClass);
            })
		}
	},
	
	//get a component with server dependency
	testCreateComponentServerDependencyReturnCorrectType : {
		test: function(testCmp) {
			var type="auradev:quickFixButton"; 
			var attributes = null;
            $A.createComponent(type, attributes, function(targetComponent){
            	var cmpFromComponentClass = $A.componentService.getComponentClass(type);
            	$A.test.assertTrue(targetComponent instanceof cmpFromComponentClass);
            })
		}
	},
	
	testCreateComponentsReturnCorrectType : {
		test: function(testCmp) {
			var type="aura:text";
			var attributes = null;
			$A.createComponents([
			                     [type, attributes],
			                     [type, attributes],
			                     [type, attributes],
			                     [type, attributes],
			                     [type, attributes]
			                 ],
			    function(components){
					for( var i=0; i< components.length; i++ ) {
						var cmpFromComponentClass = $A.componentService.getComponentClass(type);
						$A.test.assertTrue(components[i] instanceof cmpFromComponentClass);
					}
			});
		}
	},
	
	//$A.ns.AuraComponentService.prototype.newComponent = function(config, attributeValueProvider, localCreation, doForce){
	testNewComponentReturnCorrectType : {
		test: function(testCmp) {
			var type="aura:text";
			var config = {
	                componentDef: type,
	                attributes: {
	                    values: {
	                        value: "something",
	                    }
	                }
	            }
			var newCmp = $A.componentService.newComponent(config);
			var cmpFromComponentClass = $A.componentService.getComponentClass(type);
        	$A.test.assertTrue(newCmp instanceof cmpFromComponentClass);
		}
	},
	
	//W-2567017
	_testNewComponentServerDependencyReturnCorrectType : {
		test: function(testCmp) {
			var type="auradev:quickFixButton";
			var config = {
	                componentDef: type,
	            }
			var newCmp = $A.componentService.newComponent(config);
			debugger;
			//for newCmp, first we will get a place holder, once the response from server arrived, we will get a real one
        	$A.test.addWaitForWithFailureMessage(true,
        			function() {
        		debugger;
        				var cmpFromComponentClass = $A.componentService.getComponentClass(type);
        				return (newCmp instanceof cmpFromComponentClass);
        			},
        			"component created by server via newComponentDeprecated should be instance of those created by component Class"
        	);
		}
	},
	
	//$A.ns.AuraComponentService.prototype.newComponentDeprecated = function(config, attributeValueProvider, localCreation, doForce)
	testNewComponentDeprecatedReturnCorrectType : {
		test: function(testCmp) {
			var type="aura:text";
			var config = {
	                componentDef: type,
	                attributes: {
	                    values: {
	                        value: "something",
	                    }
	                }
	            }
			var newCmp = $A.componentService.newComponentDeprecated(config);
			var cmpFromComponentClass = $A.componentService.getComponentClass(type);
        	$A.test.assertTrue(newCmp instanceof cmpFromComponentClass);
		}
	},
	
	//W-2567017
	_testNewComponentDeprecatedServerDependencyReturnCorrectType : {
		test: function(testCmp) {
			var type="auradev:quickFixButton";
			var config = {
	                componentDef: type,
	            }
			var newCmp = $A.componentService.newComponentDeprecated(config);
			var cmpFromComponentClass = $A.componentService.getComponentClass(type);
			//for newCmp, first we will get a place holder, once the response from server arrived, we will get a real one
        	$A.test.addWaitForWithFailureMessage(true,
        			function() { return (newCmp instanceof cmpFromComponentClass) },
        			"component created by server via newComponentDeprecated should be instance of those created by component Class"
        	);
		}
	},
	
	//$A.componentService.newComponentAsync(callbackScope, callback, config, avp)
	testNewComponentAsyncReturnCorrectType : {
		test: function(testCmp) {
			var type="aura:text";
			$A.componentService.newComponentAsync(
	                this,
	                function(newCmp){
	                	var cmpFromComponentClass = $A.componentService.getComponentClass(type);
	                	$A.test.assertTrue(newCmp instanceof cmpFromComponentClass);
	                },
	                type
	            );
		}
	},
	
	testNewComponentAsyncServerDependencyReturnCorrectType : {
		test: function(testCmp) {
			var type="auradev:quickFixButton";
			$A.componentService.newComponentAsync(
	                this,
	                function(newCmp){
	                	var cmpFromComponentClass = $A.componentService.getComponentClass(type);
	                	//for newCmp, first we will get a place holder, once the response from server arrived, we will get a real one
	                	$A.test.addWaitForWithFailureMessage(true,
	                			function() { return (newCmp instanceof cmpFromComponentClass) },
	                			"component created by server via newComponentAsync should be instance of those created by component Class"
	                	);
	                },
	                type
	            );
		}
	}
	
})