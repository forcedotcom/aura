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
    assertChildCounters: function(component, count) {
        count = "" + count;
        $A.test.assertEquals(count, $A.test.getText(component.find("counter").find("count").getElement()), "unexpected child count");
        $A.test.assertEquals(count, $A.test.getText(component.getSuper().find("counter").find("count").getElement()), "unexpected parent count");
        $A.test.assertEquals(count, $A.test.getText(component.getSuper().getSuper().find("counter").find("count").getElement()), "unexpected abstract count");
    },

    assertCounters: function(component, child1count, grandchild1count, child2count, grandchild2count, layoutItemCount){
        var child1 = component.find("child1");
        this.assertChildCounters(child1, child1count);
        var grandchild1 = component.find("grandchild1");
        this.assertChildCounters(grandchild1, grandchild1count);
        var child2 = component.find("child2");
        this.assertChildCounters(child2, child2count);
        var grandchild2 = component.find("grandchild2");
        this.assertChildCounters(grandchild2, grandchild2count);
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

    /**
     * Update attribute from abstract component.
     */
    testAbstractAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
                $A.test.addWaitFor(true, function(){
                    var t = $A.test.getText(component.find("layoutTarget").getElement());
                    return t && (t.indexOf("def layout item") >= 0);
                });
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
                $A.test.addWaitFor("1", function(){
                    return $A.test.getText(child1.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "1");
            }]
    },

    /**
     * Update model from abstract component.
     */
    testAbstractModelUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
                $A.test.addWaitFor(true, function(){
                    var t = $A.test.getText(component.find("layoutTarget").getElement());
                    return t && (t.indexOf("def layout item") >= 0);
                });
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstractModel").get("e.press").fire();
                $A.test.addWaitFor("1", function(){
                    return $A.test.getText(child1.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "1");
            }]
    },

    /**
     * Update interface attribute from abstract component.
     */
    testInterfaceAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
                $A.test.addWaitFor(true, function(){
                    var t = $A.test.getText(component.find("layoutTarget").getElement());
                    return t && (t.indexOf("def layout item") >= 0);
                });
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleInterface").get("e.press").fire();
                $A.test.addWaitFor("1", function(){
                    return $A.test.getText(child1.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "1");
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
                $A.test.addWaitFor("1", function(){
                    return $A.test.getText(child2.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "0", "0", "1", "1");
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
                $A.test.addWaitFor("1", function(){
                    return $A.test.getText(child2.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "0", "0", "1", "1");
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
                $A.test.addWaitFor("1", function(){
                    return $A.test.getText(child2.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "0", "0", "1", "1");
            }]
    },

    /**
     * Layout change will not rerender the container.
     */
    testLayoutChange: {
        attributes : { __layout: "#def" },
        test: [function(component){
                $A.test.addWaitFor(true, function(){
                    var t = $A.test.getText(component.find("layoutTarget").getElement());
                    return t && (t.indexOf("def layout item") >= 0);
                });
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
                child1.getSuper().find("toggleParent").get("e.press").fire();
                $A.test.addWaitFor("2", function(){
                    return $A.test.getText(child1.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "2", "2", "0", "0", "2");
                $A.layoutService.layout("death");
                $A.test.addWaitFor(true, function(){
                    var t = $A.test.getText(component.find("layoutTarget").getElement());
                    return t && (t.indexOf("death layout item") >= 0);
                });
            }, function(component){
                this.assertCounters(component, "2", "2", "0", "0", "0");
                var child1 = component.find("child1");
                child1.find("toggleChild").get("e.press").fire();
                $A.test.addWaitFor("3", function(){
                    return $A.test.getText(child1.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "3", "3", "0", "0", "1");
            }]
    },

    /**
     * Update attribute on a layout item.
     */
    testLayoutItemAttributeUpdated: {
        attributes : { __layout: "#def" },
        test: [function(component){
                $A.test.addWaitFor(true, function(){
                    var t = $A.test.getText(component.find("layoutTarget").getElement());
                    return t && (t.indexOf("def layout item") >= 0);
                });
            }, function(component){
                var child1 = component.find("child1");
                child1.getSuper().getSuper().find("toggleAbstract").get("e.press").fire();
                $A.test.addWaitFor("1", function(){
                    return $A.test.getText(child1.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "1");
                var item = component.find("layoutTarget").get("v.body")[0].getSuper();
                item.find("toggleParent").get("e.press").fire();
                $A.test.addWaitFor("2", function(){
                    return $A.test.getText(item.find("counter").find("count").getElement());
                });
            }, function(component){
                this.assertCounters(component, "1", "1", "0", "0", "2");
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
                this.assertCounters(component, "0", "0", "0", "0");
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
                this.assertCounters(component, "1", "1", "1", "1");
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
                this.assertCounters(component, "1", "1", "1", "1");
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
                this.assertCounters(component, "2", "2", "2", "2");
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
                this.assertCounters(component, "1", "1", "1", "1");

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
                this.assertCounters(component, "2", "2", "2", "2");

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
                this.assertCounters(component, "0", "0", "0", "0");
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
                this.assertCounters(component, "0", "0", "0", "0");

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
                this.assertCounters(component, "0", "0", "0", "0");
            }]
    }
})

