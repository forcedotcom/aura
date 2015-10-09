({

	/* Check that no DOM event (mouseover, mouseout, focus, blur) was fired on initial render */
	testInitial : {
		test : function (cmp) {
			
			var metrics = ["mouseoverCounter", "mouseoutCounter", "focusCounter", "blurCounter"];
			var expectedInitialValue = "0";
			
			for(var i = 0; i < metrics.length; i++) {
				var metric = cmp.find(metrics[i]);
				var value = metric.get('v.value');
				$A.test.assertEquals(expectedInitialValue, value, "The value of "+ metrics[i] + " was not 0");
			}
		}
	},
	
	
	/* Perform mouseover on button with a mouseover handler */
	testMouseoverOutsideBtn : { 			  
		
		test : 	function(cmp) {
		        	var numTimesToPerform = cmp.get('v.numTimesToPerform').toString();
		        	this.performAction(cmp, numTimesToPerform, "statefulBtn", "mouseoverCounter", null, "mouseover", null);
				},
	},
	
	
	/* Perform mouseover on a child of a button with a mouseover handler */
	testMouseoverInsideBtn : {
		
		test : function(cmp) {
					var numTimesToPerform = cmp.get('v.numTimesToPerform').toString();
					this.performAction(cmp, numTimesToPerform, "insidebtn", "mouseoverCounter", null, "mouseover", null);
				},
	},
	
	/* Perform mouseout on button with a mouseout handler */
	testMouseoutOutsideBtn : {
		
		test : function(cmp) {
		        	var numTimesToPerform = cmp.get('v.numTimesToPerform').toString();
		        	this.performAction(cmp, numTimesToPerform, "statefulBtn", "mouseoutCounter", null, "mouseout", null);				
				},
	},
	
	/* Perform mouseout on a child of a button with a mouseout handler */
	testMouseoutInsideBtn : {
		
		test : function(cmp) {
					var numTimesToPerform = cmp.get('v.numTimesToPerform').toString();
					this.performAction(cmp, numTimesToPerform, "insidebtn", "mouseoutCounter", null, "mouseout", null);
					
				},
	},
	
	/* Perform mouseover and mouseout on button with handler for each */
	testOverAndOutOutsideBtn : {
		
		test :  function(cmp) {
		        	var numTimesToPerform = cmp.get('v.numTimesToPerform').toString();
		        	this.performAction(cmp, numTimesToPerform, "statefulBtn", "mouseoverCounter", "mouseoutCounter", "mouseover", "mouseout");
				},		
	},	
	
	/* Perform mouseover and mouseout on a child of a button with handler for each */
	testOverAndOutInsideBtn : {
		
		test : function(cmp) {
					var numTimesToPerform = cmp.get('v.numTimesToPerform').toString();
					this.performAction(cmp, numTimesToPerform, "insidebtn", "mouseoverCounter", "mouseoutCounter", "mouseover", "mouseout");
				},
	},
		    
	/* Perform focus on a button with a focus event handler */ 
	testFocusOutsideBtn : {
		
		test : function(cmp) {
		        	var numTimesToPerform = (cmp.get('v.numTimesToPerform')).toString();
					this.performAction(cmp, numTimesToPerform, "statefulBtn", "focusCounter", null, "focus", null);
				},
		        
	},
	
	/* Perform blur on a button with a blur event handler */
	testBlurOutsideBtn : {
		
		test :  function(cmp) {
					var numTimesToPerform = (cmp.get('v.numTimesToPerform')).toString();
					this.performAction(cmp, numTimesToPerform, "statefulBtn", "blurCounter", null, "blur", null);
					
				},
	},
	
	
	/* Perform focus and blur on a button with event handlers for each */
	testFocusAndBlurOutsideBtn : {
		
		test : function(cmp) {
					var numTimesToPerform = (cmp.get('v.numTimesToPerform')).toString();
					this.performAction(cmp, numTimesToPerform, "statefulBtn", "focusCounter", "blurCounter", "focus", "blur");
				},
	},
	
	
	/* Check initial values for a stateful button (stateful=true) */
	testStatefulTrueInitial : {
		
		test :  function(cmp) {
		        	var buttonElement = cmp.find("statefulBtn").getElement();
		        	$A.test.assertTrue($A.util.hasClass(buttonElement, 'not-selected'));
		        	$A.test.assertFalse($A.util.hasClass(buttonElement, 'is-selected'));
		        },
	},
	
	
	/* Check initial values for a non-stateful button (stateful=false) */
	testStatefulFalseInitial : {

		test : function(cmp) {
		        	var buttonElement = cmp.find("insidebtn").getElement();
		        	$A.test.assertFalse($A.util.hasClass(buttonElement, 'not-selected'));
		        	$A.test.assertFalse($A.util.hasClass(buttonElement, 'is-selected'));
		        },
	},
	
	
	/**
	 * Test Flow:
	 * 
	 * 1. Change the value of 'selected' of the stateful button from false to true (by clicking on the stateful button)
	 * 2. Check if stateful button contains appropriate class (i.e. is-selected)
	 * 3. Change the value of 'selected' of the stateful button from true back to false (by clicking again)
	 * 4. Check if stateful button contains appropriate class (i.e. not-selected) 
	 * 
	 */
	testSelectedOutsideBtn : {

		test : [
		        function(cmp) {
		        	var btnToClick = cmp.find("statefulBtn").getElement();
		        	this.toggleSelectedByClick(cmp, "statefulBtn", btnToClick);
		        },
		        function(cmp) {
		        	var btnToClick = cmp.find("statefulBtn").getElement();
		        	this.toggleSelectedByClick(cmp, "statefulBtn", btnToClick);
		        },
		        ]
	},
	
	/**
	 * Test Flow:
	 * 
	 * 1. Change the value of 'selected' of the stateful button(outside button) from false to true (by clicking on the inside button which is not stateful)
	 * 2. Check if stateful button contains appropriate class (i.e. is-selected)
	 * 3. Change the value of 'selected' of the stateful button(outside button) from true back to false (by clicking again on inside button)
	 * 4. Check if stateful button contains appropriate class (i.e. not-selected) 
	 * 
	 */
	testSelectedInsideBtn : {

		test : [
		        function(cmp) {
		        	var btnToClick = cmp.find("insidebtn").getElement();
		        	this.toggleSelectedByClick(cmp, "statefulBtn", btnToClick);
		        },
		        function(cmp) {
		        	var btnToClick = cmp.find("insidebtn").getElement();
		        	this.toggleSelectedByClick(cmp, "statefulBtn", btnToClick);
		        },
		        ]
	},
	
	
	/**
	 * Test Flow:
	 * 
	 * 1. Take a button whose stateful value = false (inside button)
	 * 2. Change the value of 'selected' to true
	 * 3. Check that the classes not-selected and is-selected are not present in its classlist
	 * 
	 */
	testStateFalseSelectedTrue : {
		test : function(cmp) {
		        	var buttonElement = cmp.find("insidebtn").getElement();
		        	
		        	cmp.find("insidebtn").set('v.selected', "true");
		        	$A.test.addWaitForWithFailureMessage(true, function(){
		        		return 	($A.util.hasClass(buttonElement, 'not-selected') === false &&
		        				 $A.util.hasClass(buttonElement, 'is-selected') === false);
		        		}, "Button should not contain the classes 'not-selected' or 'is-selected' ");
		        }
	},
	
	/**
	 * Test Flow:
	 * 
	 * 1. Take button whose stateful value = false (inside button)
	 * 2. Set its stateful value to true
	 * 3. Check if it contains appropriate class (not-selected which is default)
	 * 
	 */
	testChangeStatefulToTrue : {
		
		test : function(cmp) {   
		    	   this.toggleStatefulValue(cmp, "insidebtn");
		       },
	},
	
	
	/**
	 * Test Flow:
	 * 
	 * 1. Change stateful value of a button from false to true (inside button)
	 * 2. Change its 'selected' attribute value to true
	 * 3. Check if appropriate class is present (i.e. is-selected)
	 * 
	 */
	testStatefulAndSelectedDynamicChange : {
		test : [	       
		       function(cmp) {
		    	   this.toggleStatefulValue(cmp, "insidebtn");
		       },
		       
		       function(cmp) {
		    	   var buttonElement = cmp.find("insidebtn").getElement();
		    	   
		        	cmp.find("insidebtn").set('v.selected', "true");
		        	
		        	$A.test.addWaitForWithFailureMessage(true, function(){
		        		return 	($A.util.hasClass(buttonElement, 'is-selected'));
		        		}, "Button should contain the class 'is-selected' ");
		       },
		       ]
	},
	 
	
	/**
	 * Test Flow:
	 * 
	 * 1. Take button whose stateful value is true (outside button)
	 * 2. Set its stateful value to false
	 * 3. Check that is-selected and not-selected do not exist in the class list
	 * 
	 */
	testChangeStatefulToFalse : {
		test : function(cmp) {
			this.toggleStatefulValue(cmp, "statefulBtn");
		}
	},
	
	/**
	 * Test Flow:
	 * 
	 * 1. Change the value of stateful from true to false
	 * 2. Change the value of 'selected' to true
	 * 3. Check that the classes not-selected and is-selected do not exist since stateful is false
	 * 
	 */
	testChangeStatefulToFalseSelectedToTrue : {
		test : [
		        function(cmp) {
		        	this.toggleStatefulValue(cmp, "statefulBtn");
		        },
		      
		        function(cmp) {
		        	var buttonElement = cmp.find("statefulBtn").getElement();
		        	cmp.find("statefulBtn").set('v.selected', true);
		        	$A.test.addWaitForWithFailureMessage(true, function(){
		        		return 	($A.util.hasClass(buttonElement, 'not-selected') === false &&
		        				 $A.util.hasClass(buttonElement, 'is-selected') === false);
		        		}, "Button should not contain the classes 'is-selected' or 'not-selected' ");
		        },
		        ]
	},
	
	
	/**
	 * Test Flow:
	 * 
	 * 1. Take a button with stateful value set to true (outside button)
	 * 2. Set its 'selected' value to true. The button is now selected
	 * 3. Change the stateful value to false
	 * 4. The class list of the button should not contain is-selected or not-selected
	 * 
	 */
	testSelectedTrueStatefulFalse : {
		test : [
		        function(cmp) {
		        	var buttonElement = cmp.find("statefulBtn").getElement();
		        	cmp.find("statefulBtn").set('v.selected', true);
		        	
		        	$A.test.addWaitForWithFailureMessage(true, function(){
		        		return 	($A.util.hasClass(buttonElement, 'is-selected'));
		        		}, "Button should contain the class 'is-selected' ");
		        },
		        function(cmp) {
		        	var buttonElement = cmp.find("statefulBtn").getElement();
		        	cmp.find("statefulBtn").set('v.stateful', false);
		        	
		        	$A.test.addWaitForWithFailureMessage(true, function(){
		        		return 	(cmp.find("statefulBtn").get('v.stateful') === false &&
		        				 $A.util.hasClass(buttonElement, 'is-selected') === false &&
		        				 $A.util.hasClass(buttonElement, 'not-selected') === false);
		        		}, "Button should not contain the classes 'is-selected' or 'not-selected' ");
		        },
		        ]
	},
	
	
	
	/************************************************************************************************************************************************
	 ************************************************************HELPER FUNCTIONS********************************************************************
	 ************************************************************************************************************************************************/
	
	
	/**
	 * Perform DOM actions like mouseover, mouseout, focus, blur and verify class names of the button
	 */
	performAction : function(cmp, numTimesToPerform, buttonId, counterElement1, counterElement2, action1, action2) {
		
		var expectedCount = numTimesToPerform;
		var buttonElement = cmp.find(buttonId).getElement();
		var actualCount = 0;
		var actualCount2 = 0;
		
		// Perform DOM event a specified number of times
		for(var i = 0; i < numTimesToPerform; i++) {
			$A.test.fireDomEvent(buttonElement, action1);
			$A.test.fireDomEvent(buttonElement, action2);
		}
		
		// Get count of how many times action1 was performed from its counter and check if its correct
		$A.test.addWaitForWithFailureMessage(true, function(){
			actualCount = $A.util.getText(cmp.find(counterElement1).getElement());
    		return (expectedCount === actualCount);
    		}, counterElement1 + "'s value does not match expected count: " + expectedCount);
		
		// If action2 was performed, get count of how many times it was performed and if the count is correct
		if(action2 !== null && counterElement2 !== null) {
			
			$A.test.addWaitForWithFailureMessage(true, function(){
				actualCount2 = $A.util.getText(cmp.find(counterElement2).getElement());
	    		return ((expectedCount === actualCount2) && (actualCount === actualCount2));
	    		}, counterElement2 + "'s value does not match either expected count: " + expectedCount +" or "+ counterElement1 +"'s value: " + actualCount);
			
		}
		
	},
	
	/**
	 * Toggle the 'selected' attribute value of the button by clicking on button
	 */
	toggleSelectedByClick : function (cmp, statefulBtnId, btnToClick) {
		
		var statefulBtn = cmp.find(statefulBtnId).getElement();
		//initial and final value of 'selected'
		var initialSelected = cmp.find(statefulBtnId).get('v.selected');
		var finalSelected = !initialSelected;
		
		// class contains not-selected when 'selected'=false ; is-selected when 'selected'=true
		$A.test.assertTrue($A.util.hasClass(statefulBtn, 'not-selected') !== initialSelected);
		$A.test.assertTrue($A.util.hasClass(statefulBtn, 'is-selected') === initialSelected);
		
		//toggle 'selected' value by clicking - toggles when stateful is true on button
		$A.test.clickOrTouch(btnToClick, true, true);
		
		//check if appropriate class is present
		$A.test.addWaitForWithFailureMessage(true, function(){
    		return 	($A.util.hasClass(statefulBtn, 'is-selected') === finalSelected) && ($A.util.hasClass(statefulBtn, 'not-selected') !== finalSelected);
    		}, "Button does not have the correct class");
		
	},

	
	toggleStatefulValue : function (cmp, buttonAuraId) {
		
		//initial and final value of 'stateful'
		var initialStatefulValue = cmp.find(buttonAuraId).get('v.stateful');
		var toggledStatefulValue = !initialStatefulValue;
		var buttonElement = cmp.find(buttonAuraId).getElement();
		
		// when stateful=false, button should not contain either of these classes
		if(initialStatefulValue === false) {
			$A.test.assertFalse($A.util.hasClass(buttonElement, 'not-selected'));
		 	$A.test.assertFalse($A.util.hasClass(buttonElement, 'is-selected'));
		}
		
		cmp.find(buttonAuraId).set('v.stateful', toggledStatefulValue);
		
		$A.test.addWaitForWithFailureMessage(true, function(){
    		return 	(cmp.find(buttonAuraId).get('v.stateful') === toggledStatefulValue);
    		}, "Could not change value of 'stateful' ");
		
		// when stateful is changed from false to true, button will have the class not-selected
		// when stateful is change from true to false, button will not have either of the two classes (not-selected/is-selected)
		$A.test.addWaitForWithFailureMessage(true, function(){
    		return 	($A.util.hasClass(buttonElement, 'not-selected') === toggledStatefulValue &&
    				 $A.util.hasClass(buttonElement, 'is-selected') === false);
    		}, "Button does not have the correct class");
	},


})