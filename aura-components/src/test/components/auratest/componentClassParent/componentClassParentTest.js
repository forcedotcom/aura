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
	 * Tests to verify componentClass give us same render/reRender/afterRender/unRender method on every instance
	*/
	getMethodBody : function(methodString) {
		return methodString.split('{')[1];
	},

	testRenderAreTheSame : {
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("markup://auratest:componentClassParent");
			var fromComponentClass = cc.prototype.renderer.render;
			var fromComponentInstance = testCmp.getRenderer()["render"];
			$A.test.assertTrue((fromComponentClass === fromComponentInstance),
					"render function from componentClass and componentDef should be the same");
		}
	},

	testReRenderAreTheSame : {
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("markup://auratest:componentClassParent");
			var fromComponentClass = cc.prototype.renderer.rerender;
			var fromComponentInstance = testCmp.getRenderer()["rerender"];
			$A.test.assertTrue((fromComponentClass === fromComponentInstance),
					"rerender function from componentClass and componentDef should be the same");
		}
	},

	testAfterRenderAreTheSame : {
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("markup://auratest:componentClassParent");
			var fromComponentClass = cc.prototype.renderer.afterRender;
			var fromComponentInstance = testCmp.getRenderer()["afterRender"];
			$A.test.assertTrue((fromComponentClass === fromComponentInstance),
					"afterRender function from componentClass and componentDef should be the same");
		}
	},

	testUnRenderAreTheSame : {
		test: function(testCmp) {
			var cc = $A.componentService.getComponentClass("markup://auratest:componentClassParent");
			var fromComponentClass = cc.prototype.renderer.unrender;
			var fromComponentInstance = testCmp.getRenderer()["unrender"];
			$A.test.assertTrue((fromComponentClass === fromComponentInstance),
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

	testNewCmpFromConfigReturnCorrectType : {
		test: function(testCmp) {
			var type = "markup://aura:text";
			var config = {
                componentDef: { descriptor: type },
                attributes: { values: { value: "something" } }
            };
			var newCmp = $A.createComponentFromConfig(config);
			var cmpFromComponentClass = $A.componentService.getComponentClass(type);
        	$A.test.assertTrue(newCmp instanceof cmpFromComponentClass);
		}
	}
})
