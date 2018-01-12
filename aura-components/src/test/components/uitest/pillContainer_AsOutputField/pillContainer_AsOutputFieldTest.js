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
    PILLS: [
        {id:'pill01',label:"Test Pill 01",icon: {url:'https://ipsumimage.appspot.com/20x20,8888ff?l=1&f=FFFFFF', alt:'pill 01'}},
        {id:'pill02',label:"Test Pill 02",icon: {url:'https://ipsumimage.appspot.com/20x20,ff88cc?l=2&f=FFFFFF'}},
        {id:'pill03',label:"Test Pill 03",icon: {url:'https://ipsumimage.appspot.com/20x20,88cc88?l=3&f=FFFFFF'}}],
    PILLS_CASEINSENSITIVE: [{id:'pill01',label:"TEST PILL 01"},{id:'pill02',label:"TEST PILL 02"},{id:'pill03',label:"Test PILL 03"}],
    PILLS_WITHLONGLENGTH: [
                           {id:'pill01',label:"Pills can be used to provide text for categories or tags, and provide text selection in an auto-complete field",icon: {url:'https://ipsumimage.appspot.com/20x20,8888ff?l=1&f=FFFFFF'}}],
    
    browsers: ["GOOGLECHROME", "IPHONE", "IPAD", "FIREFOX", "IE9", "IE10", "SAFARI", "ANDROID_PHONE", "ANDROID_TABLET"],
    doNotWrapInAuraRun: true,

    testStartsEmpty: {
        test: function (cmp) {
            $A.test.assertEquals(0, $A.test.select(".pill").length, "pill should not be displayed on empty pillContainer.");
        }
    },

    testInsert: {
        test: function (cmp) {
        	this._insertPill(cmp, this.PILLS[0]);
        }
    },
    
    _insertPill: function(cmp, pill) {
    	var pillContainer = cmp.find("pillContainer");
        pillContainer.insertItems( [pill] );
        var pillItem = $A.test.select(".pill");
        var actualNumberOfPills = pillItem.length;
        $A.test.assertEquals(1, actualNumberOfPills, "Incorrect number of pills displayed.");
        this._validateIconURLIsPresent(cmp, actualNumberOfPills);
    },

    testPillIconInformational: {
    	failOnWarning: true,
    	test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems([this.PILLS[0]]);
            var pillIcons = $A.test.select(".pillIcon img");
            $A.test.assertEquals(this.PILLS[0].icon.alt,$A.test.getElementAttributeValue(pillIcons[0], "alt"),"pill icon should have alt attribute");
        }
    },

    testPillIconDecorative: {
    	failOnWarning: true,
    	test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems([this.PILLS[1]]);
            var pillIcons = $A.test.select(".pillIcon img");
            $A.test.assertEquals("", $A.test.getElementAttributeValue(pillIcons[0], "alt"),"pill icon should not have alt attribute");
        }
    },
    
    testDoNotDisplayDeleteIconInPills: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems( [this.PILLS[0]] );
            //Do not display delete icon on pills
            pillContainer.find("pill").set("v.showDelete",false);
            var actualNumberOfPills = $A.test.select(".pill").length;
            $A.test.assertEquals(1, actualNumberOfPills, "Incorrect number of pills displayed.");
            $A.test.assertEquals(0, $A.test.select(".deleteIcon").length, "Delete Icon on pill should not be present");
        }
    },

    testInsertTwo: {
        test: function (cmp) {
            this._initializeWithTwoPills(cmp);
            var actualNumberOfPills = $A.test.select(".pill").length;
            $A.test.assertEquals(2, actualNumberOfPills, "Incorrect number of pills displayed.");
            this._validateIconURLIsPresent(cmp, actualNumberOfPills);
            $A.test.assertTrue(this._pillExists(cmp, this.PILLS[0].label), "Expected pill not found");
            $A.test.assertTrue(this._pillExists(cmp, this.PILLS[1].label), "Expected pill not found");
        }
    },

    testInsertDuplicate: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems( [this.PILLS[0], this.PILLS[0]] );
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Only one pill component should exist");
            $A.test.assertTrue(this._pillExists(cmp, this.PILLS[0].label), "Expected pill not found");
        }
    },
    
    testInsertCaseInsensitiveDuplicatePill: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems( [this.PILLS[0], this.PILLS_CASEINSENSITIVE[0]]);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Only one pill component should exist");
            $A.test.assertTrue(this._pillExists(cmp, this.PILLS[0].label), "Expected pill not found");
        }
    },

    testMaxPills: {
        attributes: {
            maxAllowed: 2
        },
        test: function (cmp) {
            this._initializeWithThreePills(cmp);
            $A.test.assertEquals(2, $A.test.select(".pill").length, "maxAllowed should restrict number of pills");
            $A.test.assertTrue(this._pillExists(cmp, this.PILLS[0].label), "Expected pill 1 not found");
            $A.test.assertTrue(this._pillExists(cmp, this.PILLS[1].label), "Expected pill 2 not found");
            //to make sure it third pill doesn't overwrite the second pill
            $A.test.assertFalse(this._pillExists(cmp, this.PILLS[2].label), "Pill 3 should not be found");
        }
    },

    testPillGetsFocus: {
        test: [function(cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);
            var firstPill = pillContainer.find("pill")[0];

            firstPill.focus();

            this._validatePillIsFocused(firstPill);

        } ]
    },

    RIGHT_ARROW_KEY:39,
    testRightArrowKey: {
        test: [function(cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);
            var firstPill = pillContainer.find("pill")[0];

            firstPill.focus();
            this._fireKeydownEvent(firstPill, this.RIGHT_ARROW_KEY);

            this._validatePillIsFocused(pillContainer.find("pill")[1]);
        } ]
    },

    LEFT_ARROW_KEY: 37,
    testLeftArrowKey: {
        test: [function(cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);
            var secondPill = pillContainer.find("pill")[1];

            secondPill.focus();
            this._fireKeydownEvent(secondPill, this.LEFT_ARROW_KEY);

            this._validatePillIsFocused(pillContainer.find("pill")[0]);
        } ]
    },

    BACKSPACE_KEY: 8,
    testBackspace: {
        test: [function(cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);

            this._fireKeydownEvent(pillContainer.find("pill")[0], this.BACKSPACE_KEY);

            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function() {
                var deletedPillDoesNotExist = !that._pillExists(cmp, that.PILLS[0].label);
                var thereAreTwoPills = $A.test.select(".pill").length === 2;
                return thereAreTwoPills && deletedPillDoesNotExist;
            }, "There should only be two pills and the deleted pill should not exist after pressing backSpace on the first pill");
        } ]
    },

    DELETE_KEY: 46,
    testDeleteKey: {
        test: [function(cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);

            this._fireKeydownEvent(pillContainer.find("pill")[0], this.DELETE_KEY);

            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function() {
                var deletedPillDoesNotExist = !that._pillExists(cmp, that.PILLS[0].label);
                var thereAreTwoPills = $A.test.select(".pill").length === 2;
                return thereAreTwoPills && deletedPillDoesNotExist;
            }, "There should only be two pills and the deleted pill should not exist after pressing delete on first pill");
        } ]
    },

    testDeleteClick: {
        test: function (cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);

            pillContainer.find("pill")[1].getElement().getElementsByClassName("deleteIcon")[0].click();

            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function () {
                var deletedPillDoesNotExist = !that._pillExists(cmp, that.PILLS[1].label);
                var thereAreTwoPills = $A.test.select(".pill").length === 2;
                return thereAreTwoPills && deletedPillDoesNotExist;
            }, "There should only be two pills and the deleted pill should not exist after pressing delete icon");
        }
    },

    testClickOnPill: {
        browsers: ["GOOGLECHROME", "FIREFOX", "IE9", "IE10", "SAFARI"],
        test: function(cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);
            var firstPill = pillContainer.find("pill")[0];

            firstPill.focus();
            firstPill.getEvent("click").setParams({
                domEvent: { target: { classlabel: {
                    indexOf : function() {
                        return -1;
                    }
                } } } }).fire();

            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function() {
                var clickedPillStillExists = that._pillExists(cmp, that.PILLS[0].label);
                var thereAreThreePills = $A.test.select(".pill").length === 3;
                return thereAreThreePills && clickedPillStillExists;
            }, "Clicking the pill should not delete it");
        }
    },

    testClickOnDelete: {
        test: function(cmp) {
            var pillContainer = this._initializeWithThreePills(cmp);
            var firstPillDeleteIcon = $A.test.select(".deleteIcon")[0];
            firstPillDeleteIcon.click();

            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function() {
                var clickedPillStillExists = that._pillExists(cmp, that.PILLS[0].label);
                var thereAreTwoPills = $A.test.select(".pill").length === 2;
                return thereAreTwoPills && !clickedPillStillExists;
            }, "Clicking the pill's delete icon should delete it");
        }
    },

    testBrokenIcon: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems( [{id:'pill01',label:"Test Pill 01",icon: {url:'notfound.gif'}}] );
            var icon = $A.test.select(".pillIcon img")[0].parentElement;
            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function() {
                return that._isDisplayNone( icon);
            }, "icon should not be visible with broken icon");
        }
    },

    testFocus: {
        test: function (cmp) {

            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems( [this.PILLS[0]] );
            pillContainer.focus();
            $A.test.addWaitForWithFailureMessage(true, function() {
                var pill = pillContainer.find("pill");
                return document.activeElement===pill.getElement();
            }, "pill should be focused");
        }
    },

    _validatePillIsFocused: function(cmp) {
        $A.test.assertTrue($A.util.hasClass(cmp.getElement(), "focused"), "The pill is not focused");

        $A.test.assertEquals("visible",
            $A.test.getStyle(cmp.getElement().getElementsByClassName("deleteIcon")[0], "visibility"),
            "The delete icon is not visible when the pillItem is on focus or hover");
    },
    
    _validateIconURLIsPresent: function(cmp, expectedPillsCount) {
    	var that = this;
    	var pillIcons = $A.test.select(".pillIcon img");
    	for (i = 0; i < expectedPillsCount; i++) {
    		var expectedURL = that.PILLS[i].icon.url;
    		$A.test.assertEquals(expectedURL,$A.test.getElementAttributeValue(pillIcons[i], "src"),"Icon Url for pill " + i + " is not correct");
    	}
    },

    _fireKeydownEvent: function(cmp, keycode) {
        cmp.getEvent("keydown").setParams({
            keyCode: keycode
        }).fire();
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

    _pillExists: function(cmp, label) {
        var innerHTML = $A.test.getText(cmp.getElement());
        var indexOf = innerHTML.indexOf(label);
        return indexOf != -1;
    },

    _isDisplayNone: function (element) {
        var display = element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display;
        return display === "none";
    }


})