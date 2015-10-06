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
			var cc = $A.componentService.getComponentClass("markup://auratest:componentClassParent");
			var cmpDef = testCmp.getDef();
			var fromComponentClass = cc.prototype.render;
			var fromComopnentDef = cmpDef.getRendererDef()["renderMethod"];
			$A.test.assertTrue((fromComponentClass === fromComopnentDef),
					"render function from componentClass and componentDef should be the same");
		}
	},
	
	testReRenderDefAreTheSame : { 
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("markup://auratest:componentClassParent");
			var cmpDef = testCmp.getDef();
			
			var fromComponentClass = cc.prototype.rerender;
			var fromComopnentDef = cmpDef.getRendererDef()["rerenderMethod"];
			$A.test.assertTrue((fromComponentClass === fromComopnentDef),
					"rerender function from componentClass and componentDef should be the same");
		}
	},
	
	testAfterRenderDefAreTheSame : { 
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("markup://auratest:componentClassParent");
			var cmpDef = testCmp.getDef();
			
			var fromComponentClass = cc.prototype.afterrerender;
			var fromComopnentDef = cmpDef.getRendererDef()["afterrenderMethod"];
			$A.test.assertTrue((fromComponentClass === fromComopnentDef),
					"afterrender function from componentClass and componentDef should be the same");
		}
	},
	
	testUnRenderDefAreTheSame : { 
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("markup://auratest:componentClassParent");
			var cmpDef = testCmp.getDef();
			
			var fromComponentClass = cc.prototype.unrender;
			var fromComopnentDef = cmpDef.getRendererDef()["unrenderMethod"];
			$A.test.assertTrue((fromComponentClass === fromComopnentDef),
					"unrender function from componentClass and componentDef should be the same");
		}
	},
	
	//check component from $A.createComponent is instanceof what we get from componentClass
	testCreateComponentReturnCorrectType : {
		test: function(testCmp) {
			var type="markup://aura:text";
			var attributes = null;
            $A.createComponent(type, attributes, function(targetComponent){
            	var cmpFromComponentClass = $A.componentService.getComponentClass(type);
            	$A.test.assertTrue(targetComponent instanceof cmpFromComponentClass);
            })
		}
	},
	
	//get a component with server dependency via $A.createComponent
	testCreateComponentServerDependencyReturnCorrectType : {
		test: function(testCmp) {
			var type="markup://auratest:componentClassUnloaded"; 
			var attributes = null;
			var done = false;
			var newComponent;
			$A.createComponent(type, attributes, function(targetComponent){
				newComponent = targetComponent;
            	done = true;
            });
			$A.test.addWaitForWithFailureMessage(true,
        			function() { 
						return done;
					},
					"createComponent fail to get us a new component",
					function() {
						var cmpFromComponentClass = $A.componentService.getComponentClass(type);
						$A.test.assertTrue(newComponent instanceof cmpFromComponentClass);
					}
			);
            
		}
	},
	
	testCreateComponentsReturnCorrectType : {
		test: function(testCmp) {
			var type="markup://aura:text";
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
	
	testNewComponentReturnCorrectType : {
		test: function(testCmp) {
			var type="markup://aura:text";
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
	
	testNewComponentServerDependencyReturnCorrectType : {
		test: function(testCmp) {
			var type="markup://auratest:componentClassUnloaded";
			var config = {
	                componentDef: type,
	            }
			var newCmp = $A.componentService.newComponent(config);
			testCmp.find("serverInParent").set("v.body", [newCmp]);
			var cmpFromComponentClass = $A.componentService.getComponentClass(type);
			//for newCmp, first we will get a place holder, once the response from server arrived, we will get a real one
			$A.test.addWaitForWithFailureMessage(true,
        			function() { 
						var placeholderBody = newCmp.get("v.body")[0];
						if(placeholderBody) {
							var qname = placeholderBody.getDef().getDescriptor().getQualifiedName();
							return $A.test.contains(qname, type);
						} else {
							return false;
						}
					},
					"placeholder didn't get replaced with real component we want",
					function() {
						var cmpFromComponentClass = $A.componentService.getComponentClass(type);
						$A.test.assertTrue(newCmp.get("v.body")[0] instanceof cmpFromComponentClass);
					}
			);
		}
	},
	
	testNewComponentDeprecatedReturnCorrectType : {
		test: function(testCmp) {
			var type="markup://aura:text";
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
	
	testNewComponentDeprecatedServerDependencyReturnCorrectType : {
		test: function(testCmp) {
        	var type="markup://auratest:componentClassUnloaded";
			var config = {
	                componentDef: type,
	            }
			var newCmp = $A.componentService.newComponentDeprecated(config);
			testCmp.find("serverInParent").set("v.body", [newCmp]);
			var cmpFromComponentClass = $A.componentService.getComponentClass(type);
			//for newCmp, first we will get a place holder, once the response from server arrived, we will get a real one
			$A.test.addWaitForWithFailureMessage(true,
        			function() { 
						var placeholderBody = newCmp.get("v.body")[0];
						if(placeholderBody) {
							var qname = placeholderBody.getDef().getDescriptor().getQualifiedName();
							return $A.test.contains(qname, type);
						} else {
							return false;
						}
					},
					"placeholder didn't get replaced with real component we want",
					function() {
						var cmpFromComponentClass = $A.componentService.getComponentClass(type);
						$A.test.assertTrue(newCmp.get("v.body")[0] instanceof cmpFromComponentClass);
					}
			);
		}
	},
	
	testNewComponentAsyncReturnCorrectType : {
		test: function(testCmp) {
			var type="markup://aura:text";
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
			var type="markup://auratest:componentClassUnloaded";
			var done = false;
			var newComponent;
			$A.test.addWaitForWithFailureMessage(true,
        			function() { 
						return done;
					},
					"createComponent fail to get us a new component",
					function() {
						var cmpFromComponentClass = $A.componentService.getComponentClass(type);
						$A.test.assertTrue(newComponent instanceof cmpFromComponentClass);
					}
			);
			$A.componentService.newComponentAsync(
	                this,
	                function(newCmp){
	                	newComponent = newCmp;
	                	done = true;
	                },
	                type
	        );
		}
	}
	
})
