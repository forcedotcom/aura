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
 * WITHOUT WARRANTIES OR CONDITIOloNS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
	/**
	 * Test to verify action menu works when interacting with the menu items
	 * using AURA API  
	 */
	testActionMenu:{
		test: [function(cmp) {
				actionMenu = cmp.find("actionMenu");
	        	menuLabel = cmp.find("trigger");
	        	
	        	//check menu is default to hidden by using AURA API
	        	$A.test.assertFalse(actionMenu.get('v.visible'),"Action Menu should not be visible");
	            
	        	//check menu is default to hidden by using DOM API
	        	$A.test.assertTrue($A.util.hasClass(actionMenu.getElement(),"uiMenuList"), "Class name should be just uiMenuList");
	        	$A.test.assertFalse($A.util.hasClass(actionMenu.getElement(),"visible"), "Class name should not contain visible");
	        	menuLabel.get("e.click").fire();
	            
	            //Check if secondItem in the menu is disabled
	            $A.test.addWaitForWithFailureMessage(true, function(){return cmp.find("actionItem2").get("v.disabled");}, "Check if Item2 in the menu is disabled");
			}, function(cmp) {
				var disableAttrValue = cmp.find("actionItem1").get("v.disabled");
				$A.test.assertFalse(disableAttrValue,"Menu item 1 should be clickable");
				
				//check menu is visible by using AURA API
	        	$A.test.assertTrue(actionMenu.get('v.visible'),"Menu should be visible");
	            
	        	$A.test.assertTrue($A.util.hasClass(actionMenu.getElement(),"visible"), "Class name should be uiMenuList visible");
	        	
	        	//disable ActionItem1
	        	cmp.find("actionItem1").getAttributes().setValue("disabled", true);
	        	var disableAttrValue = cmp.find("actionItem1").get("v.disabled");
	            $A.test.assertTrue(disableAttrValue,"Menu item 1 should not be clickable");
	            
	            //click actionItem3 and check if label is updated
	            cmp.find("actionItem3").get("e.click").fire();
	            $A.test.addWaitForWithFailureMessage(cmp.find("actionItem3").get('v.label'), function(){return menuLabel.get('v.label')}, "Label should be updated to "+ cmp.find("actionItem3").get('v.label'));
	        }
        ]
    },
    
    /**
	 * Test to verify checkbox menu works when interacting with the menu items
	 * using AURA API  
	 */
    testCheckboxMenu:{
		test: [function(cmp) {
				menuLabel = cmp.find("checkboxMenuLabel");
				checkboxMenu = cmp.find("checkboxMenu");
				ouptutButton = cmp.find("checkboxButton");
				
				ouptutButton.get('e.press').fire();
				//check if default value is checked
				$A.test.addWaitForWithFailureMessage(cmp.find("checkboxItem4").get('v.label'), function(){return cmp.find("result").get('v.value')}, "Ouput Label should be updated to " + cmp.find("checkboxItem4").get('v.label'));
			},function(cmp){
				menuLabel.get("e.click").fire();
	            //Check if menu is visible
	            $A.test.addWaitForWithFailureMessage(true, function(){return $A.util.hasClass(checkboxMenu.getElement(),"visible")}, "Checkbox Menu Should be visible");
			}, function(cmp){
				//check item 1 is not selected
				$A.test.assertFalse(cmp.find("checkboxItem1").get('v.selected'),"Checkbox Menu item 1 should not be selected");
				//Select item1 from the list
				cmp.find("checkboxItem1").get('e.click').fire();
				$A.test.addWaitForWithFailureMessage(true, function(){return cmp.find("checkboxItem1").get('v.selected')}, "Checkbox Menu item 1 should be selected");
			}, function(cmp){
				menuLabel.get("e.click").fire();
				$A.test.addWaitForWithFailureMessage(false, function(){return $A.util.hasClass(checkboxMenu.getElement(),"visible")}, "Checkbox Menu Should be not be visible");
		    }, function(cmp){
		    	//check output result
				ouptutButton.get('e.press').fire();
				
				var expectedOutputText = cmp.find("checkboxItem1").get('v.label') + "," + cmp.find("checkboxItem4").get('v.label');
				$A.test.addWaitForWithFailureMessage(expectedOutputText, function(){return cmp.find("result").get('v.value')}, "Checkbox Menu Default value is not correct");
			},function(cmp){
				//uncheck item1 from the list
				cmp.find("checkboxItem1").get('e.click').fire();
				
				$A.test.addWaitForWithFailureMessage(false, function(){return cmp.find("checkboxItem1").get('v.selected')}, "Checkbox Menu item 1 should be unchecked");
			},function(cmp){
				//check output result
				ouptutButton.get('e.press').fire();
				
				var expectedOutputText = cmp.find("checkboxItem4").get('v.label');
				$A.test.addWaitForWithFailureMessage(expectedOutputText, function(){return cmp.find("result").get('v.value')}, "Checkbox Menu output text did not get updated");
			}
        ]
    },
    
    /**
	 * Test to verify radiobox menu works when interacting with the menu items
	 * using AURA API  
	 */
    testRadioMenu:{
		test: [function(cmp) {
				menuLabel = cmp.find("radioMenuLabel");
				radioMenu = cmp.find("radioMenu");
				ouptutButton = cmp.find("radioButton");
				item1 = cmp.find("radioItem1")
				item2 = cmp.find("radioItem2")
				
				menuLabel.get("e.click").fire();
				//check if menu is visible
				$A.test.addWaitForWithFailureMessage(true, function(){return $A.util.hasClass(radioMenu.getElement(),"visible")}, "Radio Menu should be visible");
			},function(cmp){
				//Select first item from the menu
				item1.get('e.click').fire();
				//check if first item is selected
				$A.test.addWaitForWithFailureMessage(true, function(){return item1.get('v.selected')}, "Radio Menu item 1 should be selected");
			},function(cmp){
				//select 2nd item from the menu
				item2.get('e.click').fire();
				$A.test.addWaitForWithFailureMessage(true, function(){return item2.get('v.selected')}, "Radio Menu item 2 should be selected");
			},function(cmp){
				//menu item 1 should be unchecked after selecting item2
				$A.test.assertFalse(item1.get('v.selected'),"Radio Menu item 1 should be unchecked");
				menuLabel.get("e.click").fire();
				$A.test.addWaitForWithFailureMessage(false, function(){return $A.util.hasClass(radioMenu.getElement(),"visible")}, "Radio Menu should not be visible");
	    	}, function(cmp){
	    		ouptutButton.get('e.press').fire();
				var expectedOutputText = item2.get('v.label');
				$A.test.addWaitForWithFailureMessage(expectedOutputText, function(){return cmp.find("radioResult").get('v.value')}, "Radio Menu output text did not get updated");
		  }
	    
        ]
    },
    
    /**
	 * Test to verify radiobox menu created using iteration cmp works when interacting with the menu items
	 * using AURA API 
	 * Test Case for W-1617363, W-1617518 
	 */
    testRadioMenuCreatedByIteration:{
		test: [function(cmp) {
				menuLabel = cmp.find("iterationTrigger");
				radioMenu = cmp.find("iterationRadioMenu");
				ouptutButton = cmp.find("radioIterationButton");
				menuItems = radioMenu.getValue("v.childMenuItems");
				item1 = menuItems.getValue(1);
				item2 = menuItems.getValue(2);
				
				menuLabel.get("e.click").fire();
				//check if menu is visible
				$A.test.addWaitForWithFailureMessage(true, function(){return $A.util.hasClass(radioMenu.getElement(),"visible")}, "Radio Menu created by Iteration should be visible");
			},function(cmp){
				//Select first item from the menu
				item1.get('e.click').fire();
				//check if first item is selected
				$A.test.addWaitForWithFailureMessage(true, function(){return item1.get('v.selected')}, "Radio Menu created by iteration should have item 1 selected");
			},function(cmp){
				//Test case for W-1617363
				$A.test.assertDefined(item1.get('v.value'),"value of item1 should be defined");
				$A.test.assertEquals(item1.get('v.value'), item1.get('v.label'), "Value of Item1 is not correct");
				//select 2nd item from the menu
				item2.get('e.click').fire();
				$A.test.addWaitForWithFailureMessage(true, function(){return item2.get('v.selected')}, "Radio Menu created by iteration should have item 2 selected");
			},function(cmp){
				//menu item 1 should be unchecked after selecting item2
				$A.test.assertFalse(item1.get('v.selected'),"Radio Menu item 1 should be unchecked");
				menuLabel.get("e.click").fire();
				$A.test.addWaitForWithFailureMessage(false, function(){return $A.util.hasClass(radioMenu.getElement(),"visible")}, "Radio Menu created by Iteration should not be visible");
	    	}, function(cmp){
	    		ouptutButton.get('e.press').fire();
				var expectedOutputText = item2.get('v.label');
				$A.test.addWaitForWithFailureMessage(expectedOutputText, function(){return cmp.find("radioIterationResult").get('v.value')}, "Output text did not get updated for Menu created by iteration");
		  }
	    
        ]
    },
    
    /**
	 * General Test to verify focus on menu item using AURA API  
	 */
    testFocusOnMenuItem:{
    	test:function(cmp){
				trigger = cmp.find("trigger");
				trigger.get("e.click").fire();
				var menuItem3 = cmp.find("actionItem3");
				menuItem3.get("e.mouseover").fire();
				$A.test.addWaitForWithFailureMessage(menuItem3.get('v.label'), function(){return $A.test.getActiveElementText()}, "Focus should be on item 3");
			}
	},
    
    /**
     * Test menu is positioned above if there is no space left at the bottom.
     * Test Case: W-1622773
     */
    testPositionOfMenu:{
    	test: [function(cmp) {
    		trigger = cmp.find("triggercheckPosition");
			menuList = cmp.find("checkPosition");
			menuListElement = menuList.getElement();
			item1 = cmp.find("checkPositionItem1").getElement();
			trigger.get("e.click").fire();
			$A.test.addWaitForWithFailureMessage(true, function(){return $A.util.hasClass(menuList.getElement(),"visible")}, "Menu Should be visible");
		},function(cmp){
			//check if expand event got fired - test case for W-1647658
			$A.test.assertTrue(cmp.get('v.expandEventFired'),"Expand event did not get fired");
			$A.test.assertFalse(cmp.get('v.collapseEventFired'),"Collapse event should not be fired");
        	
			topPropertyValue = $A.util.style.getCSSProperty(menuListElement,'top');
			//default value
			$A.test.assertTrue(parseInt(topPropertyValue) >=0 || topPropertyValue=="auto", "CSS property of MenuList should be auto or a positive value");
			viewPort = $A.util.getWindowSize();
			//change the height for item1 such that not enough space below
			item1.style.height = viewPort.height * 2 + "px";
			trigger.get("e.click").fire();
			$A.test.addWaitForWithFailureMessage(false, function(){return $A.util.hasClass(menuList.getElement(),"visible")}, "Menu Should not be visible");
		}, function(cmp){
			//check if collapse event got fired - test case for W-1647658
			$A.test.assertTrue(cmp.get('v.collapseEventFired'),"Collapse event did not get fired");
			$A.test.assertFalse(cmp.get('v.expandEventFired'),"Expand event should not be fired");
        	
			//open the menu
			trigger.get("e.click").fire();
			$A.test.addWaitForWithFailureMessage(true, function(){return $A.util.hasClass(menuList.getElement(),"visible")}, "Menu Should be visible after changing height of item1");
		}, function(cmp){
			topPropertyValue = $A.util.style.getCSSProperty(menuListElement,'top');
			$A.test.assertTrue(parseInt(topPropertyValue) < 0, "Menu is not position properly");
		}
	]
   },
   
   /**
	 * Test case for W-1636495
	 * Test to verify menuTrigger expands menuList since ui:menuList is extensible
	 */
   testMenuExpandWhenExtendFromMenuList:{
	   test:function(cmp){
				trigger = cmp.find("triggerLink");
				menuList = cmp.find("extendMenuList");
				trigger.get("e.click").fire();
				$A.test.addWaitForWithFailureMessage(true, function(){return $A.util.hasClass(menuList.getElement(),"visible")}, "Menu Should be be visible when you extend from menuList");
			}
   }
})