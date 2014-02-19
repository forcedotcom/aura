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
        $A.test.assertEquals(1, value.getLength());
        value = value.get(0);
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
            var value = cmp.find("if").getValue("v.body");
            $A.test.assertEquals("ArrayValue", value.toString());
            $A.test.assertEquals(1, value.getLength());
            value = value.get(0);
            var iteration = cmp.find("iteration");
            $A.test.assertEquals(iteration, value);

            this.assertBodyComponentDefRef(cmp);

            var realbody = iteration.getValue("v.realbody");
            $A.test.assertEquals("ArrayValue", realbody.toString());
            $A.test.assertEquals(2, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertTrue(typeof value === "object");
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("0:alpha,", value.get("v.value"));
            value = realbody.get(1);
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
            $A.test.assertEquals(1, value.getLength());
            value = value.get(0);
            var iteration = cmp.find("iteration");
            $A.test.assertEquals(iteration, value);

            this.assertBodyComponentDefRef(cmp);

            var realbody = iteration.getValue("v.realbody");
            $A.test.assertEquals("ArrayValue", realbody.toString());
            $A.test.assertEquals(2, realbody.getLength());
            $A.test.assertFalse(iteration.isRendered());
            $A.test.assertTrue(undefined === iteration.getElements());

            value = realbody.get(0);
            $A.test.assertTrue(typeof value === "object");
            $A.test.assertEquals("Component", value.auraType);
            $A.test.assertEquals("markup://aura:expression", value.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("0:alpha,", value.get("v.value"));
            $A.test.assertFalse(value.isRendered());
            $A.test.assertTrue(undefined === value.getElements());
            value = realbody.get(1);
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
            $A.test.assertEquals(1, realbody.getLength());
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
            $A.test.assertEquals(2, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertEquals("3:d,", value.get("v.value"));
            value = realbody.get(1);
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
            $A.test.assertEquals(3, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertEquals("0:a,", value.get("v.value"));
            value = realbody.get(1);
            $A.test.assertEquals("1:b,", value.get("v.value"));
            value = realbody.get(2);
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
            $A.test.assertEquals(2, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertEquals("0:delta,", value.get("v.value"));
            value = realbody.get(1);
            $A.test.assertEquals("1:gamma,", value.get("v.value"));
        }
    },

    /**
     * Iteration with decimal start value is treated as integer
     */
    // W-1299463 start/end values not handled the same on server (intValue)
    _testStartDecimal:{
        attributes:{ items:"alhpa,beta", start: 0.000001 },
        test:function(cmp){
            this.assertBodyComponentDefRef(cmp);
            var realbody = cmp.find("iteration").getValue("v.realbody");
            $A.test.assertEquals(1, realbody.getLength());
            value = realbody.get(0);
            $A.test.assertEquals("0:alpha,1:beta,", value.get("v.value"));
        }
    }
})
