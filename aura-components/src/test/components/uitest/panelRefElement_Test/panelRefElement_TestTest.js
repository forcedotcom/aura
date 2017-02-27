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
	 * Test that panel body and position is updated when the reference element is changed dynamically
	 * 
	 * Test Flow:
	 * 1. Click on 'RefElem2' button
	 * 2. A panel will be created and its reference element is RefElem2 (see controller)
	 * 3. Click on ChangeRefElem button; this will change the reference element to RefElem1
	 * 4. Check if panel body data is updated
	 * 5. Check if panel's position has been updated
	 * 
	 */
	 testReferenceElement: {
		test: [function(cmp) {
			var epsilon = 0.001;
			var firstPanelBody = "First panel body"; //defined in controller
			var referenceElement2 = cmp.find("refElement2");
			
			referenceElement2.get('e.press').fire();	
			
			$A.test.addWaitForWithFailureMessage(true, function(){	
				var panel = cmp.find("pm").find("panel").getElement();
				var referenceElement2 = cmp.find("refElement2").getElement();
				var panelText = $A.test.getText(panel);
				var pointer = $A.test.getElementByClass("pointer")[0];
				var pointerRect = pointer.getBoundingClientRect();
				var referenceElemRect = referenceElement2.getBoundingClientRect();
				var ready = (pointerRect.left <= (referenceElemRect.right + epsilon)) && (panelText.indexOf(firstPanelBody) > 0); // when the direction is set to 'east'
				return ready;
				}, "Either the panel body text of first panel does not match or the panel pointer is disjoint from the reference element");	
		}, function(cmp) {
			var epsilon = 0.001;
			var newPanelBody = "New panel body"; //defined in controller

			setTimeout(function() {
				// Give Aura a chance to rerender
				var changeRefBtn = cmp.find("changeRefBtn");
				changeRefBtn.get('e.press').fire();
			}, 0);
			
			$A.test.addWaitForWithFailureMessage(true, function(){	
				var panel = cmp.find("pm").find("panel").getElement();
				var referenceElement1 = cmp.find("refElement1").getElement();
				var panelText = $A.test.getText(panel);
				var panelPointer = $A.test.getElementByClass("pointer")[0];
				var pointerRect = panelPointer.getBoundingClientRect();
				var referenceElemRect = referenceElement1.getBoundingClientRect();   			
				return (pointerRect.left <= (referenceElemRect.right + epsilon)) && (panelText.indexOf(newPanelBody) > 0); // when the direction is set to 'east'   			
				}, "Either the panel body text of second panel does not match or the panel pointer is disjoint from the reference element");
			
		}]
	 },
	 
	 /**
	  * Test to check that the panel is positioned correctly with respect to its reference element
	  */
	 testReferenceElementPosition : {
		test : function (cmp) {
			var epsilon = 0.001;
			var firstPanelBody = "First panel body"; //defined in controller
			var referenceElement2 = cmp.find("refElement2");
			var referenceElemRect = referenceElement2.getElement().getBoundingClientRect();
			$A.test.assertTrue(referenceElemRect.left > 5, "Reference Element should not be along the left edge of the screen");
			referenceElement2.get('e.press').fire();	
			
			$A.test.addWaitForWithFailureMessage(true, function(){			
				var panel = cmp.find("pm").find("panel").getElement(); 			
				var panelText = $A.util.getText(panel);
				var panelRect = panel.getBoundingClientRect();
				var panelPointer = $A.test.getElementByClass("pointer")[0];   			
				var pointerRect = panelPointer.getBoundingClientRect();
				var pointerMiddle = (pointerRect.width/2 + 1) + pointerRect.left; //adding 1 to account for rounding error 			   			
				if((pointerRect.left <= (referenceElemRect.right + epsilon)) &&  // check if pointer is next to the reference element
					(panelRect.left <= pointerMiddle)  &&  // check that the panel and its pointer are not disjoint
					(panelText.indexOf(firstPanelBody) > 0))  // check that the panel body contains the correct data 
					return true;
				else
					return false;
			
				}, "Panel body does not match; or pointer is disjoint from the reference element or from the panel");
			
		}
	 }
  

})