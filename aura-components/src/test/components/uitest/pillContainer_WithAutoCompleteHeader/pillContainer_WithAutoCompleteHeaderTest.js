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
    DOWNARROW_KEY: 40,
    ENTER_KEY: 13,


    testEvenSelection: {
        test: function (cmp) {
            var select = cmp.find("select");
            select.set("v.value","Even");
            select.get("e.change").fire();
            this._createPillByAutoComplete(cmp);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
            $A.test.assertTrue($A.test.getText(($A.test.select(".pill")[0])).indexOf(this.PILLS[1].label) > -1, "The wrong pill was created");
            $A.test.assertTrue(this._validateAutocompleteList(this.PILLS[1].label), this.PILLS[1].label + "should be part of autocomplete list");
            $A.test.assertTrue(this._validateAutocompleteList(this.PILLS[3].label), this.PILLS[3].label + "should be part of autocomplete list");
            $A.test.assertFalse(this._validateAutocompleteList(this.PILLS[0].label), this.PILLS[0].label + "should not be part of autocomplete list");
            $A.test.assertFalse(this._validateAutocompleteList(this.PILLS[2].label), this.PILLS[2].label + "should not be part of autocomplete list");
        }
    },

    testOddSelection: {
        test: function (cmp) {
            var select = cmp.find("select");
            select.set("v.value","Odd");
            select.get("e.change").fire();
            this._createPillByAutoComplete(cmp);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
            $A.test.assertTrue($A.test.getText(($A.test.select(".pill")[0])).indexOf(this.PILLS[0].label) > -1, "The wrong pill was created");
            $A.test.assertTrue(this._validateAutocompleteList(this.PILLS[0].label), this.PILLS[0].label + "should be part of autocomplete list");
            $A.test.assertTrue(this._validateAutocompleteList(this.PILLS[2].label), this.PILLS[2].label + "should be part of autocomplete list");
            $A.test.assertFalse(this._validateAutocompleteList(this.PILLS[1].label), this.PILLS[1].label + "should not be part of autocomplete list");
            $A.test.assertFalse(this._validateAutocompleteList(this.PILLS[3].label), this.PILLS[3].label + "should not be part of autocomplete list");
        }
    },

    _createPillByAutoComplete: function (cmp) {
        var textInput = this._getInput(cmp);
        var autocomplete = cmp.find("autocomplete");
        var value = this.PILLS[0].label.substring(0, 4);
        textInput.set("v.value", value);
        this._fireInputchange(autocomplete, value);

        this._fireKeydownEvent(textInput, this.ENTER_KEY);
        return textInput;
    },

    _getInput: function(cmp) {
        return cmp.find("autocomplete").getSuper().find("input");
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

    _fireInputchange: function(cmp, value) {
        var inputChangeEvt = cmp.get("e.inputChange");
        if (inputChangeEvt) {
            inputChangeEvt.setParams({
                value: value
            });
            inputChangeEvt.fire();
        }
    },
    
    _validateAutocompleteList: function(label) {
    	var listContent = $A.test.select(".listContent")[0];
    	var list = listContent.getElementsByTagName("ul")[0];
    	var lengthOfList = list.childElementCount;
        var indexOf = $A.test.getText(list).indexOf(label);
        return indexOf != -1;
    }
})