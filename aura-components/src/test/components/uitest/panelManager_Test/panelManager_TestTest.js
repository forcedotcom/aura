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
    browsers: ["-IE8", "-IPHONE", "-IPAD", "-ANDROID_PHONE", "-ANDROID_TABLET"],
    
    /**
     * Test panel notify
     */
    testPanelNotify: {
    	test: [function(cmp) {
    		// create panel 1
    		this.createPanel(cmp);
    		this.waitForPanelVisilbe(cmp, 0, true);
    	}, function(cmp) {
    		// create second panel
    		this.createPanel(cmp);
    		this.waitForPanelVisilbe(cmp, 1, true);
    	}, function(cmp) {
        	// inital count for panel
        	var countForPanel0 = this.getCounterValueForPanel(cmp, 0);
        	var countForPanel1 = this.getCounterValueForPanel(cmp, 1);
        	$A.test.assertEquals(0, countForPanel0, "Initial count for instance(0) panel incorrect");
        	$A.test.assertEquals(0, countForPanel1, "Initial count for instance(1) panel incorrect");
        	this.notify(cmp, 1);
        }, function(cmp) {
        	// verify new panel count
        	var countForPanel0 = this.getCounterValueForPanel(cmp, 0);
        	var countForPanel1 = this.getCounterValueForPanel(cmp, 1);
        	$A.test.assertEquals(1, countForPanel0, "Final count for instance(0) panel incorrect");
        	$A.test.assertEquals(0, countForPanel1, "Final count for instance(1) panel incorrect");
        }]
    },
    
    /**
     * Test panel notify all
     */
    testPanelNofityAll: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
    		this.createPanel(cmp);
        }, function(cmp) {
        	// inital count for panel
        	var countForPanel0 = this.getCounterValueForPanel(cmp, 0);
        	var countForPanel1 = this.getCounterValueForPanel(cmp, 1);
        	$A.test.assertEquals(0, countForPanel0, "Initial count for instance(0) panel incorrect");
        	$A.test.assertEquals(0, countForPanel1, "Initial count for instance(1) panel incorrect");
        	this.notify(cmp, 1);
        }, function(cmp) {
        	// verify new panel count
        	var countForPanel0 = this.getCounterValueForPanel(cmp, 0);
        	var countForPanel1 = this.getCounterValueForPanel(cmp, 1);
        	$A.test.assertEquals(1, countForPanel0, "Final count for instance(0) panel incorrect");
        	$A.test.assertEquals(0, countForPanel1, "Final count for instance(1) panel incorrect");
        }]
    },
    
    /**
     * Test panel action hide
     */
    testPanelActionHideShow: {
    	test: [function(cmp) {
    		// create panel 1
    		this.createPanel(cmp);
    		this.waitForPanelVisilbe(cmp, 0, true);
    	}, function(cmp) {
    		// create second panel
    		this.createPanel(cmp);
    		this.waitForPanelVisilbe(cmp, 1, true);
    	}, function(cmp) {
    		// verify both are visible
    		this.verifyIsPanelVisible(cmp, 0, true);
    		this.verifyIsPanelVisible(cmp, 1, true);
    	}, function(cmp) {
    		// hide second panel
    		this.hidePanelWithId(cmp, 1);
    		this.waitForPanelVisilbe(cmp, 1, false);
    	}, function(cmp) {
    		// verify state of both panels
    		this.verifyIsPanelVisible(cmp, 0, true);
    		this.verifyIsPanelVisible(cmp, 1, false);
    	}, function(cmp) {
    		// show second panel
    		this.showPanelWithId(cmp, 1);
    		this.waitForPanelVisilbe(cmp, 1, true);
    	}, function(cmp) {
    		// verify state of both panels
    		this.verifyIsPanelVisible(cmp, 0, true);
    		this.verifyIsPanelVisible(cmp, 1, true);
    	}, function(cmp) {
    		// now hide first panel
    		this.hidePanelWithId(cmp, 0);
    		this.waitForPanelVisilbe(cmp, 0, false);
    	}, function(cmp) {
    		// verify state of both panels
    		this.verifyIsPanelVisible(cmp, 0, false);
    		this.verifyIsPanelVisible(cmp, 1, true);
    	}]
    },
    
    /** 
     * Test panel action close
     */
    testPanelActionClose: {
    	test: [function(cmp) {
    		// create panel 1
    		this.createPanel(cmp);
    		this.waitForPanelVisilbe(cmp, 0, true);
    	}, function(cmp) {
    		// create second panel
    		this.createPanel(cmp);
    		this.waitForPanelVisilbe(cmp, 1, true);
    	}, function(cmp) {
    		// close first panel
    		this.closePanelWithId(cmp, 0);
    		this.waitForPanelPresent(cmp, 0, false);
    	}, function(cmp) {
    		// verify both panels
    		this.verifyIsPanelPresent(cmp, 0, false);
    		this.verifyIsPanelPresent(cmp, 1, true);
    	}]
    },
    
    testPanelOwner : {
    	test : [
    	        function(cmp) {
    	        	// create panel 1
    	    		this.createPanel(cmp);
    	    		this.waitForPanelVisilbe(cmp, 0, true);
    	        },
    	        function(cmp) {
    	        	// owner of the first panel is itself
    	        	var expectedOwner = this.getPanel(cmp, 0).getGlobalId();
    	        	this.verifyPanelOwner(cmp, 0, expectedOwner);
    	        }
    	        ]
    },
    createPanel : function(cmp) {
    	cmp.find("createPanelBtn").get("e.press").fire();
    },
    
    getPanel : function(cmp, instanceId) {
    	var panels = cmp.get("v._testPanels");
    	for (var i=0; i<panels.length; i++) {
    		if (panels[i].isValid() && panels[i].get("v.instanceId") === instanceId) {
    			return panels[i];
    		}
    	}
    	return null;
    },
    
    getCounterValueForPanel : function(cmp, instanceId) {
    	var panel = this.getPanel(cmp, instanceId);
    	if (panel != null) {
    		return panel.get("v.body")[0].get("v.counter");
    	}
    	return -1;
    },
    
    getPanelClass : function(cmp, instanceId) {
    	var panel = this.getPanel(cmp, instanceId);
    	return $A.test.getElementAttributeValue(panel.getElement(), "class");
    },
    
    notify : function(cmp, instanceId) {
    	var panel = this.getPanel(cmp, instanceId);
    	panel.get("v.body")[0].find("notify").get("e.press").fire();
    },
    
    notifyAll : function(cmp, instanceId) {
    	var panel = this.getPanel(cmp, instanceId);
    	panel.get("v.body")[0].find("notifyAll").get("e.press").fire();
    },
    
    hidePanelWithId : function(cmp, instanceId) {
    	var panel = this.getPanel(cmp, instanceId);
    	this.hidePanel(panel);
    },
    
    hidePanel : function(panel) {
    	this.performPanelAction(panel, "hideLink");
    },
    
    showPanelWithId : function(cmp, instanceId) {
    	var panel = this.getPanel(cmp, instanceId);
    	this.showPanel(panel);
    },
    
    showPanel : function(panel) {
    	this.performPanelAction(panel, "showLink");
    },
    
    closePanelWithId : function(cmp, instanceId) {
    	var panel = this.getPanel(cmp, instanceId);
    	this.closePanel(panel);
    },
    
    closePanel : function(panel) {
    	this.performPanelAction(panel, "closeLink");
    },
    
    performPanelAction : function(panel, action) {
    	if (panel == null) {
    		return;
    	}
    	var instanceId = panel.get("v.instanceId");
    	var link = panel.find(action).getElement();
    	$A.test.clickOrTouch(link);
    },
    
    waitForPanelOpen : function(instanceId) {
    	this.waitForPanel(instanceId, true);
    },
    
    waitForPanelClose : function(instanceId) {
    	this.waitForPanel(instanceId, false);
    },
    
    waitForPanel : function(id, isOpen) {
    	var className = "instance(" + id + ")";
    	
    	$A.test.addWaitForWithFailureMessage(isOpen, function() {
			var panel = $A.test.getElementByClass(className);
			return $A.util.isUndefinedOrNull(panel);
		}, "Expected panel '"+className+"' to be " + 
			(isOpen ? "Open" : "Closed") + " but was not");
    },
    
    waitForPanelVisilbe : function(cmp, id, isVisible) {
    	var panelName = "instance(" + id + ")";
    	var panel = this.getPanel(cmp, id);
    	
    	$A.test.addWaitForWithFailureMessage(isVisible+"", function() {
    		var panelClass = $A.test.getElementAttributeValue(panel.getElement(), "class");
			return (panelClass.indexOf("visible") > -1)+"";
		}, "Expected panel '"+panelName+"' to be " + 
			(isVisible ? "Visible" : "InVisible") + " but was not");
    }, 
    
    waitForPanelPresent : function(cmp, id, isPresent) {
    	var that = this;
    	var panelName = "instance(" + id + ")";
    	
    	$A.test.addWaitForWithFailureMessage(isPresent+"", function() {
    		var panel = that.getPanel(cmp, id);
			return (!$A.util.isUndefinedOrNull(panel))+"";
		}, "Expected panel '"+panelName+"' to be " + 
			(isPresent ? "Present" : "Not Present") + " but was not");
    },
    
    verifyIsPanelVisible : function(cmp, instanceId, isVisible) {
    	var panelClass = this.getPanelClass(cmp, instanceId);
    	var visibleResult = panelClass.indexOf("visible") > -1;
    	if (isVisible) {
    		$A.test.assertTrue(visibleResult, "Panel instance("+instanceId+") should be visible");
    	} else {
    		$A.test.assertFalse(visibleResult, "Panel instance("+instanceId+") should be invisible");
    	}
    },
    
    verifyIsPanelPresent : function(cmp, instanceId, isPresent) {
    	var panel = this.getPanel(cmp, instanceId);
    	if (isPresent) {
    		$A.test.assertTrue(panel != null, "Panel instance(0) should have been present");
    	} else {
    		$A.test.assertTrue(panel == null, "Panel instance(0) should not have been present");
    	}
    },
    
    verifyPanelOwner : function(cmp, instanceId, expectedOwner) {
    	var panelManager = cmp.find('pm');
    	var globalId = this.getPanel(cmp, instanceId).getGlobalId();
    	var owner = panelManager.getDef().getHelper().PANELS_OWNER[globalId];
    	$A.test.assertEquals(expectedOwner, owner, "The owner and expected owner do not match");
    }
})
