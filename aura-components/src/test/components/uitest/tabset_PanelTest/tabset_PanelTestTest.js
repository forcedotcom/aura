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
     * Tabset inside panel should be scrollable scoped.
     */
    testTabsetInPanelScrollable: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
        }, function(cmp) {
        	this.waitForPanelOpen();
        }, function(cmp) {
        	var scrollableTab = $A.test.getElementByClass('tabContent');
        	$A.test.assertNotNull(scrollableTab);
        	
        	var scrollableNestedTab = $A.test.getElementByClass('tabContentNested');
        	$A.test.assertNotNull(scrollableNestedTab);
        	
        	$A.test.assertTrue($A.util.isUndefinedOrNull(scrollableTab[0]._scopedScroll), 
        			'tab should not be scrollable scoped');
        	$A.test.assertTrue(scrollableNestedTab[0]._scopedScroll, 
        			'nested tab should be scrollable scoped');
        }]
    },
    
    createPanel : function(cmp) {
    	cmp.find("createPanelBtn").get("e.press").fire();
    },
    
    waitForPanelOpen : function() {
    	this.waitForPanel("panel", true);
    },
    
    waitForPanel : function(type, isOpen, numItems) {
    	var panelType = type === "modal" ? "uiModal" : "uiPanel";
    	var expectedState = isOpen ? "open" : "closed";
    	
    	if (numItems) {
    		$A.test.addWaitForWithFailureMessage(numItems, function() {
				var panel = $A.test.getElementByClass(panelType);
				return $A.util.isUndefinedOrNull(panel) ? 0 : panel.length;
			}, "Number of panels expected is incorrect");
    	} else {
	    	$A.test.addWaitForWithFailureMessage(isOpen, function() {
				var panel = $A.test.getElementByClass(panelType);
				return !$A.util.isUndefinedOrNull(panel);
			}, "Panel was not " + expectedState);
    	}
    }
})