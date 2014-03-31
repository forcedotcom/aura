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
	getCounter : function(component) {
		return $A.test.getText(component.find("counter").find("count").getElement());
	},

	assertCounter : function(component, count, msg) {
        $A.test.assertEquals("" + count, this.getCounter(component), msg || "unexpected count");
	},
	
    assertChildCounters: function(component, count) {
    	this.assertCounter(component, count, "unexpected child count");
    	this.assertCounter(component.getSuper(), count, "unexpected parent count");
    	this.assertCounter(component.getSuper().getSuper(), count, "unexpected abstract count");
    },

    assertCounters: function(component, child1count, grandchild1count, child2count, grandchild2count, grandchild2acount, greatgrandchild2count, layoutItemCount){
        var child1 = component.find("child1");
        this.assertChildCounters(child1, child1count);
        var grandchild1 = component.find("grandchild1");
        this.assertChildCounters(grandchild1, grandchild1count);
        var child2 = component.find("child2");
        this.assertChildCounters(child2, child2count);
        var grandchild2 = component.find("grandchild2");
        this.assertChildCounters(grandchild2, grandchild2count);
        var grandchild2a = component.find("grandchild2a");
        this.assertChildCounters(grandchild2a, grandchild2acount);
        var greatgrandchild2 = component.find("greatgrandchild2");
        this.assertChildCounters(greatgrandchild2, greatgrandchild2count);
        if(layoutItemCount){
            var layoutItem = component.find("layoutTarget").get("v.body")[0];
            this.assertChildCounters(layoutItem, layoutItemCount);
        }
    },

    assertPlaceholder: function(component) {
        var body = component.get("v.body");
        $A.test.assertEquals(1, body.length, "container should only have an expression.cmp");
        $A.test.assertEquals("markup://aura:expression", body[0].getDef().getDescriptor().getQualifiedName(), "unexpected body component");
        var element = body[0].getElements().element;
        $A.test.assertEquals(true, (element !== null) && (element !== undefined), "placeholder is not alone");
        $A.test.assertEquals(3, element.nodeType, "placeholder not a text node");
        $A.test.assertEquals("", $A.test.getText(element), "placeholder isn't an empty string");
    },

    addWaitForCounter : function(component, count) {
    	var that = this;
    	var cmp = component;
        $A.test.addWaitFor("" + count, function(){
            return that.getCounter(cmp);
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
    
    toggleValue : function(component) {
        var val = component.getValue("v.toggleChild");
        val.setValue(!val.unwrap());
    },
    
    /**
     * Update attribute from abstract component.
     */
    testAbstractAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
                this.addWaitForCounter(child1, "1");
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "0", "0", "1");
            }]
    },

    /**
     * Update model from abstract component.
     */
    testAbstractModelUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstractModel").get("e.press").fire();
                this.addWaitForCounter(child1, "1");
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "0", "0", "1");
            }]
    },

    /**
     * Update interface attribute from abstract component.
     */
    testInterfaceAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleInterface").get("e.press").fire();
                this.addWaitForCounter(child1, "1");
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "0", "0", "1");
            }]
    },

    /**
     * Update attribute from parent component.
     */
    testParentAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
                var child2 = component.find("child2");
                child2.getSuper().find("toggleParent").get("e.press").fire();
                this.addWaitForCounter(child2, "1");
            }, function(component){
                this.assertCounters(component, "0", "0", "1", "1", "1", "1");
            }]
    },

    /**
     * Update model from parent component.
     */
    testParentModelUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
                var child2 = component.find("child2");
                child2.getSuper().find("toggleParentModel").get("e.press").fire();
                this.addWaitForCounter(child2, "1");
            }, function(component){
                this.assertCounters(component, "0", "0", "1", "1", "1", "1");
            }]
    },

    /**
     * Update attribute from child component.
     */
    testChildtAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
                var child2 = component.find("child2");
                child2.find("toggleChild").get("e.press").fire();
                this.addWaitForCounter(child2, "1");
            }, function(component){
                this.assertCounters(component, "0", "0", "1", "1", "1", "1");
            }]
    },

    /**
     * Layout change will not rerender the container.
     */
    testLayoutChange: {
        attributes : { __layout: "#def" },
        test: [function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
                child1.getSuper().find("toggleParent").get("e.press").fire();
                this.addWaitForCounter(child1, "2");
            }, function(component){
                this.assertCounters(component, "2", "2", "0", "0", "0", "0", "2");
                $A.layoutService.layout("death");
        		this.addWaitForLayoutItem(component, "death layout item");
            }, function(component){
                this.assertCounters(component, "2", "2", "0", "0", "0", "0", "0");
                var child1 = component.find("child1");
                child1.find("toggleChild").get("e.press").fire();
                this.addWaitForCounter(child1, "3");
            }, function(component){
                this.assertCounters(component, "3", "3", "0", "0", "0", "0", "1");
            }]
    },

    /**
     * Update attribute on a layout item.
     */
    testLayoutItemAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
        		this.addWaitForLayoutItem(component, "def layout item");
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
                this.addWaitForCounter(child1, "1");
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "0", "0", "1");
                var item = component.find("layoutTarget").get("v.body")[0].getSuper();
                item.find("toggleParent").get("e.press").fire();
                this.addWaitForCounter(item, "2");
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "0", "0", "2");
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
            	that.toggleValue(cmp.find("child2"));
            	that.toggleValue(cmp.find("grandchild2"));
            	that.toggleValue(cmp.find("greatgrandchild2"));
            });
            $A.test.addWaitFor("1", function(){
                return that.getCounter(child2);
            });
        }, function(component){
        	this.assertCounters(component, "0", "0", "1", "1", "1", "1");
        }]
    },

    /** Tests rerender ordering. */
    testRerenderOrder: {
        attributes : { __layout: "#def" },
        test: [function(component){
            var child2 = component.find("child2");
            var grandchild2a = component.find("grandchild2a");
            var grandchild1 = component.find("grandchild1");
            // Try to rerender all three of the above, but try to rerender grandchild2a
            // before child2.  But rerender should insist on doing child2 before
            // grandchild2a (and grandchild1 not in the middle, but before or after both).
            Window.rerenderTestOrder = [];  // Reset order tracking
            $A.rerender([grandchild2a, grandchild1, child2]);
            this.addWaitForCounter(child2, "1");
        }, function(component){
            // Rerendering of child2 will also rerender grandchild2 (and 2a), thus:
            this.assertCounters(component, "0", "1", "1", "1", "1", "1");
            var order = Window.rerenderTestOrder;
            if (order.length === 6) {
                // When run commandline, we get an extra leading rerender that we don't count, and
                // that we DON'T see running by hand.  Account for that here:
                for (var j = 0; j < order.length; ++j) {
                    if (order[j].indexOf("1:") === 0) {
                        order.splice(j, 1);
                        break;
                    }
                }
            }
            var child2 = component.find("child2");
            var grandchild2 = component.find("grandchild2");
            var greatgrandchild2 = component.find("greatgrandchild2");
            var grandchild2a = component.find("grandchild2a");
            var grandchild1 = component.find("grandchild1");
            $A.test.assertEquals(5, order.length);
            // We have two "legal" variations in rerender order: grandchild1 could
            // be before or after grandchild2.
            if (grandchild1.getGlobalId() === order[0]) {
                $A.test.assertEquals(child2.getGlobalId(), order[1]);
                if (grandchild2.getGlobalId() === order[2]) {
                    $A.test.assertEquals(greatgrandchild2.getGlobalId(), order[3]);
                    $A.test.assertEquals(grandchild2a.getGlobalId(), order[4]);
                } else {
                    $A.test.assertEquals(grandchild2a.getGlobalId(), order[2]);
                    $A.test.assertEquals(grandchild2.getGlobalId(), order[3]);
                    $A.test.assertEquals(greatgrandchild2.getGlobalId(), order[4]);
                }
            } else {
                $A.test.assertEquals(child2.getGlobalId(), order[0]);
                if (grandchild2.getGlobalId() === order[1]) {
                    $A.test.assertEquals(greatgrandchild2.getGlobalId(), order[2]);
                    $A.test.assertEquals(grandchild2a.getGlobalId(), order[3]);
                } else {
                    $A.test.assertEquals(grandchild2a.getGlobalId(), order[1]);
                    $A.test.assertEquals(grandchild2.getGlobalId(), order[2]);
                    $A.test.assertEquals(greatgrandchild2.getGlobalId(), order[3]);
                }
                $A.test.assertEquals(grandchild1.getGlobalId(), order[4]);
            }
        }]
    },

    /**
     * Add component to empty array.
     */
    _testAddComponentToEmptyArray: {
        attributes : { whichArray: "v.emptyArray" },
        test: [function(component){
                var cmp = component.find("emptyArrayContainer");
                this.assertChildCounters(cmp, 0);
                this.assertCounters(component, "0", "0", "0", "0", "0", "0");
                this.assertPlaceholder(cmp);
                component.find("pushComponent").get("e.press").fire();
                $A.test.addWaitFor("markup://auratest:rerenderChild", function(){
                    var added = cmp.get("v.body")[0].get("v.value")[0];
                    return added.isRendered() && added.getDef().getDescriptor().getQualifiedName();
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                // all components rerendered since array belongs to root
                this.assertChildCounters(cmp, 1);
                this.assertCounters(component, "1", "1", "1", "1", "1", "1");
                var added = cmp.get("v.body")[0].get("v.value")[0];
                this.assertChildCounters(added, 0);
            }]
    },

    /**
     * Clear an array.
     */
    _testClearArray: {
        attributes : { whichArray: "v.emptyArray" },
        test: [function(component){
                component.find("pushText").get("e.press").fire();
                component.find("pushComponent").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    var cmps = component.find("emptyArrayContainer").get("v.body")[0].get("v.value");
                    return (cmps.length === 2) && cmps[0].isRendered() && cmps[1].isRendered();
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                // expecting both events above to get processed at once
                this.assertChildCounters(cmp, "1");
                this.assertCounters(component, "1", "1", "1", "1", "1", "1");
                var added = cmp.get("v.body")[0].get("v.value")[1];
                this.assertChildCounters(added, 0);
                component.getValue("v.emptyArray").clear();
                $A.rerender(component);
                var suite = this;
                $A.test.addWaitFor(0, function(){
                    return component.find("emptyArrayContainer").get("v.body")[0].get("v.value").length;
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                this.assertChildCounters(cmp, "2");
                this.assertCounters(component, "2", "2", "2", "2", "2", "2");
                this.assertPlaceholder(cmp);
            }]
    },

    /**
     * Rearrange an array.
     */
    _testReverseArray: {
        attributes : { whichArray: "v.emptyArray" },
        test: [function(component){
                component.find("pushText").get("e.press").fire();
                component.find("pushComponent").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    var cmps = component.find("emptyArrayContainer").get("v.body")[0].get("v.value");
                    return (cmps.length === 2) && cmps[0].isRendered() && cmps[1].isRendered();
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                // expecting both events above to get processed at once
                this.assertChildCounters(cmp, "1");
                this.assertCounters(component, "1", "1", "1", "1", "1", "1");

                // text comp before child comp
                var textElem = cmp.get("v.body")[0].get("v.value")[0].getElement();
                $A.test.assertEquals("PUSHED.", $A.test.getText(textElem), "unexpected text node rendered first");

                var childComp = cmp.get("v.body")[0].get("v.value")[1];
                $A.test.assertEquals(textElem.nextSibling, childComp.getElement(), "child component not rendered after text node");
                this.assertChildCounters(childComp, 0);

                component.find("reverse").get("e.press").fire();
                $A.test.addWaitFor("PUSHED.", function(){
                    return $A.test.getText(cmp.get("v.body")[0].get("v.value")[1].getElement());
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");
                this.assertChildCounters(cmp, "2");
                this.assertCounters(component, "2", "2", "2", "2", "2", "2");

                // text comp now after child comp
                var textElem = cmp.get("v.body")[0].get("v.value")[1].getElement();
                $A.test.assertEquals("PUSHED.", $A.test.getText(textElem), "unexpected text node rendered second");

                var childComp = cmp.get("v.body")[0].get("v.value")[0];
                $A.test.assertEquals(textElem, childComp.getElement().nextSibling, "child component not rendered before text node");
                this.assertChildCounters(childComp, 1);
            }]
    },

    /**
     * Clear component body.
     */
    _testClearBody: {
        attributes : { whichArray: "emptyArrayContainer.super.super.v.body" },
        test: [function(component){
                var cmp = component.find("emptyArrayContainer");
                // quick check elements are alive by checking properties exist
                $A.test.assertEquals("BUTTON", cmp.find("toggleChild").getElement().tagName.toUpperCase(), "unexpected child element");
                $A.test.assertEquals("BUTTON", cmp.getSuper().find("toggleParent").getElement().tagName.toUpperCase(), "unexpected parent element");
                $A.test.assertEquals("DIV", cmp.getElement().firstChild.firstChild.tagName.toUpperCase(), "unexpected parent element");

                var origElement = cmp.getSuper().getSuper().get("v.body")[0].getElement();
                $A.test.assertEquals(origElement, cmp.getElement().firstChild.firstChild, "unexpected original body element");

                // clear the array
                component.find("clear").get("e.press").fire();
                $A.test.addWaitFor(true, function(){
                    var elem = cmp.getElement().firstChild.firstChild;
                    return (elem.nodeType === 3) && ($A.test.getText(elem) == ""); //wait for placeholder, instead of original div that just got unrendered at this position
                });
            }, function(component){
                var cmp = component.find("emptyArrayContainer");

                // quick check that elements from original body components are no longer present
                $A.test.assertEquals(undefined, cmp.find("toggleChild").getElement(), "child element wasn't unrendered");
                $A.test.assertEquals(undefined, cmp.getSuper().find("toggleParent").getElement(), "parent element wasn't unrendered");

                $A.test.assertEquals("1", $A.test.getText(cmp.getSuper().getSuper().find("counter").find("count").getElement()), "unexpected abstract count");
                this.assertCounters(component, "0", "0", "0", "0", "0", "0");
            }]
    },

    /**
     * Add, rearrange, and remove from component body.
     */
    _testUpdateBody: {
        attributes : { whichArray: "emptyArrayContainer.super.v.body" },
        test: [function(component){
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
                this.assertChildCounters(cmp, 1);
                this.assertChildCounters(cmp.getSuper().get("v.body")[2], 0); // newly added child comp
                this.assertCounters(component, "0", "0", "0", "0", "0", "0");

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
                this.assertChildCounters(cmp.getSuper().get("v.body")[0], 1); // moved child comp
                this.assertCounters(component, "0", "0", "0", "0", "0", "0");
            }]
    }
})

