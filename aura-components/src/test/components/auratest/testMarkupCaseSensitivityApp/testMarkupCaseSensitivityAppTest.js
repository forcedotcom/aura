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
	 *  disabled because W-2892452
	 *  W-2891817: we have <componentTEST:hasBody/> as 2nd facet,  <auraTEST:TESTMarkupCaseSensitivityOuterCmp/>
    	as 3rd facet, both of them get the namespace with wrong case
    	however we only honor the wrong namespace in the 3rd facet
    	because we have the correct one as 1st facet: <componentTest:HASBody/>, and it get cached, what 2nd one say doesn't matter
    	
    	also notice we have TESTMarkupCaseSensitivityOuterCmp (wrong case), but component get the correct case anyway
	 */
	_testMarkupNamespace: {
		test: function(cmp) {
			var facetsArray = cmp.getDef().getFacets()[0];
	    			$A.test.assertEquals("markup://componentTest:hasBody",
					facetsArray.value[1].componentDef.descriptor,
        			"1st facet <componentTEST:hasBody/> has wrong component descriptor");
			$A.test.assertEquals("markup://auraTEST:testMarkupCaseSensitivityOuterCmp",
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
     * we have <aura:dependency resource="appCache:WITHPRELOAD" type="APPLICATION"/> in markup
     * This verify that dependency actually get us appCache:withpreload, not appCache:WITHPRELOAD
     */
    testDependency: {
    	test: function(cmp) {
    		var withpreloadCreated = false;
    		//Verify dependency loaded with 'correct' case, even markup says different
    		$A.createComponent("appCache:withpreload",
                    {},
                    function(newCmp) {
                    	$A.test.assertEquals("markup://appCache:withpreload", 
                    			newCmp.getDef().getDescriptor().getQualifiedName(), 
                    			"Dependency did not load for appCache:withpreload");
                    	$A.test.assertEquals("markup://appCache:slate",
                    			newCmp.getDef().getFacets()[0].value[0].componentDef.descriptor,
                    			"appCache:WITHPRELOAD should have appCache:slate in its body");
                    	withpreloadCreated = true;
                    }
            );
    		var WITHPRELOADCreated = false;
    		//Verify getting appCache:withpreload with wrong case will error out
    		$A.createComponent("appCache:WITHPRELOAD",
                    {},
                    function(newCmp) {
                    	$A.test.assertEquals("markup://aura:text", 
                    			newCmp.getDef().getDescriptor().getQualifiedName(), 
                    			"Getting component that's not loaded as dependency should return aura:text");
                    	var expectedErrorMsg = "org.auraframework.throwable.quickfix.DefinitionNotFoundException: No COMPONENT named markup://appCache:WITHPRELOAD found";
                    	$A.test.assertTrue(newCmp.toString().indexOf(expectedErrorMsg) >=0 );
                    	WITHPRELOADCreated = true;
                    }
            );
    		$A.test.addWaitForWithFailureMessage(true, function() { return withpreloadCreated; }, 
			"fail to create withpreload");
    		$A.test.addWaitForWithFailureMessage(true, function() { return WITHPRELOADCreated; }, 
			"fail to create WITHPRELOAD");
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
     * Aura clientLibrary, when imported via url, the url is case sensitive.
     * when imported just by name, the name is case sensitive.
     */
    testClientLib : {
    	test: function(cmp) {
    		// look at clientLibraryTest/clientLibraryTestResourse.js
    		$A.test.assertTrue(clientLibraryTest.cool === "awesome", "clientLibrary imported by url fail to load");
    		///we have register(new AuraResourceResolver("CkEditor", ClientLibraryDef.Type.JS, 
    		//"ckeditor/ckeditor-4.x/rel/ckeditor.js",  "ckeditor/ckeditor-4.x/rel/ckeditor.js"));
    	    //in ClientLibraryResolverRegistryImpl.java
    		//in ckeditor.js, we have window.CKEDITOR = blablalba, hence the CKEDITOR down there
    		//however in the test app markup, we use the wrong name ("ckEDITOR" instead of "CkEditor"), so it won't load
    		$A.test.assertTrue(window.CKEDITOR === undefined, "clientLibrary CkEDITOR shouldn't get loaded");
    	}
    }
	
})