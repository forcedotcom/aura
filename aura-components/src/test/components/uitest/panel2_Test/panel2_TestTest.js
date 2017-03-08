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
     * Class set correctly on modal using join
     * Bug: W-3157190
     */
    testClassSetCorrectlyOnModalUsingJoin: {
        test: [function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var modalElement = $A.test.select(".uiModal")[0];
                return $A.util.hasClass(modalElement, "PanelModalClass "+$A.get('$Browser.formFactor'));
            }, "Modal should have class: PanelModalClass "+$A.get('$Browser.formFactor'));
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
     * Active Position is set to fixed for modal
     * Bug: W-3245795
     */
    testPositonSetToFixedOnModal: {
        test: [function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage("fixed", function() {
                var modalElement = $A.test.select(".uiModal")[0];
                return $A.test.getStyle(modalElement,"position");
            }, "Modal Position should be fixed");
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
     * Test to verify that the panel does focus the element specified by returnFocusElement when it is closed
     * with shouldReturnFocus = true
     */ 
    testPanelReturnFocusElementDoesFocusOnClose: {
        attributes : {"testPanelType" : "panel" },
        test: [function(cmp) {
        	cmp.set('v.testReturnFocusElement', $A.test.getElementByClass('inputFocusMeClass')[0]);
            
        	// Set the focus to a different element before opening the panel.
        	$A.test.getElementByClass('inputDoNotFocusMeClass')[0].focus();
        }, function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForPanelDialogOpen();
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputPanelTypeClass");
            }, "Panel was never opened and the focus was never at the first input element.");
        }, function(cmp) {	
        	// We must programmatically close the panel and force it to return focus because we
        	// cannot simulate an ESC or SHIFT+TAB key press which is the only
        	// valid case for when focus should be returned.
        	panelGlobalId = this.getGlobalIdForPanelModal(1);
        	panel = $A.getCmp(panelGlobalId);
        	panel.close(null, true);
        }, function(cmp) {         
            this.waitForPanelDialogClose();
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputFocusMeClass");
            }, "The focus me input should be focused after the panel is closed.");
        }]
    },
    
    testModalReturnFocusElementDoesFocusOnClose: {
        test: [function(cmp) {
        	cmp.set('v.testReturnFocusElement', $A.test.getElementByClass('inputFocusMeClass')[0]);
            
        	// Set the focus to a different element before opening the panel.
        	$A.test.getElementByClass('inputDoNotFocusMeClass')[0].focus();
        }, function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForModalOpen();
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputPanelTypeClass");
            }, "Modal was never opened and the focus was never at the first input element.");
        }, function(cmp) {	
        	// We must programmatically close the panel and force it to return focus because we
        	// cannot simulate an ESC or SHIFT+TAB key press which is the only
        	// valid case for when focus should be returned.
        	panelGlobalId = this.getGlobalIdForPanelModal(1);
        	panel = $A.getCmp(panelGlobalId);
        	panel.close(null, true);
        }, function(cmp) {         
            this.waitForModalClose();
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputFocusMeClass");
            }, "The focus me input should be focused after the panel is closed.");
        }]
    },
    
    /**
     * Test to verify that the panel does NOT focus the element specified by returnFocusElement when it is closed
     * with shouldReturnFocus = false
     */ 
    testPanelReturnFocusElementDoesNotFocusOnClose: {
        attributes : {"testPanelType" : "panel" },
        test: [function(cmp) {        	
        	cmp.set('v.testReturnFocusElement', $A.test.getElementByClass('inputFocusMeClass')[0]);
        }, function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForPanelDialogOpen()
        }, function(cmp) {	        	
        	panelGlobalId = this.getGlobalIdForPanelModal(1);
        	panel = $A.getCmp(panelGlobalId);
        	panel.close(null, false);
        }, function(cmp) {         
            this.waitForPanelDialogClose();
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return !$A.util.hasClass(activeElement, "inputFocusMeClass");
            }, "The focus me input should NOT be focused after the panel is closed.");
        }]
    },
    
    testModalReturnFocusElementDoesNotFocusOnClose: {
        test: [function(cmp) {        	
        	cmp.set('v.testReturnFocusElement', $A.test.getElementByClass('inputFocusMeClass')[0]);
        }, function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
        	this.waitForModalOpen()
        }, function(cmp) {	        	
        	panelGlobalId = this.getGlobalIdForPanelModal(1);
        	panel = $A.getCmp(panelGlobalId);
        	panel.close(null, false);
        }, function(cmp) {         
        	 this.waitForModalClose();
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return !$A.util.hasClass(activeElement, "inputFocusMeClass");
            }, "The focus me input should NOT be focused after the panel is closed.");
        }]
    },
    
    /**
     * Test to verify that when the panel is closed it will return focus to the element that was previously focused.
     */ 
    testPanelReturnFocusDefaultBehaviorOnClose: {
        attributes : {"testPanelType" : "panel", "testAutoFocus": true },
        test: [function(cmp) {
        	// Set the focus before opening the panel.
        	$A.test.getElementByClass('inputFocusMeClass')[0].focus();
        }, function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForPanelDialogOpen()
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputPanelTypeClass");
            }, "Panel was never opened and the focus was never at the first input element.");
        }, function(cmp) {	        	
        	// We must programmatically close the panel and force it to return focus because we
        	// cannot simulate an ESC or SHIFT+TAB key press which is the only
        	// valid case for when focus should be returned.
        	panelGlobalId = this.getGlobalIdForPanelModal(1);
        	panel = $A.getCmp(panelGlobalId);
        	panel.close(null, true);
        }, function(cmp) {         
            this.waitForPanelDialogClose();
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputFocusMeClass");
            }, "The focus me input should be focused after the panel is closed.");
        }]
    },
    
    testModalReturnFocusDefaultBehaviorOnClose: {
    	attributes : {"testAutoFocus": true },
        test: [function(cmp) {
        	// Set the focus before opening the panel.
        	$A.test.getElementByClass('inputFocusMeClass')[0].focus();
        }, function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForModalOpen();
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputPanelTypeClass");
            }, "Modal was never opened and the focus was never at the first input element.");
        }, function(cmp) {	        	
        	// We must programmatically close the panel and force it to return focus because we
        	// cannot simulate an ESC or SHIFT+TAB key press which is the only
        	// valid case for when focus should be returned.
        	panelGlobalId = this.getGlobalIdForPanelModal(1);
        	panel = $A.getCmp(panelGlobalId);
        	panel.close(null, true);
        }, function(cmp) {         
            this.waitForModalClose();
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var activeElement = $A.test.getActiveElement();
                return $A.util.hasClass(activeElement, "inputFocusMeClass");
            }, "The focus me input should be focused after the panel is closed.");
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
     * inputSelect with useMenu=true inside a panel set's width correctly
     * Bug: W-3204083
     */
    testMenuPicklistOnModal: {
        test: [function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForModalOpen();
        }, function(cmp) {
        	var modal = this.getPanelTesterComponent(cmp.find("tester"));
        	var modalElement = modal.getElement();
        	var modalWidth = parseInt($A.test.getStyle(modalElement,"width"));
        	var pickList = modal.find("inputSelectionOptions").getElement();
        	$A.test.addWaitForWithFailureMessage(modalWidth, function () {
        		return parseInt($A.test.getStyle(pickList,"width"));
            }, "Modal Width and menuPicklist width should be the same:" + modalWidth);
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
    // TODO: Flapping on Jenkins autobuilds
    _testPositionedPanelHideAndShow: {
        labels : ["flapper"],
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
            $A.test.addWaitForWithFailureMessage(0, function () {
                    return parseInt($A.test.getStyle(panel.getElement(),'opacity'));
                }, "Opacity of the panel should be 0 after hiding the panel");
        }, function(cmp) {
            panel.show();
        }, function(cmp) {
            this.waitForPanelDialogOpen();
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage("block", function () {
                    return $A.test.getStyle(panel.getElement(),'display')
                }, "Positioned panels should have display:block after showing it.");
        }, function(cmp) {
            $A.test.addWaitForWithFailureMessage(1, function () {
                    return parseInt($A.test.getStyle(panel.getElement(),'opacity'));
                }, "Opacity of the panel should be 1 after showing the panel");

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

    /**
    * Test app ecents
    * W-2964732
    */
    testOpenPanelTransitionEndEvent: {
        attributes : {"testPanelType" : "panel", "testCloseDialogLabel" : "CloseLabel"},
        test: [function(cmp) {
            var self = this;
            $A.test.addEventHandler('ui:panelTransitionEnd',
                function(e) {
                    var params = e.getParams();
                    $A.test.assertEquals('show', params.action);
                    $A.test.assertEquals(self.getGlobalIdForPanelModal(1), params.panelId);
                });
            this.createPanel(cmp);
        }]
    },

    testClosePanelTransitionEndEvent: {
        attributes : {"testPanelType" : "panel", "testCloseDialogLabel" : "CloseLabel"},
        test: [function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            var shownEventFinished = false;
            $A.test.addEventHandler('ui:panelTransitionEnd',
                    function(e) {
                        var params = e.getParams();
                        if(!shownEventFinished && params.action === 'show') {
                            shownEventFinished = true;
                        } else if (!shownEventFinished) {
                            $A.test.fail('Hide event caught before show event');
                        }
                    }
            );
            $A.test.addWaitFor(true, function() {
                return shownEventFinished;
            }, function() {
                var globalId = this.getGlobalIdForPanelModal(1);
                var closeCount = 0;
                $A.test.addEventHandler('ui:panelTransitionEnd',
                    function(e) {
                        var params = e.getParams();

                        closeCount++;

                        $A.test.assertEquals(1, closeCount, 'TranstionEnd event should be fired only once');
                        $A.test.assertEquals('hide', params.action, 'expected hide');
                        $A.test.assertEquals(globalId, params.panelId, 'panel id should be panel that closed');
                    }
                );
                this.closePanel(cmp);
            })         
        }]
    },

    testClosePanelTransitionEndEventDestroy: {
        attributes : {"testPanelType" : "panel", "testCloseDialogLabel" : "CloseLabel"},
        test: [function(cmp) {
            var endEvent = false;
            var globalId;

            $A.test.addWaitForWithFailureMessage(true, function() {
                return endEvent;
            }, "No transition end event was recieved");

            $A.get('e.ui:createPanel').setParams({
                panelType: 'panel',
                visible: true,
                panelConfig: {
                    body: $A.createComponentFromConfig({
                        componentDef : { descriptor: "markup://ui:outputText"},
                        attributes : {
                            values : {
                                value : "PANELS ARE GREAT"
                            }
                        }
                    })
                },

                onAfterShow: $A.getCallback(function(panel) {
                    var closeCount = 0;
                    globalId = panel.getGlobalId();

                    

                    $A.test.addEventHandler('ui:panelTransitionEnd',
                        function(e) {
                            endEvent = true;
                            var params = e.getParams();

                            closeCount++;
                            $A.test.assertEquals(1, closeCount, 'TranstionEnd event should be fired only once');
                            $A.test.assertEquals('hide', params.action, 'expected hide');
                            $A.test.assertEquals(globalId, params.panelId, 'panel id should be panel that closed');
                        }
                    );

                    $A.get('e.ui:destroyPanel').setParams({
                        panelInstance: panel.getGlobalId(),
                    }).fire();
                })
            }).fire();
            
        }]
    },
    
    testClosePanelUsingNotify: {
        attributes : {"testPanelType" : "panel"},
        test: [function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForPanelDialogOpen();
        }, function(cmp) {
            var panel = cmp._panel;
            if (panel == null) {
                panel = this.getPanelFromDomElement(cmp, "panel");
            }
            
            panel.getEvent('notify').setParams({
                action: 'closePanel',
                typeOf: 'ui:closePanel'
            }).fire();
        }, function(cmp) {
            this.waitForPanelDialogClose();
        }]
    },
    
    testCloseModalUsingNotify: {
        attributes : {"testPanelType" : "modal"},
        test: [function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForModalOpen();
        }, function(cmp) {
            var panel = cmp._panel;
            if (panel == null) {
                panel = this.getPanelFromDomElement(cmp, "modal");
            }
            
            panel.getEvent('notify').setParams({
                action: 'closePanel',
                typeOf: 'ui:closePanel'
            }).fire();
        }, function(cmp) {
            this.waitForModalClose();
        }]
    },
    
    testPanelDoesNotTrapFocus: {
        attributes : {"testTrapFocus" : false},
        test: [function(cmp) {
            this.createPanel(cmp);
        }, function(cmp) {
            this.waitForModalOpen();
        }, function(cmp) {
            var panel = cmp._panel;
            if (panel == null) {
                panel = this.getPanelFromDomElement(cmp, "modal");
            }
            $A.test.assertFalse(panel.get("v.trapFocus"), "trapFocus was not false");
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
            this.verifyPointerPresent(false);//ns,sw,ne,se, directions never have pointers
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
            this.verifyPointerPresent(false); 
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
            this.verifyPointerPresent(false);
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
            this.verifyPointerPresent(false);
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
    
    getPanelFromDomElement : function(cmp, panelType, index) {
        panelType = panelType == "panel" ? "uiPanel" : "uiModal";
        index = index ? index : 0;
        var panelElm = $A.test.getElementByClass(panelType);
        var htmlCmp = $A.componentService.getRenderingComponentForElement(panelElm[index]);
        return htmlCmp.getAttributeValueProvider();
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
