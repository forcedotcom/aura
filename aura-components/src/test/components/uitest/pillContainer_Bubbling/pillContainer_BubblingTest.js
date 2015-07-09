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
        {id:'pill01',label:"Test Pill 01",icon: {url:'https://ipsumimage.appspot.com/20x20,8888ff?l=1&f=FFFFFF'}},
        {id:'pill02',label:"Test Pill 02",icon: {url:'https://ipsumimage.appspot.com/20x20,ff88cc?l=2&f=FFFFFF'}},
        {id:'pill03',label:"Test Pill 03",icon: {url:'https://ipsumimage.appspot.com/20x20,88cc88?l=3&f=FFFFFF'}}],
    PILLS_CASEINSENSITIVE: [{id:'pill01',label:"TEST PILL 01"},{id:'pill02',label:"TEST PILL 02"},{id:'pill03',label:"Test PILL 03"}],
    PILLS_WITHLONGLENGTH: [
                           {id:'pill01',label:"Pills can be used to provide text for categories or tags, and provide text selection in an auto-complete field",icon: {url:'https://ipsumimage.appspot.com/20x20,8888ff?l=1&f=FFFFFF'}}],
    
    browsers: ["GOOGLECHROME", "IPHONE", "IPAD", "FIREFOX", "IE9", "IE10", "SAFARI", "ANDROID_PHONE", "ANDROID_TABLET"],
    doNotWrapInAuraRun: true,


    /* FIXME kwtan: temp comment out this failed test
    testBlurEventBubble: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            cmp.find("autocomplete").focus();
            var result = cmp.find("result");
            result.getElement().focus();
            $A.test.assertEquals("blur",result.get("v.value"),"blur event didn't bubble");
        }
    },
    */

    testInsertEventBubble: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems( [this.PILLS[0]] );
            $A.test.assertEquals("inserted",cmp.find("result").get("v.value"),"insert event didn't bubble");
        }
    },


    testRemoveEventBubble: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            pillContainer.insertItems( [this.PILLS[0]] );
            pillContainer.find("pill").getElement().getElementsByClassName("deleteIcon")[0].click();
            var that = this;
            $A.test.addWaitForWithFailureMessage(true, function() {
                return cmp.find("result").get("v.value") === "removed";
            }, "remove event didn't bubble");
        }
    },

    _validateIconURLIsPresent: function(cmp, expectedPillsCount) {
    	var that = this;
    	var pillIcons = $A.test.select(".pillIcon");
    	for (i = 0; i < expectedPillsCount; i++) {
    		var expectedURL = that.PILLS[i].icon.url;
    		$A.test.assertEquals(expectedURL,$A.test.getElementAttributeValue(pillIcons[i], "src"),"Icon Url for pill " + i + " is not correct");
    	}
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

    _validateTitlePresentInPill: function(pill, isTitlePresent, label){
    	var pillTitle = $A.test.getElementAttributeValue(pill,"title")
    	if(!isTitlePresent){
    		$A.test.assertFalsy(pillTitle,"Title attribute should not be present on the pill")
    	}
    	else{
    		$A.test.assertTruthy(pillTitle,"Title attribute should be present on the pill")
        	$A.test.assertEquals(label, pillTitle, "Title attribute set is incorrect");
    		var pillTextElement = $A.test.select(".pillText")[0];
    		$A.test.assertTrue(pillTextElement.offsetWidth < pillTextElement.scrollWidth, "Pill text should be truncated");
    	}
    }
})