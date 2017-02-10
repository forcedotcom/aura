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
	
	labels : ["UnAdaptableTest"],
	
    testComponentCanUseAllAccessLevelsInMarkup:{
        test:function(cmp){
            var expected="PRIVATE\nPUBLIC\nINTERNAL\nGLOBAL";

            var actual=$A.test.getTextByComponent(cmp.find("local"));

            $A.test.assertEqualsIgnoreWhitespace(expected,actual);
        }
    },

    testComponentCanUseAllAccessLevelsOfAttributesInController:{
        test:[
            function canUsePrivateAttribute(cmp){
                var expected="PRIVATE";
                cmp.set("v.testType","Private");

                cmp.find("testAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            },
            function canUsePublicAttribute(cmp){
                var expected="PUBLIC";
                cmp.set("v.testType","Public");

                cmp.find("testAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            },
            function canUseInternalAttribute(cmp){
                var expected="INTERNAL";
                cmp.set("v.testType","Internal");

                cmp.find("testAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            },
            function canUseGlobalAttribute(cmp){
                var expected="GLOBAL";
                cmp.set("v.testType","Global");

                cmp.find("testAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            }
        ]
    },

    testComponentUseAttributesOfRemoteInternalComponentInController:{
        test:[
            function canNotUsePrivateAttribute(cmp){
                // No access private attribute on facet
                cmp.set("v.testType","Private");
                $A.test.expectAuraError("Access Check Failed!");
                
                cmp.find("testRemoteAttributes").getElement().click();
                $A.test.addWaitForWithFailureMessage(
                        true, 
                        function() {
                            return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                        },
                        "Didn't get ACF error box",
                        function() {
                            $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                    "Access Check Failed! AttributeSet.get(): attribute \'Private\' of component \'markup://componentTest:accessAttributes",
                                        "markup://auratest:access");
                 });
            },
            function canNotUsePublicAttribute(cmp){
                var expected="PUBLIC";
                cmp.set("v.testType","Public");
                $A.test.expectAuraError("Access Check Failed!");
                cmp.find("testRemoteAttributes").getElement().click();
                $A.test.addWaitForWithFailureMessage(
                        true, 
                        function() {
                            return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                        },
                        "Didn't get ACF error box",
                        function() {
                            $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                    "Access Check Failed! AttributeSet.get(): attribute \'Public\' of component \'markup://componentTest:accessAttributes",
                                        "markup://auratest:access");
                 });
            },
            function canUseInternalAttribute(cmp){
                var expected="INTERNAL";
                cmp.set("v.testType","Internal");

                cmp.find("testRemoteAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            },
            function canUseGlobalAttribute(cmp){
                var expected="GLOBAL";
                cmp.set("v.testType","Global");

                cmp.find("testRemoteAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
                });
            }
        ]
    },

    testComponentFromExternalNamespaceCanUseAllAccessLevelsInMarkup:{
        test:function(cmp){
            var expected="PRIVATE\nPUBLIC\nINTERNAL\nGLOBAL";

            var actual=$A.test.getTextByComponent(cmp.find("remote"));

            $A.test.assertEqualsIgnoreWhitespace(expected,actual);
        }
    },

    testComponentCanAccessEventsFromController: {
        test: [
            function canAccessGlobalEvent(cmp) {
                var expected = "markup://auratest:accessGlobalEvent";
                cmp.set("v.testType", "globalEvent");

                cmp.find("testEvent").getElement().click();

                var actual = cmp.get("v.output").getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals(expected, actual);
            },
            function canAccessPublicEvent(cmp) {
                var expected = "markup://auratest:accessPublicEvent";
                cmp.set("v.testType", "publicEvent");

                cmp.find("testEvent").getElement().click();

                var actual = cmp.get("v.output").getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals(expected, actual);
            },
            function canAccessInternalEvent(cmp) {
                var expected = "markup://auratest:accessInternalEvent";
                cmp.set("v.testType", "internalEvent");

                cmp.find("testEvent").getElement().click();

                var actual = cmp.get("v.output").getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    testComponentCanAccessEventsOfRemoteInternalComponentFromController: {
        test: [
           function canAccessGlobalEvent(cmp) {
               var expected = "markup://auratest:accessGlobalEvent";
               cmp.set("v.testType", "globalEvent");

               cmp.find("testRemoteEvent").getElement().click();

               var actual = cmp.get("v.output").getDef().getDescriptor().getQualifiedName();
               $A.test.assertEquals(expected, actual);
           },
           function canAccessPublicEvent(cmp) {
               var expected = "markup://auratest:accessPublicEvent";
               cmp.set("v.testType", "publicEvent");

               cmp.find("testRemoteEvent").getElement().click();

               var actual = cmp.get("v.output").getDef().getDescriptor().getQualifiedName();
               $A.test.assertEquals(expected, actual);
           },
           function canAccessInternalEvent(cmp) {
               var expected = "markup://auratest:accessInternalEvent";
               cmp.set("v.testType", "internalEvent");

               cmp.find("testRemoteEvent").getElement().click();

               var actual = cmp.get("v.output").getDef().getDescriptor().getQualifiedName();
               $A.test.assertEquals(expected, actual);
           }
       ]
   },

   testComponentCanClientSideCreateGlobalComponentOnServerFromController: {
       test: function(cmp) {
           var expected = "markup://auratest:accessGlobalComponent";
           cmp.set("v.testType", expected);

           cmp.find("testComponent").getElement().click();

           $A.test.addWaitFor(
                   true, 
                   function(){ return cmp.get("v.testDone") },
                   function(){ 
                       $A.test.assertEquals(expected, cmp.get("v.output").getDef().getDescriptor().getQualifiedName());
                   });
       }
   },

   testComponentCanClientSideCreatePublicComponentOnServerFromController: {
       test: function(cmp) {
           var expected = "markup://auratest:accessPublicComponent";
           cmp.set("v.testType", expected);

           cmp.find("testComponent").getElement().click();

           $A.test.addWaitFor(
                   true, 
                   function(){ return cmp.get("v.testDone") },
                   function(){ 
                       $A.test.assertEquals(expected, cmp.get("v.output").getDef().getDescriptor().getQualifiedName());
                   });
       }
   },

   testComponentCanClientSideCreateInternalComponentOnServerFromController: {
       test: function(cmp) {
           var expected = "markup://auratest:accessInternalComponent";
           cmp.set("v.testType", expected);

           cmp.find("testComponent").getElement().click();

           $A.test.addWaitFor(
                   true, 
                   function(){ return cmp.get("v.testDone") },
                   function(){ 
                       $A.test.assertEquals(expected, cmp.get("v.output").getDef().getDescriptor().getQualifiedName());
                   });
       }
   },

   testComponentCanClientSideCreateGlobalComponentOnClientFromController: {
       test: [
           function cacheCmpOnClient(cmp) {
               var completed = false;
               $A.createComponent("markup://auratest:accessGlobalComponent", {}, function(){ completed = true;});
               $A.test.addWaitFor(true, function(){ return completed; });
           },
           function createCmpOnClientAndVerify(cmp) {
               var expected = "markup://auratest:accessGlobalComponent";
               cmp.set("v.testType", expected);

               cmp.find("testComponent").getElement().click();

               $A.test.addWaitFor(
                       true, 
                       function(){ return cmp.get("v.testDone") },
                       function(){ 
                           $A.test.assertEquals(expected, cmp.get("v.output").getDef().getDescriptor().getQualifiedName());
                       });
           }
       ]
   },

   testComponentCanClientSideCreatePublicComponentOnClientFromController: {
       test: [
           function cacheCmpOnClient(cmp) {
               var completed = false;
               $A.createComponent("markup://auratest:accessPublicComponent", {}, function(){ completed = true;});
               $A.test.addWaitFor(true, function(){ return completed; });
           },
           function createCmpOnClientAndVerify(cmp) {
               var expected = "markup://auratest:accessPublicComponent";
               cmp.set("v.testType", expected);

               cmp.find("testComponent").getElement().click();

               $A.test.addWaitFor(
                       true, 
                       function(){ return cmp.get("v.testDone") },
                       function(){ 
                           $A.test.assertEquals(expected, cmp.get("v.output").getDef().getDescriptor().getQualifiedName());
                       });
           }
       ]
   },

   testComponentCanClientSideCreateInternalComponentOnClientFromController: {
       test: [
           function cacheCmpOnClient(cmp) {
               var completed = false;
               $A.createComponent("markup://auratest:accessInternalComponent", {}, function(){ completed = true;});
               $A.test.addWaitFor(true, function(){ return completed; });
           },
           function createCmpOnClientAndVerify(cmp) {
               var expected = "markup://auratest:accessInternalComponent";
               cmp.set("v.testType", expected);

               cmp.find("testComponent").getElement().click();

               $A.test.addWaitFor(
                       true, 
                       function(){ return cmp.get("v.testDone") },
                       function(){ 
                           $A.test.assertEquals(expected, cmp.get("v.output").getDef().getDescriptor().getQualifiedName());
                       });
           }
       ]
   },
   
    /**************************************************************************************************
	    Test for creating component belong to custom namespace starts
	***************************************************************************************************/
   testCreateComponentWithDefaultAccessOfCustomNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testCustomNS2:componentWithDefaultAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getType(),"testCustomNS2:componentWithDefaultAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        	 $A.test.addWaitForWithFailureMessage(
                     true, 
                     function() {
                         return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                     },
                     "Didn't get ACF error box",
                     function() {
                         $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                 "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS2:componentWithDefaultAccess",
                                     "markup://auratest:access");
              });
        },
        function canAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    testCreateComponentWithPublicAccessOfCustomNS:{
        test:[
        function canCreateComponentWithPublicAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testCustomNS2:componentWithPublicAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getType(),"testCustomNS2:componentWithPublicAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        	$A.test.addWaitForWithFailureMessage(
                    true, 
                    function() {
                        return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                    },
                    "Didn't get ACF error box",
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS2:componentWithPublicAccess",
                                    "markup://auratest:access");
             });
        },
        function canAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    testCreateComponentWithGlobalAccessOfCustomNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testCustomNS2:componentWithGlobalAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getType(),"testCustomNS2:componentWithGlobalAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });   
        },
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        	$A.test.addWaitForWithFailureMessage(
                    true, 
                    function() {
                        return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                    },
                    "Didn't get ACF error box",
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testCustomNS2:componentWithGlobalAccess",
                                    "markup://auratest:access");
             });
        },
        function canAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
   
   /**************************************************************************************************
	    Test for creating component belong to Privileged namespace starts
	***************************************************************************************************/
	
	testCreateComponentWithDefaultAccessOfPrivilegedNS:{
        test:[
        function canCreateComponentWithDefaultAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS1:componentWithDefaultAccess", 
            	{}, 
            	function(newCmp){
            		$A.test.assertEquals(newCmp.getType(),"testPrivilegedNS1:componentWithDefaultAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        	$A.test.addWaitForWithFailureMessage(
                    true, 
                    function() {
                        return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                    },
                    "Didn't get ACF error box",
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testPrivilegedNS1:componentWithDefaultAccess",
                                    "markup://auratest:access");
             });
        },
        function canAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    testCreateComponentWithPublicAccessOfPrivilegedNS:{
        test:[
        function canCreateComponentWithPublicAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS1:componentWithPublicAccess", 
            	{}, 
            	function(newCmp){
            		//$A.test.assertEquals(newCmp.getName(),"testPrivilegedNS1:componentWithPublicAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        	$A.test.addWaitForWithFailureMessage(
                    true, 
                    function() {
                        return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                    },
                    "Didn't get ACF error box",
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute \'privateAttribute\' of component \'markup://testPrivilegedNS1:componentWithPublicAccess",
                                    "markup://auratest:access");
             });
        },
        function canAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    testCreateComponentWithGlobalAccessOfPrivilegedNS:{
        test:[
        function canCreateComponentWithGlobalAccess(cmp){
        	var completed = false;
        	var that = this;
            $A.createComponent(
            	"markup://testPrivilegedNS1:componentWithGlobalAccess", 
            	{}, 
            	function(newCmp){
            		//$A.test.assertEquals(newCmp.getName(),"testPrivilegedNS1:componentWithGlobalAccess");
            		that.componentCreated = newCmp;
            		completed = true;
            	}
            );
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function cannotAccessPrivateAttribute(cmp) {
        	$A.test.expectAuraError("Access Check Failed!");
        	var actual = this.componentCreated.get("v.privateAttribute");
        },
        function cannotAccessPublicAttribute(cmp) {
        	var actual = this.componentCreated.get("v.publicAttribute");
        	$A.test.assertEquals(actual, "PUBLIC");
        },
        function canAccessGlobalAttribute(cmp) {
        	var actual = this.componentCreated.get("v.globalAttribute");
        	$A.test.assertEquals(actual, "GLOBAL");
        }
        ]
    },
    
    
    


   testSetNonExistentAttribute: {
       test: function(cmp) {
           // One for the get old value on the set
           $A.test.expectAuraError("Access Check Failed! AttributeSet.get(): attribute \'iDontExist\' of component \'markup://auratest:access");
           // One for the set new value
           $A.test.expectAuraError("Access Check Failed! AttributeSet.set(): \'iDontExist\' of component \'markup://auratest:access");
           // One for the final read into v.output
           $A.test.expectAuraError("Access Check Failed!");
           
           cmp.testSetNonExistentAttribute();
           $A.test.assertUndefined(cmp.get("v.output"), "Should not be able to set and retrieve attributes on a"
                   + " component that do not exist");
           $A.test.addWaitForWithFailureMessage(
                   true, 
                   function() {
                       return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                   },
                   "Didn't get ACF error box",
                   function() {
                       $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                               "Access Check Failed! AttributeSet.get(): attribute \'iDontExist\' of component \'markup://auratest:access",
                                   "markup://auratest:access");
            });
       }
   },

   testSetNonExistentRemoteAttribute: {
       test: function(cmp) {
           // One for the get old value on the set
           $A.test.expectAuraError("Access Check Failed! AttributeSet.get(): attribute \'iDontExist\' of component \'markup://componentTest:accessAttributes");
           // One for the set new value
           $A.test.expectAuraError("Access Check Failed! AttributeSet.set(): \'iDontExist\' of component \'markup://componentTest:accessAttributes");
           // One for the final read into v.output
           $A.test.expectAuraError("Access Check Failed!");
           
           cmp.testSetNonExistentRemoteAttribute();
           $A.test.assertUndefined(cmp.get("v.output"), "Should not be able to set and retrieve attributes on a"
                   + " component that do not exist");
           $A.test.addWaitForWithFailureMessage(
                   true, 
                   function() {
                       return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                   },
                   "Didn't get ACF error box",
                   function() {
                       $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                               "Access Check Failed! AttributeSet.get(): attribute \'iDontExist\' of component \'markup://componentTest:accessAttributes",
                                   "markup://auratest:access");
            });
       }
   },

   testAuraMethodAccess: {
       test: [
       function canAccessGlobalMethod(cmp) {
           cmp.testMethods("GLOBAL");
           $A.test.assertEquals("globalMethod", cmp.get("v.output"));
       },
       function canAccessPublicMethod(cmp) {
           cmp.testMethods("PUBLIC");
           $A.test.assertEquals("publicMethod", cmp.get("v.output"));
       },
       function canAccessInternalMethod(cmp) {
           cmp.testMethods("INTERNAL");
           $A.test.assertEquals("internalMethod", cmp.get("v.output"));
       },
       function canAccessPrivateMethod(cmp) {
           cmp.testMethods("PRIVATE");
           $A.test.assertEquals("privateMethod", cmp.get("v.output"));
       }]
   },

   testCanAccessRemoteGlobalMethod: {
       attributes: {
           "testType": "GLOBAL"
       },
       test: function(cmp) {
           cmp.find("testRemoteMethods").getElement().click();
           $A.test.assertEquals("globalMethod", cmp.find("remote").get("v.output"));
       }
    },

    testCanNotAccessRemotePublicMethod: {
       attributes: {
           "testType": "PUBLIC"
       },
       test: function(cmp) {
           $A.test.expectAuraError("Access Check Failed!");
           cmp.find("testRemoteMethods").getElement().click(); 
           $A.test.addWaitForWithFailureMessage(
                   true, 
                   function() {
                       return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                   },
                   "Didn't get ACF error box",
                   function() {
                       $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                               "Access Check Failed! Component.method():\'markup://componentTest:publicMethod",
                                   "markup://auratest:access");
            });
       }
   },

   testCanAccessRemoteInternalMethod: {
       attributes: {
           "testType": "INTERNAL"
       },
       test: function(cmp) {
           cmp.find("testRemoteMethods").getElement().click();
           $A.test.assertEquals("internalMethod", cmp.find("remote").get("v.output"));
       }
   },

   testCanNotAccessRemotePrivateMethod: {
       attributes: {
           "testType": "PRIVATE"
       },
       test: function(cmp) {
           $A.test.expectAuraError("Access Check Failed!");
           cmp.find("testRemoteMethods").getElement().click();
           $A.test.assertUndefined(cmp.find("remote").get("v.output"));
           $A.test.addWaitForWithFailureMessage(
                   true, 
                   function() {
                       return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                   },
                   "Didn't get ACF error box",
                   function() {
                       $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                               "Access Check Failed! Component.method():\'markup://componentTest:privateMethod",
                                   "markup://auratest:access");
            });
           
       }
   }
   
    
})
