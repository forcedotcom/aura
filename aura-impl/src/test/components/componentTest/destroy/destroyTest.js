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
    /**
     * Calling destroy on a facet which has its own facet.
     * Each level of facet evaluating v.body in its markup.
     */
    testDestroyOnChainedFacet:{
	test:[
	      function(cmp){//Before Destroy
		  $A.test.assertDefined(cmp.find("outerFacet"));
		  $A.test.assertDefined(cmp.find("innerFacet1"));
		  $A.test.assertDefined(cmp.find("innerFacet2"));
		  $A.test.assertEquals(5, cmp.find("team").getElement().childNodes.length);
	      },function(cmp){//Destroy
		  var outerFacet = cmp.find("outerFacet");
		  try{
		      outerFacet.destroy(false);
		  }catch(e){
		      $A.test.fail("Component destroy() failed destroying chained facets with body:"+e)
		  }
	      },function(cmp){//After Destroy
		  $A.test.assertUndefinedOrNull(cmp.find("outerFacet"));
		  $A.test.assertUndefinedOrNull(cmp.find("textInOuterFacet"));
		  $A.test.assertUndefinedOrNull(cmp.find("bullPen"));
		  
		  $A.test.assertUndefinedOrNull(cmp.find("innerFacet1"));
		  $A.test.assertUndefinedOrNull(cmp.find("textInInnerFacet"));
		  $A.test.assertUndefinedOrNull(cmp.find("players"));
		  
		  $A.test.assertUndefinedOrNull(cmp.find("innerFacet2"));
		  $A.test.assertUndefinedOrNull(cmp.find("coach"));
		  
		  $A.test.assertEquals(0, cmp.find("team").getElement().childNodes.length);
	      }
	      ]
    },
    /**
     * Verify that destroy can handle reference loops in facets.
     * Cause a reference loop by making a facet aware of its parent using an attribute on the facet.
     * W-1584816
     */
    testDestroyOnParentAwareFacet:{
	test:[
	      function(cmp){
		  $A.test.assertDefined(cmp.find("informFacet"));
		  $A.test.assertDefined(cmp.find("knowParent"));
	      },function(cmp){
        	    var facet = cmp.find("informFacet");
        	    try{
        		facet.destroy()
        	    }catch(e){
        		$A.test.fail("Component destroy() failed to handle reference loops in facet:"+e)
        	    }
	      },function(cmp){
		  $A.test.assertUndefinedOrNull(cmp.find("informFacet"));
		  $A.test.assertUndefinedOrNull(cmp.find("knowParent"));
	      }]
    }
})