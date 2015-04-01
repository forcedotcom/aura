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
/**
 * Note: This test relies on the fact that labels in TestSuites are not processed by Aura.
 * JavascriptTestSuiteDefHandler.addExpressionReferences() is a no op. 
 * If that changes, then the label expressions in this test have to be changed from 
 * $A.get("$Label.Section1.controller") to $A.get("$Label.Section1."+"controller") to avoid the labels in test resulting in false positives.
 */
({
	/**
	 * Verify that labels are parsed from Javascript Controller and loaded in the client.
	 * No additional server roundtrip should be required to fetch such labels.
	 */
	testLabelsInControllerAreParsed:{ 
		test:function(cmp){
			//Block server requests to make sure the labels were not fetched from the server by the test script.
			$A.test.blockRequests();
			$A.test.assertEquals("Controller", $A.get("$Label.Section1.controller"), 
					"Label expression in controller not parsed and loaded in client.");
			$A.test.assertEquals("Controller", $A.get("$Label.Section2.controller"), 
					"All label expressions in controller not parsed and loaded in client.");
		}
	},
	/**
	 * Verify that labels are parsed from Javascript helper and loaded in the client.
	 * No additional server roundtrip should be required to fetch such labels.
	 */
	testLabelsInHelperAreParsed:{
		test:function(cmp){
			//Block server requests to make sure the labels were not fetched from the server by the test script.
			$A.test.blockRequests();
			$A.test.assertEquals("Helper", $A.get("$Label.Section1.helper"), 
					"Label expression in helper not parsed and loaded in client.");
			$A.test.assertEquals("Helper", $A.get("$Label.Section2.helper"), 
					"All label expressions in helper not parsed and loaded in client.");
			$A.test.assertEquals("Helper", $A.get("$Label.ML_Comment.helper"), 
					"Label expressions in multi line comment not parsed.");
			$A.test.assertEquals("Helper", $A.get("$Label.SL_Comment.helper"), 
					"Label expressions in single line comment not parsed.");
			$A.test.assertEquals("Helper", $A.get("$Label.Section5.helper"), 
					"Label expressions enclosed in delimiters not parsed.");
		}
	},
	/**
	 * Verify that labels are parsed from Javascript renderer and loaded in the client.
	 * No additional server roundtrip should be required to fetch such labels.
	 */
	testLabelsInRendererAreParsed:{
		test:function(cmp){
			//Block server requests to make sure the labels were not fetched from the server by the test script.
			$A.test.blockRequests();
			$A.test.assertEquals("Renderer", $A.get("$Label.Section1.renderer"), 
					"Label expression in render function not parsed and loaded in client.");
			$A.test.assertEquals("Renderer", $A.get("$Label.Section2.renderer"), 
					"All label expressions in afterRender function not parsed and loaded in client.");
			$A.test.assertEquals("Renderer", $A.get("$Label.Section3.renderer"), 
					"All label expressions in rerender function not parsed and loaded in client.");
		}
	},
	/**
	 * BUG W-2207636: Updating LabelValueProvider while joining context encounters an error if sections have the wrong case.
	 * Also $A.get("$Label.section.item") is not case sensitive about the section and item specifier in the client. 
	 * But the server is case sensitive about these two parameters.
	 * 
	 *  In this particular test case, take a look at curiousCaseOfBenjamin() in the helper.js file. 
	 *  The two label expressions only differ by a single letter in their section. 
	 *  Because of the way we create a MapValue while joining gvps, we overwrite one of the sections.
	 */
	_testCaseInsensitiveLabels:{
		test : function(cmp){
			$A.test.blockRequests();
			$A.test.assertEquals("Controller", $A.get("$Label.Section_A.controller"), 
					"Label expression with incorrectly cased section was not parsed");
			$A.test.assertEquals("Helper", $A.get("$Label.Section_a.helper"), 
					"Case insensitive section name resulted in dropping of the labels of a section");
			
			$A.test.assertEquals("Helper", $A.get("{!$Label.Section_B.helper}"), 
					"Case insensitive label name resulted in dropping of the labels of a section");
		}
	},
	/**
	 * Verify that labels are parsed from Javascript provider and loaded in the client.
	 * No additional server roundtrip should be required to fetch such labels.
	 */
	testLabelsInProviderAreParsed:{
		test:function(cmp){
			//Block server requests to make sure the labels were not fetched from the server by the test script.
			$A.test.blockRequests();
			$A.test.assertEquals("Provider", $A.get("$Label.Section1.provider"), 
					"Label expression in provider not parsed and loaded in client.");
			$A.test.assertEquals("Provider", $A.get("$Label.Section2.provider"), 
					"All label expressions in provider not parsed and loaded in client.");
			$A.test.assertEquals("Provider", $A.get("$Label.Section3.provider"), 
                    "All label expressions in provider not parsed and loaded in client.");
		}
	},

	/**
	 * Verify that labels are parsed from Javascript library and loaded in the client.
	 * No additional server roundtrip should be required to fetch such labels.
	 */
	testLabelsInLibraryAreParsed:{
		test:function(cmp){
			//Block server requests to make sure the labels were not fetched from the server by the test script.
			$A.test.blockRequests();
			$A.test.assertEquals("Library1", $A.get("$Label.Section1.library"), 
					"Label expression in library not parsed and loaded in client.");
			$A.test.assertEquals("Library2", $A.get("$Label.Section2.library"), 
					"Label reference in comment in library not parsed and loaded in client.");
		}
	},

    /**
     * Verify that labels not parsed from Javascript library can still be loaded async.
     */
    testLabelsInUnparseableLibraryAreStillRetrievable:{
        test:function(cmp){
            //Block server requests to make sure the labels were not fetched from the server by the test script.
            $A.test.blockRequests();
            $A.test.assertEquals("[Section1.badlibrary]", $A.get("$Label.Section1.badlibrary"), 
                    "Label expression in library should not have been parsed and loaded in client.");
            $A.test.assertEquals("[Section2.badlibrary]", $A.get("$Label.Section2.badlibrary"), 
                    "Label reference in comment in library should not have been parsed and loaded in client.");
            
            // Resume normal operation and check that unparsed labels are now retrieved.
            $A.test.releaseRequests();
            $A.test.addWaitFor("BadLibrary2", function(){
                return cmp.helper.pll.badlabel();
            });
        }
    }
})
