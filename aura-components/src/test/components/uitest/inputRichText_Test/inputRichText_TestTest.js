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
	 * Test multiple inputRichText components rendered.
	 */
	testMultipleRichTextComponents: {
		browsers:["-ANDROID_PHONE","-ANDROID_TABLET"],
		test : function(component) {
			this.assertRichTextInitalized(component.find("Text"));
			this.assertRichTextInitalized(component.find("rtCustom"));
		}
	},

    /**
     * Test html content.
     */
    testRichTextHtmlContent:{
    	browsers:["-ANDROID_PHONE","-ANDROID_TABLET"],
    	attributes : {testContent: "<b>some content</b></html>"},
    	test : [function(component) {
    		this.assertRichTextInitalized(component.find("Text"));
    		this.waitForBaseComponentInitialized(component);
    	}, function(component) {
     		component.find("base").find("submitBtn").get("e.press").fire();
     		$A.test.addWaitForWithFailureMessage(true, function(){
     			var content = component.find("base").find("outputValue").get("v.value");
     			return content === "<b>some content</b></html>";
			 }, "Error with going to server.");
     	}, function(component) {
    		var rtValue = component.find("Text").get("v.value");  
    		$A.test.assertEquals("<b>some content</b></html>", rtValue, 
    			"Rich text value expected is incorrect");
    	}]
    },

    /**
     * Test RTE placeholder when value is not set
     * RTE content should show placeholder
     */
    testRtePlaceholderWhenValueIsNotSet: {
        owner: "smo",
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET"],
        attributes: {placeholder: "Test placeholder"},
        test: [function(component) {
            // placeholder should be shown when v.value is not set
            this.waitForCkEditorContentUpdate(1, "Test placeholder",
                "Rich text placeholder expected is incorrect");
        }]
    },

    /**
     * Test RTE placeholder when value is set
     * RTE content should show value, when value is removed, placeholder should be shown
     */
    testRtePlaceholderWhenValueIsSet: {
        owner: "smo",
        browsers: ["-ANDROID_PHONE", "-ANDROID_TABLET"],
        attributes: {placeholder: "Test placeholder", testContent: "Test content"},
        test: [function(component) {
            // placeholder should be hidden after v.value is set
            this.waitForCkEditorContentUpdate(1, "Test content",
                "Rich text content expected is incorrect");
        }, function(component) {
            component.find("Text").set("v.value", "");
        }, function(component) {
            // when value is removed, placeholder should come back
            this.waitForCkEditorContentUpdate(1, "Test placeholder",
                "Rich text placeholder expected is incorrect");
        }]
    },

    /**
     * wait for a CKEDITOR's content to load and check if the content is correct
     */
    waitForCkEditorContentUpdate : function(rteIndex, expectedText, errMsg) {
        var self = this;
        $A.test.addWaitForWithFailureMessage(true, function() {
            return self.getRteContent(rteIndex) === expectedText;
        }, errMsg);
    },

    /**
     * get the text content of a CKEditor
     */
    getRteContent : function(rteIndex) {
        var iframe = document.querySelector(".cke_" + rteIndex + " iframe");
        if (iframe) {
            var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (innerDoc) {
                var body = innerDoc.querySelector("body");
                if (body) {
                    return $A.test.getText(body);
                }
            }
        }
        return "";
    },

	assertRichTextInitalized : function(rtCmp) {
		var textArea = rtCmp.find("textAreaElem");
    	$A.test.assertNotNull(textArea, "Component did not initialize correctly");
    },

    waitForBaseComponentInitialized : function(cmp) {
    	$A.test.addWaitForWithFailureMessage(false, function(){
 			return $A.util.isUndefinedOrNull(cmp.find("base"));
		 }, "Error loading base test component.");
    }
})