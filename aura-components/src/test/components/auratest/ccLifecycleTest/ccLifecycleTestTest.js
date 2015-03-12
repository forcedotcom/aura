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
    // set target only once, for test reuse 
    setTargetCmp: function(testCmp, targetCmp) {
        testCmp._target = testCmp._target || targetCmp;
    },
    
    getLogs : function(testCmp) {
    	debugger;
        var targetId = testCmp._target.getGlobalId();
        var filterStr = "^" + targetId + ":(.*)";
        testCmp.set("v.logFilter", filterStr);
        return testCmp.find("logPanel").get("v.logs");
    },

    //call this function once every test stage please, or you will be messed up with different waits on different expected strings
    assertLogs : function(testCmp, expected, callback) {
        var that = this;
        var expectedStr = expected.join();
        var actual;
        debugger;
        $A.test.addWaitForWithFailureMessage(true, function() {
            actual = that.getLogs(testCmp, testCmp._target);
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
	                                                         "RootHelperRootProvide",
	                                                         "RootHelperRootInit",
	                                                         "RootHelperRootRender",
	                                                         "RootHelperRootAfterrender" ];
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
            var expected = [ "RootHelperRootAction",
                             "[RootHelperRootParam]",
                             "RootHelperRootValuechange",
                             "RootHelperRootRerender" ];
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
            var expected = [ "RootHelperRootUnrender" ];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "RootHelperRootRender",
                                 "RootHelperRootAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
    },
    
    //put Parent in iteration and check if it behaves just like loading it alone
    testIteratedParent : {
        attributes : {
            iterationItems : "ONE,TWO",
            "testParentInIteration": true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ParentInIteration")[0]);
            this.testStaticParent_Init.test.call(this, testCmp, "ParentInIteration");
        }, function(testCmp) {
        	this.testStaticParent_Rerender.test.call(this, testCmp, "ParentInIteration");
        }, function(testCmp) {
        	this.testStaticParent_Unrender.test.call(this, testCmp, "ParentInIteration");
        }]
    },
    
    //create Parent dynamically, check if it behaves just like loading it statically
    testClientCreatedParent : {
        test : [function(testCmp) {
        	var componentConfig = {
                    componentDef : "markup://auratest:componentClassParent",
                    attributes : {
                        values : {
                            id : "ClientCreatedParent"
                        }
                    }
            };
            //create the component and push it to testCmp's body
            var that = this;
            var cmpCreated = false;
            $A.componentService.newComponentAsync(that, function(newCmp) {
                var output = testCmp.find("client");
                var body = output.get("v.body");
                body.push(newCmp);
                output.set("v.body", body);
                that.setTargetCmp(testCmp, newCmp);
                cmpCreated = true;
            }, componentConfig, null, true, true);
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
	    			 debugger;
	    			 var targetCmp = testCmp.find(expectedId);
	    			 targetCmp = (targetCmp.length === undefined)?targetCmp:targetCmp[0];
		             this.setTargetCmp(testCmp, targetCmp);
    			 }
	             // first check initial state
	             var expected = testCmp._initialExpected || [
	                                                         "ChildHelperChildProvide",
	                                                         "RootHelperRootInit",
	                                                         "ChildHelperChildInit",
	                                                         "ChildHelperChildRender",
	                                                         "RootHelperRootRender",
	                                                         "ChildHelperChildAfterrender",
	                                                         "RootHelperRootAfterrender" ];
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
                             "RootHelperRootValuechange",
                             "ChildHelperChildValuechange",
                             "ChildHelperChildRerender",
                             "RootHelperRootRerender" ];
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
                             "RootHelperRootUnrender" ];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "ChildHelperChildRender",
                                 "RootHelperRootRender",
                                 "ChildHelperChildAfterrender",
                                 "RootHelperRootAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
    },
    
    testIteratedChild : {
        attributes : {
            iterationItems : "ONE,TWO",  
            testChildInIteration : true
        },
        test : [ function(testCmp) {
        	debugger;
            this.setTargetCmp(testCmp, testCmp.find("ChildInIteration")[0]);
            this.testStaticChild_Init.test.call(this, testCmp, "ChildInIteration");
        }, function(testCmp) {
        	this.testStaticChild_Rerender.test.call(this, testCmp, "ChildInIteration");
        }, function(testCmp) {
        	this.testStaticChild_Unrender.test.call(this, testCmp, "ChildInIteration");
        }]
    },
    
    testClientCreatedChild : {
        test : [function(testCmp) {
            var componentConfig = {
                componentDef : "markup://auratest:componentClassChild",
                attributes : {
                    values : {
                        id : "ClientCreatedChild"
                    }
                }
            };
           //create the component and push it to testCmp's body
            var that = this;
            var cmpCreated = false;
            $A.componentService.newComponentAsync(that, function(newCmp) {
                var output = testCmp.find("client");
                var body = output.get("v.body");
                body.push(newCmp);
                output.set("v.body", body);
                that.setTargetCmp(testCmp, newCmp);
                cmpCreated = true;
            }, componentConfig, null, true, true);
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
							"RootHelperRootInit",
							"ChildHelperChildInit",
							"GrandChildServerProviderHelperGrandChildServerProviderInit",
							"GrandChildServerProviderHelperGrandChildServerProviderRender",
							"ChildHelperChildRender",
							"RootHelperRootRender",
							"GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
							"ChildHelperChildAfterrender",
							"RootHelperRootAfterrender" ];
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
                             "RootHelperRootValuechange",
                             "ChildHelperChildValuechange",
                             "GrandChildServerProviderHelperGrandChildServerProviderValuechange",
                             "GrandChildServerProviderHelperGrandChildServerProviderRerender",
                             "ChildHelperChildRerender",
                             "RootHelperRootRerender" ];
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
                             "RootHelperRootUnrender" ];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "GrandChildServerProviderHelperGrandChildServerProviderRender",
                                 "ChildHelperChildRender",
                                 "RootHelperRootRender",
                                 "GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
                                 "ChildHelperChildAfterrender",
                                 "RootHelperRootAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
    },
    
    //Check grandChild component provided by server in iteration
    testIteratedGrandChildServerProvider : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true,
            testGrandChildServerInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("GrandChildServerProviderInIteration")[0]);
            this.testGrandChildServerProvider_Init.test.call(this, testCmp, "GrandChildServerProviderInIteration");
        }, function(testCmp) {
        	this.testGrandChildServerProvider_Rerender.test.call(this, testCmp, "GrandChildServerProviderInIteration");
        }, function(testCmp) {
        	this.testGrandChildServerProvider_Unrender.test.call(this, testCmp, "GrandChildServerProviderInIteration");
        }]
    },

    /*
     * componentClassServerProvider will call its java provider to create a component (desc=requestDescriptor)
     * in this case we pass in componentClassGrandChildServerProvider as requestDescriptor
     * so we have a grandChildServerProvider component via a server provided cmp.
     * 
     * This test verify that the behavior is the same as loading the grandChildServerProvider component directly
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
    
    //we create GrandChildServerProvider component dynamically, then verify it behave just like the one we load statically
    testClientCreatedGrandChildServerProvider : {
        test : [function(testCmp) {
            var componentConfig = {
                componentDef : "markup://auratest:componentClassGrandChildServerProvider",
                attributes : {
                    values : {
                        id : "ClientCreatedGrandChildServerProvider"
                    }
                }
            };
			var that = this;
			var cmpCreated = false;
			$A.componentService.newComponentAsync(that, function(newCmp) {
			    var output = testCmp.find("client");
			    var body = output.get("v.body");
			    body.push(newCmp);
			    output.set("v.body", body);
			    that.setTargetCmp(testCmp, newCmp);
			    cmpCreated = true;
			}, componentConfig, null, true, true);
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
            var componentConfig = {
                componentDef : "markup://auratest:componentClassServerProvider",
                attributes : {
                    values : {
                        requestDescriptor : "markup://auratest:componentClassGrandChildServerProvider",
                        id : "ClientCreatedServerProvidedGrandChildServerProvider"
                    }
                }
            };
            var that = this;
			var cmpCreated = false;
			$A.componentService.newComponentAsync(that, function(newCmp) {
			    var output = testCmp.find("client");
			    var body = output.get("v.body");
			    body.push(newCmp);
			    output.set("v.body", body);
			    that.setTargetCmp(testCmp, newCmp);
			    cmpCreated = true;
			}, componentConfig, null, true, true);
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
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testClientProvidedGrandChildServerProvider : {
        test : function(testCmp, expectedId) {
            this.setTargetCmp(testCmp, testCmp.find("CPBS"));
            testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "RootHelperRootInit",
                                         "ChildHelperChildInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderInit",
                                         "GrandChildServerProviderHelperGrandChildServerProviderRender",
                                         "ChildHelperChildRender",
                                         "RootHelperRootRender",
                                         "GrandChildServerProviderHelperGrandChildServerProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "RootHelperRootAfterrender" ];
            this.testStaticGrandChildServerProvider.test.call(this, testCmp, expectedId || "CPBS");
        }
    },
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testClientCreatedClientProvidedGrandChildServerProvider : {
        test : function(testCmp) {
            this.clientCreateAndTest(testCmp, {
                componentDef : "markup://auratest:componentClassClientProvider",
                attributes : {
                    values : {
                        requestDescriptor : "markup://auratest:componentClassGrandChildServerProvider",
                        id : "CCPBS"
                    }
                }
            }, this.testClientProvidedGrandChildServerProvider.test, "CCPBS");
        }
    },
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testIteratedClientProvidedGrandChildServerProvider : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true
        },
        test : function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ICPBS")[0]);
            this.testClientProvidedGrandChildServerProvider.test.call(this, testCmp, "ICPBS");
        }
    },
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testServerProvidedClientProvidingGrandChildServerProvider : {
        test : function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("SPCPBS"));
            this.testClientProvidedGrandChildServerProvider.test.call(this, testCmp, "SPCPBS");
        }
    },
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testIteratedServerProvidedGrandChildServerProvider : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true
        },
        test : function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ISPBS")[0]);
            this.testStaticGrandChildServerProvider.test.call(this, testCmp, "ISPBS");
        }
    },
    
    
    
///////////////////////////////////////   tests with componentClassGrandChildClinetProvider.cmp begin   /////////////////////////////////////////

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
						"RootHelperRootInit",
						"ChildHelperChildInit",
						"GrandChildClientProviderHelperGrandChildClientProviderInit",
						"GrandChildClientProviderHelperGrandChildClientProviderRender",
						"ChildHelperChildRender",
						"RootHelperRootRender",
						"GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
						"ChildHelperChildAfterrender",
						"RootHelperRootAfterrender" ];
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
                             "RootHelperRootValuechange",
                             "ChildHelperChildValuechange",
                             "GrandChildClientProviderHelperGrandChildClientProviderValuechange",
                             "GrandChildClientProviderHelperGrandChildClientProviderRerender",
                             "ChildHelperChildRerender",
                             "RootHelperRootRerender" ];
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
                             "RootHelperRootUnrender" ];
            that.assertLogs(testCmp, expected, function() {
                // then check after render again (same as initial without provide or init)
                testCmp.set("v.shouldRender", true);
                var expected = [ "GrandChildClientProviderHelperGrandChildClientProviderRender",
                                 "ChildHelperChildRender",
                                 "RootHelperRootRender",
                                 "GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
                                 "ChildHelperChildAfterrender",
                                 "RootHelperRootAfterrender" ];
                this.assertLogs(testCmp, expected);
            });
    	}
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
    
    //put GrandChildClientProvider in interation, verify it behaves the same of loading seperately
    testIteratedGrandChildClientProvider : {
        attributes : {
            iterationItems : "ONE,TWO",
            testGrandChildClientInIteration : true
        },
        test : [function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("GrandChildClientProviderInIteration")[0]);
            this.testGrandChildClientProvider_Init.test.call(this, testCmp, "GrandChildClientProviderInIteration");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Rerender.test.call(this, testCmp, "GrandChildClientProviderInIteration");
        }, function(testCmp) {
        	this.testGrandChildClientProvider_Unrender.test.call(this, testCmp, "GrandChildClientProviderInIteration");
        }]
    },
    
    //we create GrandChildClientProvider component dynamically, then verify it behave just like the one we load statically
    testClientCreatedGrandChildClientProvider : {
        test : [function(testCmp) {
            var componentConfig = {
                componentDef : "markup://auratest:componentClassGrandChildClientProvider",
                attributes : {
                    values : {
                        id : "ClientCreatedGrandChildClientProvider"
                    }
                }
            };
            var that = this;
			var cmpCreated = false;
			$A.componentService.newComponentAsync(that, function(newCmp) {
			    var output = testCmp.find("client");
			    var body = output.get("v.body");
			    body.push(newCmp);
			    output.set("v.body", body);
			    that.setTargetCmp(testCmp, newCmp);
			    cmpCreated = true;
			}, componentConfig, null, true, true);
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
            var componentConfig = {
                componentDef : "markup://auratest:componentClassServerProvider",
                attributes : {
                    values : {
                        requestDescriptor : "markup://auratest:componentClassGrandChildClientProvider",
                        id : "ClientCreatedServerProvidedGrandChildClientProvider"
                    }
                }
            };
            var that = this;
			var cmpCreated = false;
			$A.componentService.newComponentAsync(that, function(newCmp) {
			    var output = testCmp.find("client");
			    var body = output.get("v.body");
			    body.push(newCmp);
			    output.set("v.body", body);
			    that.setTargetCmp(testCmp, newCmp);
			    cmpCreated = true;
			}, componentConfig, null, true, true);
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
    
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testClientProvidedGrandChildClientProvider : {
        test : function(testCmp, expectedId) {
            this.setTargetCmp(testCmp, testCmp.find("CPBC"));
            testCmp._initialExpected = [ "ClientProviderHelperClientProviderProvide",
                                         "RootHelperRootInit",
                                         "ChildHelperChildInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderInit",
                                         "GrandChildClientProviderHelperGrandChildClientProviderRender",
                                         "ChildHelperChildRender",
                                         "RootHelperRootRender",
                                         "GrandChildClientProviderHelperGrandChildClientProviderAfterrender",
                                         "ChildHelperChildAfterrender",
                                         "RootHelperRootAfterrender" ];
            this.testStaticGrandChildClientProvider.test.call(this, testCmp, expectedId || "CPBC");
        }
    },
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testIteratedClientProvidedGrandChildClientProvider : {
        attributes : {
            iterationItems : "ONE,TWO"
        },
        test : function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ICPBC")[0]);
            this.testClientProvidedGrandChildClientProvider.test.call(this, testCmp, "ICPBC");
        }
    },
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testClientCreatedClientProvidedGrandChildClientProvider : {
        test : function(testCmp) {
            this.clientCreateAndTest(testCmp, {
                componentDef : "markup://auratest:componentClassClientProvider",
                attributes : {
                    values : {
                        requestDescriptor : "markup://auratest:componentClassGrandChildClientProvider",
                        id : "CCPBC"
                    }
                }
            }, this.testClientProvidedGrandChildClientProvider.test, "CCPBC");
        }
    },
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testServerProvidedClientProvidingGrandChildClientProvider : {
        test : function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("SPCPBC"));
            this.testClientProvidedGrandChildClientProvider.test.call(this, testCmp, "SPCPBC");
        }
    },
    
    //this doesn't work when i start working on Gerald's branch, check it out later
    _testIteratedServerProvidedGrandChildClientProvider : {
        attributes : {
            iterationItems : "ONE,TWO",
            iterationForceServer : true
        },
        test : function(testCmp) {
            this.setTargetCmp(testCmp, testCmp.find("ServerProviderGrandChildClientProviderInIteration")[0]);
            this.testStaticGrandChildClientProvider.test.call(this, testCmp, "ServerProviderGrandChildClientProviderInIteration");
        }
    }
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
})