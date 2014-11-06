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

 /* 
 * IMPORTANT NOTE: This tests were suppose to be testing rerendering correctness before HALO (which were checking for parent, grandparent, and child rerendering)
 * We inverted the asserts to check that nothing actually rerenders now, because the rendering is now much more selective.
 * We have other more robust tests to check that the rendering is correct in cases were the component sub-tree changes.
 *
 */
({
	getCounter : function(component) {
		return $A.test.getText(component.find("counter").find("count").getElement());
	},

	assertCounter : function(component, count, msg) {
        $A.test.assertEquals("" + count, this.getCounter(component), msg || "unexpected count");
	},
	
    assertChildRendererCounters: function(component, count) {
    	this.assertCounter(component, count, "unexpected child count");
    	this.assertCounter(component.getSuper(), count, "unexpected parent count");
    	this.assertCounter(component.getSuper().getSuper(), count, "unexpected abstract count");
    },

    assertRendererCounters: function(component, child1count, grandchild1count, child2count, grandchild2count, grandchild2acount, greatgrandchild2count, layoutItemCount){
        var child1 = component.find("child1");
        this.assertChildRendererCounters(child1, child1count);
        var grandchild1 = component.find("grandchild1");
        this.assertChildRendererCounters(grandchild1, grandchild1count);
        var child2 = component.find("child2");
        this.assertChildRendererCounters(child2, child2count);
        var grandchild2 = component.find("grandchild2");
        this.assertChildRendererCounters(grandchild2, grandchild2count);
        var grandchild2a = component.find("grandchild2a");
        this.assertChildRendererCounters(grandchild2a, grandchild2acount);
        var greatgrandchild2 = component.find("greatgrandchild2");
        this.assertChildRendererCounters(greatgrandchild2, greatgrandchild2count);
        if(layoutItemCount){
            var layoutItem = component.find("layoutTarget").get("v.body")[0];
            this.assertChildRendererCounters(layoutItem, layoutItemCount);
        }
    },

    addWaitForCounter : function(component, count) {
    	var that = this;
    	var cmp = component;
        $A.test.addWaitFor("" + count, function(){
        	var cntr = that.getCounter(cmp);
        	debugger;
            return cntr;
        });
    },
    
    addWaitForLayoutItem : function(component, layoutItemText) {
    	var cmp = component;
    	var expected = layoutItemText;
        $A.test.addWaitFor(true, function(){
            var t = $A.test.getText(cmp.find("layoutTarget").getElement());
            return t && (t.indexOf(expected) >= 0);
        });    	
    },
    
    toggleValue : function(component, targetExpression) {
        var val = $A.util.getBooleanValue(component.get(targetExpression));
        component.set(targetExpression, !val);
    },
    
    /**
     * Update attribute from abstract component.
     * Nothing should rerender but the cmp itself
     */
    testAbstractAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
                this.addWaitForCounter(child1, "0");
            }, function(component){
                this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0", "0");
            }]
    },

    /**
     * Update model from abstract component.
     * Nothing should rerender but the cmp itself
     */
    testAbstractModelUpdated: {
        attributes : { __layout: "#def" },
        test: [
            function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, 
            function(component) {
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstractModel").get("e.press").fire();
                this.addWaitForCounter(child1, "0");
            }, 
            function(component){
                this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0", "0");
            }]
    },

    /**
     * Update interface attribute from abstract component.
     * Nothing should rerender but the cmp itself
     */
    testInterfaceAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleInterface").get("e.press").fire();
                this.addWaitForCounter(child1, "0");
            }, function(component){
                this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0", "0");
            }]
    },

    /**
     * Update attribute from parent component.
     * Nothing should rerender but the cmp itself
     */
    testParentAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, function(component){
                var child2 = component.find("child2");
                child2.getSuper().find("toggleParent").get("e.press").fire();
                this.addWaitForCounter(child2, "0");
            }, function(component){
                this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0");
            }]
    },

    /**
     * Update model from parent component.
     * Nothing should rerender but the cmp itself (no participation (dirtyness on the children))
     */
    testParentModelUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, function(component){
                var child2 = component.find("child2");
                child2.getSuper().find("toggleParentModel").get("e.press").fire();
                this.addWaitForCounter(child2, "0");
            }, function(component){
                this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0");
            }]
    },

    /**
     * Update attribute from child component.
     * This should only cause a rerender in the component that owns that attribute, 
     * because that attribute does not participate any where else.
     */
    testChildtAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
				this.addWaitForLayoutItem(component, "def layout item");
		    }, function(component){
                var child2 = component.find("child2");
                child2.find("toggleChild").get("e.press").fire();
                this.addWaitForCounter(child2, "0");
            }, function(component){
                var child2 = component.find("child2");
                $A.test.assertEquals(child2.get('v.ownRenderCounter'), 1, 'no rendering happened!');
                this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0");
            }]
    },

    /**
     * Layout change will not rerender the container.
     * Nothing should rerender but the cmp itself
     */
    _testLayoutChange: {
    	doNotWrapInAuraRun : true,
        attributes : { __layout: "#def" },
        test: [
            function (component) {
        		this.addWaitForLayoutItem(component, "def layout item");
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().find("toggleParent").get("e.press").fire();
            }, function(component){
                this.addWaitForCounter(component.find("child1"), "2");
            }, function(component){
                this.assertCounters(component, "2", "2", "0", "0", "0", "0", "2");
                $A.layoutService.layout("death");
        		this.addWaitForLayoutItem(component, "death layout item");
            }, function(component){
                this.assertCounters(component, "2", "2", "0", "0", "0", "0", "0");
            }, function(component){        
                component.find("child1").find("toggleChild").get("e.press").fire();
            }, function(component){
                this.addWaitForCounter(component.find("child1"), "3");
            }, function(component){
                this.assertCounters(component, "3", "3", "0", "0", "0", "0", "1");
            }]
    },
    /**
     * Update attribute on a layout item.
     */
    testLayoutItemAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [
            function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, 
            function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
                this.addWaitForCounter(child1, "0");
            }, 
            function(component){
                this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0", "0");
                var item = component.find("layoutTarget").get("v.body")[0].getSuper();
                item.find("toggleParent").get("e.press").fire();
                this.addWaitForCounter(item, "0");
            }, 
            function(component){
                this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0", "0");
            }]
    },
    
    testRerenderOnceIfContainerRerenderedInEventLoop: {
        attributes : { __layout: "#def" },
        test: [function(component){
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, function(component){
	        	var cmp = component;
	        	var child2 = cmp.find("child2");
	            var that = this;
	            $A.run(function(){
	            	that.toggleValue(cmp.find("child2"), "v.toggleChild");
	            	that.toggleValue(cmp.find("grandchild2"), "v.toggleChild");
	            	that.toggleValue(cmp.find("greatgrandchild2"), "v.toggleChild");
	            });
	            $A.test.addWaitFor("0", function(){
	                return that.getCounter(child2);
	            });
	        }, function(component){
	        	this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0");
	        }]
    },

    testRerenderOnceForNonConcreteComponentsIfContainerRerenderedInEventLoop: {
        attributes : { __layout: "#def" },
        test: [function(component){
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, function(component){
	        	var cmp = component;
	        	var child2 = cmp.find("child2");
	            var that = this;
	            $A.run(function(){
	            	that.toggleValue(cmp.find("greatgrandchild2").getSuper().getSuper(), "v.toggleInterface");
	            	that.toggleValue(cmp.find("child2").getSuper(), "v.toggleParent");
	            	that.toggleValue(cmp.find("grandchild2").getSuper().getSuper(), "v.toggleAbstract");
	            });
	            $A.test.addWaitFor("0", function(){
	                return that.getCounter(child2);
	            });
	        }, function(component){
	        	this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0");
	        }]
    },

    /** Tests rerender ordering. */
    testRerenderOrder: {
        attributes : { __layout: "#def" },
        test: [function(component){
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, function(component){
	            var child2 = component.find("child2");
	            var grandchild2a = component.find("grandchild2a");
	            var grandchild1 = component.find("grandchild1");
	            Window.rerenderTestOrder = [];  // Reset order tracking
	            $A.rerender([grandchild2a, grandchild1, child2]);
	            this.addWaitForCounter(child2, "0");
	        }, function(component){
	            // Rerendering this three components should only render the components alone and nothing else in the tree (no supers or children)
                // Because the there is no real attribute changes down the tree
	            this.assertRendererCounters(component, "0", "0", "0", "0", "0", "0");
	            var order = Window.rerenderTestOrder; // we should only collect the rendering for the components themselves
	            var strOrder = order.join(",");
                
	            if (order.length !== 3 && strOrder !== "grandchild2a,grandchild1,child2") {
	            	$A.test.fail("Unexpected rendering order: " + strOrder);
	            }
	        }]
    },

    /**
     * Add component to empty array.
     */
    testAddComponentToEmptyArray: {
        attributes : { whichArray: "v.emptyArray" },
        test: [
            function (component) {
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, 
            function (component) {
                var cmp = component.find("emptyArrayContainer");
                this.assertChildRendererCounters(cmp, 0);
                component.find("pushComponent").get("e.press").fire();
                $A.test.addWaitFor("markup://auratest:rerenderChild", function(){
                    var added = cmp.get("v.body")[0].get("v.value")[0];
                    return added && added.isRendered() && added.getDef().getDescriptor().getQualifiedName();
                });
            }, 
            function (component) {
                var cmp = component.find("emptyArrayContainer");
                this.assertChildRendererCounters(cmp, 0);
                var added = cmp.get("v.body")[0].get("v.value")[0];
                this.assertChildRendererCounters(added, 0);
            }
        ]
    },

    /**
     * Clear an array.
     */
    testClearArray: {
        attributes : { whichArray: "v.emptyArray" },
        test: [function(component){
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, function(component){
                component.find("pushText").get("e.press").fire();
                component.find("pushComponent").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    var cmps = component.find("emptyArrayContainer").get("v.body")[0].get("v.value");
                    return (cmps.length === 2) && cmps[0].isRendered() && cmps[1].isRendered();
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                this.assertChildRendererCounters(cmp, "0");
                var added = cmp.get("v.body")[0].get("v.value")[1];
                this.assertChildRendererCounters(added, 0);
                var root = component;
                $A.run(function(){
                    root.set("v.emptyArray", []);
                });
                $A.test.addWaitFor(0, function(){
                    return component.find("emptyArrayContainer").get("v.body")[0].get("v.value").length;
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                this.assertChildRendererCounters(cmp, "0");
            }]
    },

    /**
     * Rearrange an array. 
     * the last part doesn work due to W-2298368
     */
    _testReverseArray: {
        attributes : { whichArray: "v.emptyArray" },
        test: [function(component){
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, function(component){
                component.find("pushText").get("e.press").fire();
                component.find("pushComponent").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    var cmps = component.find("emptyArrayContainer").get("v.body")[0].get("v.value");
                    return (cmps.length === 2) && cmps[0].isRendered() && cmps[1].isRendered();
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                this.assertChildRendererCounters(cmp, "2");

                // text comp before child comp
                var textElem = cmp.get("v.body")[0].get("v.value")[0].getElement();
                $A.test.assertEquals("PUSHED.", $A.test.getText(textElem), "unexpected text node rendered first");

                var childComp = cmp.get("v.body")[0].get("v.value")[1];
                $A.test.assertEquals(textElem.nextSibling, childComp.getElement(), "child component not rendered after text node");
                this.assertChildRendererCounters(childComp, 0);

                component.find("reverse").get("e.press").fire();
                $A.test.addWaitFor("PUSHED.", function(){
                    return $A.test.getText(cmp.get("v.body")[0].get("v.value")[1].getElement());
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                this.assertChildRendererCounters(cmp, "3");

                // text comp now after child comp
                var textElem = cmp.get("v.body")[0].get("v.value")[1].getElement();
                $A.test.assertEquals("PUSHED.", $A.test.getText(textElem), "unexpected text node rendered second");

                /*
                 * this part doesn't work. W-2298368
                var childComp = cmp.get("v.body")[0].get("v.value")[0];
                $A.test.assertEquals(textElem, childComp.getElement().nextSibling, "child component not rendered before text node");
                this.assertChildRendererCounters(childComp, 1);
                */
            }]
    },

    /**
     * Add, rearrange, and remove from component body. W-2298368
     */
    _testUpdateBody: {
        attributes : { whichArray: "emptyArrayContainer.super.v.body" },
        test: [function(component){
	    		this.addWaitForLayoutItem(component, "def layout item");
	        }, function(component){
                var cmp = component.find("emptyArrayContainer");
                var children = cmp.getElement().firstChild.firstChild.childNodes;
                var origCount = children.length;

                component.find("pushText").get("e.press").fire();
                component.find("pushComponent").get("e.press").fire();

                $A.test.addWaitFor(origCount + 2, function(){
                    return children.length;
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                var children = cmp.getElement().firstChild.firstChild.childNodes;

                $A.test.assertTrue($A.util.hasClass(children[0], "boxed"), "unexpected original child");
                $A.test.assertEquals("PUSHED.", $A.test.getText(children[1]), "unexpected text component");
                $A.test.assertTrue($A.util.hasClass(children[2], "auratestRerenderChild"), "unexpected child component element");
                this.assertChildRendererCounters(cmp, 2);
                this.assertChildRendererCounters(cmp.getSuper().get("v.body")[2], 0); // newly added child comp
            }
            /* the part below reverse doesn't work : W-2298368
                component.find("reverse").get("e.press").fire();
                component.find("pop").get("e.press").fire();
                component.find("pushText").get("e.press").fire();

                $A.test.addWaitFor("PUSHED.", function(){
                    return $A.test.getText(children[2]);
                });
                
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                var children = cmp.getElement().firstChild.firstChild.childNodes;

                $A.test.assertTrue($A.util.hasClass(children[0], "auratestRerenderChild"), "child component element not moved");
                $A.test.assertEquals("PUSHED.", $A.test.getText(children[1]), "text component not moved");
                $A.test.assertEquals("PUSHED.", $A.test.getText(children[2]), "unexpected text component");
                $A.test.assertEquals("2", $A.test.getText(cmp.getSuper().getSuper().find("counter").find("count").getElement()), "unexpected abstract count");
                $A.test.assertEquals("2", $A.test.getText(cmp.getSuper().find("counter").find("count").getElement()), "unexpected parent count");
                $A.test.assertEquals(undefined, cmp.find("counter").find("count").getElement(), "child count not unrendered");
                this.assertChildRendererCounters(cmp.getSuper().get("v.body")[0], 1); // moved child comp
            }
            */
            ]
    }
})

