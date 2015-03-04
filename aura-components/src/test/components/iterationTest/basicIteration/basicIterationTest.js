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
    assertTemplateComponentDefRef: function(cmp) {
    	var iteration = cmp.find("iteration");
    	var value = iteration.get("v.template");
        $A.test.assertTrue($A.util.isArray(value));
        $A.test.assertEquals(1, value.length);
        value = value[0];
        $A.test.assertTrue(typeof value === "object");
        $A.test.assertEquals(undefined, value.auraType);
        $A.test.assertEquals(undefined, value.getDef);
        $A.test.assertEquals("markup://aura:expression", value.componentDef.descriptor);
    },

    /**
     * Iteration body is rendered by renderIf
     */
    testSanity:{
        attributes:{ items:"alpha,omega" },
        test:function(cmp){
        	// Verify renderIf
            var value = cmp.find("if").get("v.body");
            $A.test.assertTrue($A.util.isArray(value));
            $A.test.assertEquals(1, value.length);
            var iteration = cmp.find("iteration");
            $A.test.assertEquals(iteration, value[0]);

            this.assertTemplateComponentDefRef(cmp);

            var body = iteration.get("v.body");
            $A.test.assertTrue( $A.util.isArray(body));
            $A.test.assertEquals(2, body.length);
            value = body[0];
            $A.test.assertTrue($A.util.isObject(value));
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("0:alpha,", value.get("v.value"));
            value = body[1];
            $A.test.assertTrue($A.util.isObject(value));
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
            var value = cmp.find("if").get("v.body");
            $A.test.assertTrue($A.util.isArray(value));
            $A.test.assertEquals(1, value.length);
            var iteration = cmp.find("iteration");
            $A.test.assertEquals(iteration, value[0]);

            this.assertTemplateComponentDefRef(cmp);

            var body = iteration.get("v.body");
            $A.test.assertTrue( $A.util.isArray(body));
            $A.test.assertEquals(2, body.length);
            $A.test.assertFalse(iteration.isRendered());
            $A.test.assertEquals(0, iteration.getElements().length);

            value = body[0];
            $A.test.assertTrue($A.util.isObject(value));
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("0:alpha,", value.get("v.value"));
            $A.test.assertFalse(value.isRendered());
            $A.test.assertEquals(0, value.getElements().length);
            value = body[1];
            $A.test.assertTrue($A.util.isObject(value));
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("1:omega,", value.get("v.value"));
            $A.test.assertFalse(value.isRendered());
            $A.test.assertEquals(0, value.getElements().length);
        }
    },

    /**
     * Iteration is empty if items is empty
     */
    testItemsEmpty:{
        test:function(cmp){
        	this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertTrue($A.util.isArray(body));
            $A.test.assertEquals(0, body.length);
        }
    },

    testStartAndEnd:{
        attributes:{ items:"a,b,c,d,e", start:2, end:3 },
        test:function(cmp){
            this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertEquals(1, body.length);
            value = body[0];
            $A.test.assertTrue($A.util.isObject(value));
            $A.test.assertEquals("2:c,", value.get("v.value"));
        }
    },

    /**
     * Iteration is empty if start greater than items length
     */
    testStartGreaterThanLength:{
        attributes:{ items:"a,b,c,d,e", start:99 },
        test:function(cmp){
            this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertTrue($A.util.isArray(body));
            $A.test.assertEquals(0, body.length);
        }
    },

    /**
     * Iteration is empty if start greater than end
     */
    testStartGreaterThanEnd:{
        attributes:{ items:"a,b,c,d,e", start:3, end:2 },
        test:function(cmp){
            this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertTrue($A.util.isArray(body));
            $A.test.assertEquals(0, body.length);
        }
    },

    /**
     * Iteration starts at start and contains remainder of list, without end
     */
    testStartWithoutEnd:{
        attributes:{ items:"a,b,c,d,e", start:3 },
        test:function(cmp){
            this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertEquals(2, body.length);
            value = body[0];
            $A.test.assertEquals("3:d,", value.get("v.value"));
            value = body[1];
            $A.test.assertEquals("4:e,", value.get("v.value"));
        }
    },

    /**
     * Iteration starts with first item and ends before end, without start
     */
    testEndWithoutStart:{
        attributes:{ items:"a,b,c,d,e", end:3 },
        test:function(cmp){
            this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertEquals(3, body.length);
            value = body[0];
            $A.test.assertEquals("0:a,", value.get("v.value"));
            value = body[1];
            $A.test.assertEquals("1:b,", value.get("v.value"));
            value = body[2];
            $A.test.assertEquals("2:c,", value.get("v.value"));
        }
    },

    testEndZero:{
        attributes:{ items:"a,b,c,d,e", end:0 },
        test:function(cmp){
            this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertEquals(0, body.length);
        }
    },

    /**
     * Iteration starts with first item and ends before end, without start
     */
    testStartNegative:{
        attributes:{ items:"delta,gamma", start:-3 },
        test:function(cmp){
            this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertEquals(2, body.length);
            value = body[0];
            $A.test.assertEquals("0:delta,", value.get("v.value"));
            value = body[1];
            $A.test.assertEquals("1:gamma,", value.get("v.value"));
        }
    },

    /**
     * Iteration with decimal start value is treated as integer
     */
    testStartDecimal:{
        attributes:{ items:"alpha,beta", start: 0.000001 },
        test:function(cmp){
        	this.assertTemplateComponentDefRef(cmp);
            var body = cmp.find("iteration").get("v.body");
            $A.test.assertEquals(2, body.length);
            value = body[0];
            $A.test.assertEquals("0:alpha,", value.get("v.value"));
            value = body[1];
            $A.test.assertEquals("1:beta,", value.get("v.value"));
        }
    },
 
    /** Iteration rerender stays stable */
    testEmptyAndFill:{
        attributes:{ items:"alpha,beta" },
        test:[function(cmp) {
            var items = cmp.get("v.items");
            items.splice(0,1);
            cmp.set("v.items", items);
        },
        function(cmp) {
            var items = cmp.get("v.items");
            items.splice(0,1);
            cmp.set("v.items", items);
        },
        function(cmp) {
            var items = cmp.get("v.items");
            items.push("xyz");
            cmp.set("v.items", items);
        },
        function(cmp) {
        	var body = cmp.find("iteration").get("v.body");
            // This assertion isn't the big one; it doesn't show the render state.
            // But we do want to be sure it's right:
            $A.test.assertEquals(1, body.length);
            $A.test.assertEquals("0:xyz,", body[0].get("v.value"));

            // Now, this is the more useful part:
            var refNode = body[0].getElement();
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

    testChangeTemplate:{
        attributes:{items:"a,b,c,d,e"},
        test:[
            function assertInitialState(cmp){
                var expected="0:a,1:b,2:c,3:d,4:e,";

                var actual=$A.test.getTextByComponent(cmp.find("iteration"));

                $A.test.assertEquals(expected,actual);
            },
            function changeTemplate(cmp){
                var iteration=cmp.find("iteration");
                var expected="a:0,b:1,c:2,d:3,e:4,";
                iteration.set("v.template",[
                    {attributes:{values:{value:"{!var}"}},componentDef:{descriptor:"aura:expression"}},
                    {attributes:{values:{value:":"}},componentDef:{descriptor:"aura:text"}},
                    {attributes:{values:{value:"{!idx}"}},componentDef:{descriptor:"aura:expression"}},
                    {attributes:{values:{value:","}},componentDef:{descriptor:"aura:text"}}
                ]);

                $A.test.addWaitFor(true,function(){return iteration.get("v.loaded");},function(){
                    var actual=$A.test.getTextByComponent(iteration);

                    $A.test.assertEquals(expected,actual);
                })
            }
        ]
    },

    /**
     * Verify iterationComplete event is fired as expected.
     */
    testIterationCompleteEvent_onLoad: {
        attributes: {
            items: "a,b,c,d,e"
        },
        test: function(cmp) {
            // Initialize operation fired on load
            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        return cmp.get("v.iterationCompleteFired");
                    }, 
                    "Iteration's iterationComplete event not fired on cmp load",
                    function() {
                        $A.test.assertEquals("Initialize", cmp.get("v.iterationCompleteOperation"),
                            "Unexpected operation param on iterationComplete event");
                    }
            );

        }
    },

    testIterationCompleteEvent_listChange: {
        attributes: {
            items: "a,b,c,d,e"
        },
        test: function(cmp) {
            // Clear any attribute changes from loading component
            cmp.set("v.iterationCompleteFired", false);
            cmp.set("v.iterationCompleteOperation", "");
            cmp.set("v.items", "a,b,Z,d,e");

            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        return cmp.get("v.iterationCompleteFired");
                    }, 
                    "Iteration's iterationComplete event not fired when modifying items in iteration",
                    function() {
                        $A.test.assertEquals("Update", cmp.get("v.iterationCompleteOperation"));
                    }
            );
        }
    },

    testIterationCompleteEventList_setSameValues: {
        attributes: {
            items: "a,b,c,d,e"
        },
        test: function(cmp) {
            // Clear any attribute changes from loading component
            cmp.set("v.iterationCompleteFired", false);
            cmp.set("v.iterationCompleteOperation", "");
            cmp.set("v.items", cmp.get("v.items"));

            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        return cmp.get("v.iterationCompleteFired");
                    }, 
                    "Iteration's iterationComplete event not fired when setting items to current values",
                    function() {
                        $A.test.assertEquals("Update", cmp.get("v.iterationCompleteOperation"));
                    }
            );
        }
    },

    testIterationCompleteEventList_changeTemplate: {
        attributes: {
            items: "a,b,c,d,e"
        },
        test: function(cmp) {
            // Clear any attribute changes from loading component
            cmp.set("v.iterationCompleteFired", false);
            cmp.set("v.iterationCompleteOperation", "");
            cmp.find("iteration").set("v.template",[
                {attributes:{values:{value:"{!var}"}},componentDef:{descriptor:"aura:expression"}},
                {attributes:{values:{value:":"}},componentDef:{descriptor:"aura:text"}},
                {attributes:{values:{value:"{!idx}"}},componentDef:{descriptor:"aura:expression"}},
                {attributes:{values:{value:","}},componentDef:{descriptor:"aura:text"}}
            ]);

            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        return cmp.get("v.iterationCompleteFired");
                    }, 
                    "Iteration's iterationComplete event not fired when changing template",
                    function() {
                        $A.test.assertEquals("Initialize", cmp.get("v.iterationCompleteOperation"));
                    }
            );
        }
    }
})
