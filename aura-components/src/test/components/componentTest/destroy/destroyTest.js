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

    /**
     * Calling destroy on a facet which has its own facet.
     * Each level of facet evaluating v.body in its markup.
     */
    testDestroyOnChainedFacet:{
        test:[
            function(cmp){
                //Before Destroy
                $A.test.assertDefined(cmp.find("outerFacet"));
                $A.test.assertDefined(cmp.find("innerFacet1"));
                $A.test.assertDefined(cmp.find("innerFacet2"));
                $A.test.assertEquals(5, cmp.find("team").getElement().childNodes.length);
            },
            function(cmp){
                //Destroy
                var outerFacet = cmp.find("outerFacet");
                try{
                    outerFacet.destroy();
                }catch(e){
                    $A.test.fail("Component destroy() failed destroying chained facets with body:"+e)
                }
            },
            function(cmp){
                //After Destroy
                this.verifyOuterFacetComponentDestroyed(cmp);
            }
        ]
    },

    /**
     * Verify that destroy can handle reference loops in facets.
     * Cause a reference loop by making a facet aware of its parent using an attribute on the facet.
     * W-1584816
     */
    testDestroyOnParentAwareFacet:{
        test:[
            function(cmp){
	            $A.test.assertDefined(cmp.find("informFacet"));
	            $A.test.assertDefined(cmp.find("knowParent"));
	        },
	        function(cmp){
	            var facet = cmp.find("informFacet");
	            try{
	                facet.destroy();
	            }catch(e){
	                $A.test.fail("Component destroy() failed to handle reference loops in facet:"+e)
	            }
	        },
	        function(cmp){
	            $A.test.assertUndefinedOrNull(cmp.find("informFacet"));
	            $A.test.assertUndefinedOrNull(cmp.find("knowParent"));
	        }
	    ]
    },

    /**
     * Verify Component.isValid() returns false after a component has been destroyed.
     */
    testIsValidSynchronousDestroy: {
        test: function(cmp) {
            var facet = cmp.find("knowParent");
            $A.test.assertTrue(facet.isValid());
            facet.destroy();
            $A.test.assertFalse(facet.isValid());
        }
    },

    testDestroySameComponentTwice: {
        test: function(cmp) {
            var outerFacet = cmp.find("outerFacet");
            outerFacet.destroy();
            this.verifyOuterFacetComponentDestroyed(cmp);

            outerFacet.destroy();
            this.verifyOuterFacetComponentDestroyed(cmp);
        }
    },

    /**
     * Verify customized destroy handler gets called when component gets destroyed.
     */
    testCustomizedDestroyHanlder : {
        test : function(cmp) {
                component = cmp.find("cmpWithDestroyHandlerWrapper");
                component.destroy();

                $A.test.assertTrue(cmp.get("v.cmpDestroyed"),
                        "Destroy handler didn't get called when component gets destroyed");
                $A.test.assertTrue(cmp.get("v.childCmpDestroyed"),
                        "Child component's Destroy handler didn't get called when parent component gets destroyed");
            }
     },

    /**
     * After a component is destroyed it no longer performs set or get operations.
     */
    testGetReturnsUndefinedAfterDestroy: {
        test: function(cmp) {
            var textCmp = cmp.find("textInOuterFacet");
            $A.test.assertTrue(textCmp.get("v.value")!==undefined);

            textCmp.destroy();

            $A.test.assertFalse(textCmp.get("v.value")!==undefined);
        }
    },

    testSetDoesNothingAfterDestroy: {
        test: function(cmp) {
            var textCmp = cmp.find("textInOuterFacet");
            $A.test.assertTrue(textCmp.get("v.value")!==undefined);

            textCmp.destroy();
            textCmp.set("v.value","New Value");

            $A.test.assertFalse(textCmp.get("v.value")!==undefined);
        }
    },

    /**
     * Verify component in attribute will be destroyed when parent component is destroyed.
     */
    testDestroyCmpWithComponentTypedAttribute : {
        test : function(cmp) {
            var newCmp = this.createComponent("markup://aura:text");
            cmp.set("v.cmpAttribute", newCmp);

            cmp.destroy();

            $A.test.assertFalse(newCmp.isValid());
        }
    },

    /**
     * Verify component in array attribute will be destroyed when parent component is destroyed.
     */
    testDestroyCmpWithComponentArrayTypedAttribute : {
        test : function(cmp) {
            var newCmp = this.createComponent("markup://aura:text");
            var cmpArray = [newCmp];
            cmp.set("v.cmpArrayAttribute", cmpArray);

            cmp.destroy();

            $A.test.assertFalse(newCmp.isValid());
        }
    },

    /**
     * Verify non Aura Component object attribute's destroy method does NOT get called when destroying component.
     */
    testDestroyCmpWithOjectAttributeWithDestroyMethod : {
        test : function(cmp) {
            var destroyed = false;
            var obj = {
                "destroy" : function() {
                    destroyed = true;
                },
                // the compiler adds $ sign to method name
                "$destroy$" : function() {
                    destroyed = true;
                }
            }
            cmp.set("v.objWithDestroy", obj);
            cmp.destroy();

            $A.test.assertFalse(destroyed,
                    "Non Aura Component attribute's destroy method should not be called when destroying component.");
        }
    },

    testDestroyCleansUpDynamicallyAddedHandlers: {
        test: function(cmp) {
            var uniqueEventName = "markup://componentTest:destroyTest"

            // Add a dynamic handler
            $A.eventService.addHandler({
                "event": uniqueEventName,
                "globalId": cmp.getGlobalId(),
                "handler": function(){}
            });

            // Delete component
            cmp.destroy();

            // Verify handler is no longer present on the component.
            $A.test.assertFalse($A.eventService.hasHandlers(uniqueEventName), "The handler (" + uniqueEventName + ") should have been removed on delete of the component it was referencing.");
        }
    },

    testDestroyCleansUpComponentHandlerReferences: {
        test: function(cmp) {
            var reference = cmp.getReference("c.handler");
            var destroy;
            $A.createComponent("componentTest:destroy", {}, function(component){
                destroy = component;
            });
            destroy.addHandler("markup://aura:valueDestroy", cmp, reference, true, "default");

            destroy.destroy();
            cmp.destroy();
            
            // toJSON on an inValid reference is null
            $A.test.assertUndefinedOrNull(reference.toJSON());
        }
    },

    testDestroyCleansUpSharedComponentHandlerStringReferences: {
        test: function(cmp) {
            var reference = cmp.getReference("c.handler");
            var toCreate = [ ["componentTest:destroy", {}], ["componentTest:destroy", {}] ];
            var toDestroy;
            $A.createComponents(toCreate, function(components){
                toDestroy = components;
            });

            toDestroy[0].addHandler("markup://aura:valueDestroy", cmp, "{!c.handler}", true, "default");
            toDestroy[1].addHandler("markup://aura:valueDestroy", cmp, "{!c.handler}", true, "default");

            toDestroy[0].destroy();
            toDestroy[1].destroy();

            cmp.destroy();
            
            // toJSON on an inValid reference is null
            $A.test.assertUndefinedOrNull(reference.toJSON());
        }
    },
    

    testDestroyCleansUpSharedComponentHandlerReferences: {
        test: function(cmp) {
            var reference = cmp.getReference("c.handler");
            var toCreate = [ ["componentTest:destroy", {}], ["componentTest:destroy", {}] ];
            var toDestroy;
            $A.createComponents(toCreate, function(components){
                toDestroy = components;
            });

            toDestroy[0].addHandler("markup://aura:valueDestroy", cmp, reference, true, "default");
            toDestroy[1].addHandler("markup://aura:valueDestroy", cmp, reference, true, "default");

            toDestroy[0].destroy();
            toDestroy[1].destroy();

            cmp.destroy();
            
            // toJSON on an inValid reference is null
            $A.test.assertUndefinedOrNull(reference.toJSON());
        }
    },

    /**
     * Render an iteration with several items.
     * The body should contain an if bound to the same expression as the iteration v.items
     * 1. Set the iteration v.items to empty
     * 2. The If will rerender with the iteration, blanking out its facet.
     * 3. Rerender the iteration explicitly.
     * 4. See that all the elements in the iteration have been destroyed.
     */
    _testDestroyIterationWithIf: {
        test: [
            function(component) {
                var iteration = component.find("iteration");
                
                var components = this.getBodyComponentsRecursively(iteration);

                component.set("v.list", []);
                
                $A.renderingService.rerenderDirty();
                
                // All of the components inside the iteration should be invalid at this point.
                //var components = ifs.concat(divs);
                for(var c=0;c<components.length;c++) {
                    $A.test.assertFalse(components[c].isValid(), "One of the components inside the iteration after empty and rerender was valid: " + components[c]);
                }
            }
        ]
    },

    getBodyComponentsRecursively: function(component) {
        var components = [];

        function getBodyComponents(children) {
            for(var c=0;c<children.length;c++) {
                components.push(children[c]);
                if(children[c].getType() !== "aura:expression") {
                    getBodyComponents(children[c].get("v.body"));
                }
            }
        }

        getBodyComponents(component.get("v.body"))

        return components;
    },

    verifyOuterFacetComponentDestroyed : function(cmp) {
        this.verifyChildComponentsDestroyed(cmp);
        $A.test.assertEquals(0, cmp.find("team").getElement().childNodes.length);
    },

    verifyTeamDivDestroyed : function(cmp) {
        this.verifyChildComponentsDestroyed(cmp);
        $A.test.assertUndefinedOrNull(cmp.find("team"));
    },

    verifyChildComponentsDestroyed : function(cmp) {
        $A.test.assertUndefinedOrNull(cmp.find("outerFacet"));
        $A.test.assertUndefinedOrNull(cmp.find("textInOuterFacet"));
        $A.test.assertUndefinedOrNull(cmp.find("bullPen"));

        $A.test.assertUndefinedOrNull(cmp.find("innerFacet1"));
        $A.test.assertUndefinedOrNull(cmp.find("textInInnerFacet"));
        $A.test.assertUndefinedOrNull(cmp.find("players"));

        $A.test.assertUndefinedOrNull(cmp.find("innerFacet2"));
        $A.test.assertUndefinedOrNull(cmp.find("coach"));
    },

    createComponent : function(qualifyedName) {
        var newCmp;
        $A.createComponent(qualifyedName,null,function(targetComponent){
            newCmp = targetComponent;
        });
        $A.test.assertTrue(newCmp.isValid());
        return newCmp;
    }
})
