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
	 * Test making sure that getting element by Index works correctly
	 */
	testGettingTabByTabIndex : {
		attributes : {"renderItem" : "basic"},
        test: [function(cmp) {
        	this.activateElement(cmp, "Index");
        }, function(cmp){
        	this.verifyNewlyActivatedElement("Index", "Dashboards");
        }]
    },
    
    /**
     * Test trying to get element by its tab name
     */
    testGettingTabByTabName : {
    	attributes : {"renderItem" : "basic"},
        test: [function(cmp){
        	this.activateElement(cmp, "Name");
        }, function(cmp){
        	this.verifyNewlyActivatedElement("Name","Icon");
        }]
    },
    
    /**
     * Making sure that not have any tabs still works fine
     */
	testEmptyTab : {
		attributes : {"renderItem" : "noTabs"},
        test : function (cmp){
        	 var ulElem = cmp.find("noTabsTabSet").getElement().getElementsByTagName("ul")[0];
        	 var ulChldrn = this.ignoreComments(ulElem.children);
        	 $A.test.assertEquals(0, ulChldrn.length, "There should not be any tabs or errors present");
        }
	},
	
	/**
	 * Verifying lazy rendering works as expected, With Lazy rendering we should only have a new section 
	 * when we click on a tab and activate
	 */
	
	testLazyRendering : {
		attributes : {"renderItem" : "basic"},
        test : [function (cmp){
        	/*
        	 * Get the active tab and verify that it matches the correct section 
        	 * (in this case there should only be one section since we are loading things lazily)
        	 */
        	 var tabSet = cmp.find("tabset2").getElement();
        	 var section = tabSet.getElementsByTagName("section");       	
        	 $A.test.assertEquals(1, section.length, "Since we loading lazily we should only have one section on the page");
        	 
        	 //Verify that section and anchor aria-controled by id match
        	 this.matchSectionAndAnchor(cmp.find("chatter").get("v.title"), "tab 5 contents");
     
        	 //Click on the first item on the list
        	 var lis = tabSet.getElementsByTagName("li");
        	 $A.test.clickOrTouch(lis[6].children[0]);
        }, function (cmp){
        	 //Verify that the new active element is correct and its sections matches correctly
        	 this.matchSectionAndAnchor(cmp.find("dashboard").get("v.title"), "tab 7 contents");
        }]
	},
	
	/*************************************************************************************************************
     * HELPER FUNCTIONS
     ************************************************************************************************************/
	 /**
	  * Specifically for IE7/8 since grabbing all of the children from a parent element will include comments
	  */
	 ignoreComments : function(elements){
		   	 var elementArray = [];
	    
		     for(var i = 0; i < elements.length; i++){
		        if(elements[i].tagName != "!"){
		        	elementArray.push(chldrn[i]);
		        }
		     }
	    	return elementArray;		 
	 },
	 
	 /**
	  * Code extracted to be used to activate tab by name and by index
	  */
	 activateElement : function(cmp, activateBy){
     		//Pressing button to activate predetermined tab
	    	cmp.find("activateBy"+activateBy).get("e.press").fire({});
	    	var tmpFunc = this.getElement;
	    	$A.test.addWaitFor(true, function(){
	    		return ($A.util.getText(tmpFunc("li", "tabItem uiTabItem active")[0]).indexOf("Chatter") < 0);
	    	});
	 },
	 /**
	  * Verifying that the newly activated element is what we expect it to be
	  */
	 verifyNewlyActivatedElement : function (activateBy, text){
        	//Get newly activated tab
	    	var element = this.getElement("li", "tabItem uiTabItem active");
	    	//Verify that there is only one tab active
	    	$A.test.assertEquals(element.length, 1, "There should only be one active tab");
	    	$A.test.assertNotUndefinedOrNull(element[0], "Finding an active element should not be null");
	    	
	    	var elmText = $A.util.getText(element[0]);
	    	$A.test.assertEquals(text, elmText, "Did not find the correct tab by its' "+activateBy.toLowerCase());	    	
	 },
	 /**
	  * Helper code verifying that we are looking at the correct items
	  */
	 matchSectionAndAnchor : function(tabText, bodyText){

		 //Get Element in three different ways (1 way for ie7, 1 way for ie 8 and another way for all other browsers)
         var activeLi = this.getElement("li", "tabItem uiTabItem active");
		 var activeSection = this.getElement("section", "tabBody uiTab active");

		 $A.test.assertEquals(1, activeLi.length, "There should only be one active list element");		 
		 $A.test.assertEquals(1, activeSection.length, "There should only be one active section element");
		 
		 //Grab the only elements
		 activeLi = activeLi[0];
		 activeSection = activeSection[0];

		 var activeLiText = $A.util.getText(activeLi);
		 var activeSectionText = $A.util.getText(activeSection);
		 $A.test.assertEquals(tabText, activeLiText, "Text from the active tab, does not match what the text of the active tab should be");
		 $A.test.assertTrue(activeSectionText.indexOf(bodyText) > -1, "Text from the active section, does not match what the text of the active section should be");
		 
		 //check to make sure the correct items are set
		 var anchorAriaId = $A.util.getElementAttributeValue(activeLi.children[0], "aria-controls");
		 var sectionId = $A.util.getElementAttributeValue(activeSection, "id");
    	 $A.test.assertEquals(anchorAriaId, sectionId, "Aria Anchor Id and section Id do not match");
	},
	
	/**
	 * Extracted function so that we can use a more sophisticated way of getting the element by class
	 */
	getElement : function(elmTagName, classToUse){
		//All other browsers
		 var activeElm  = $A.test.getElementByClass(classToUse);
		 
		 //Custom way to get an element in ie8/7
		 if($A.util.isUndefinedOrNull(activeElm)) {
			 //IE8 custom way
			 if(document.querySelectorAll){
				 activeElm = document.querySelectorAll(elmTagName + "." +classToUse.replace(/ /g, "."));
			 }
			 //IE7 custom way
			 else{
				 activeElm = [];
				 var elmArray = document.getElementsByTagName(elmTagName);
				 var className = "";
				 for(var i = 0; i< elmArray.length; i++){
					 className = $A.util.getElementAttributeValue(elmArray[i], "class");
					 if(!$A.util.isUndefinedOrNull(className) && className.indexOf(classToUse) > -1){
						 activeElm.push(elmArray[i]);
					 }
				 }
			 }
			 
		 }
		 return activeElm;
	 }
})