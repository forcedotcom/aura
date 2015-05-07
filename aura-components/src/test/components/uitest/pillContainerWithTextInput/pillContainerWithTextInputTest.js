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
    PILLS: [{id:'pill01',label:"Test Pill 01"},{id:'pill02',label:"Test Pill 02"},{id:'pill03',label:"Test Pill 03"}],
    browsers: ["GOOGLECHROME", "IPHONE", "IPAD", "FIREFOX", "IE9", "IE10", "SAFARI", "ANDROID_PHONE", "ANDROID_TABLET"],
    doNotWrapInAuraRun : true,
    
    ENTER_KEY: 13,
    BACKSPACE_KEY: 8,
    LEFTARROW_KEY: 37,
    RIGHTARROW_KEY: 39,
    
    testEnterCreatesPill: {
        test: function (cmp) {
        	$A.test.assertFalse(cmp.get("v.pillInsertFired"),"Pills Insert Event should not be fired yet");
        	this._inputPill(cmp.find("textInput"), this.PILLS[0].label);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
            $A.test.assertTrue(cmp.get("v.pillInsertFired"),"Pills Insert Event should be fired after pill was created");
        }
    },

    testEnterWithNoTextDoesNotCreatePill: {
        test: function (cmp) {
            this._fireKeydownEvent(cmp.find("textInput"), this.ENTER_KEY);
            $A.test.assertEquals(0, $A.test.select(".pill").length, "Pill should not have been created");
        }
    },

    testEnterClearsInput: {
        test: function (cmp) {
            var textInput = cmp.find("textInput");
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals(0, textInput.getElement().value.length, "input should be empty");
        }
    },

    testEnterWithDuplicateTextDoesNotCreatePill: {
        test: function (cmp) {
            var textInput = cmp.find("textInput");
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "There should only be one pill");
        }
    },

    testFocusKeptAfterItemInput: {
        test: function (cmp) {
            var textInput = cmp.find("textInput");
            textInput.getElement().focus();
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals($A.test.getActiveElement(), textInput.getElement(), "input should be focused");
        }
    },

    testBackspaceOnEmpty: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = cmp.find("textInput");
            this._inputPill(textInput, this.PILLS[0].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);

            var firstPill = pillContainer.find("pill");
            $A.test.assertEquals($A.test.getActiveElement(), firstPill.getElement(), "pill should be focused");
        }
    },

    testFocusOnInputAfterDelete: {
    	test: [function(cmp) {
        	$A.test.assertFalse(cmp.get("v.pillRemovedFired"),"Pills removed Event should not be fired yet");
        	
        	var pillContainer = cmp.find("pillContainer");
            var textInput = cmp.find("textInput");
            this._inputPill(textInput, this.PILLS[0].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);
            $A.test.assertFalse(cmp.get("v.pillRemovedFired"),"Pills removed Event should not be fired after shifting focus to first pill");
        	
            var firstPill = pillContainer.find("pill");
            this._fireKeydownEvent(firstPill, this.BACKSPACE_KEY);
            
            $A.test.addWaitForWithFailureMessage(true, function() {
                return $A.test.getActiveElement() === textInput.getElement();
            }, "input should be focused");
    	}, function(cmp) {    
    		$A.test.assertTrue(cmp.get("v.pillRemovedFired"),"Pills removed Event should be fired after deleting the pill");
        }]
    },

    testFocusOnPillAfterDelete: {
        test: [function (cmp) {
            pillContainer = cmp.find("pillContainer");
            var textInput = cmp.find("textInput");
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[1].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);
            secondPill = pillContainer.find("pill")[1];
            
            $A.test.addWaitForWithFailureMessage(true, function() {
                return $A.util.hasClass(secondPill.getElement(),"focused");
            }, "Second pill should be focused");
        }, function (cmp) {
        	this._fireKeydownEvent(secondPill, this.BACKSPACE_KEY);

            $A.test.addWaitForWithFailureMessage(true, function() {
                var firstPill = pillContainer.find("pill")[0];
                return $A.test.getActiveElement() === firstPill.getElement();
            }, "first pill should be focused");
        }] 
    },
    
    testFocusOnPillUsingLeftRightArrowKey: {
        test: [function (cmp) {
            pillContainer = cmp.find("pillContainer");
            var textInput = cmp.find("textInput");
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[1].label);
            
            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);
            secondPill = pillContainer.find("pill")[1];
            
            $A.test.addWaitForWithFailureMessage(true, function() {
                return $A.util.hasClass(secondPill.getElement(),"focused");
            }, "first pill should be focused");
        }, function (cmp) {
        	firstPill = pillContainer.find("pill")[0];
            this._fireKeydownEvent(secondPill, this.LEFTARROW_KEY);
            $A.test.addWaitForWithFailureMessage(true, function() {
                return $A.util.hasClass(firstPill.getElement(),"focused");
            }, "First pill should be focused");
        }] 
    },
    
    testLeftArrowKey: {
        test: [function(cmp) {
            var pillContainer = this._initializeWithTwoPills(cmp);
            secondPill = pillContainer.find("pill")[1];
            firstPill = pillContainer.find("pill")[0];
            
            secondPill.focus();
            this._fireKeydownEvent(secondPill, this.LEFTARROW_KEY);

            this._validatePillIsFocused(firstPill);
        }, function(cmp){
        	this._fireKeydownEvent(firstPill, this.LEFTARROW_KEY);
        	this._validatePillIsFocused(secondPill);
        }, function(cmp){
        	//making sure that focus is on the first pill instead of the input
        	this._fireKeydownEvent(secondPill, this.LEFTARROW_KEY);
        	this._validatePillIsFocused(firstPill);
        }]
    },
    
    _validatePillIsFocused: function(cmp) {
        $A.test.assertTrue($A.util.hasClass(cmp.getElement(), "focused"), "The pill is not focused");

        $A.test.assertEquals("visible",
            $A.test.getStyle(cmp.getElement().getElementsByClassName("deleteIcon")[0], "visibility"),
            "The delete icon is not visible when the pillItem is on focus or hover");
    },
    
    _initializeWithTwoPills: function (cmp) {
        var pillContainer = cmp.find("pillContainer");
        pillContainer.insertItems([this.PILLS[0],this.PILLS[1]]);
        return pillContainer;
    },

    _fireKeydownEvent: function(cmp, keycode) {
        cmp.getEvent("keydown").setParams({
            keyCode: keycode
        }).fire();
    },

    _inputPill: function(textInput, text) {
        textInput.set("v.value", text);
        this._fireKeydownEvent(textInput, this.ENTER_KEY);
    }

})