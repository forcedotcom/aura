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
	browsers: ["-IE8"],
	
	/**
	 * Panel in ui:menu opens and closes without gacking
	 */
    testMenuWithPanelModal: {
        test: [function(cmp) {
            trigger = cmp.find("menuWithPanelTrigger");
            this.clickAnchor(trigger);
        }, function(cmp) {
        	// click menuitem that opens panel
            this.clickAnchor(cmp.find("menuWithPanelItem1"));
        }, function(cmp) {
            this.waitForModalOpen();
        }, function(cmp) {
        	/* TODO : @ctatlah - figure out why close button does not
        	 * render when modal is in panel
        	 */
        	//this.closePanel();
        }, function(cmp) {
        	//this.waitForModalClose();
        }]
    },
    
    clickAnchor: function (trigger) {
		var anchor = trigger.getElement().getElementsByTagName("a")[0];
		anchor.click();
    },
    
    closePanel : function(cmp, closeDialogLabel, totalPanels) {
    	if($A.util.isUndefinedOrNull(closeDialogLabel)){
    		closeDialogLabel = "Close";
    	}
    	if($A.util.isUndefinedOrNull(totalPanels)){
    		totalPanels = 1;
    	}
    	var closeBtn = $A.test.getElementByClass("closeBtn")[totalPanels-1];

    	$A.test.clickOrTouch(closeBtn);
    },
    
    waitForPanelDialogOpen : function() {
    	this.waitForPanel("panel", true);
    },
    
    waitForPanelDialogClose : function() {
    	this.waitForPanel("panel", false);
    },
    
    waitForModalOpen : function() {
    	this.waitForPanel("modal", true);
    },
    
    waitForModalClose : function() {
    	this.waitForPanel("modal", false);
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
