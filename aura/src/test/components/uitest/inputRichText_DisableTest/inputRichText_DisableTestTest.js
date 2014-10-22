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
	 * Toggle richText to between disable/enable. ckeditor should be
	 * replaced by inputTextArea when disabled, and value should be
	 * preserved.
	 */
	// TODO : @ctatlah - Bug #W-1927701 - toggle is done quickly run into ck editor js error.
	_testRichTextToggleDisableEnable : {
		test : [function(component) {
			this.assertRichTextInitalized();
		}, function(component) {
			// disable
			this.toggleRichText(component);
		}, function(component) {
			this.assertRichTextState(false);
			this.assertInputTextAreaVisible(true);
			this.assertRichTextValue(component.find("rt"), "abc");

			// enable
			this.toggleRichText(component);
		}, function(component) {
			this.assertRichTextState(true);
			this.assertInputTextAreaVisible(false);
			this.assertRichTextValue(component.find("rt"),"abc");
		}]
	},

	assertRichTextInitalized : function() {
    	$A.test.addWaitFor(true, function(){
    		return !$A.util.isUndefinedOrNull(
    			$A.test.getElementByClass("cke_wysiwyg_frame"));
		});
    },

	/**
	 * toggles richText between enable/disable.
	 * @return boolean - new state of richText (false=disabled, true=enabled).
	 */
	toggleRichText : function(cmp) {
		var isRichTextEnabled = cmp.find("rt").get("v.isRichText");
		cmp.find("disableBtn").get("e.press").fire();
		this.waitForToggle(cmp.find("rt"), !isRichTextEnabled);
		return !isRichTextEnabled;
	},

	waitForToggle : function(rtCmp, state) {
		$A.test.addWaitFor(state, function(){
			return rtCmp.get("v.isRichText");
		});
	},

	assertRichTextState : function(isEnabled) {
		var elem = $A.test.getElementByClass("cke_wysiwyg_frame");
		if (isEnabled) {
    		$A.test.assertNotNull(elem, "ck editor should be present");
		} else {
			$A.test.assertNull(elem, "There should be NO ck editor");
		}
	},

	assertInputTextAreaVisible : function(isVisible) {
		var elem = $A.test.getElementByClass("uiInputRichText");
		var isHidden = "visibility: hidden; display: none;" ===
			elem[0].getAttribute("style");
		$A.test.assertEquals(isVisible, !isHidden,
			"Checking visability of ui:inputTextArea");
	},

	assertRichTextValue : function(rtCmp, expectedValue) {
		var actualValue = rtCmp.get("v.value");
		$A.test.assertEquals(expectedValue, actualValue,
			"Value is not what was expected");
	}
})