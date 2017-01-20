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
	setUp : function(testCmp) {
		testCmp._target = undefined;
	},
	
    // set target only once, for test reuse 
    setTargetCmp: function(testCmp, targetCmp, othercmpsInsideTestCmp) {
        testCmp._target = testCmp._target || targetCmp;
        testCmp._othercmpsInsideTestCmp = testCmp._othercmpsInsideTestCmp || othercmpsInsideTestCmp;
    },
    
    getLogs : function(testCmp) {
        var targetId = testCmp._target.getGlobalId();
        var otherCmpsInsideTestCmp = testCmp._othercmpsInsideTestCmp;
        if(otherCmpsInsideTestCmp) {
        	for (var i = 0; i < otherCmpsInsideTestCmp.length; i++) {
        		targetId = targetId+","+otherCmpsInsideTestCmp[i].getGlobalId(); 
        	}
        }
        var filterStr = "^[" + targetId + "]+.:(.*)";
        testCmp.set("v.logFilter", filterStr);
        return testCmp.find("logPanel").get("v.logs");
    },

    //call this function once every test stage please, or you will be messed up with different waits on different expected strings
    assertLogs : function(testCmp, expected, callback) {
        var that = this;
        var expectedStr = expected.join();
        var actual;
        $A.test.addWaitForWithFailureMessage(true, function() {
            actual = that.getLogs(testCmp);
            if (actual) {
                var actualStr = actual.join();
                if(expectedStr === actualStr){
                    testCmp.find("logPanel").clear();//maybe we can do the clear at the beginning of each test stage, rather than after
                    return true;
                }
            }
            return false;
        }, 
        "expecting "+expected+" but get these instead:"+actual,
        callback);
    },
    
///////////////////////////////////////   tests with componentClassParent.cmp begin   /////////////////////////////////////////
    
    /* when loading the component, we go through these in order
     * #1. client side provider
     * #2. init(in Controller)
     * #3 render and afterRender(in Renderer)
     */ 
    testStaticParent_Init : {
    	attributes : { "testParentInIteration": true, "testParent": true },
    	test : function(testCmp, expectedId) {
    			 if(!expectedId) {//only need to setTarget when running this test directly
	    			 expectedId = expectedId || "Parent";
	    			 var targetCmp = testCmp.find(expectedId);
	    			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
		             this.setTargetCmp(testCmp, targetCmp);
    			 }
	             // first check initial state
	             var expected = testCmp._initialExpected || [
	                                                         "ParentHelperParentProvide",
	                                                         "ParentHelperParentInit",
	                                                         "ParentHelperParentRender",
	                                                         "ParentHelperParentAfterrender" ];
	             this.assertLogs(testCmp, expected);
             }
    },
    
    /* 
     * make sure you set targetCmp before calling this function !!!
     * 
     * we have v.value in markup, click on the button to change v.value, these happens: 
     * #1. client action is called 
     * #2. server action is called by #1. 
     * #3. get response from server action, change v.value with it
     * #4. value change event is fired
     * #5. Rerender
     * 
     * do we really need #1 to #3 ?
     * 
     * 
     */
    testStaticParent_Rerender : {
    	attributes : { "testParentInIteration": true, "testParent": true },
    	test : function(testCmp, expectedId) {
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "Parent";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	             this.setTargetCmp(testCmp, targetCmp);
			}
    		testCmp.find("logPanel").clear();
    		// then fire an action and check after rerender
            testCmp._target.find("button").getElement().click();
            var expected = [ "ParentHelperParentAction",
                             "[ParentHelperParentParam]",
                             "ParentHelperParentValuechange",
                             "ParentHelperParentRerender" ];
            this.assertLogs(testCmp, expected);
    	}
    	
    },
    
    /*
     * Unrender the cmp, check if Unrender is called. then render it, check if Render and Afterrender is called
     */
    testStaticParent_Unrender : {
    	attributes : { "testParentInIteration": true, "testParent": true },
    	test : function(testCmp, expectedId) {
    		var that = this;
    		testCmp.find("logPanel").clear();
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "Parent";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	             this.setTargetCmp(testCmp, targetCmp);
			}
    		// then check after unrender
            testCmp.set("v.shouldRender", false);
            var expected = [ "ParentHelperParentUnrender" ];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "ParentHelperParentRender",
                                 "ParentHelperParentAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
    },
    
    //put Parent in iteration and check if it behaves just like loading it alone
    testIteratedParent_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            "testParentInIteration": true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ParentInIteration")[0]);
            this.testStaticParent_Init.test.call(this, testCmp, "ParentInIteration");
        }]
    },
    
    //put Parent in iteration and check if it behaves just like loading it alone
    testIteratedParent_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            "testParentInIteration": true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ParentInIteration")[0]);
        	this.testStaticParent_Rerender.test.call(this, testCmp, "ParentInIteration");
        }]
    },
    
    //put Parent in iteration and check if it behaves just like loading it alone
    testIteratedParent_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            "testParentInIteration": true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ParentInIteration")[0]);
        	this.testStaticParent_Unrender.test.call(this, testCmp, "ParentInIteration");
        }]
    },
    
    //create Parent dynamically, check if it behaves just like loading it statically
    testClientCreatedParent : {
        test : [function(testCmp) {
            //create the component and push it to testCmp's body
            var that = this;
            var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassParent",
                {
                    id : "ClientCreatedParent"
                },
                function(newCmp) {
                    var output = testCmp.find("client");
                    var body = output.get("v.body");
                    body.push(newCmp);
                    output.set("v.body", body);
                    that.setTargetCmp(testCmp, newCmp);
                    cmpCreated = true;
                }
            );
            $A.test.addWaitFor(true, function() {
                return cmpCreated;
            });
        }, function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientCreatedParent"));
        	this.testStaticParent_Init.test.call(this, testCmp, "ClientCreatedParent");
        }, function(testCmp) {
        	this.testStaticParent_Rerender.test.call(this, testCmp, "ClientCreatedParent");
        }, function(testCmp) {
        	this.testStaticParent_Unrender.test.call(this, testCmp, "ClientCreatedParent");
        }]
    },
   
    
///////////////////////////////////////   tests with componentClassOuter.cmp begin   /////////////////////////////////////////
    
    /* 
     * componentClassOuter has componentClassInner in its markup
     * during init, we call
     * #1 Outer's provider then Inner's provider
     * #2 Inner's init then Outer's init (in controller)
     * #3 Outer's render then Inner's render
     * #4 Outer's after-render, then Inner's after-render
     */ 
    testStaticOuter_Init : {
    	attributes : { "testOuter": true },
    	test : function(testCmp, expectedId) {
    			 if(!expectedId) {//only need to setTarget when running this test directly
	    			 expectedId = expectedId || "Outer";
	    			 var targetCmp = testCmp.find(expectedId);
	    			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	    			 var innerCmp = targetCmp.find("Inner");
		             this.setTargetCmp(testCmp, targetCmp, [innerCmp]);
    			 }
	             // first check initial state
	             var expected = testCmp._initialExpected || [
	                                                         "OuterHelperOuterProvide",
	                                                         "InnerHelperInnerProvide",
	                                                         "InnerHelperInnerInit",
	                                                         "OuterHelperOuterInit",
	                                                         "OuterHelperOuterRender",
	                                                         "InnerHelperInnerRender",
	                                                         "OuterHelperOuterAfterrender",
	                                                         "InnerHelperInnerAfterrender"];
	             this.assertLogs(testCmp, expected);
             }
    },
    
    /* 
     * componentClassOuter has componentClassInner in its markup, componentClassInner has attribute v.value
     * we change v.value by clicking on a button in componentClassInner
     * these happens: 
     * #1 valueChange event handler in componentClassInner
     * #2 Re-render in componentClassInner
     * #3 valueChange event handler in componentClassOuter
     * #4 Re-render in componentClassOuter
     * #5 valueChange event handler in componentClassInner ... again ...
     * #6 Re-render in componentClassInner
     * 
     * W-2739264 : handling value change twice is a performance no-no
     */
    testStaticOuter_RerenderInnerCmp : {
    	attributes : { "testOuter": true },
    	test : function(testCmp, expectedId) {
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "Outer";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	   			 var innerCmp = targetCmp.find("Inner");
	             this.setTargetCmp(testCmp, targetCmp, [innerCmp]);
			}
    		testCmp.find("logPanel").clear();
    		// then fire an action and check after rerender
            testCmp._target.find("Inner").find("button").getElement().click();
            var expected = [ "InnerHelperInnerAction",
                             "[InnerHelperInnerParam]",
                             "InnerHelperInnerValuechange",
                             "OuterHelperOuterValuechange", 
                             "InnerHelperInnerValuechange",
                             "OuterHelperOuterRerender",
                             "InnerHelperInnerRerender"
                             ];
            this.assertLogs(testCmp, expected);
    	}
    	
    },
    
    /* 
     * componentClassOuter has componentClassInner in its markup, componentClassInner has attribute v.value
     * we change v.value by clicking on a button in componentClassOuter
     * these happens: 
     * #1 valueChange event handler in componentClassInner -- this is because we pass valueOuter to Inner as v.valueInner
     * #2 valueChange event handler in componentClassOuter
     * #3 Re-render in componentClassOuter
     * #4 Re-render in componentClassInner 
     */
    testStaticOuter_RerenderOuterCmp : {
    	attributes : { "testOuter": true },
    	test : function(testCmp, expectedId) {
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "Outer";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	   			 var innerCmp = targetCmp.find("Inner");
	             this.setTargetCmp(testCmp, targetCmp, [innerCmp]);
			}
    		testCmp.find("logPanel").clear();
    		// then fire an action and check after rerender
            testCmp._target.find("button").getElement().click();
            var expected = [ "OuterHelperOuterAction",
                             "[OuterHelperOuterParam]",
                             "InnerHelperInnerValuechange",
                             "OuterHelperOuterValuechange",
                             "OuterHelperOuterRerender",
                             "InnerHelperInnerRerender"
                             ];
            this.assertLogs(testCmp, expected);
    	}
    	
    },
    
    /*
     * componentClassOuter has componentClassInner in its markup
     * toggle v.shouldRender, will un-Render componentClassOuter
     * Unrender of componentClassOuter is called before Unrender of componentClassInner.
     */
    testStaticOuter_Unrender : {
    	attributes : { "testOuter": true },
    	test : function(testCmp, expectedId) {
    		var that = this;
    		testCmp.find("logPanel").clear();
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "Outer";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	   			 var innerCmp = targetCmp.find("Inner");
	             this.setTargetCmp(testCmp, targetCmp, [innerCmp]);
			}
    		// then check after unrender
            testCmp.set("v.shouldRender", false);
            var expected = [ "OuterHelperOuterUnrender",
                             "InnerHelperInnerUnrender"];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "OuterHelperOuterRender",
                                 "InnerHelperInnerRender",
                                 "OuterHelperOuterAfterrender",
                                 "InnerHelperInnerAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
    },
    
    //put componentClassOuter in iteration and check if it behaves just like loading it alone
    testIteratedOuter_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            "testOuterInIteration": true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("OuterInIteration")[0], [testCmp.find("OuterInIteration")[0].find("Inner")]);
            this.testStaticOuter_Init.test.call(this, testCmp, "OuterInIteration");
        }]
    },
    
    //put Parent in iteration and check if it behaves just like loading it alone
    testIteratedOuter_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            "testOuterInIteration": true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("OuterInIteration")[0], [testCmp.find("OuterInIteration")[0].find("Inner")]);
        	this.testStaticOuter_RerenderOuterCmp.test.call(this, testCmp, "OuterInIteration");
        }, function(testCmp) {
        	this.testStaticOuter_RerenderInnerCmp.test.call(this, testCmp, "OuterInIteration");
        }]
    },
    
    //put Parent in iteration and check if it behaves just like loading it alone
    testIteratedOuter_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            "testOuterInIteration": true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("OuterInIteration")[0], [testCmp.find("OuterInIteration")[0].find("Inner")]);
        	this.testStaticOuter_Unrender.test.call(this, testCmp, "OuterInIteration");
        }]
    },
    /*
     * componentClassOuter has componentClassInner in its markup
     * we create componentClassOuter dynamically, then make sure it behaves the same as loading directly in markup
     */
    testClientCreatedOuter : {
        test : [function(testCmp) {
           //create the component and push it to testCmp's body
            var that = this;
            var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassOuter",
                {
                    id : "ClientCreatedOuter"
                },
                function(newCmp) {
                    var output = testCmp.find("client");
                    var body = output.get("v.body");
                    body.push(newCmp);
                    output.set("v.body", body);
                    that.setTargetCmp(testCmp, newCmp, [newCmp.find("Inner")]);
                    cmpCreated = true;
                }
            );
            $A.test.addWaitFor(true, function() {
                return cmpCreated;
            });
        }, function(testCmp) {
        	this.testStaticOuter_Init.test.call(this, testCmp, "ClientCreatedOuter");
        }, function(testCmp) {
        	this.testStaticOuter_RerenderInnerCmp.test.call(this, testCmp, "ClientCreatedOuter");
        },  function(testCmp) {
        	this.testStaticOuter_RerenderOuterCmp.test.call(this, testCmp, "ClientCreatedOuter");
        },function(testCmp) {
        	this.testStaticOuter_Unrender.test.call(this, testCmp, "ClientCreatedOuter");
        }]
    },
    
///////////////////////////////////////   tests with componentClassChild.cmp begin   /////////////////////////////////////////
    
    /* 
     * make sure you set targetCmp before calling this function !!!
     * componentClassChild extends componentClassParent
     * during init, we call
     * #1 child's provider
     * #2 parent's init then child's init (in controller)
     * #3 child's render then parent's render
     * #4 child after-render, then parent's after-render
     */ 
    testStaticChild_Init : {
    	attributes : { "testChild": true },
    	test : function(testCmp, expectedId) {
    			 if(!expectedId) {//only need to setTarget when running this test directly
	    			 expectedId = expectedId || "Child";
	    			 var targetCmp = testCmp.find(expectedId);
	    			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
		             this.setTargetCmp(testCmp, targetCmp);
    			 }
	             // first check initial state
	             var expected = testCmp._initialExpected || [
	                                                         "ChildHelperChildProvide",
	                                                         "ParentHelperParentInit",
	                                                         "ChildHelperChildInit",
	                                                         "ChildHelperChildRender",
	                                                         "ParentHelperParentRender",
	                                                         "ChildHelperChildAfterrender",
	                                                         "ParentHelperParentAfterrender" ];
	             this.assertLogs(testCmp, expected);
             }
    },
    
    /* 
     * make sure you set targetCmp before calling this function !!!
     * componentClassChild extends componentClassParent, componentClassParent has attribute v.value
     * we change v.value by clicking on a button in componentClassChild
     * these happens: 
     * #1 valueChange event handler in Parent, then handler in Child
     * #2 Re-render in Child then Re-render in Parent
     * 
     */
    testStaticChild_Rerender : {
    	attributes : { "testChild": true },
    	test : function(testCmp, expectedId) {
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "Child";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	             this.setTargetCmp(testCmp, targetCmp);
			}
    		testCmp.find("logPanel").clear();
    		// then fire an action and check after rerender
            testCmp._target.find("button").getElement().click();
            var expected = [ "ChildHelperChildAction",
                             "[ChildHelperChildParam]",
                             "ParentHelperParentValuechange",
                             "ChildHelperChildValuechange",
                             "ChildHelperChildRerender",
                             "ParentHelperParentRerender" ];
            this.assertLogs(testCmp, expected);
    	}
    	
    },
    
    /*
     * make sure you set targetCmp before calling this function !!!
     * componentClassChild extends componentClassParent
     * toggle v.shouldRender, will un-Render componentClassChild
     * Unrender of child is called before Unrender of parent.
     */
    testStaticChild_Unrender : {
    	attributes : { "testChild": true },
    	test : function(testCmp, expectedId) {
    		var that = this;
    		testCmp.find("logPanel").clear();
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "Child";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	             this.setTargetCmp(testCmp, targetCmp);
			}
    		// then check after unrender
            testCmp.set("v.shouldRender", false);
            var expected = [ "ChildHelperChildUnrender",
                             "ParentHelperParentUnrender" ];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "ChildHelperChildRender",
                                 "ParentHelperParentRender",
                                 "ChildHelperChildAfterrender",
                                 "ParentHelperParentAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
    },
    
    //put static child into an iteration, see if it behaves same as loading alone
    testIteratedChild_Init : {
        attributes : {
            iterationItems : "ONE,TWO",  
            testChildInIteration : true
        },
        test : [ function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ChildInIteration")[0]);
            this.testStaticChild_Init.test.call(this, testCmp, "ChildInIteration");
        }]
    },
    
    //put static child into an iteration, see if it behaves same as loading alone
    testIteratedChild_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",  
            testChildInIteration : true
        },
        test : [ function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ChildInIteration")[0]);
        	this.testStaticChild_Rerender.test.call(this, testCmp, "ChildInIteration");
        }]
    },
    
    //put static child into an iteration, see if it behaves same as loading alone
    testIteratedChild_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",  
            testChildInIteration : true
        },
        test : [ function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ChildInIteration")[0]);
        	this.testStaticChild_Unrender.test.call(this, testCmp, "ChildInIteration");
        }]
    },
    
    testClientCreatedChild : {
        test : [function(testCmp) {
           //create the component and push it to testCmp's body
            var that = this;
            var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassChild",
                {
                    id : "ClientCreatedChild"
                },
                function(newCmp) {
                    var output = testCmp.find("client");
                    var body = output.get("v.body");
                    body.push(newCmp);
                    output.set("v.body", body);
                    that.setTargetCmp(testCmp, newCmp);
                    cmpCreated = true;
                }
            );
            $A.test.addWaitFor(true, function() {
                return cmpCreated;
            });
        }, function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientCreatedChild"));
        	this.testStaticChild_Init.test.call(this, testCmp, "ClientCreatedChild");
        }, function(testCmp) {
        	this.testStaticChild_Rerender.test.call(this, testCmp, "ClientCreatedChild");
        }, function(testCmp) {
        	this.testStaticChild_Unrender.test.call(this, testCmp, "ClientCreatedChild");
        }]
    },
    
    
///////////////////////////////////////   tests with componentClassGrandChildServerProvider.cmp begin   /////////////////////////////////////////

    /* 
     * make sure you set targetCmp before calling this function !!!
     * componentClassGrandChildServerProvider extends componentClassChild
     * during init, we call
     * #1 parent's init , child's init then grandChild's init (in controller)
     * #2 grandChild's render, child's render then parent's render
     * #3 grandChild's after-render, child after-render, then parent's after-render
     * notice that there is NO PROVIDER call
     */ 
    testGrandChildServerProvider_Init : {
    	attributes : { "testGrandChildServer": true },
    	test : function(testCmp, expectedId) {
    			 if(!expectedId) {//only need to setTarget when running this test directly
	    			 expectedId = expectedId || "GrandChildServerProvider";
	    			 var targetCmp = testCmp.find(expectedId);
	    			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
		             this.setTargetCmp(testCmp, targetCmp);
    			 }
	             // first check initial state
	             var expected = testCmp._initialExpected || [
							"ParentHelperParentInit",
							"ChildHelperChildInit",
							"GrandChildServerProviderHelperGrandChildServerProviderInit",
							"GrandChildServerProviderHelperGrandChildServerProviderRender",
							"ChildHelperChildRender",
							"ParentHelperParentRender",
							"GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
							"ChildHelperChildAfterrender",
							"ParentHelperParentAfterrender" ];
	             this.assertLogs(testCmp, expected);
             }
    },
    
    
    /* 
     * make sure you set targetCmp before calling this function !!!
     * componentClassGrandChildServerProvider extends componentClassChild, componentClassChild extends componentClassParent, componentClassParent has v.value
     * we change v.value by clicking on a button in GrandChild
     * these happens: 
     * #1 valueChange event handler in Parent, then handler in Child, then handler in GrandChild
     * #2 Re-render in GrandChild, Re-render in Child then Re-render in Parent
     * 
     */
    testGrandChildServerProvider_Rerender : {
    	attributes : { "testGrandChildServer": true },
    	test : function(testCmp, expectedId) {
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "GrandChildServerProvider";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	             this.setTargetCmp(testCmp, targetCmp);
			}
    		testCmp.find("logPanel").clear();
    		// then fire an action and check after rerender
            testCmp._target.find("button").getElement().click();
            var expected = [ "GrandChildServerProviderHelperGrandChildServerProviderAction",
                             "[GrandChildServerProviderHelperGrandChildServerProviderParam]",
                             "ParentHelperParentValuechange",
                             "ChildHelperChildValuechange",
                             "GrandChildServerProviderHelperGrandChildServerProviderValuechange",
                             "GrandChildServerProviderHelperGrandChildServerProviderRerender",
                             "ChildHelperChildRerender",
                             "ParentHelperParentRerender" ];
            this.assertLogs(testCmp, expected);
    	}
    	
    },
    
    /*
     * make sure you set targetCmp before calling this function !!!
     * componentClassGrandChildServerProvider extends componentClassChild
     * toggle v.shouldRender, will un-Render grandChild
     * we un-render grandChild first, then Child, then Parent.
     */
    testGrandChildServerProvider_Unrender : {
    	attributes : { "testGrandChildServer": true },
    	test : function(testCmp, expectedId) {
    		var that = this;
    		testCmp.find("logPanel").clear();
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "GrandChildServerProvider";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	             this.setTargetCmp(testCmp, targetCmp);
			}
    		// then check after unrender
            testCmp.set("v.shouldRender", false);
            var expected = [ "GrandChildServerProviderHelperGrandChildServerProviderUnrender",
                             "ChildHelperChildUnrender",
                             "ParentHelperParentUnrender" ];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "GrandChildServerProviderHelperGrandChildServerProviderRender",
                                 "ChildHelperChildRender",
                                 "ParentHelperParentRender",
                                 "GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
                                 "ChildHelperChildAfterrender",
                                 "ParentHelperParentAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
    },
    
    //Check grandChild component provided by server in iteration
    testIteratedGrandChildServerProvider_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testGrandChildServerInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("GrandChildServerProviderInIteration")[0]);
            this.testGrandChildServerProvider_Init.test.call(this, testCmp, "GrandChildServerProviderInIteration");
        }]
    },
    
    //Check grandChild component provided by server in iteration
    testIteratedGrandChildServerProvider_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testGrandChildServerInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("GrandChildServerProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "GrandChildServerProviderInIteration");
        }]
    },
    
    //Check grandChild component provided by server in iteration
    testIteratedGrandChildServerProvider_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testGrandChildServerInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("GrandChildServerProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "GrandChildServerProviderInIteration");
        }]
    },

    /*
     * componentClassServerProvider will call its java provider to create a component (desc=requestDescriptor)
     * in this case we pass in componentClassGrandChildServerProvider as requestDescriptor
     * so we have a grandChildServerProvider component via a server provided cmp.
     * 
     * This test verify that the behavior is the same as loading the grandChildServerProvider component directly
     * 
     * notice that componentClassServerProvider actually has a js provider, we didn't use it in the component's mark-up,
     * and it's not being called.
    */
    testServerProvidedGrandChildServerProvider : {
    	attributes : { testServerProviderGrandChildServerProvider : true },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildServerProvider"));
            this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ServerProviderGrandChildServerProvider");
        }, function(testCmp) {
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ServerProviderGrandChildServerProvider");
        }, function(testCmp) {
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ServerProviderGrandChildServerProvider");
        }]
    },
    
    
    /*
     * see what we did for testServerProvidedGrandChildServerProvider above
     * this test put that in iteration, and verify it behaves the same 
     * 
     * This is not working as expected. W-2559712
     * componentClassServerProvider has java provider, and it use it in the markup, but in fact it's not being used. 
     * somehow the componentClassServerProvider component itself is being served. that's not what we expected.
     * there are warnings being thrown about "unused config"
     */
    _testIteratedServerProvidedGrandChildServerProvider_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildServerProviderInIteration")[0]);
            this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ServerProviderGrandChildServerProviderInIteration");
        }]
    },
    
    _testIteratedServerProvidedGrandChildServerProvider_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildServerProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ServerProviderGrandChildServerProviderInIteration");
        }]
    },
    
    _testIteratedServerProvidedGrandChildServerProvider_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildServerProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ServerProviderGrandChildServerProviderInIteration");
        }]
    },
    
    /*
     * componentClassClientProvider will call its js provider to create a component
     * in this case we pass in componentClassGrandChildServerProvider as requestDescriptor
     * so we have a grandChildServerProvider component via a server provided cmp
     * 
     * This test verify the bahavior is similar as loading the grandChildServerProvider component directly (expect the js provider is called first)
     */
    testClientProvidedGrandChildServerProvider : {
    	attributes : { testClientProviderGrandChildServerProvider : true },
        test : [function(testCmp, expectedId) {
            this.setTargetCmp(testCmp, testCmp.find("ClientProviderGrandChildServerProvider"));
            testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
                this.setTargetCmp(testCmp, testCmp.find("ClientProviderGrandChildServerProvider"));
                this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ClientProviderGrandChildServerProvider");
            }, function(testCmp) {
            	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ClientProviderGrandChildServerProvider");
            }, function(testCmp) {
            	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ClientProviderGrandChildServerProvider");
            }
        ]
    },
    
    /*
     * see what we did for testClientProvidedGrandChildServerProvider above
     * this test put that in iteration, and verify it behaves the same 
     */
    testIteratedClientProvidedGrandChildServerProvider_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testClientProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
        	testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
            this.setTargetCmp(testCmp, testCmp.find("ClientProviderGrandChildServerProviderInIteration")[0]);
            this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ClientProviderGrandChildServerProviderInIteration");
        }]
    },
    
    testIteratedClientProvidedGrandChildServerProvider_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testClientProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ClientProviderGrandChildServerProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ClientProviderGrandChildServerProviderInIteration");
        }]
    },
    
    testIteratedClientProvidedGrandChildServerProvider_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testClientProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ClientProviderGrandChildServerProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ClientProviderGrandChildServerProviderInIteration");
        }]
    },
    
    //we create GrandChildServerProvider component dynamically, then verify it behave just like the one we load statically
    testClientCreatedGrandChildServerProvider : {
        test : [function(testCmp) {
			var that = this;
			var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassGrandChildServerProvider",
                {
                    id : "ClientCreatedGrandChildServerProvider"
                },
    			function(newCmp) {
    			    var output = testCmp.find("client");
    			    var body = output.get("v.body");
    			    body.push(newCmp);
    			    output.set("v.body", body);
    			    that.setTargetCmp(testCmp, newCmp);
    			    cmpCreated = true;
    			}
            );
			$A.test.addWaitFor(true, function() {
			    return cmpCreated;
			});
        }, function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientCreatedGrandChildServerProvider"));
        	this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ClientCreatedGrandChildServerProvider");
        }, function(testCmp) {
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ClientCreatedGrandChildServerProvider");
        }, function(testCmp) {
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ClientCreatedGrandChildServerProvider");
        }
        ]
    },
    
    /*
     * remember what we did in testServerProvidedGrandChildServerProvider above? we create GrandChildServerProvider component
     * by pass it as requestDescriptor to a component with server provider.
     * 
     * Here we verify we can do above dynamically, and it behave just like the GrandChildServerProvider component we created statically
     */
    testClientCreatedServerProvidedGrandChildServerProvider : {
        test : [function(testCmp) {
            var that = this;
			var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassServerProvider",
                {
                    requestDescriptor : "markup://auratest:componentClassGrandChildServerProvider",
                    id : "ClientCreatedServerProvidedGrandChildServerProvider"
                },
    			function(newCmp) {
    			    var output = testCmp.find("client");
    			    var body = output.get("v.body");
    			    body.push(newCmp);
    			    output.set("v.body", body);
    			    that.setTargetCmp(testCmp, newCmp);
    			    cmpCreated = true;
    			}
            );
			$A.test.addWaitFor(true, function() {
			    return cmpCreated;
			});
        }, function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientCreatedServerProvidedGrandChildServerProvider"));
        	this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ClientCreatedServerProvidedGrandChildServerProvider");
        },function(testCmp) {
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ClientCreatedServerProvidedGrandChildServerProvider");
        },function(testCmp) {
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ClientCreatedServerProvidedGrandChildServerProvider");
        }]
    },
    
    /*
     * remember what we did in testClientProvidedGrandChildServerProvider above? we create GrandChildServerProvider component
     * by pass it as requestDescriptor to a component with js(client) provider.
     * 
     * Here we verify we can do above dynamically, and it behave similar to the GrandChildServerProvider component we created statically
     * the only difference is during initial load, the js(client) provider is called before anything else
     * 
     * TODO: why the string(which is{!v.id}) is missing before the buttons
     */
    testClientCreatedClientProvidedGrandChildServerProvider : {
        test : [function(testCmp) {
            var that = this;
			var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassClientProvider",
                {
                    requestDescriptor : "markup://auratest:componentClassGrandChildServerProvider",
                    id : "ClientCreatedClientProvidedGrandChildServerProvider"
                },
    			function(newCmp) {
    			    var output = testCmp.find("client");
    			    var body = output.get("v.body");
    			    body.push(newCmp);
    			    output.set("v.body", body);
    			    that.setTargetCmp(testCmp, newCmp);
    			    cmpCreated = true;
    			}
            );
			$A.test.addWaitFor(true, function() {
			    return cmpCreated;
			});
        },function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientCreatedClientProvidedGrandChildServerProvider"));
        	testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
        	this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ClientCreatedClientProvidedGrandChildServerProvider");
        },function(testCmp) {
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ClientCreatedClientProvidedGrandChildServerProvider");
        },function(testCmp) {
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ClientCreatedClientProvidedGrandChildServerProvider");
        }]
    },
    
    /*
     * k, this is getting little complecated, hold your breath :)
     * componentClassServerProvider has a server provider, we ask it to provide componentClassClientProvider.cmp
     * componentClassClientProvider has a client provider, we ask it to provide componentClassGrandChildServerProvider.cmp
     * 
     * This test verify componentClassGrandChildServerProvider we got behave similar as loading it statically
     */
    testServerProvidedClientProvidingGrandChildServerProvider : {
    	attributes : {
    		testServerProviderClientProviderGrandChildServerProvider : true
    	},
        test : [function(testCmp) {
        	testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderClientProviderGrandChildServerProvider"));
            this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ServerProviderClientProviderGrandChildServerProvider");
        }, function(testCmp) {
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ServerProviderClientProviderGrandChildServerProvider");
        }, function(testCmp) {
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ServerProviderClientProviderGrandChildServerProvider");
        }]
    },
    
    /*
     * see what we did for testServerProvidedClientProvidingGrandChildServerProvider above
     * this test put that in iteration, and verify it behaves the same 
     * 
     * this is not working. W-2559712
     * once we put componentClassServerProvider.cmp inside an iteration, it igore the fact that we ask it to use the server provider in its markup
     */
    _testIteratedServerProvidedClientProvidingGrandChildServerProvider_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderClientProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
        	testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderClientProviderGrandChildServerProviderInIteration")[0]);
            this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ServerProviderClientProviderGrandChildServerProviderInIteration");
        }
        ]
    },
    
    _testIteratedServerProvidedClientProvidingGrandChildServerProvider_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderClientProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderClientProviderGrandChildServerProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ServerProviderClientProviderGrandChildServerProviderInIteration");
        }
        ]
    },
    
    _testIteratedServerProvidedClientProvidingGrandChildServerProvider_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderClientProviderGrandChildServerProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderClientProviderGrandChildServerProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ServerProviderClientProviderGrandChildServerProviderInIteration");
        }
        ]
    },
    
    
///////////////////////////////////////   tests with componentClassGrandChildClientProvider.cmp begin   /////////////////////////////////////////

    /* 
     * make sure you set targetCmp before calling this function !!!
     * componentClassGrandChildClientProvider extends componentClassChild, it has a client-side provider
     * during the initial load, we call
     * #0 client provider of grandChild
     * #1 parent's init , child's init then grandChild's init (in controller)
     * #2 grandChild's render, child's render then parent's render
     * #3 grandChild's after-render, child after-render, then parent's after-render
     */ 
    testGrandChildClientProvider_Init : {
    	attributes : { "testGrandChildClient": true },
    	test : function(testCmp, expectedId) {
    			 if(!expectedId) {//only need to setTarget when running this test directly
	    			 expectedId = expectedId || "GrandChildClientProvider";
	    			 var targetCmp = testCmp.find(expectedId);
	    			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
		             this.setTargetCmp(testCmp, targetCmp);
    			 }
	             // first check initial state
	             var expected = testCmp._initialExpected || [
						"GrandChildClientProviderHelperGrandChildClientProviderProvide",
						"ParentHelperParentInit",
						"ChildHelperChildInit",
						"GrandChildClientProviderHelperGrandChildClientProviderInit",
						"GrandChildClientProviderHelperGrandChildClientProviderRender",
						"ChildHelperChildRender",
						"ParentHelperParentRender",
						"GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
						"ChildHelperChildAfterrender",
						"ParentHelperParentAfterrender" ];
	             this.assertLogs(testCmp, expected);
             }
    },
    
    /* 
     * make sure you set targetCmp before calling this function !!!
     * componentClassGrandChildClientProvider extends componentClassChild, componentClassChild extends componentClassParent, componentClassParent has v.value
     * we change v.value by clicking on a button in GrandChild
     * these happens: 
     * #1 valueChange event handler in Parent, then handler in Child, then handler in GrandChild
     * #2 Re-render in GrandChild, Re-render in Child then Re-render in Parent
     * 
     */
    testGrandChildClientProvider_Rerender : {
    	attributes : { "testGrandChildClient": true },
    	test : function(testCmp, expectedId) {
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "GrandChildClientProvider";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	             this.setTargetCmp(testCmp, targetCmp);
			}
    		testCmp.find("logPanel").clear();
    		// then fire an action and check after rerender
            testCmp._target.find("button").getElement().click();
            var expected = [ "GrandChildClientProviderHelperGrandChildClientProviderAction",
                             "[GrandChildClientProviderHelperGrandChildClientProviderParam]",
                             "ParentHelperParentValuechange",
                             "ChildHelperChildValuechange",
                             "GrandChildClientProviderHelperGrandChildClientProviderValuechange",
                             "GrandChildClientProviderHelperGrandChildClientProviderRerender",
                             "ChildHelperChildRerender",
                             "ParentHelperParentRerender" ];
            this.assertLogs(testCmp, expected);
    	}
    	
    },
    
    /*
     * make sure you set targetCmp before calling this function !!!
     * componentClassGrandChildClientProvider extends componentClassChild
     * toggle v.shouldRender, will un-Render grandChild
     * we un-render grandChild first, then Child, then Parent.
     */
    testGrandChildClientProvider_Unrender : {
    	attributes : { "testGrandChildClient": true },
    	test : function(testCmp, expectedId) {
    		var that = this;
    		testCmp.find("logPanel").clear();
    		if(!expectedId) {//only need to setTarget when running this test directly
	   			 expectedId = expectedId || "GrandChildClientProvider";
	   			 var targetCmp = testCmp.find(expectedId);
	   			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
	             this.setTargetCmp(testCmp, targetCmp);
			}
    		// then check after unrender
            testCmp.set("v.shouldRender", false);
            var expected = [ "GrandChildClientProviderHelperGrandChildClientProviderUnrender",
                             "ChildHelperChildUnrender",
                             "ParentHelperParentUnrender" ];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "GrandChildClientProviderHelperGrandChildClientProviderRender",
                                 "ChildHelperChildRender",
                                 "ParentHelperParentRender",
                                 "GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
                                 "ChildHelperChildAfterrender",
                                 "ParentHelperParentAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
    },
    
    //put GrandChildClientProvider in interation, verify it behaves the same of loading seperately
    testIteratedGrandChildClientProvider_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            testGrandChildClientInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("GrandChildClientProviderInIteration")[0]);
            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "GrandChildClientProviderInIteration");
        }]
    },
    
    //put GrandChildClientProvider in interation, verify it behaves the same of loading seperately
    testIteratedGrandChildClientProvider_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            testGrandChildClientInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("GrandChildClientProviderInIteration")[0]);
        	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "GrandChildClientProviderInIteration");
        }]
    },
    
    //put GrandChildClientProvider in interation, verify it behaves the same of loading seperately
    testIteratedGrandChildClientProvider_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            testGrandChildClientInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("GrandChildClientProviderInIteration")[0]);
        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "GrandChildClientProviderInIteration");
        }]
    },
    
    /*
     * componentClassServerProvider will call its java provider to create a component (desc=requestDescriptor)
     * in this case we pass in componentClassGrandChildClientProvider as requestDescriptor
     * so now we have a grandChildClientProvider component via a server provided cmp.
     * 
     * This test verify that the behavior is the same as loading the grandChildClientProvider component directly
    */ 
    testServerProvidedGrandChildClientProvider : {
    	attributes : { testServerProviderGrandChildClientProvider: true },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildClientProvider"));
            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "ServerProviderGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "ServerProviderGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "ServerProviderGrandChildClientProvider");
        }]
    },
    
    /*
     * see testServerProvidedGrandChildClientProvider above? 
     * we are doing it in an iteration and verify GrandChildClientProvider behaves the same like loading it individually
     * 
     * This is not working as expected. W-2559712
     * somehow the componentClassServerProvider component itself is being served. that's
     * not what we expected.
     * there are warnings being thrown about "unused config"
     */
    _testIteratedServerProvidedGrandChildClientProvider_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildClientProviderInIteration")[0]);
            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "ServerProviderGrandChildClientProviderInIteration");
        }
        ]
    },
    
    _testIteratedServerProvidedGrandChildClientProvider_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildClientProviderInIteration")[0]);
        	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "ServerProviderGrandChildClientProviderInIteration");
        }
        ]
    },
    
    _testIteratedServerProvidedGrandChildClientProvider_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildClientProviderInIteration")[0]);
        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "ServerProviderGrandChildClientProviderInIteration");
        }
        ]
    },
    
    /*
     * componentClassClientProvider will call its js(client) provider to create a component (desc=requestDescriptor)
     * in this case we pass in componentClassGrandChildClientProvider as requestDescriptor
     * so now we have a grandChildClientProvider component via a js(client) provided cmp.
     * 
     * This test verify that the behavior is similar as loading the grandChildClientProvider component directly
     * except we call js provider goes first during the initial load
    */ 
    testClientProvidedGrandChildClientProvider : {
    	attributes: { testClientProviderGrandChildClientProvider: true},
        test : [function(testCmp, expectedId) {
            this.setTargetCmp(testCmp, testCmp.find("ClientProviderGrandChildClientProvider"));
            testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
                this.testGrandChildClientProvider_Init.test.call(this, testCmp, "ClientProviderGrandChildClientProvider");
            }, function(testCmp) {
            	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "ClientProviderGrandChildClientProvider");
            }, function(testCmp) {
            	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "ClientProviderGrandChildClientProvider");
        }]
    },
    
    /*
     * look at what we did in testClientProvidedGrandChildClientProvider above
     * this test do that in an iteration, and verify it behaves the same as  loading indivisually
     */
    testIteratedClientProvidedGrandChildClientProvider_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            testClientProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientProvidedGrandChildClientProviderInIteration")[0]);
	        testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
	                                         "ParentHelperParentInit",
	                                         "ChildHelperChildInit",
	                                         "GrandChildClientProviderHelperGrandChildClientProviderInit",
	                                         "GrandChildClientProviderHelperGrandChildClientProviderRender",
	                                         "ChildHelperChildRender",
	                                         "ParentHelperParentRender",
	                                         "GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
	                                         "ChildHelperChildAfterrender",
	                                         "ParentHelperParentAfterrender" ];
	            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "ClientProvidedGrandChildClientProviderInIteration");
        }]
    },
    
    /*
     * look at what we did in testClientProvidedGrandChildClientProvider above
     * this test do that in an iteration, and verify it behaves the same as  loading indivisually
     */
    testIteratedClientProvidedGrandChildClientProvider_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            testClientProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientProvidedGrandChildClientProviderInIteration")[0]);
	        this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "ClientProvidedGrandChildClientProviderInIteration");
        }]
    },
    
    /*
     * look at what we did in testClientProvidedGrandChildClientProvider above
     * this test do that in an iteration, and verify it behaves the same as  loading indivisually
     */
    testIteratedClientProvidedGrandChildClientProvider_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            testClientProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientProvidedGrandChildClientProviderInIteration")[0]);
	        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "ClientProvidedGrandChildClientProviderInIteration");
        }]
    },
    
    
    //we create GrandChildClientProvider component dynamically, then verify it behave just like the one we load statically
    testClientCreatedGrandChildClientProvider : {
        test : [function(testCmp) {
            var that = this;
			var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassGrandChildClientProvider",
                {
                    id : "ClientCreatedGrandChildClientProvider"
                },
    			function(newCmp) {
    			    var output = testCmp.find("client");
    			    var body = output.get("v.body");
    			    body.push(newCmp);
    			    output.set("v.body", body);
    			    that.setTargetCmp(testCmp, newCmp);
    			    cmpCreated = true;
    			}
            );
			$A.test.addWaitFor(true, function() {
			    return cmpCreated;
			});
        }, function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientCreatedGrandChildClientProvider"));
            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "ClientCreatedGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "ClientCreatedGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "ClientCreatedGrandChildClientProvider");
        }]
    },
    
    /*
     * remember what we did in testServerProvidedGrandChildClientProvider ? 
     * we create GrandChildClientProvider cmp by feeding it as desc to a component with server provider.
     * here we create the component with server provider dynamically, verify GrandChildClientProvider behaves the same as loading statically  
    */
    testClientCreatedServerProvidedGrandChildClientProvider : {
        test : [function(testCmp) {
            var that = this;
			var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassServerProvider",
                {
                    requestDescriptor : "markup://auratest:componentClassGrandChildClientProvider",
                    id : "ClientCreatedServerProvidedGrandChildClientProvider"
                },
    			function(newCmp) {
    			    var output = testCmp.find("client");
    			    var body = output.get("v.body");
    			    body.push(newCmp);
    			    output.set("v.body", body);
    			    that.setTargetCmp(testCmp, newCmp);
    			    cmpCreated = true;
    			}
            );
			$A.test.addWaitFor(true, function() {
			    return cmpCreated;
			});
        }, function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientCreatedServerProvidedGrandChildClientProvider"));
            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "ClientCreatedServerProvidedGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "ClientCreatedServerProvidedGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "ClientCreatedServerProvidedGrandChildClientProvider");
        }]
    },
    
    
    
    /*
     * remember what we did in testClientProvidedGrandChildClientProvider ? 
     * we create GrandChildClientProvider cmp by feeding it as desc to a component with client provider.
     * here we create the component with client provider dynamically, verify GrandChildClientProvider behaves the same as loading statically
     * notice the client provider call happens before anything else
     * 
     * TODO: why {!v.id} is missing before the buttons
    */
    testClientCreatedClientProvidedGrandChildClientProvider : {
        test : [function(testCmp) {
            var that = this;
			var cmpCreated = false;
            $A.createComponent(
                "auratest:componentClassClientProvider",
                {
                    requestDescriptor : "markup://auratest:componentClassGrandChildClientProvider",
                    id : "ClientCreatedClientProvidedGrandChildClientProvider"
                },
    			function(newCmp) {
    			    var output = testCmp.find("client");
    			    var body = output.get("v.body");
    			    body.push(newCmp);
    			    output.set("v.body", body);
    			    that.setTargetCmp(testCmp, newCmp);
    			    cmpCreated = true;
    			}
            );
			$A.test.addWaitFor(true, function() {
			    return cmpCreated;
			});
        }, function(testCmp) {
        	this.setTargetCmp(testCmp, testCmp.find("ClientCreatedClientProvidedGrandChildClientProvider"));
        	testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "ClientCreatedClientProvidedGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "ClientCreatedClientProvidedGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "ClientCreatedClientProvidedGrandChildClientProvider");
        }]
    },
    
    
    /*
     * k, this is getting little complecated, hold your breath :)
     * componentClassServerProvider has a server provider, we ask it to provide componentClassClientProvider.cmp
     * componentClassClientProvider has a client provider, we ask it to provide componentClassGrandChildClientProvider.cmp
     * 
     * This test verify componentClassGrandChildClientProvider we got behave similar as loading it statically
     * Notice the call to client provider goes before anything else
     */
    testServerProvidedClientProvidingGrandChildClientProvider : {
    	attributes : { testServerProviderClientProviderGrandChildClientProvider : true },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderClientProviderGrandChildClientProvider"));
            testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "ServerProviderClientProviderGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "ServerProviderClientProviderGrandChildClientProvider");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "ServerProviderClientProviderGrandChildClientProvider");
        }]
    },
    
    /*
     * see what we did for testServerProvidedClientProvidingGrandChildClientProvider above
     * this test put that in iteration, and verify it behaves the same 
     * 
     * this is not working. W-2559712
     * once we put componentClassServerProvider.cmp inside an iteration, it start to use its client provider file,
     * igoring that we ask it to use the server provider in its markup
     */
    _testIteratedServerProvidedClientProvidingGrandChildClientProvider_Init : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderClientProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
        	testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "ParentHelperParentInit",
                                         "ChildHelperChildInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderRender",
                                         "ChildHelperChildRender",
                                         "ParentHelperParentRender",
                                         "GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "ParentHelperParentAfterrender" ];
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderClientProviderGrandChildClientProviderInIteration")[0]);
            this.testGrandChildServerProvider_Init.test.call(this, testCmp, "ServerProviderClientProviderGrandChildClientProviderInIteration");
        }
        ]
    },
    
    _testIteratedServerProvidedClientProvidingGrandChildClientProvider_Rerender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderClientProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderClientProviderGrandChildClientProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "ServerProviderClientProviderGrandChildClientProviderInIteration");
        }
        ]
    },
    
    _testIteratedServerProvidedClientProvidingGrandChildClientProvider_Unrender : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testServerProviderClientProviderGrandChildClientProviderInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderClientProviderGrandChildClientProviderInIteration")[0]);
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "ServerProviderClientProviderGrandChildClientProviderInIteration");
        }
        ]
    }
    
})