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
    failOnWarning : true,

    assertCreationPath : function(cmp, path, msg) {
        var cp = $A.test.getCreationPath(cmp);
        if (path) {
            $A.test.assertEquals(path, cp.substring(cp.indexOf("/")), msg);    
        } else {
            $A.test.assertEquals(path, cp, msg);
        }
    },
    
    addComponent : function(root, cmp, descriptor, value) {
        var count = cmp.get("v.output").length;
        root.set("v.descriptor", descriptor);
        root.set("v.value", value);
        cmp.find("trigger").get("e.press").fire();
        $A.test.addWaitForWithFailureMessage(
                count + 1,
                function(){return cmp.get("v.output").length},
                "waiting for output length to increment after adding component");
    },
    
    testRoot : {
        test : function(cmp) {
            this.assertCreationPath(cmp, "/*[0]", "root is only body");
        }
    },
    
    testBody : {
        test : function(cmp) {
            this.assertCreationPath(cmp.find("topbody"), "/*[0]/$/*[0]", "body belongs to super's (first)");
            this.assertCreationPath(cmp.find("topmodel"), "/*[0]/$/*[1]", "body belongs to super's (second)");
        }
    },
    
    testNested : {
        test : function(cmp) {
            this.assertCreationPath(cmp.find("nestingmodel"), "/*[0]/$/*[1]/*[1]");
            this.assertCreationPath(cmp.find("nestedmodel"), "/*[0]/$/*[1]/*[1]/*[1]");
            this.assertCreationPath(cmp.find("nestedbody"), "/*[0]/$/*[1]/*[1]/*[2]");
            this.assertCreationPath(cmp.find("nestestbody"), "/*[0]/$/*[1]/*[1]/*[1]/*[1]");
            this.assertCreationPath(cmp.find("nestestmodel"), "/*[0]/$/*[1]/*[1]/*[1]/*[2]");
        }
    },
    
    testFacet : {
        test : function(cmp) {
            this.assertCreationPath(cmp.find("headerbody"), "/*[0]/$/*[1]/headerComponents[0]");
            this.assertCreationPath(cmp.find("headermodel"), "/*[0]/$/*[1]/headerComponents[1]");
            this.assertCreationPath(cmp.find("innermodel"), "/*[0]/$/*[1]/innerComponents[0]");
            this.assertCreationPath(cmp.find("innermodel2"), "/*[0]/$/*[1]/innerComponents[1]");
        }
    },
    

    testIfTrue : {
        attributes : { iftrue : true },
        test : function(cmp) {
            this.assertCreationPath(cmp.find("truebody"), "/*[0]/$/*[2]/*[0]");
            $A.test.assertUndefined(cmp.find("falsebody"));
        }
    },





    testIfFalse : {
        attributes : { iftrue : false },
        test : function(cmp) {
            $A.test.assertUndefined(cmp.find("truebody"));
            this.assertCreationPath(cmp.find("falsebody"), "/*[0]/$/*[2]/*[0]");
        }
    },
    // @dval: This is just a hardcoded test for no reason, if you change an if on the client, 
    // we use to have localCreation: true, but we dont care anymore

    // testIfChangedToTrue : {
    //     attributes : { iftrue : false },
    //     test : [ function(cmp) {
    //         $A.run(function(){cmp.set("v.iftrue", true)});
    //         $A.test.addWaitForWithFailureMessage(false, function(){return $A.util.isUndefined(cmp.find("truebody"))}, "'true' components not instantiated");
    //     }, function(cmp) {
    //         $A.log("Looking For: ", $A.test.getCreationPath(cmp.find("truebody")), " to be client created");
    //         this.assertCreationPath(cmp.find("truebody"), "client created");
    //     }]
    // },

    // testIfChangedToFalse : {
    //     attributes : { iftrue : true },
    //     test : [ function(cmp) {
    //         $A.run(function(){
    //         	cmp.set("v.iftrue", false);
    //         });
    //         $A.test.addWaitForWithFailureMessage(true, function(){return !!cmp.find("falsebody");}, "'else' components not instantiated");
    //     }, function(cmp) {
    //         this.assertCreationPath(cmp.find("falsebody"), "client created");
    //     }]
    // },

    testSingleIteration : {
        attributes : { list : "x" },
        test : function(cmp) {
            this.assertCreationPath(cmp.find("iterinst"), "/*[0]/$/*[3]/*[0]/*[0]");
            this.assertCreationPath(cmp.find("iterinst").find("output"), "/*[0]/$/*[3]/*[0]/*[0]/$/*[0]");
        }
    },
    
    testMultipleIteration : {
        attributes : { list : "x,x,x" },
        test : function(cmp) {
            this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/*[0]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[0].find("output"), "/*[0]/$/*[3]/*[0]/*[0]/$/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]/$/*[3]/*[1]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[1].find("output"), "/*[0]/$/*[3]/*[1]/*[0]/$/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[2], "/*[0]/$/*[3]/*[2]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[2].find("output"), "/*[0]/$/*[3]/*[2]/*[0]/$/*[0]");
        }
    },

    // TODO: W-2406307: remaining Halo test failure
    _testChangeIterationSize : {
        attributes : { list : "x,x,x" },
        test : [ function(cmp) {
            $A.run(
            		function(){
            			cmp.find("iteration").set("v.start", 1)
            		});
            $A.test.addWaitForWithFailureMessage(2, function(){return cmp.find("iterinst").length}, "number of iterations not reduced");
        }, function(cmp) {
            // client created
            this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/*[1]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[0].find("output"), "/*[0]/$/*[3]/*[1]/*[0]/$/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]/$/*[3]/*[2]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[1].find("output"), "/*[0]/$/*[3]/*[2]/*[0]/$/*[0]");
        }]
    },

    testAddInitialIteration : {
        attributes : { list : "" },
        test : [function(cmp) {
        	$A.test.assertUndefined(cmp.find("iterinst"));
            $A.run(function(){
            	var list = cmp.get("v.list");
            	list.push("x");
            	cmp.set("v.list", list);
            });
            $A.test.addWaitForWithFailureMessage(false, function(){return $A.util.isUndefined(cmp.find("iterinst"))}, "iteration is still empty");
        }]
    },

    testAddAdditionalIteration : {
        attributes : { list : "x" },
        test : [function(cmp) {
            this.assertCreationPath(cmp.find("iterinst"), "/*[0]/$/*[3]/*[0]/*[0]");
            $A.run(function(){
            	var list = cmp.get("v.list");
            	list.push("x");
            	cmp.set("v.list", list);
            });
            $A.test.addWaitForWithFailureMessage(2, function(){return cmp.find("iterinst").length}, "number of iterations didn't increment");
        }, function(cmp) {
            this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/*[0]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[0].find("output"), "/*[0]/$/*[3]/*[0]/*[0]/$/*[0]");
        }]
    },

    testAddMultipleIterations : {
        attributes : { list : "x,x" },
        test : [function(cmp) {
            this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/*[0]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]/$/*[3]/*[1]/*[0]");
            $A.run(function(){
            	var list = cmp.get("v.list"); 
            	list.push("x"); 
            	list.push("x");
            	cmp.set("v.list", list);
            	});
            $A.test.addWaitForWithFailureMessage(4, function(){return cmp.find("iterinst").length}, "number of iterations didn't increment");
        }, function(cmp) {
            this.assertCreationPath(cmp.find("iterinst")[0], "/*[0]/$/*[3]/*[0]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[0].find("output"), "/*[0]/$/*[3]/*[0]/*[0]/$/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[1], "/*[0]/$/*[3]/*[1]/*[0]");
            this.assertCreationPath(cmp.find("iterinst")[1].find("output"), "/*[0]/$/*[3]/*[1]/*[0]/$/*[0]");
        }]
    },
    
    testAddClientCmp : {
        test : [function(cmp) {
            this.addComponent(cmp, cmp.find("iterinst"), "aura:text", "hi");
        }, function(cmp) {
            $A.test.assertEqualsIgnoreWhitespace("0 - hi", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
            this.assertCreationPath(cmp.find("iterinst").get("v.output")[0], undefined);
        }]
    },

    testAddMultipleClientCmp : {
        test : [function(cmp) {
            this.addComponent(cmp, cmp.find("iterinst"), "aura:text", "a");
        }, function(cmp) {
            $A.test.assertEqualsIgnoreWhitespace("0 - a", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
            this.assertCreationPath(cmp.find("iterinst").get("v.output")[0], undefined);
            
            this.addComponent(cmp, cmp.find("iterinst"), "aura:text", "bb");
        }, function(cmp) {
            $A.test.assertEqualsIgnoreWhitespace("0 - abb", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
            this.assertCreationPath(cmp.find("iterinst").get("v.output")[1], undefined);
        }]
    },

    testAddServerCmp : {
        test : [function(cmp) {
            this.addComponent(cmp, cmp.find("iterinst"), "componentTest:hasModel", "bye");
        }, function(cmp) {
            $A.test.assertEqualsIgnoreWhitespace("0 - bye footerdefault", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
            this.assertCreationPath(cmp.find("iterinst").get("v.output")[0], "/*[0]");
        }]
    },

    // TODO: W-2406307: remaining Halo test failure
    _testAddMultipleServerCmp : {
        test : [function(cmp) {
            this.addComponent(cmp, cmp.find("iterinst"), "componentTest:hasModel", "x");
        }, function(cmp) {
            $A.test.assertEqualsIgnoreWhitespace("0 - x footerdefault", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
            this.assertCreationPath(cmp.find("iterinst").get("v.output")[0], "/*[0]");
            
            this.addComponent(cmp, cmp.find("iterinst"), "componentTest:hasModel", "yy");
        }, function(cmp) {
            $A.test.assertEqualsIgnoreWhitespace("0 - x footerdefault yy footerdefault", $A.test.getText(cmp.find("iterinst").find("output").getElement()));
            this.assertCreationPath(cmp.find("iterinst").get("v.output")[1], "/*[0]");
        }]
    }
})
