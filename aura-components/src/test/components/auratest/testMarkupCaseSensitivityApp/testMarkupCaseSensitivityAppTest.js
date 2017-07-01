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
    //Most of these tests are positive case, in the sense where we can load this App. Error cases will be test in UI test.
    /**
     * Used to be that we had issues with the 'canonical' descriptor being set by first access. This test catches
     * that problem. All descriptors should be mapped to their canonical form now.
     */
    testMarkupNamespace: {
        test: function(cmp) {
            var facetsArray = cmp.getDef().getFacets()[0];
                    $A.test.assertEquals("markup://componentTest:hasBody",
                    facetsArray.value[1].componentDef.descriptor,
                    "1st facet <componentTEST:hasBody/> has wrong component descriptor");
            $A.test.assertEquals("markup://auratest:testMarkupCaseSensitivityOuterCmp",
                    facetsArray.value[2].componentDef.descriptor,
                    "2nd facet <auraTEST:TESTMarkupCaseSensitivityOuterCmp/> has wrong component descriptor");
        }
    },

    /**
     * we have <componentTest:HASBody/> in markup
     * here we verify we get and cache the component with 'correct' case, also createComponent with wrong case works
     */
    testMarkupCmpName: {
        test: function(cmp) {
            var hasBodyCreated = false;
            $A.createComponent("componentTest:hasBody",
                    {},
                    function(newCmp) {
                        $A.test.assertEquals("markup://componentTest:hasBody",
                                newCmp.getDef().getDescriptor().getQualifiedName(), "Did not get expected component with hasBody");
                        hasBodyCreated = true;
                    }
            );
            var HASBodyCreated = false;
            $A.createComponent("componentTest:HASBody",
                    {},
                    function(newCmp) {
                        $A.test.assertEquals("markup://componentTest:hasBody",
                                newCmp.getDef().getDescriptor().getQualifiedName(), "Did not get expected component with HASBody");
                        HASBodyCreated = true;
                    }
            );
            $A.test.addWaitForWithFailureMessage(true, function() { return hasBodyCreated; },
                    "fail to create hasBody");
            $A.test.addWaitForWithFailureMessage(true, function() { return HASBodyCreated; },
                    "fail to create HASBody");
        }
    },

    testMarkupNestedCmp : {
        test: function(cmp) {
            var strOuterCmp = "I'm outer cmp that contains a inner cmp in markup, the inner cmp's name has wrong case";
            var strInnerCmp = "I'm inner cmp that inside an outer cmp's markup";
            $A.test.assertTrue($A.test.getText(cmp.getElements()[0]).indexOf(strOuterCmp) >= 0, "Fail to load OuterCmp");
            $A.test.assertTrue($A.test.getText(cmp.getElements()[1]).indexOf(strInnerCmp) >= 0, "Fail to load InnerCmp");
        }
    },

    /**
     * we have <aura:dependency resource="appCache:SLATE" type="COMPONENT"/> in markup
     * This verify that dependency actually get us appCache:slate, not appCache:SLATE
     */
    testDependency: {
        test: function(cmp) {
            var slateCreated = false;
            //Verify dependency loaded with 'correct' case, even markup says different
            $A.createComponent("appCache:slate",
                    {},
                    function(newCmp) {
                        $A.test.assertEquals("markup://appCache:slate",
                                newCmp.getDef().getDescriptor().getQualifiedName(),
                                "Dependency did not load for appCache:slate");
                        slateCreated = true;
                    }
            );
            var SLATECreated = false;
            //Verify getting appCache:SLATE with wrong case will error out
            $A.createComponent("appCache:SLATE",
                    {},
                    function(newCmp,status,message) {
                        // FIXME? this has always been broken this way. it always goes to the server.
                        //$A.test.assertEquals(null,newCmp,"Getting wrong case component should return fail");
                        //var expectedErrorMsg = "org.auraframework.throwable.quickfix.DefinitionNotFoundException: No COMPONENT named markup://appCache:SLATE found";
                        //$A.test.assertTrue(message.indexOf(expectedErrorMsg) >=0 );
                        $A.test.assertEquals("markup://appCache:slate",
                                newCmp.getDef().getDescriptor().getQualifiedName(),
                                "Dependency did not load for appCache:slate");
                        SLATECreated = true;
                    }
            );
            $A.test.addWaitForWithFailureMessage(true, function() { return slateCreated; },
            "fail to create slate");
            $A.test.addWaitForWithFailureMessage(true, function() { return SLATECreated; },
            "fail to create SLATE");
        }
    },

    /**
     * This test verify once the lib (test_Library.lib) is imported, function in it is case sensitive.
     * Also if we import the lib file with wrong case name, it will get imported as undefined.
     * for other issues, see comment in the app.
     */
    testLib : {
        test: function(cmp) {
            var helper = cmp.getDef().getHelper();
            //we include basicFirst in test_Library.lib
            $A.test.assertTrue(helper.importED.BASICFIRST == undefined, "function name is case sensitive");
            //we have <aura:import library="test:TEST_Library" property="importedWithWrongCase" />  in markup
            $A.test.assertTrue(helper.hasOwnProperty('importedWithWrongCase'), "lib imported with wrong case should still be part of helper");
            $A.test.assertTrue(helper.importedWithWrongCase === undefined, "lib imported with wrong case should be undefined");
        }
    },

    /**
     * Aura clientLibrary, when imported just by name, the name is case sensitive.
     */
    testClientLib : {
        test: function(cmp) {
            // We have register(new AuraResourceResolver("CkEditor", ClientLibraryDef.Type.JS,
            // "ckeditor/ckeditor-4.x/rel/ckeditor.js",  "ckeditor/ckeditor-4.x/rel/ckeditor.js"));
            // in ClientLibraryResolverRegistryImpl.java
            // In ckeditor.js, we have window.CKEDITOR = blablalba, hence the CKEDITOR down there
            // However in the test app markup, we use the wrong name ("ckEDITOR" instead of "CkEditor"),
            // so it won't load
            $A.test.assertTrue(window.CKEDITOR === undefined, "clientLibrary CkEDITOR shouldn't get loaded");
        }
    }
})
