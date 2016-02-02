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

    testComponentUseAttributesOfRemotePrivilegedComponentInController:{
        test:[
            function canNotUsePrivateAttribute(cmp){
                // No access private attribute on facet
                cmp.set("v.testType","Private");
                $A.test.expectAuraError("Access Check Failed!");

                cmp.find("testRemoteAttributes").getElement().click();
            },
            function canUsePublicAttribute(cmp){
                var expected="PUBLIC";
                cmp.set("v.testType","Public");

                cmp.find("testRemoteAttributes").getElement().click();

                $A.test.addWaitFor(expected,function(){
                    return $A.test.getTextByComponent(cmp.find("local"));
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
            },
            function canAccessPrivateEvent(cmp) {
                var expected = "markup://auratest:accessPrivateEvent";
                cmp.set("v.testType", "privateEvent");

                cmp.find("testEvent").getElement().click();

                var actual = cmp.get("v.output").getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals(expected, actual);
            }
        ]
    },

    testComponentCanAccessEventsOfRemotePrivilegedComponentFromController: {
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
           },
           function canAccessPrivateEvent(cmp) {
               // Cannot access remote private event
               var expected = null;
               cmp.set("v.testType", "privateEvent");
               $A.test.expectAuraError("Access Check Failed!");

               cmp.find("testRemoteEvent").getElement().click();

               var actual = cmp.get("v.output");
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

   testSetNonExistentAttribute: {
       test: function(cmp) {
           // One for the get old value on the set
           $A.test.expectAuraError("Access Check Failed!");
           // One for the set new value
           $A.test.expectAuraError("Access Check Failed!");
           // One for the final read into v.output
           $A.test.expectAuraError("Access Check Failed!");

           cmp.testSetNonExistentAttribute();
           $A.test.assertUndefined(cmp.get("v.output"), "Should not be able to set and retrieve attributes on a"
                   + " component that do not exist");
       }
   },

   testSetNonExistentRemoteAttribute: {
       test: function(cmp) {
           // One for the get old value on the set
           $A.test.expectAuraError("Access Check Failed!");
           // One for the set new value
           $A.test.expectAuraError("Access Check Failed!");
           // One for the final read into v.output
           $A.test.expectAuraError("Access Check Failed!");

           cmp.testSetNonExistentRemoteAttribute();
           $A.test.assertUndefined(cmp.get("v.output"), "Should not be able to set and retrieve attributes on a"
                   + " component that do not exist");
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
       function canAccessGlobalMethod(cmp) {
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

   testCanAccessRemotePublicMethod: {
       attributes: {
           "testType": "PUBLIC"
       },
       test: function(cmp) {
           cmp.find("testRemoteMethods").getElement().click();
           $A.test.assertEquals("publicMethod", cmp.find("remote").get("v.output"));
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

   // TODO(W-2769153): Should not be able to access facet's private method
   _testCanNotAccessRemotePrivateMethod: {
       attributes: {
           "testType": "PRIVATE"
       },
       test: function(cmp) {
           cmp.find("testRemoteMethods").getElement().click();
           $A.test.assertUndefined(cmp.find("remote").get("v.output"));
       }
   }
})
