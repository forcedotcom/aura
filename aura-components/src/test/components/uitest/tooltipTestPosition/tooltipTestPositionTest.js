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
	 * Test the top row. Check if tooltip is being displayed correctly in all directions 
	 */
	
	// Top portion of tooltip going out of viewport. Uncomment assertion ~line 71 when fixed
	testTop: {
		test: function(component) {
			var tooltips = ['topLeftWest', 'topLeftNorth', 'topLeftSouth', 'topLeftEast', 
			                'topCenterWest', 'topCenterNorth', 'topCenterSouth', 'topCenterEast', 
			                'topRightWest', 'topRightNorth', 'topRightSouth', 'topRightEast'];
			
			var triggers = ['topLeftWestlabel', 'topLeftNorthlabel', 'topLeftSouthlabel', 'topLeftEastlabel',
			                'topCenterWestlabel', 'topCenterNorthlabel', 'topCenterSouthlabel', 'topCenterEastlabel', 
			                'topRightWestlabel', 'topRightNorthlabel', 'topRightSouthlabel', 'topRightEastlabel'];

			for(var i = 0; i < tooltips.length; i++) {
				
				function topRow(ttLabel, triggerLabel) {
					var trigger = component.find(triggerLabel).getElement();
					var ttCmp = component.find(ttLabel);
					$A.test.fireDomEvent(trigger, "mouseover");
					var tt = $A.test.getElementByClass(ttLabel)[0];			
					$A.test.addWaitForWithFailureMessage(true, function(){	
						
						if($A.util.hasClass(tt,"visible") == true) {
							/* verticalEpsilon is different from epsilon since for north and south,
							   the boundaries of the pointer and tooltip body are not perfectly aligned */
							var verticalEpsilon = 4;
							var epsilon = 1;
							var direction = ttCmp.get('v.direction');
							var wrapper = tt.querySelector('div.tooltip');
							var body = tt.querySelector('div.tooltip-body');
							var bodyBoundingRect = body.getBoundingClientRect();
							var pointer = tt.querySelector('div.pointer');
							var pointerBoundingRect = pointer.getBoundingClientRect();
							// Check if correct styling has been applied 
							// and make sure pointer is not disjoint from the tooltip body
							
							/* For tooltip triggers along the top edge of the viewport, 
							   the tooltip is displayed in the 'south' direction only */
							if(direction == "south") {
								$A.test.assertTrue($A.util.hasClass(wrapper,"south"), 'the class south is not attached to tooltip: ' + ttLabel);
								$A.test.assertTrue((pointerBoundingRect.bottom + epsilon) >= bodyBoundingRect.top, 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
								$A.test.assertTrue((pointerBoundingRect.bottom - verticalEpsilon) <= bodyBoundingRect.top, 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
							}

							// Check that the tooltip body is within the viewport
							$A.test.assertTrue(bodyBoundingRect.right < window.innerWidth, 'Right edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.left >= 0, 'Left edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.bottom < window.innerHeight, 'Bottom edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.top >= 0, 'Top edge leaving the view port for tooltip ' + ttLabel);		
							
							return true;
						}
						
						return false;
						
					}, "'visible' class not attached to tooltip " + ttLabel);
				}
				
				topRow(tooltips[i], triggers[i]);
			}		
		}
	},
	
	/**
	 * Test the center row. Check if tooltip is being displayed correctly in all directions 
	 */
	testCenter: {
		test: function(component) {
			var tooltips = ['leftCenterWest', 'leftCenterNorth', 'leftCenterSouth', 'leftCenterEast', 
			                'centerCenterWest', 'centerCenterNorth', 'centerCenterSouth', 'centerCenterEast', 
			                'rightCenterWest', 'rightCenterNorth', 'rightCenterSouth', 'rightCenterEast'];
			
			var triggers = ['leftCenterWestlabel', 'leftCenterNorthlabel', 'leftCenterSouthlabel', 'leftCenterEastlabel',
			                'centerCenterWestlabel', 'centerCenterNorthlabel', 'centerCenterSouthlabel', 'centerCenterEastlabel', 
			                'rightCenterWestlabel', 'rightCenterNorthlabel', 'rightCenterSouthlabel', 'rightCenterEastlabel'];

			for(var i = 0; i < tooltips.length; i++) {
				
				function centerRow(ttLabel, triggerLabel) {
					var trigger = component.find(triggerLabel).getElement();
					var ttCmp = component.find(ttLabel);
					$A.test.fireDomEvent(trigger, "mouseover");
					var tt = $A.test.getElementByClass(ttLabel)[0];
					$A.test.addWaitForWithFailureMessage(true, function(){	
						
						if($A.util.hasClass(tt,"visible") == true) {
							
							/* verticalEpsilon is different from epsilon since for north and south,
							   the boundaries of the pointer and tooltip body are not perfectly aligned */
							var epsilon = 1;
							var verticalEpsilon = 4;
							var direction = ttCmp.get('v.direction');
							var wrapper = tt.querySelector('div.tooltip');
							var body = tt.querySelector('div.tooltip-body');
							var bodyBoundingRect = body.getBoundingClientRect();
							var pointer = tt.querySelector('div.pointer');
							var pointerBoundingRect = pointer.getBoundingClientRect();
							
							// Check if correct styling has been applied 
							// and make sure pointer is not disjoint from the tooltip body
							if(direction == "west") {
								$A.test.assertTrue($A.util.hasClass(wrapper,"west"), 'the class west is not attached to tooltip: ' + ttLabel);	
								console.log(pointerBoundingRect.left+"<="+bodyBoundingRect.right);
								
								$A.test.assertTrue(pointerBoundingRect.left <= (bodyBoundingRect.right + epsilon), 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
								$A.test.assertTrue(pointerBoundingRect.left >= (bodyBoundingRect.right - epsilon), 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
							}
							else if(direction == "north") {
								$A.test.assertTrue($A.util.hasClass(wrapper,"north"), 'the class north is not attached to tooltip: ' + ttLabel);
								$A.test.assertTrue(pointerBoundingRect.top <= (bodyBoundingRect.bottom + verticalEpsilon), 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
								$A.test.assertTrue(pointerBoundingRect.top >= (bodyBoundingRect.bottom - verticalEpsilon), 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
							}
							else if(direction == "south") {
								$A.test.assertTrue($A.util.hasClass(wrapper,"south"), 'the class south is not attached to tooltip: ' + ttLabel);
								$A.test.assertTrue((pointerBoundingRect.bottom + verticalEpsilon) >= bodyBoundingRect.top, 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
								$A.test.assertTrue((pointerBoundingRect.bottom - verticalEpsilon) <= bodyBoundingRect.top, 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
							}
							else if(direction == "east") {
								$A.test.assertTrue($A.util.hasClass(wrapper,"east"), 'the class east is not attached to tooltip: ' + ttLabel);
								$A.test.assertTrue((pointerBoundingRect.right + epsilon) >= bodyBoundingRect.left, 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
								$A.test.assertTrue((pointerBoundingRect.right - epsilon) <= bodyBoundingRect.left, 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
							}
							
							// Check that the tooltip body is within the viewport
							$A.test.assertTrue(bodyBoundingRect.right < window.innerWidth, 'Right edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.left >= 0, 'Left edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.bottom < window.innerHeight, 'Bottom edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.top >= 0, 'Top edge leaving the view port for tooltip ' + ttLabel);		
							
							return true;
						}
						
						return false;
						
					}, "'visible' class not attached to tooltip " + ttLabel);				
				}			
				centerRow(tooltips[i], triggers[i]);
			}		
		}
	},
	
	/**
	 * Test the bottom row. Check if tooltip is being displayed correctly in all directions 
	 */
	// Bottom portion of tooltip going out of viewport. Uncomment assertion ~line 191 when fixed
	testBottom: {
		test: function(component) {
			var tooltips = ['bottomLeftWest', 'bottomLeftNorth', 'bottomLeftSouth', 'bottomLeftEast', 
			                'bottomCenterWest', 'bottomCenterNorth', 'bottomCenterSouth', 'bottomCenterEast', 
			                'bottomRightWest', 'bottomRightNorth', 'bottomRightSouth', 'bottomRightEast'];
			
			var triggers = ['bottomLeftWestlabel', 'bottomLeftNorthlabel', 'bottomLeftSouthlabel', 'bottomLeftEastlabel',
			                'bottomCenterWestlabel', 'bottomCenterNorthlabel', 'bottomCenterSouthlabel', 'bottomCenterEastlabel', 
			                'bottomRightWestlabel', 'bottomRightNorthlabel', 'bottomRightSouthlabel', 'bottomRightEastlabel'];

			for(var i = 0; i < tooltips.length; i++) {
				
				function bottomRow(ttLabel, triggerLabel) {
					var trigger = component.find(triggerLabel).getElement();
					var ttCmp = component.find(ttLabel);
					$A.test.fireDomEvent(trigger, "mouseover");
					var tt = $A.test.getElementByClass(ttLabel)[0];
					$A.test.addWaitForWithFailureMessage(true, function(){	
											
						if($A.util.hasClass(tt,"visible") == true) {
							
							/* verticalEpsilon is different from epsilon since for north and south,
							   the boundaries of the pointer and tooltip body are not perfectly aligned */
							var epsilon = 1;
							var verticalEpsilon = 4;
							var direction = ttCmp.get('v.direction');
							var wrapper = tt.querySelector('div.tooltip');
							var body = tt.querySelector('div.tooltip-body');
							var bodyBoundingRect = body.getBoundingClientRect();
							var pointer = tt.querySelector('div.pointer');
							var pointerBoundingRect = pointer.getBoundingClientRect();
							
							// Check if correct styling has been applied 
							// and make sure pointer is not disjoint from the tooltip body
							
							/* For tooltip triggers along the bottom edge of the viewport, 
							   the tooltip is displayed in the 'north' direction only */
							if(direction == "north") {
								$A.test.assertTrue($A.util.hasClass(wrapper,"north"), 'the class north is not attached to tooltip: ' + ttLabel);
								$A.test.assertTrue(pointerBoundingRect.top <= (bodyBoundingRect.bottom + epsilon), 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
								$A.test.assertTrue(pointerBoundingRect.top >= (bodyBoundingRect.bottom - verticalEpsilon), 'Pointer is disjoint from tooltip body for tooltip: ' + ttLabel);
							}
							
							// Check that the tooltip body is within the viewport
							$A.test.assertTrue(bodyBoundingRect.right < window.innerWidth, 'Right edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.left >= 0, 'Left edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.bottom < window.innerHeight, 'Bottom edge leaving the view port for tooltip ' + ttLabel);
							$A.test.assertTrue(bodyBoundingRect.top >= 0, 'Top edge leaving the view port for tooltip ' + ttLabel);		
							
							return true;
						}
						
						return false;
						
					}, "'visible' class not attached to tooltip " + ttLabel);					
				}
				
				bottomRow(tooltips[i], triggers[i]);
			}		
		}
	}
})
