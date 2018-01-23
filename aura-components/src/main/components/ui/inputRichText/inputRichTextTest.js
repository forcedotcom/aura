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
	browsers:["-ANDROID_PHONE","-ANDROID_TABLET"],

	ckeButtons:{
		bold: "cke_button__bold_icon",
		italic: "cke_button__italic_icon",
		underline: "cke_button__underline_icon",
		strike: "cke_button__strike_icon",
		subscript: "cke_button__subscript_icon",
		superscript: "cke_button__superscript_icon",
		removeFormat: "cke_button__removeformat_icon",
		indent: "cke_button__indent_icon",
		outdent: "cke_button__outdent_icon",
		justifyLeft: "cke_button__justifyleft_icon",
		justifyCenter: "cke_button__justifycenter_icon",
		justifyRight: "cke_button__justifyright_icon",
		justifyBlock: "cke_button__justifyblock_icon",
		bidiLeftToRight: "cke_button__bidiltr_icon",
		bidiRightToLeft: "cke_button__bidirtl_icon",
		bulletList: "cke_button__bulletedlist_icon",
		numberList: "cke_button__numberedlist_icon",
		fontStyle: "cke_combo__styles",
		fontFormat: "cke_combo__format",
		font: "cke_combo__font",
		fontSize: "cke_combo__fontsize",
		textColor: "cke_button__textcolor_icon",
		bgColor: "cke_button__bgcolor_icon",
		cut: "cke_button__cut_icon",
		copy: "cke_button__copy_icon",
		paste: "cke_button__paste_icon",
		pasteText: "cke_button__pastetext_icon",
		pasteWord: "cke_button__pastefromword_icon",
		undo: "cke_button__undo_icon",
		redo: "cke_button__redo_icon",
		find: "cke_button__find_icon",
		replace: "cke_button__replace_icon",
		selectAll: "cke_button__selectall",
		link: "cke_button__link_icon",
		unlink: "cke_button__unlink_icon",
		anchor: "cke_button__anchor_icon",
		image: "cke_button__image_icon",
		quote: "cke_button__blockquote_icon",
		div: "cke_button__creatediv_icon",
		showBlocks: "cke_button__showblocks_icon",
		form: "cke_button__form_icon",
		checkbox: "cke_button__checkbox_icon",
		radio: "cke_button__radio_icon",
		text: "cke_button__textfield_icon",
		textArea: "cke_button__textarea_icon",
		select: "cke_button__select_icon",
		button: "cke_button__button_icon",
		imageButton: "cke_button__imagebutton_icon",
		hidden: "cke_button__hiddenfield_icon",
		flash: "cke_button__flash_icon",
		table: "cke_button__table_icon",
		horizontalRule: "cke_button__horizontalrule_icon",
		smiley: "cke_button__smiley_icon",
		specialChar: "cke_button__specialchar_icon",
		pageBreak: "cke_button__pagebreak_icon"
	},

	ckeDefaultButtons:{
		bold: "cke_button__bold_icon",
		italic: "cke_button__italic_icon",
		bulletList: "cke_button__bulletedlist_icon",
		numberList: "cke_button__numberedlist_icon"
	},

	ckeBasicButtons:{
		bold: "cke_button__bold_icon",
		italic: "cke_button__italic_icon",
		underline: "cke_button__underline_icon",
		strike: "cke_button__strike_icon",
		link: "cke_button__link_icon",
		image: "cke_button__image_icon",
		justifyLeft: "cke_button__justifyleft_icon",
		justifyCenter: "cke_button__justifycenter_icon",
		justifyRight: "cke_button__justifyright_icon",
		indent: "cke_button__indent_icon",
		outdent: "cke_button__outdent_icon",
		bulletList: "cke_button__bulletedlist_icon",
		numberList: "cke_button__numberedlist_icon"
	},

	ckeStandardButtons:{
		bold: "cke_button__bold_icon",
		italic: "cke_button__italic_icon",
		link: "cke_button__link_icon",
		unlink: "cke_button__unlink_icon",
		anchor: "cke_button__anchor_icon",
		image: "cke_button__image_icon",
		justifyLeft: "cke_button__justifyleft_icon",
		justifyCenter: "cke_button__justifycenter_icon",
		justifyRight: "cke_button__justifyright_icon",
		indent: "cke_button__indent_icon",
		outdent: "cke_button__outdent_icon",
		bulletList: "cke_button__bulletedlist_icon",
		numberList: "cke_button__numberedlist_icon",
		fontStyle: "cke_combo__styles",
		fontFormat: "cke_combo__format",
		font: "cke_combo__font",
		fontSize: "cke_combo__fontsize"
	},

	ckeEmailButtons:{
		font: "cke_combo__font",
		fontSize: "cke_combo__fontsize",
		bold: "cke_button__bold_icon",
		italic: "cke_button__italic_icon",
		underline: "cke_button__underline_icon",
		justifyLeft: "cke_button__justifyleft_icon",
		justifyCenter: "cke_button__justifycenter_icon",
		justifyRight: "cke_button__justifyright_icon",
		indent: "cke_button__indent_icon",
		outdent: "cke_button__outdent_icon",
		bulletList: "cke_button__bulletedlist_icon",
		numberList: "cke_button__numberedlist_icon"
	},

	ckeCustomButtons:{
		font: "cke_combo__font",
		fontSize: "cke_combo__fontsize"
	},


    /**
     * Test basic tool bar is loaded.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarTypeBasic:{
    	attributes : {toolbar: "basic"},
    	test : [function() {
    		this.assertRichTextInitalized();
    	}, function() {
    		this.assertButtonsOnToolBar(this.ckeBasicButtons);
    	}]
    },

    /**
     * Test full tool bar is loaded.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarTypeFull:{
    	attributes : {toolbar: "full"},
    	test : [function() {
    		this.assertRichTextInitalized();
    	}, function() {
    		this.assertButtonsOnToolBar(this.ckeButtons);
    	}]
    },

    /**
     * Test standard tool bar is loaded.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarTypeStandard:{
    	attributes : {toolbar: "standard"},
    	test : [function() {
    		this.assertRichTextInitalized();
    	}, function() {
    		this.assertButtonsOnToolBar(this.ckeStandardButtons);
    	}]
    },

    /**
     * Test email tool bar is loaded.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarTypeEmail:{
    	attributes : {toolbar: "email"},
    	test : [function() {
    		this.assertRichTextInitalized();
    	}, function() {
    		this.assertButtonsOnToolBar(this.ckeEmailButtons);
    	}]
    },

    /**
     * Test default tool bar is loaded.
     */
    // TODO : @ctatlah - uncomment after john pushes fix
    testToolbarTypeDefault:{
    	attributes : {toolbar: ""},
    	test : [function() {
    		this.assertRichTextInitalized();
    	}, function() {
    		this.assertButtonsOnToolBar(this.ckeDefaultButtons);
    	}]
    },



    /**
     * Test custom tool bar is loaded.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarTypeCustom : {
        attributes : {
            toolbar : "custom",
            customToolbarConfig : '[{"name" : "format", "items" : ["Font","FontSize"]}]'
        },
        test : [ function() {
            this.assertRichTextInitalized();
        }, function() {
            this.assertButtonsOnToolBar(this.ckeCustomButtons);
        } ]
    },

    /**
     * Test default tool bar is loaded for an empty custom tool bar configuration.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarTypeCustomWithEmptyConfig : {
        attributes : {
            toolbar : "custom",
            customToolbarConfig : ""
        },
        test : [ function() {
            this.assertRichTextInitalized();
        }, function() {
            this.assertButtonsOnToolBar(this.ckeBasicButtons);
        } ]
    },

    /**
     * Test default tool bar is loaded for no custom tool bar configuration.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarTypeCustomWithNoConfig : {
        attributes : {
            toolbar : "custom"
        },
        test : [ function() {
            this.assertRichTextInitalized();
        }, function() {
            this.assertButtonsOnToolBar(this.ckeBasicButtons);
        } ]
    },

    /**
     * Test default tool bar is loaded for a bad custom tool bar configuration.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarTypeCustomWithBadConfig : {
        attributes : {
            toolbar : "custom",
            customToolbarConfig : false
        },
        test : [ function() {
            this.assertRichTextInitalized();
        }, function() {
            this.assertButtonsOnToolBar(this.ckeBasicButtons);
        } ]
    },

    /**
     * Valid toolbar location value. ckeditor is loaded with toolbar in proper place bottom.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarLocationBottom:{
    	attributes : {toolbarLocation: "outerspace"},
    	test : [function() {
    		this.assertRichTextInitalized();
    	}, function() {
    		this.assertToolbarPresent(false);
    	}]
    },

    /**
     * Invalid toolbar location value. ckeditor is loaded but no toolbar present.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testToolbarLocationInvalid:{
    	attributes : {toolbarLocation: "outerspace"},
    	test : [function() {
    		this.assertRichTextInitalized();
    	}, function() {
    		this.assertToolbarPresent(false);
    	}]
    },

    /**
     * Disable richText.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testDisableRichText:{
    	attributes : {isRichText: false},
    	test : function() {
    		this.assertCkeEditorPresent(false);
    	}
    },

    /**
     * Test invalid dimensions.
     * Exclude IE 7, 8 since they don't support negative dimensions
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testRichTextInvalidDimensions:{
        browsers: ["-IE8"],
        attributes : {width: -100, height:-10},
        test : function() {
            // just verify ckeditor loaded
            this.assertRichTextInitalized();
        }
    },

    /**
     * Test rich text editor content.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testRichTextContent:{
    	attributes : {value: "<h3 style='color:red;'><span style='font-family:courier new,courier,monospace;'><span style='font-size:8px;'>test content</span></span></h3>"},
    	test : [function() {
    		this.assertRichTextInitalized();
    	}, function(component) {
    		var content = component.get("v.value");
    		$A.test.assertNotNull(content,
    			"Content should be present (note: can not verify styling)");
    	}]
    },

    
    /**
     * Verify setting value.
     * Disabled due to W-2996437
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testValue: {
        attributes : {isRichText: false, value: "Initial value"},
        test: [function(component){
            $A.test.assertEquals("Initial value", component.getElement().value, "Textarea value not correctly initialized.");
            component.set("v.value", "Changed value");
        }, function(component){
            $A.test.assertEquals("Changed value", component.getElement().value, "Textarea value not correctly changed.");
        }]
    },
    
    /**
     * Verify setting disabled attribute to true, then switching to false.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testDisabled: {
        attributes : {isRichText: false, disabled: true},
        test: [function(component){
            $A.test.assertTrue(component.getElement().disabled, "Textarea not correctly disabled");
            component.set("v.disabled", false);
        }, function(component){
            $A.test.assertFalse(component.getElement().disabled, "Textarea disabled attribute not correct after switching.");
        }]
    },
    
    /**
     * Verify not setting disabled attribute to false, then switching to true.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testNotDisabled: {
        attributes : {isRichText: false, disabled: false},
        test: [function(component){
            $A.test.assertFalse(component.getElement().disabled, "Textarea not correctly enabled");
            component.set("v.disabled", true);
        }, function(component){
            $A.test.assertTrue(component.getElement().disabled, "Textarea disabled attribute not correct after switching.");
        }]
    },
    
    /**
     * Verify setting readonly attribute to true, then switching to false.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testReadonly: {
        attributes : {isRichText: false, readonly: 'true'},
        test: [function(component){
            $A.test.assertTrue(component.getElement().readOnly, "Textarea readonly attribute not correct");
            component.set("v.readonly", false);
        }, function(component){
            $A.test.assertFalse(component.getElement().readOnly, "Textarea readonly attribute not correct after switching.");
        }]
    },
    
    /**
     * Verify setting readonly attribute to false, then switching to true.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testNotReadonly: {
        attributes : {isRichText: false, readonly: 'false'},
        test: [function(component){
            $A.test.assertFalse(component.getElement().readOnly, "Textarea readonly attribute not correct");
            component.set("v.readonly", true);
        }, function(component){
            $A.test.assertTrue(component.getElement().readOnly, "Textarea readonly attribute not correct after switching.");
        }]
    },
    
    /**
     * Verify setting rows attribute.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testRows: {
        attributes : {isRichText: false, rows: "15"},
        test: function(component){
            $A.test.assertEquals(15, component.getElement().rows, "Textarea rows attribute not correct");
        }
    },
    
    /**
     * Verify setting columns attribute.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testCols: {
        attributes : {isRichText: false, cols: "15"},
        test: function(component){
            $A.test.assertEquals(15, component.getElement().cols, "Textarea cols attribute not correct");
        }
    },
    
    /**
     * Verify setting resizable attribute to true, then switching to false.
     */
    // TODO(W-3259241): Flapping on Jenkins autobuilds
    testResizable: {
        attributes : {isRichText: false, resizable: true},
        doNotWrapInAuraRun : true,
        test: function(component){
        	var textarea = document.createElement('textarea');
        	if (textarea.hasAttribute("resizable")) {
        		// resizable is supported
            	$A.test.assertEquals('both', $A.util.style.getCSSProperty(component.getElement(),'resize'), "Textarea not correctly resizable");
                component.set("v.resizable", false);
                $A.rerender(component);
                $A.test.assertEquals('none', $A.util.style.getCSSProperty(component.getElement(),'resize'), "Textarea resizable attribute not correct after switching.");
        	}
        }
    },
    	
    assertRichTextInitalized : function() {
    	$A.test.addWaitFor(true, function(){
    		return !$A.util.isUndefinedOrNull(
    			$A.test.getElementByClass("cke_wysiwyg_frame"));
		});
    },

    assertCkeEditorPresent : function(isPresent) {
    	var elem = $A.test.getElementByClass("cke_wysiwyg_frame");
    	if (isPresent) {
    		$A.test.assertNotNull(elem, "ck editor should be present");
    	} else {
    		$A.test.assertNull(elem, "There should be NO ck editor");
    	}
    },

    assertToolbarPresent : function(isPresent) {
    	var elem = $A.test.getElementByClass("cke_toolbox");
    	if (isPresent) {
    		$A.test.assertNotNull(elem, "Toolbar should be present");
    	} else {
    		$A.test.assertNull(elem, "Toolbar should NOT be present");
    	}
    },

    assertButtonsOnToolBar : function(expectedButtons) {
    	for (var b in this.ckeButtons) {
    		// if button is not in expected list verify its not present else
    		// verify it is present.
			if ($A.util.isUndefinedOrNull(expectedButtons[b])) {
    			this.assertButtonPresent(expectedButtons[b], false);
    		} else {
    			this.assertButtonPresent(expectedButtons[b], true);
    		}
    	}
    },

    assertButtonPresent : function(button, isPresent) {
    	var elem = $A.test.getElementByClass(button);
    	if (isPresent) {
    		$A.test.assertNotNull(elem,
    			button + " button in toolbar should be present");
    	} else {
    		$A.test.assertNull(elem,
    			button + " button in toolbar should NOT be present");
    	}
    }
/*eslint-disable semi */
})
/*eslint-enable semi */
