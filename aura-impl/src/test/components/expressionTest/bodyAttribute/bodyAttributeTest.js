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
	clickGivenButtonToSetBody : function(cmp, buttonId, failureMsg){
		var idsToDestroy = ["clearRootBody", "setRootBody", "setRootBody_ReUse", "rootDiv", 
                            "rootDivsBody", "rootButton", "facetButton", "clearFacetButtonBody", 
                            "facetCmp", "clearFacetCmpBody"];
		var finder = cmp.getDef().getHelper();
		cmp._toDestroy = finder.findCmpsById(cmp, idsToDestroy);
		$A.test.clickOrTouch(cmp.find(buttonId).getElement());
		$A.test.addWaitForWithFailureMessage(
				true, 
				function(){
					return $A.util.isEmpty(finder.findCmpsById(cmp, idsToDestroy));
				},
				failureMsg
				);
	},
	verifyCmpsAreInvalid:function(cmps){
		for(var i in cmps){
			$A.test.assertFalse(cmps[i].isValid());
		}
	},
	/**
	 * Verify that setting the root component's body to an empty array will clean the 
	 * body markup and auto destroy the components in v.body
	 * The test also verifies that the destroy is recursive.
	 */
	testSettingBodyOfRootComponentToEmptyArray: {
		test:[function(cmp){
			this.clickGivenButtonToSetBody(cmp, "clearRootBody", "Failed to clean body of root component, still able to access body cmps by aura:id");
		},function(cmp){
			this.verifyCmpsAreInvalid(cmp._toDestroy);
			//TODO: W-2352999 Even after clearing all components, there is a dom element belonging to this component
			//$A.test.assertTrue($A.util.isEmpty(cmp.getElement()));
			$A.test.assertTrue($A.util.isEmpty($A.test.getTextByComponent(cmp)));
		}]
	},
	/**
	 * Verify that if a facet component included in the root component is accessed and its v.body set to an empty array,
	 * the body of the facet is cleaned.
	 * The facet in this case has its own body, the body is defined in the facet component's markup.
	 */
	testSettingBodyOfAFacetToEmptyArray:{
		test:[function(cmp){
			var facetButton = cmp.find("facetButton");
			var finder = cmp.getDef().getHelper();
			cmp._toDestroy = finder.findCmpsById(facetButton, ["button", "span", "hidden"]);
			$A.test.clickOrTouch(cmp.find("clearFacetButtonBody").getElement());
			$A.test.addWaitForWithFailureMessage(
					true, 
					function(){
						return $A.util.isEmpty(finder.findCmpsById(facetButton, ["button", "span", "hidden"]));
					},
					"Failed to clean body of facet component, still able to access body cmps by aura:id");
		},function(cmp){
			var facetButton = cmp.find("facetButton");
			this.verifyCmpsAreInvalid(cmp._toDestroy);
			$A.test.assertTrue($A.util.isEmpty(facetButton.getElement()), "Expected facet to be empty");
			$A.test.assertTrue($A.util.isEmpty($A.test.getTextByComponent(facetButton)), "Expected facet to have no html markup on page");
		}]
	},
	
	/**
	 * Verify that if a facet component included in the root component is accessed and its v.body set to an empty array,
	 * the body of the facet is cleaned.
	 * The facet in this case does not have its own body, the body is defined in the root component's markup.
	 */
	testSettingBodyOfAFacetComponentWithBodyDefinedInRootMarkup:{
		test:[function(cmp){
			var facetCmp = cmp.find("facetCmp");
			var finder = cmp.getDef().getHelper();
			cmp._toDestroy = finder.findCmpsById(facetCmp, ["clearFacetCmpBody", "div"]);
			$A.test.clickOrTouch(cmp.find("clearFacetCmpBody").getElement());
			$A.test.addWaitForWithFailureMessage(
					true, 
					function(){
						return $A.util.isEmpty(finder.findCmpsById(facetCmp, ["clearFacetCmpBody", "div"]));
					},
					"Failed to clean body of facet component, still able to access body cmps by aura:id");
		},function(cmp){
			var facetCmp = cmp.find("facetCmp");
			this.verifyCmpsAreInvalid(cmp._toDestroy);
			//TODO: W-2352999 Even after clearing all components, there is a dom element belonging to this component
			//$A.test.assertTrue($A.util.isEmpty(facetCmp.getElement()));
			$A.test.assertTrue($A.util.isEmpty($A.test.getTextByComponent(facetCmp)), "Expected facet to have no html markup on page");
		}]
	},
	/**
	 * Verify that setting the root component's body will clean the 
	 * body markup and auto destroy the components in v.body
	 */
	testSettingBodyOfComponent: {
		test:[function(cmp){
			this.clickGivenButtonToSetBody(cmp, "setRootBody", "Failed to auto destroy components in body of root component, still able to access old body cmps by aura:id");
		},function(cmp){
			this.verifyCmpsAreInvalid(cmp._toDestroy);
			//Verify new component is pushed to body of root component
			var newCmp = cmp.find("newCmpOnRootbody");
			$A.test.assertNotUndefinedOrNull(newCmp, "Unable to find new component on root");
			$A.test.assertTrue(newCmp.isRendered(), "New component not rendered");
			$A.test.assertEquals("New button cmp on v.body of root component", $A.test.getTextByComponent(cmp), 
					"Expected content of new component not seen on page");
		}]
	},
	
	/**
	 * Verify that setting the root component's body will clean the 
	 * body markup and auto destroy the components in v.body
	 */
	testSettingBodyOfComponent_ReuseExistingComponent: {
		test:[function(cmp){
			var idsToDestroy = ["clearRootBody", "setRootBody", "rootDiv", 
	                            "rootDivsBody", "rootButton", "facetButton", "clearFacetButtonBody", 
	                            "facetCmp", "clearFacetCmpBody"];
			var finder = cmp.getDef().getHelper();
			cmp._toDestroy = finder.findCmpsById(cmp, idsToDestroy);
			$A.test.clickOrTouch(cmp.find("setRootBody_ReUse").getElement());
			$A.test.addWaitForWithFailureMessage(
					true, 
					function(){
						return $A.util.isEmpty(finder.findCmpsById(cmp, idsToDestroy));
					},
					"Failed to auto destroy components in body of root component, still able to access body cmps by aura:id");
		},function(cmp){
			this.verifyCmpsAreInvalid(cmp._toDestroy);
			//Verify the component that was marked for reuse was not destroyed
			var reusedCmp = cmp.find("setRootBody_ReUse");
			$A.test.assertNotUndefinedOrNull(reusedCmp);
			$A.test.assertTrue(reusedCmp.isValid());
			$A.test.assertTrue(reusedCmp.isRendered());
			
			//Verify the new component set on body is rendered
			var newCmp = cmp.find("newCmpOnRootbody");
			$A.test.assertNotUndefinedOrNull(newCmp);
			$A.test.assertTrue(newCmp.isRendered());
			
			$A.test.assertEquals("New button cmp on v.body of root component", $A.test.getTextByComponent(newCmp));
			$A.test.assertEquals("Set Body of Root Cmp to new cmp array which reuses some existing cmps", $A.test.getTextByComponent(reusedCmp));
			//TODO W-2352999: Seems like we are leaving references to elements, could be resulting in performance problems?
			//$A.test.assertEquals("New button cmp on v.body of root componentSet Body of Root Cmp to new cmp array which reuses some existing cmps", 
			//		$A.test.getTextByComponent(cmp));
		}]
	}
})