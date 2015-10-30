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
    browsers: ["-IE7","-IE8", "-IPHONE", "-IPAD", "-ANDROID_PHONE", "-ANDROID_TABLET"],
    
    /**
     * Test to verify first inputElement is focused
     */
    testModalFocusOnFirstInput: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
        }, function(cmp) {
        	$A.test.addWaitForWithFailureMessage(true, function() {
        		var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputPanelTypeClass");
            }, "First input element should be focused.");
        }]
    },
    
    /**
     * Verify First input is focused when autoFocus is set
     * Test case for W-2643030
     */
    testPanelFocusOnFirstInput: {
    	attributes : {"testPanelType" : "panel"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
        }, function(cmp) {
        	$A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputPanelTypeClass");
            }, "First input element should be focused.");
        }]
    },
    
    /**
     * Active class set correctly on panel/modal
     * Bug: W-2647558
     */
    testActiveClassSetCorrectlyOnModal: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
        }, function(cmp) {
        	$A.test.addWaitForWithFailureMessage(true, function() {
        		var modalElement = $A.test.select(".uiModal")[0];
                return $A.util.hasClass(modalElement, "active");
            }, "Modal should have class active");
        }]
    },
    
    /**
     * Active class set correctly on panel/modal
     * Bug: W-2647558
     */
    testActiveClassSetCorrectlyOnPanel: {
    	attributes : {"testPanelType" : "panel"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
        }, function(cmp) {
        	$A.test.addWaitForWithFailureMessage(true, function() {
        		var panelElement = $A.test.select(".uiPanel")[0];
                return $A.util.hasClass(panelElement, "active");
            }, "Panel should have class active");
        }]
    },
  
    /**
     * Test to verify ESC button is focused when autoFocus is set to false
     * Revisit once Bug: W-2617212 is fixed
     */
    testPanelNotFocusedOnFirstInputWithAutoFocusOff: {
    	attributes : {"testAutoFocus" : false},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		$A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "closeBtn");
            }, "Esc button should be focused for Modal");
    	}]
    },
    
    /**
     * Test to verify ESC button is focused when autoFocus is set to false
     * Revisit once Bug: W-2616150 is fixed
     */
    testPanelFocusOnCloseBtnWithAutoFocusNotSet: {
    	attributes : {"testPanelType" : "panel", "testAutoFocus" : false},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		$A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "closeBtn");
            }, "Esc button should be focused for Modal");
    	}]
    },
  
    /**
     * Test close button is not displayed on modal
     */
    testCloseButtonHiddenOnModal: {
    	attributes : {"testShowCloseButton" : false},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		this.verifyElementWithClassPresent("closeBtn", false, "Close button present when it should not be");
    	}]
    },
    
    /**
     * Test close button is not displayed on panel
     */
    testCloseButtonHiddenOnPanelDialog: {
    	attributes : {"testPanelType" : "panel", "testShowCloseButton" : false},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyElementWithClassPresent("closeBtn", false, "Close button present when it should not be");
    	}]
    },
    
    
    /**
     * Test to verify positioned panels have display:none added when hiding it. 
     * Bug: W-2653120
     */
    testPositionedPanelHide: {
    	attributes : {"testPanelType" : "panel", "testDirection" : "east", "testShowPointer" : true, "testReferenceElementSelector" : ".createPanelBtnClass"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		panelGlobalId = this.getGlobalIdForPanelModal(1);
    		panel = $A.getCmp(panelGlobalId);
    		panel.hide();
    	}, function(cmp) {
    	$A.test.addWaitForWithFailureMessage("none", function () {
            return $A.test.getStyle(panel.getElement(),'display')
        }, "Positioned panels should have display:none when hiding it.");
    	}]
    },
    
    /**
     * Test panel dialog takes up full screen
     */
    testPanelDialogFullScreen: {
    	attributes : {"testPanelType" : "panel", "testFlavor" : "full-screen"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyElementWithClassPresent("uiPanel--full-screen", true, "Panel dialog should be full screen"); 
    	}]
    },
    
    /**
     * Test large modal type
     */
    testModalLarge: {
    	attributes : {"testFlavor" : "large"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		this.verifyElementWithClassPresent("uiModal--large", true, "Modal should be of type large"); 
    	}]
    },
    
    /**
     * Test open multiple panel modals
     * Use case for bug: W-2619412
     */
    testOpenMultipleModals: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		var testerCmp = this.getPanelTesterComponent(cmp.find("tester"));
    		modal1GlobalId = this.getGlobalIdForPanelModal(1);
			$A.test.addWaitForWithFailureMessage(true, function(){return $A.getCmp(modal1GlobalId).get("v.visible");}, "Visible Attribute should be set for new modal opened");
			testerCmp.set("v.useHeader","true");
    		testerCmp.set("v.useFooter","true");
    		testerCmp.find("createPanelBtn").get("e.press").fire();
    	}, function(cmp) {
    		test = this.getPanelTesterComponent(cmp.find("tester"))
    		this.waitForNumberOfPanels("modal", 2);
    	}, function(cmp) {
    		var modal2GlobalId = this.getGlobalIdForPanelModal(2);
    		var modal2VisibleAttrValue = $A.getCmp(modal2GlobalId).get("v.visible");
    		var modal1VisibleAttrValue = $A.getCmp(modal1GlobalId).get("v.visible");
			$A.test.addWaitForWithFailureMessage(true, function(){return $A.getCmp(modal2GlobalId).get("v.visible");}, "Visible Attribute should be set for new modal opened");
    		$A.test.assertTrue(modal1VisibleAttrValue, "Visible Attribute should not be set for old modal opened");
    		this.verifyElementWithClassPresent("defaultCustomPanelHeader", true, 
			"Custom panel header should be present for second modal");
    		this.verifyElementWithClassPresent("defaultCustomPanelFooter", true, 
			"Custom panel footer should be present for second modal");
    	}]
    },
    
    
    /**
     * Test close multiple panels
     * Use case for bug: W-2619412
     */
    testCloseMultiplePanels: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		var testerCmp = this.getPanelTesterComponent(cmp.find("tester"));
    		modal1GlobalId = this.getGlobalIdForPanelModal(1);
			$A.test.addWaitForWithFailureMessage(true, function(){return $A.getCmp(modal1GlobalId).get("v.visible");}, "Visible Attribute should be set for new modal opened");
    		testerCmp.set("v.useHeader","true");
    		testerCmp.set("v.useFooter","true");
    		testerCmp.find("createPanelBtn").get("e.press").fire();
    	}, function(cmp) {
    		test = this.getPanelTesterComponent(cmp.find("tester"))
    		this.waitForNumberOfPanels("modal", 2);
    	}, function(cmp) {
    		var modal2GlobalId = this.getGlobalIdForPanelModal(2);
    		var modal2VisibleAttrValue = $A.getCmp(modal2GlobalId).get("v.visible");
    		var modal1VisibleAttrValue = $A.getCmp(modal1GlobalId).get("v.visible");
			$A.test.addWaitForWithFailureMessage(true, function(){return $A.getCmp(modal2GlobalId).get("v.visible");}, "Visible Attribute should be set for new modal opened");
    		$A.test.assertTrue(modal1VisibleAttrValue, "Visible Attribute should not be set for old modal opened");
    		this.verifyElementWithClassPresent("defaultCustomPanelHeader", true, 
			"Custom panel header should be present for second modal");
    		this.verifyElementWithClassPresent("defaultCustomPanelFooter", true, 
			"Custom panel footer should be present for second modal");
    	}]
    },
    
    /**
     * Test close modal with multiple modals closes top most modal
     */
    testCloseModalWithMulitpleModals: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		// second modal
    		var panelTesterCmp = this.getPanelTesterComponent(cmp.find("tester"));
    		panelTesterCmp.find("createPanelBtn").get("e.press").fire();
    	}, function(cmp) {
    		this.waitForNumberOfPanels("modal", 2);
    	}, function(cmp) {
    		this.closePanel(cmp);
    	}, function(cmp) {
    		this.waitForNumberOfPanels("modal", 1);
    	}]
    },
    
    /**
     * Test open multiple modal and panels 
     * And closing them should close top most panel/modal
     */
    testCloseMulitpleModalPanels: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		// second panel
    		$A.test.addWaitForWithFailureMessage(true, function() {
        		var element = $A.test.select(".uiModal")[0];
                return $A.util.hasClass(element, "active");
            }, "Modal should have class active");
    		var panelTesterCmp = this.getPanelTesterComponent(cmp.find("tester"));
    		panelTesterCmp.set("v.panelType","panel");
    		panelTesterCmp.set("v.flavor","full-screen");
    		panelTesterCmp.find("createPanelBtn").get("e.press").fire();
    	}, function(cmp) {
    		this.waitForNumberOfPanels("panel", 1);
    		this.waitForNumberOfPanels("modal", 1);
    		$A.test.addWaitForWithFailureMessage(true, function() {
        		var element = $A.test.select(".uiPanel")[0];
                return $A.util.hasClass(element, "active");
            }, "Panel should have class active");
    	}, function(cmp) {
    		this.closePanel(cmp);
    	}, function(cmp) {
    		this.waitForModalClose();
    	}, function(cmp) {
    		this.waitForNumberOfPanels("panel", 1);
    	}]
    },
    
    /**
     * Test title hidden
     */
    testTitleHidden: {
    	attributes : {"testDisplayTitle" : false},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		var header = cmp.find("tester")._panel.getElement().getElementsByTagName("h2")[0];
    		$A.test.assertFalse($A.util.hasClass(header, "title"), "Title shold be hidden");
    	}]
    },
    
    /**
     * Test modal panel invisible
     */
    testModalHidden: {
    	attributes : {"testIsVisible" : false},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		var modal = $A.test.getElementByClass("uiModal");
    		$A.test.assertFalse($A.util.hasClass(modal, "active"), "Modal panel shold be hidden");
    	}, function(cmp) {
    		//use case for bug: W-2619412
    		modal1GlobalId = this.getGlobalIdForPanelModal(1);
			$A.test.addWaitForWithFailureMessage(false, function(){return $A.getCmp(modal1GlobalId).get("v.visible");}, "Visible Attribute should be set to false for non-visible modal");
    	}]
    },
    
    /**
     * Open 1st panel with visible set and then open 2nd panel with visible unset
     * Closing the 1st panel should not add active class to 2nd panel
     * Bug: W-2617288
     */
    testModalHiddenWithMultipleVisibleModal: {
    	attributes : {"testIsVisible" : false},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		var panelTesterCmp = this.getPanelTesterComponent(cmp.find("tester"));
    		panelTesterCmp.set("v.isVisible","true");
    		panelTesterCmp.find("createPanelBtn").get("e.press").fire();
    	}, function(cmp) {
    		this.closePanel(cmp, "Close", 2);
    	}, function(cmp) {
    		var modal = $A.test.getElementByClass("uiModal")[0];
    		$A.test.addWaitForWithFailureMessage(false, function(){return $A.util.hasClass(modal,"active")}, "Modal panel shold be hidden");
		}]
    },
    
    /**
     * Test panel dialog invisible
     */
    testPanelDialogHidden: {
    	attributes : {"testPanelType" : "panel", "testIsVisible" : false},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		var panel = $A.test.getElementByClass("uiPanel");
    		$A.test.assertFalse($A.util.hasClass(panel, "active"), "Panel dialog shold be hidden");
    	}]
    },
    
    /**
     * Test custom header in Modal
     */
    testCustomHeaderInModal: {
    	attributes : {"testUseHeader" : true},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		this.verifyElementWithClassPresent("defaultCustomPanelHeader", true, 
    				"Custom panel header for modal should be present");
    	}]
    },
    
    /**
     * Test custom footer in Modal
     */
    testCustomFooterInModal: {
    	attributes : {"testUseFooter" : true},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		this.verifyElementWithClassPresent("defaultCustomPanelFooter", true, 
    				"Custom panel footer for modal should be present");
    	}]
    },
    
    /**
     * Test custom header in Panel Dialog
     */
    testCustomHeaderInPanelDialog: {
    	attributes : {"testPanelType" : "panel", "testUseHeader" : true},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyElementWithClassPresent("defaultCustomPanelHeader", true, 
    				"Custom panel header for panel dialog should be present");
    	}]
    },
    
    /**
     * Test custom footer in Panel Dialog
     */
    testCustomFooterInPanelDialog: {
    	attributes : {"testPanelType" : "panel", "testUseFooter" : true},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyElementWithClassPresent("defaultCustomPanelFooter", true, 
    				"Custom panel footer for panel dialog should be present");
    	}]
    },
    
    /**
     * Test close modal
     */
    testCloseModal: {
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		this.closePanel(cmp);
    	}, function(cmp) {
    		this.waitForModalClose();
    	}, function(cmp) {
    		var ModalIdcreated = cmp.find("tester").find("idCreated").get("v.value");
    		var ModalIdDestroyed = cmp.find("tester").find("idDestroyed").get("v.value");
    		$A.test.assertEquals($A.test.getText(ModalIdcreated), $A.test.getText(ModalIdDestroyed), "Modal is not destroyed correctly");
    	}]
    },
    
    /**
     * Test close panel dialog
     */
    testClosePanelDialog: {
    	attributes : {"testPanelType" : "panel"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.closePanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogClose();
    	}, function(cmp) {
    		var ModalIdcreated = cmp.find("tester").find("idCreated").get("v.value");
    		var ModalIdDestroyed = cmp.find("tester").find("idDestroyed").get("v.value");
    		$A.test.assertEquals($A.test.getText(ModalIdcreated), $A.test.getText(ModalIdDestroyed), "Panel is not destroyed correctly");
    	}]
    },
    
    /**
     * Test close modal with invalid animation
     * Bug: W-2614945
     */
    testCloseModalWithInvalidAnimation: {
    	attributes : {"testAnimation": "abc"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForModalOpen();
    	}, function(cmp) {
    		this.closePanel(cmp);
    	}, function(cmp) {
    		this.waitForModalClose();
    	}, function(cmp) {
    		var ModalIdcreated = cmp.find("tester").find("idCreated").get("v.value");
    		var ModalIdDestroyed = cmp.find("tester").find("idDestroyed").get("v.value");
    		$A.test.assertEquals($A.test.getText(ModalIdcreated), $A.test.getText(ModalIdDestroyed), "Modal is not destroyed correctly");
    	}]
    },
    
    /**
     * Test close panel dialog with invalid animation
     * Bug: W-2614943
     */
    testClosePanelDialogWithInvalidAnimation: {
    	attributes : {"testPanelType" : "panel", "testAnimation": "abc"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.closePanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogClose();
    	}, function(cmp) {
    		var ModalIdcreated = cmp.find("tester").find("idCreated").get("v.value");
    		var ModalIdDestroyed = cmp.find("tester").find("idDestroyed").get("v.value");
    		$A.test.assertEquals($A.test.getText(ModalIdcreated), $A.test.getText(ModalIdDestroyed), "Panel is not destroyed correctly");
    	}]
    },
    
    /**
     * Test close panel dialog with custom close dialog label
     */
    testClosePanelDialogWithCloseDialogLabel: {
    	attributes : {"testPanelType" : "panel", "testCloseDialogLabel" : "CloseLabel"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.closePanel(cmp, "CloseLabel");
    	}, function(cmp) {
    		this.waitForPanelDialogClose();
    	}]
    },
    
    /**************************************************PANEL POSITION TEST**************************************************/
    
    /**
     * Test panel with reference element set
     */
    testPanelWithReferenceElementSet: {
    	attributes : {"testPanelType" : "panel", 
    		"testUseReferenceElement" : true, 
    		"testReferenceElementSelector" : ".appInput",
    		"testDirection" : "south"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		var expectedRefElId = cmp.find("appInput").getGlobalId() + ",";
    		var actualRefElId = cmp.find("tester").find("idRefEl").get("v.value");
    		$A.test.assertEquals(expectedRefElId, actualRefElId, "ReferenceElement's id is incorrect")
    	}]
    },
    
    /**
     * Test panel with referenece element selector set
     */
    testPanelWithReferenceElementSelectorSet: {
    	attributes : {"testPanelType" : "panel", 
    		"testUseReferenceElementSelector" : true, 
    		"testReferenceElementSelector" : ".appInput",
    		"testDirection" : "south"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    		// note: when using referenceElementSelector the referenceElement attribute is not set,
    		// so we can not grab the id of the reference element in the test. We just verify the
    		// panel displays without errors.
    	}]
    },
    
    /**
     * Test panel with referece element and selector set
     */
    testPanelWithBothReferenceElementAttributesSet: {
    	attributes : {"testPanelType" : "panel", 
    		"testUseReferenceElement" : true, 
    		"testUseReferenceElementSelector" : true,
    		"testReferenceElementSelector" : ".appInput",
    		"testDirection" : "south"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		var expectedRefElId = cmp.find("appInput").getGlobalId() + ",";
    		var actualRefElId = cmp.find("tester").find("idRefEl").get("v.value");
    		$A.test.assertEquals(expectedRefElId, actualRefElId, "ReferenceElement's id is incorrect")
    	}]
    },
    
    /**
     * Test panel with invalid reference element.
     */
    testPanelWithInvalidReferenceElement: {
    	attributes : {"testPanelType" : "panel", 
    		"testUseReferenceElement" : true, 
    		"testReferenceElementSelector" : ".xyz",
    		"testDirection" : "south"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		var actualRefElId = cmp.find("tester").find("idRefEl").get("v.value");
    		$A.test.assertEquals("", actualRefElId, "ReferenceElement's id is incorrect")
    	}]
    },
    
    /**
     * Test panel with empty reference element.
     */
    testPanelWithEmptyReferenceElement: {
    	attributes : {"testPanelType" : "panel", 
    		"testUseReferenceElement" : true, 
    		"testReferenceElementSelector" : "empty",
    		"testDirection" : "south"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		var actualRefElId = cmp.find("tester").find("idRefEl").get("v.value");
    		$A.test.assertEquals("", actualRefElId, "ReferenceElement's id is incorrect")
    	}]
    },
    
    /**
     * Test panel with null refernece element
     */
    testPanelWithNullReferenceElement: {
    	attributes : {"testPanelType" : "panel", 
    		"testUseReferenceElement" : true, 
    		"testReferenceElementSelector" : "null",
    		"testDirection" : "south"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		var actualRefElId = cmp.find("tester").find("idRefEl").get("v.value");
    		$A.test.assertEquals("", actualRefElId, "ReferenceElement's id is incorrect")
    	}]
    },
    
    testPanelWestPositionWithoutPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".appInput",
    		"testDirection" : "west"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(false);
    	}]
    },
    
    testPanelWithWrongDirection: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".appInput",
    		"testDirection" : "brokenDirection"},
    	test: function(cmp) {
    		try {
    			this.createPanel(cmp);
    			$A.test.fail("Expected Invalid direction error");
    		} catch (e) {
    			var expectedErrorMsg = "Invalid direction";
            	$A.test.assertTrue($A.test.contains(e.message, expectedErrorMsg), "Expected Invalid direction error");
            }
    	}
    },
    
    testPanelEastPositionWithoutPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testDirection" : "east"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(false);
    	}]
    },
    
    testPanelNorthPositionWithoutPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testDirection" : "north"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(false);
    	}]
    },
    
    testPanelSouthPositionWithoutPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".appInput",
    		"testDirection" : "south"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(false);
    	}]
    },
    
    testPanelNorthWestPositionWithoutPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testDirection" : "northwest"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(false);
    	}]
    },
    
    testPanelNorthEastPositionWithoutPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testDirection" : "northeast"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(false);
    	}]
    },
    
    testPanelSouthEastPositionWithoutPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testDirection" : "southeast"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(false);
    	}]
    },
    
    testPanelSouthWestPositionWithoutPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".appInput",
    		"testDirection" : "southwest"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(false);
    	}]
    },
    
    testPanelNorthWestPositionWithPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testShowPointer" : true,
    		"testDirection" : "northwest"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(true);
    	}]
    },
    
    testPanelNorthEastPositionWithPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testShowPointer" : true,
    		"testDirection" : "northeast"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(true);
    	}]
    },
    
    testPanelSouthEastPositionWithPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testShowPointer" : true,
    		"testDirection" : "southeast"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(true);
    	}]
    },
    
    testPanelSouthWestPositionWithPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".appInput",
    		"testShowPointer" : true,
    		"testDirection" : "southwest"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(true);
    	}]
    },
    
    testPanelWestPositionWithPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".appInput",
    		"testShowPointer" : true,
    		"testDirection" : "west"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(true);
    	}]
    },
    
    testPanelEastPositionWithPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testShowPointer" : true,
    		"testDirection" : "east"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(true);
    	}]
    },
    
    testPanelNorthPositionWithPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".createPanelBtnClass",
    		"testShowPointer" : true,
    		"testDirection" : "north"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(true);
    	}]
    },
    
    testPanelSouthPositionWithPointer: {
    	attributes : {"testPanelType" : "panel", 
    		"testReferenceElementSelector" : ".appInput",
    		"testShowPointer" : true,
    		"testDirection" : "south"},
    	test: [function(cmp) {
    		this.createPanel(cmp);
    	}, function(cmp) {
    		//just verify the panel displays without errors.
    		this.waitForPanelDialogOpen();
    	}, function(cmp) {
    		this.verifyPointerPresent(true);
    	}]
    },
    
    /**************************************************PANEL POSITION TEST ENDS**************************************************/
    
    verifyPointerPresent : function(isPresent) {
    	var errorMsg = "Pointer for panel should not be present";
    	if(isPresent){
    		errorMsg = "Pointer for panel should be present";
    	}
    	this.verifyElementWithClassPresent("pointer", isPresent, errorMsg);
    },
    
    verifyElementWithClassPresent : function(className, isPresent, errorMsg) {
    	var element = $A.test.getElementByClass(className);
    	var result = !$A.util.isUndefinedOrNull(element);
    	if (isPresent) {
    		$A.test.assertTrue(result, errorMsg);
    	} else {
    		$A.test.assertFalse(result, errorMsg);
    	}
    },
    
    getPanelTesterComponent : function(cmp) {
    	var panelRef = cmp._panel;
    	var panelBodyElem = panelRef.find("body").getElement();
    	var testerHtmlCmp = $A.componentService.getRenderingComponentForElement(panelBodyElem.lastChild);
    	return testerHtmlCmp.getAttributeValueProvider();
    },
    
    createPanel : function(cmp) {
    	cmp.find("tester").find("createPanelBtn").get("e.press").fire();
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
    
    waitForNumberOfPanels : function(panelType, numPanels) {
    	this.waitForPanel(panelType, null, numPanels)
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
    },
    
    getGlobalIdForPanelModal : function(panelNumber){
    	return $A.test.getText($A.test.select(".info .idCreated")[panelNumber-1]);
    }
})
