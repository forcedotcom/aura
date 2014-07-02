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
    assertBodyComponentDefRef: function(cmp) {
        var value = cmp.find("iteration").getValue("v.body");
        $A.test.assertEquals("ArrayValue", value.toString());
        $A.test.assertEquals(2, value.getLength());
        value = value.get(0);
        $A.test.assertTrue(typeof value === "object");
        $A.test.assertEquals(undefined, value.auraType);
        $A.test.assertEquals(undefined, value.getDef);
        $A.test.assertEquals("markup://aura:expression", value.componentDef.descriptor);
        value = cmp.find("iteration").getValue("v.body").get(1);
        $A.test.assertTrue(typeof value === "object");
        $A.test.assertEquals(undefined, value.auraType);
        $A.test.assertEquals(undefined, value.getDef);
        $A.test.assertEquals("markup://aura:renderIf", value.componentDef.descriptor);
    },

    /**
     * Iteration body is rendered by renderIf
     */
    testSanity:{
        attributes:{ items:"alpha,omega" },
        test:function(cmp){
            // Verify renderIf
            var value = cmp.find("if").getValue("v.body");
            $A.test.assertEquals("ArrayValue", value.toString());
            $A.test.assertEquals(2, value.getLength());
            var iteration = cmp.find("iteration");
            $A.test.assertEquals(iteration, value.get(0));
            $A.test.assertEquals("markup://aura:text",
            		value.get(1).getDef().getDescriptor().getQualifiedName());

            this.assertBodyComponentDefRef(cmp);

            var realbody = iteration.getValue("v.realbody");
            $A.test.assertEquals("ArrayValue", realbody.toString());
            $A.test.assertEquals(4, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertTrue(typeof value === "object");
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("0:alpha,", value.get("v.value"));
            value = realbody.get(2);
            $A.test.assertTrue(typeof value === "object");
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("1:omega,", value.get("v.value"));
        }
    },

    /**
     * Iteration body is not rendered by renderIf
     */
    testNotRendered:{
        attributes:{ showIteration:false, items:"alpha,omega" },
        test:function(cmp){
            // Verify renderIf
            var value = cmp.find("if").getValue("v.body");
            $A.test.assertEquals("ArrayValue", value.toString());
            $A.test.assertEquals(2, value.getLength());
            var iteration = cmp.find("iteration");
            $A.test.assertEquals(iteration, value.get(0));
            $A.test.assertEquals("markup://aura:text",
            		value.get(1).getDef().getDescriptor().getQualifiedName());

            this.assertBodyComponentDefRef(cmp);

            var realbody = iteration.getValue("v.realbody");
            $A.test.assertEquals("ArrayValue", realbody.toString());
            $A.test.assertEquals(4, realbody.getLength());
            $A.test.assertFalse(iteration.isRendered());
            $A.test.assertTrue(undefined === iteration.getElements());

            value = realbody.get(0);
            $A.test.assertTrue(typeof value === "object");
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("0:alpha,", value.get("v.value"));
            $A.test.assertFalse(value.isRendered());
            $A.test.assertTrue(undefined === value.getElements());
            value = realbody.get(2);
            $A.test.assertTrue(typeof value === "object");
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("1:omega,", value.get("v.value"));
            $A.test.assertFalse(value.isRendered());
            $A.test.assertTrue(undefined === value.getElements());
        }
    },

    /**
     * Iteration is empty if items is empty
     */
    testItemsEmpty:{
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals("ArrayValue", realbody.toString());
            $A.test.assertEquals(0, realbody.getLength());
        }
    },

    testStartAndEnd:{
        attributes:{ items:"a,b,c,d,e", start:2, end:3 },
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals(2, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertTrue(typeof value === "object");
            $A.test.assertEquals("2:c,", value.get("v.value"));
        }
    },

    /**
     * Iteration is empty if start greater than items length
     */
    testStartGreaterThanLength:{
        attributes:{ items:"a,b,c,d,e", start:99 },
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals("ArrayValue", realbody.toString());
            $A.test.assertEquals(0, realbody.getLength());
        }
    },

    /**
     * Iteration is empty if start greater than end
     */
    testStartGreaterThanEnd:{
        attributes:{ items:"a,b,c,d,e", start:3, end:2 },
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals("ArrayValue", realbody.toString());
            $A.test.assertEquals(0, realbody.getLength());
        }
    },

    /**
     * Iteration starts at start and contains remainder of list, without end
     */
    testStartWithoutEnd:{
        attributes:{ items:"a,b,c,d,e", start:3 },
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals(4, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertEquals("3:d,", value.get("v.value"));
            value = realbody.get(2);
            $A.test.assertEquals("4:e,", value.get("v.value"));
        }
    },

    /**
     * Iteration starts with first item and ends before end, without start
     */
    testEndWithoutStart:{
        attributes:{ items:"a,b,c,d,e", end:3 },
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals(6, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertEquals("0:a,", value.get("v.value"));
            value = realbody.get(2);
            $A.test.assertEquals("1:b,", value.get("v.value"));
            value = realbody.get(4);
            $A.test.assertEquals("2:c,", value.get("v.value"));
        }
    },

    /**
     * Iteration starts with first item and ends before end, without start
     */
    testStartNegative:{
        attributes:{ items:"delta,gamma", start:-3 },
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals(4, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertEquals("0:delta,", value.get("v.value"));
            value = realbody.get(2);
            $A.test.assertEquals("1:gamma,", value.get("v.value"));
        }
    },

    /**
     * Iteration with decimal start value is treated as integer
     */
    testStartDecimal:{
        attributes:{ items:"alpha,beta", start: 0.000001 },
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals(4, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertEquals("0:alpha,", value.get("v.value"));
            value = realbody.get(2);
            $A.test.assertEquals("1:beta,", value.get("v.value"));
        }
    },
 
    /** Iteration rerender stays stable */
    testEmptyAndFill:{
        attributes:{ items:"alpha,beta" },
        test:[function(cmp) {
            var items = cmp.getValue("v.items");
            items.remove(0);
        },
        function(cmp) {
            var items = cmp.getValue("v.items");
            items.remove(0);
        },
        function(cmp) {
            var items = cmp.getValue("v.items");
            items.push("xyz");
        },
        function(cmp) {
            var realbody = cmp.find("iteration").getValue("v.realbody");
            // This assertion isn't the big one; it doesn't show the render state.
            // But we do want to be sure it's right:
            $A.test.assertEquals(2, realbody.getLength());
            $A.test.assertEquals("0:xyz,", realbody.get(0).get("v.value"));

            // Now, this is the more useful part:
            var refNode = realbody.getReferenceNode();
            $A.test.assertTrue(refNode !== undefined, "No reference node found!");
            var parent;
            if ($A.util.isIE) {
                parent = refNode.parentNode;
            } else {
                parent = refNode.parentElement;
            }
            $A.test.assertTruthy(parent, "Reference has no parent");
            $A.test.assertEquals("BODY", parent.tagName,
                    "Reference parent isn't right component");
        }]
    },

    /** Test rerender for expanding and contracting element counts */
    testRerenderExpansion: {
        attributes:{ items: "alpha,beta" },
        test:[function(cmp) {
            var iter = cmp.find("iteration");
            var realbody = iter.get("v.realbody");
            $A.test.assertEquals(4, realbody.length);
            var elems = realbody[0].getElements();
            $A.test.assertEquals("0:alpha,", elems[0].textContent);
            elems = realbody[1].getElements();
            $A.test.assertEquals(8, elems[0].nodeType);
            $A.test.assertTrue(elems[0] === elems['element']);
            elems = realbody[2].getElements();
            $A.test.assertEquals("1:beta,", elems[0].textContent);
            elems = realbody[3].getElements();
            $A.test.assertEquals(8, elems[0].nodeType);
            $A.test.assertTrue(elems[0] === elems['element']);
            
            // Check the iteration:
            elems = iter.getElements();
            $A.test.assertEquals("0:alpha,", elems[0].textContent);
            $A.test.assertEquals(8, elems[1].nodeType);
            $A.test.assertEquals("1:beta,", elems[2].textContent);
            $A.test.assertEquals(8, elems[3].nodeType);
            $A.test.assertUndefined(elems['element']);
            $A.test.assertUndefined(elems[4]);
            
            // Now, how that plays in the parent:
            elems = cmp.getElements();
            $A.test.assertEquals("0:alpha,", elems[0].textContent);
            $A.test.assertEquals(8, elems[1].nodeType);
            $A.test.assertEquals("1:beta,", elems[2].textContent);
            $A.test.assertEquals(8, elems[3].nodeType);
            $A.test.assertUndefined(elems['element']);
            $A.test.assertEquals("Trailing after the iteration.",
            		$A.util.trim(elems[4].textContent));
            $A.test.assertEquals("Trailing after the renderIf.", 
            		$A.util.trim(elems[5].textContent));
            $A.test.assertUndefined(elems[6]);

            cmp.set("v.expanded", true);
            $A.rerender(cmp);
        }, function(cmp) {
            var iter = cmp.find("iteration");
            var realbody = iter.get("v.realbody");
            $A.test.assertEquals(4, realbody.length);
            var elems = realbody[0].getElements();
            $A.test.assertEquals("0:alpha,", elems[0].textContent);
            elems = realbody[1].getElements();
            $A.test.assertEquals("BR", elems[0].nodeName);
            $A.test.assertEquals(3, elems[1].nodeType);
            $A.test.assertEquals("A", elems[2].nodeName);
            $A.test.assertEquals("BR", elems[3].nodeName);
            $A.test.assertUndefined(elems['element']);
            elems = realbody[2].getElements();
            $A.test.assertEquals("1:beta,", elems[0].textContent);
            elems = realbody[3].getElements();
            $A.test.assertEquals("BR", elems[0].nodeName);
            $A.test.assertEquals(3, elems[1].nodeType);
            $A.test.assertEquals("A", elems[2].nodeName);
            $A.test.assertEquals("BR", elems[3].nodeName);
            $A.test.assertUndefined(elems['element']);

            // Now, how that plays in the iteration:
            elems = iter.getElements();
            $A.test.assertEquals("0:alpha,", elems[0].textContent);
            $A.test.assertEquals("BR", elems[1].nodeName);
            $A.test.assertEquals(3, elems[2].nodeType);
            $A.test.assertEquals("A", elems[3].nodeName);
            $A.test.assertEquals("BR", elems[4].nodeName);
            $A.test.assertEquals("1:beta,", elems[5].textContent);
            $A.test.assertEquals("BR", elems[6].nodeName);
            $A.test.assertEquals(3, elems[7].nodeType);
            $A.test.assertEquals("A", elems[8].nodeName);
            $A.test.assertEquals("BR", elems[9].nodeName);
            $A.test.assertUndefined(elems[10]);
            $A.test.assertUndefined(elems['element']);
            
            // Now, how that plays in the parent:
            elems = cmp.getElements();
            $A.test.assertEquals("0:alpha,", elems[0].textContent);
            $A.test.assertEquals("BR", elems[1].nodeName);
            $A.test.assertEquals(3, elems[2].nodeType);
            $A.test.assertEquals("A", elems[3].nodeName);
            $A.test.assertEquals("BR", elems[4].nodeName);
            $A.test.assertEquals("1:beta,", elems[5].textContent);
            $A.test.assertEquals("BR", elems[6].nodeName);
            $A.test.assertEquals(3, elems[7].nodeType);
            $A.test.assertEquals("A", elems[8].nodeName);
            $A.test.assertEquals("BR", elems[9].nodeName);
            $A.test.assertEquals("Trailing after the iteration.",
            		$A.util.trim(elems[10].textContent));
            $A.test.assertEquals("Trailing after the renderIf.", 
            		$A.util.trim(elems[11].textContent));
            $A.test.assertUndefined(elems[12]);
            $A.test.assertUndefined(elems['element']);

            cmp.set("v.expanded", false);
            $A.rerender(cmp);
        }, function(cmp) {
            var iter = cmp.find("iteration");
            var realbody = iter.get("v.realbody");
            $A.test.assertEquals(4, realbody.length);
            var elems = realbody[0].getElements();
            $A.test.assertEquals("0:alpha,", elems[0].textContent);
            elems = realbody[1].getElements();
            $A.test.assertEquals(8, elems[0].nodeType);
            $A.test.assertTrue(elems[0] === elems['element']);
            elems = realbody[2].getElements();
            $A.test.assertEquals("1:beta,", elems[0].textContent);
            elems = realbody[3].getElements();
            $A.test.assertEquals(8, elems[0].nodeType);
            $A.test.assertTrue(elems[0] === elems['element']);
            
            // Now, how that plays in the parent:
            elems = cmp.getElements();
            $A.test.assertEquals("0:alpha,", elems[0].textContent);
            $A.test.assertEquals(8, elems[1].nodeType);
            $A.test.assertEquals("1:beta,", elems[2].textContent);
            $A.test.assertEquals(8, elems[3].nodeType);
            $A.test.assertEquals("Trailing after the iteration.",
            		$A.util.trim(elems[4].textContent));
            $A.test.assertEquals("Trailing after the renderIf.", 
            		$A.util.trim(elems[5].textContent));
            $A.test.assertUndefined(elems[6]);
            $A.test.assertUndefined(elems['element']);
        }]
    }
})
