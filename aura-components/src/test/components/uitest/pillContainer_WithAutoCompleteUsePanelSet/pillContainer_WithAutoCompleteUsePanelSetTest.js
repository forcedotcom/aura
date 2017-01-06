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
    PILLS: [{id:'pill01',label:"Test Pill 01",icon: {url:'https://ipsumimage.appspot.com/20x20,ff8888?l=1&f=FFFFFF'}},
        {id:'pill02',label:"Test Pill 02",icon: {url:'https://ipsumimage.appspot.com/20x20,88cc88?l=2&f=FFFFFF'}},
        {id:'pill03',label:"Test Pill 03",icon: {url:'https://ipsumimage.appspot.com/20x20,8888FF?l=3&f=FFFFFF'}},
        {id:'pill04',label:"Test Pill 04",icon: {url:'https://ipsumimage.appspot.com/20x20,88cccc?l=4&f=FFFFFF'}}],
    browsers: ["GOOGLECHROME", "IPHONE", "IPAD", "FIREFOX", "IE9", "IE10", "SAFARI", "ANDROID_PHONE", "ANDROID_TABLET"],
    doNotWrapInAuraRun: true,
    
    ENTER_KEY: 13,
    COMMA_KEY: 188,
    RIGHT_ARROW_KEY:39,
    LEFT_ARROW_KEY: 37,

    /**
     * Automation to support full-width MRU for input lookup
     * Story: W-2886097
     */
    testListWithReferenceElementOnLeft: {
        test: function (cmp) {
        	//set reference component to the button
        	var buttonId = "leftButton";
            this._verifyListReferenceComponent(cmp, buttonId);
        }
    },
    
    /**
     * Automation to support full-width MRU for input lookup
     * Story: W-2886097
     */
    testListWithReferenceElementOnRight: {
    	test: function (cmp) {
    		//set reference component to the button
        	var buttonId = "rightButton";
            this._verifyListReferenceComponent(cmp, buttonId);
        }
    },

    testEnterCreatesPill: {
        test: function (cmp) {
            this._inputPill(this._getInput(cmp), this.PILLS[0].label);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
        }
    },

    testFocus: {
        test: function (cmp) {
        	this._getInputElement(cmp).blur();
            var pillContainer = cmp.find("pillContainer");
            pillContainer.focus();
            $A.test.assertEquals(document.activeElement, this._getInputElement(cmp), "input should be focused");
        }
    },
    
    testCreatesPillUsingComma: {
        test: function (cmp) {
            this._inputPillWithComma(this._getInput(cmp), this.PILLS[0].label);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
        }
    },

    testEnterWithNoTextDoesNotCreatePill: {
        test: function (cmp) {
            this._fireKeydownEvent(this._getInput(cmp), this.ENTER_KEY);
            $A.test.assertEquals(0, $A.test.select(".pill").length, "Pill should not have been created");
        }
    },
        
    testEnterClearsInput: {
        test: function (cmp) {
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals(0, this._getInputElement(cmp).value.length, "input should be empty");
        }
    },

    testEnterWithDuplicateTextDoesNotCreatePill: {
        test: function (cmp) {
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "There should only be one pill");
        }
    },

    testFocusKeptAfterItemInput: {
        test: function (cmp) {
            var textInput = this._getInput(cmp);
            textInput.getElement().focus();
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals(document.activeElement, this._getInputElement(cmp), "input should be focused");
        }
    },

    BACKSPACE_KEY: 8,
    testBackspaceOnEmpty: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);

            var firstPill = pillContainer.find("pill");
            $A.test.assertEquals(document.activeElement, firstPill.getElement(), "pill should be focused");
        }
    },

    testFocusOnInputAfterDelete: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            var textInputElement =  this._getInputElement(cmp);
            this._inputPill(textInput, this.PILLS[0].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);

            var firstPill = pillContainer.find("pill");
            this._fireKeydownEvent(firstPill, this.BACKSPACE_KEY);

            $A.test.addWaitForWithFailureMessage(true, function() {
                return document.activeElement === textInputElement;
            }, "input should be focused");
        }
    },

    testFocusOnPillAfterDelete: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[1].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);

            var secondPill = pillContainer.find("pill")[1];
            this._fireKeydownEvent(secondPill, this.BACKSPACE_KEY);


            $A.test.addWaitForWithFailureMessage(true, function() {
                var firstPill = pillContainer.find("pill")[0];
                return document.activeElement === firstPill.getElement();
            }, "first pill should be focused");
        }
    },
    
    DOWNARROW_KEY: 40,
    testEnterOnAutoCompleteItemCreatesPill: {
        test: function (cmp) {
            this._createPillByAutoComplete(cmp);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
            $A.test.assertTrue($A.test.getText(($A.test.select(".pill")[0])).indexOf(this.PILLS[0].label) > -1, "The wrong pill was created");
        }
    },

    testEnterOnAutoCompleteItemClearsInput: {
        test: function (cmp) {
            var textInput = this._createPillByAutoComplete(cmp);
            $A.test.assertEquals(0, this._getInputElement(cmp).value.length, "input should be empty");
        }
    },

    testEnterOnAutoCompleteItemHidesList: {
        test: function (cmp) {
            this._createPillByAutoComplete(cmp);
            var list = cmp.find("autocomplete").getSuper().find("list");
            $A.test.assertFalse(list.get("v.visible"), "list should be hidden");
            //Verification for W-2707857
            $A.test.assertUndefinedOrNull($A.test.select(".visible")[0], "Auto complete List Content should not be visible in dom");
        }
    },
    
    testAutoCompleteListContentVisible: {
        test: [function (cmp) {
	            pillContainer = cmp.find("pillContainer");
	            this._createPillUsingAutoCompleteList(cmp);
	        }, function(cmp){
	        	var list = cmp.find("autocomplete").getSuper().find("list");
	        	$A.test.assertTrue(list.get("v.visible"), "list should be visible");
	        }
        ]
    },

    testAllowNewFalse: {
        test: function (cmp) {
            cmp.find("autocomplete").set("v.allowNew", false);
            this._inputPill(this._getInput(cmp), this.PILLS[2].label);
            $A.test.assertEquals(0, $A.test.select(".pill").length, "Pill should not have been created");
        }
    },

    testIconExistsInPill: {
        test: function (cmp) {
            this._createPillByAutoComplete(cmp);
            $A.test.assertEquals(1, $A.test.select(".pill .pillIcon").length, "Pill icon is not present");
        }
    },

    testShowMoreHidden: {
        test: function (cmp) {
            this._getInput(cmp).getElement().blur();
            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function() {
                return that._isDisplayNone($A.test.select(".showMore")[0])
            }, "\"show more\" button should not exist");
        }
    },

    testShowMoreHiddenOnFocus: {
        attributes: {
            maxLines: 1
        },
        test: function (cmp) {
            this._initializeWithThreePills(cmp);
            $A.test.assertTrue(this._isDisplayNone($A.test.select(".showMore")[0]), "\"show more\" button should not exist");
        }
    },

    testShowMoreVisibleOnBlur: {
        attributes: {
            maxLines: 1
        },
        test: function (cmp) {
            this._initializeWithFourPills(cmp);
            this._getInputElement(cmp).blur();
            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function() {
                return !that._isDisplayNone($A.test.select(".showMore")[0]);
            }, "\"show more\" button should exist");
        }
    },

    testShowMoreHiddenAfterAddingOnBlur: {
        attributes: {
            maxLines: 1
        },
        test: function (cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);
            $A.test.select(".showMore")[0].click();

            //add a pill after clicking show more
            pillContainer.insertItems([this.PILLS[3]]);
            this._getInput(cmp).getElement().blur();
            $A.test.assertTrue(this._isDisplayNone($A.test.select(".showMore")[0]), "\"show more\" button should not exist");
        }
    },

    testShowMoreHiddenAfterDeletingOnBlur: {
        attributes: {
            maxLines: 1
        },
        test: function (cmp) {
            var pillContainer = this._initializeWithFourPills(cmp);
            $A.test.select(".showMore")[0].click();

            //delete a pill after clicking show more
            var lastPill = pillContainer.find("pill")[3];
            this._fireKeydownEvent(lastPill, this.BACKSPACE_KEY);
            $A.test.assertTrue(this._isDisplayNone($A.test.select(".showMore")[0]), "\"show more\" button should not exist");
        }
    },

    testShowMoreVisibleAfterCallingCollapse: {
        attributes: {
            maxLines: 1
        },
        test: function (cmp) {
            var pillContainer = this._initializeWithFourPills(cmp);
            this._getInputElement(cmp).blur();
            $A.test.select(".showMore")[0].click();
            pillContainer.collapse();
            $A.test.assertFalse(this._isDisplayNone($A.test.select(".showMore")[0]), "\"show more\" button should exist");
        }
    },

    testShowMoreNotVisibleAfterCallingExpand: {
        attributes: {
            maxLines: 1
        },
        test: function (cmp) {
            var pillContainer = this._initializeWithFourPills(cmp);
            this._getInputElement(cmp).blur();
            pillContainer.expand();
            $A.test.assertTrue(this._isDisplayNone($A.test.select(".showMore")[0]), "\"show more\" button should not exist");
        }
    },

    testFocusOnPillAfterMaxReached: {
        attributes: {
            maxAllowed: 2
        },
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[1].label);

            $A.test.addWaitForWithFailureMessage(true, function() {
                var secondPill = pillContainer.find("pill")[1];
                return document.activeElement===secondPill.getElement();
            }, "second pill should be focused");
        }
    },
    
    /**
     * ui:pillContainer should remove maxAllowed class
     * Bug: W-2622542
     */
    testFocusOnPillAfterDeleteAndAfterMaxReached: {
        attributes: {
            maxAllowed: 2
        },
        test: [function (cmp) {
            pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[1].label);

            $A.test.addWaitForWithFailureMessage(true, function() {
                var secondPill = pillContainer.find("pill")[1];
                return document.activeElement===secondPill.getElement();
            }, "second pill should be focused");
        }, function(cmp){
        	$A.test.assertTrue($A.util.hasClass(pillContainer.getElement(),"maxAllowed"), "Pill Container should have className maxAllowed after reaching max allowed pills");
        	var secondPill = pillContainer.find("pill")[1];
            this._fireKeydownEvent(secondPill, this.BACKSPACE_KEY);

            $A.test.addWaitForWithFailureMessage(true, function() {
                var firstPill = pillContainer.find("pill")[0];
                return document.activeElement === firstPill.getElement();
            }, "first pill should be focused");
        }, function(cmp){
        	$A.test.assertFalse($A.util.hasClass(pillContainer.getElement(),"maxAllowed"), "Pill Container should not have className maxAllowed after deleting a pill");
        }]
    },

    /**
     * ui:pillContainer should remove maxAllowed class when adding via v.items
     * Bug: W-2663679
     */
    testMaxAllowedWhenAddingViaItems: {
        attributes: {
            maxAllowed: 1
        },
        test: [function (cmp) {
            pillContainer = cmp.find("pillContainer");
            pillContainer.set("v.items",[this.PILLS[0],this.PILLS[1]]);
            $A.test.assertTrue($A.util.hasClass(pillContainer.getElement(),"maxAllowed"), "Pill Container should have className maxAllowed after reaching max allowed pills");
            $A.test.assertEquals(1, $A.test.select(".pill").length, "There should only be one pill");
        }]
    },

    /**
     * ui:pillContainer should remove maxAllowed class when adding via v.items
     * Bug: W-2663679
     */
    testChangingMaxAllowed: {
        test: [function (cmp) {
            var pillContainer = this._initializeWithTwoPills(cmp);
            pillContainer.set("v.maxAllowed",1)
            $A.test.assertEquals(1, $A.test.select(".pill").length, "There should only be one pill");
        }]
    },

    testInsertPillWithMaxAllowedOne: {
        attributes: {
            maxAllowed: 1
        },
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);

            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
        }
    },

    testRemovePillWithMaxAllowedOne: {
        attributes: {
            maxAllowed: 1
        },
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            var textInputElement = this._getInputElement(cmp);
            this._inputPill(textInput, this.PILLS[0].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);

            var firstPill = pillContainer.find("pill");
            this._fireKeydownEvent(firstPill, this.BACKSPACE_KEY);

            $A.test.addWaitForWithFailureMessage(true, function() {
                return document.activeElement === textInputElement;
            }, "input should be focused");
        }
    },

    /**
     * if in the last pill, pressing right key - move into the input
     * W-2647751
     */
    testRightArrowKeyFromLastPill: {
        test: [function(cmp) {
            var pillContainer = this._initializeWithTwoPills(cmp);
            secondPill = pillContainer.find("pill")[1];
            firstPill = pillContainer.find("pill")[0];

            secondPill.focus();
            this._fireKeydownEvent(secondPill, this.RIGHT_ARROW_KEY);

            $A.test.assertEquals(document.activeElement, this._getInputElement(cmp), "input should be focused");
        }]
    },
    
    /*
     * pressing right key on the last pill should goto 1st pill when maxAllowed is reached.
     * Bug: W-2700320
     */
    testRightArrowKeyFromLastPillWhenMaxAllowedReached: {
    	attributes: {
            maxAllowed: 2
        },
        test: [function(cmp) {
            var pillContainer = this._initializeWithTwoPills(cmp);
            secondPill = pillContainer.find("pill")[1];
            firstPill = pillContainer.find("pill")[0];

            secondPill.focus();
            this._fireKeydownEvent(secondPill, this.RIGHT_ARROW_KEY);
            $A.test.assertEquals(document.activeElement, firstPill.getElement(), "First Pill should be focused");
        }]
    },

    /*
     * pressing left key on the first pill should goto last pill when maxAllowed is reached.
     * Bug: W-2700320
     */
    testLeftArrowKeyFromFirstPillWhenMaxAllowedReached: {
    	attributes: {
            maxAllowed: 2
        },
        test: [function(cmp) {
            var pillContainer = this._initializeWithTwoPills(cmp);
            secondPill = pillContainer.find("pill")[1];
            firstPill = pillContainer.find("pill")[0];

            firstPill.focus();
            this._fireKeydownEvent(firstPill, this.LEFT_ARROW_KEY);
            $A.test.assertEquals(document.activeElement, secondPill.getElement(), "Last Pill should be focused");
        }]
    },
    
    /**
     * if in the left most side of the input - pressing left key should move me to a pill
     * W-2647751
     */
    testLeftArrowKeyFromInput: {
        test: [function(cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);

            this._fireKeydownEvent(textInput, this.LEFT_ARROW_KEY);

            var firstPill = pillContainer.find("pill");
            $A.test.assertEquals(document.activeElement, firstPill.getElement(), "pill should be focused");
        }]
    },

    /**
     * if in the left most side of the input - pressing left key should NOT move me to a pill if there is un-pilled text.
     * W-2647751
     */
    testLeftArrowKeyFromInputWithText: {
        test: [function(cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            var textInputElement = this._getInputElement(cmp);
            this._inputPill(textInput, this.PILLS[0].label);

            textInput.set("v.value", "some input text");
            textInputElement.setSelectionRange(0, 0);
            this._fireKeydownEvent(textInput, this.LEFT_ARROW_KEY);

            var firstPill = pillContainer.find("pill");
            $A.test.assertEquals(document.activeElement, this._getInputElement(cmp), "input should be focused");
        }]
    },

    _getInput: function(cmp) {
    	return cmp.find("autocomplete").getSuper().find("input")
    },
    
    _getInputElement: function(cmp) {
    	return this._getInput(cmp).getElement();
    },

    _fireKeydownEvent: function(cmp, keycode) {
        cmp.getEvent("keydown").setParams({
            keyCode: keycode,
            domEvent: {
                type: "keydown",
                preventDefault: function(){}
            }
        }).fire();
    },

    _inputPill: function(textInput, text) {
    	textInput.set("v.value", text);
        this._fireKeydownEvent(textInput, this.ENTER_KEY);
    },
    
    _inputPillWithComma: function(textInput, text) {
    	textInput.set("v.value", text);
        this._fireKeydownEvent(textInput, this.COMMA_KEY);
    },

    _fireInputchange: function(cmp, value) {
        var inputChangeEvt = cmp.get("e.inputChange");
        if (inputChangeEvt) {
            inputChangeEvt.setParams({
                value: value
            });
            inputChangeEvt.fire();
        }
    },
    
    _createPillUsingAutoCompleteList: function(cmp){
    	var textInput = this._getInput(cmp);
        var autocomplete = cmp.find("autocomplete");
        var value = this.PILLS[0].label.substring(0, 4);
        textInput.set("v.value", value);
        this._fireInputchange(autocomplete, value);
    },

    _createPillByAutoComplete: function (cmp) {
        var textInput = this._getInput(cmp);
        this._createPillUsingAutoCompleteList(cmp);
        
        this._fireKeydownEvent(textInput, this.ENTER_KEY);
        return textInput;
    },

    _isDisplayNone: function (element) {
        var display = element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display;
        return display === "none";
    },

    _initializeWithTwoPills: function (cmp) {
        var pillContainer = cmp.find("pillContainer");
        pillContainer.insertItems([this.PILLS[0],this.PILLS[1]]);
        return pillContainer;
    },

    _initializeWithThreePills: function (cmp) {
        var pillContainer = this._initializeWithTwoPills(cmp);
        pillContainer.insertItems([this.PILLS[2]]);
        return pillContainer;
    },

    _initializeWithFourPills: function (cmp) {
        var pillContainer = this._initializeWithThreePills(cmp);
        pillContainer.insertItems([this.PILLS[3]]);
        return pillContainer;
    },
    _verifyListReferenceComponent: function(cmp, referenceElemId){
    	var autocomplete = cmp.find("autocomplete");
        autocomplete.set("v.listReferenceComponent",cmp.find(referenceElemId));

        //add some text
        var textInput = this._getInput(cmp);
        var autocomplete = cmp.find("autocomplete");
        var value = this.PILLS[0].label.substring(0, 4);
        textInput.set("v.value", value);
        this._fireInputchange(autocomplete, value);
        
        //validate the list shares the left position of the button
		$A.test.addWaitForWithFailureMessage(true, function() {
			var refElementLoc,autoCompleteListLoc;
            refElementLoc = cmp.find(referenceElemId).getElement().getBoundingClientRect().left;
            autoCompleteListLoc = autocomplete.getSuper().find("panel").getElement().getBoundingClientRect().left;

            // these values must be rounded because panel position is integer only
            // but browsers support fractions of pixels
            
			return (refElementLoc|0)===(autoCompleteListLoc|0);
		}, "List should be position below "+referenceElemId);
    }
})