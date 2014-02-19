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
		bold: "cke_button_bold",
		italic: "cke_button_italic",
		underline: "cke_button_underline",
		strike: "cke_button_strike",
		subscript: "cke_button_subscript",
		superscript: "cke_button_superscript",
		removeFormat: "cke_button_removeFormat",
		indent: "cke_button_indent",
		outdent: "cke_button_outdent",
		justifyLeft: "cke_button_justifyleft",
		justifyCenter: "cke_button_justifycenter",
		justifyRight: "cke_button_justifyright",
		justifyBlock: "cke_button_justifyblock",
		bidiLeftToRight: "cke_button_bidiltr",
		bidiRightToLeft: "cke_button_bidirtl",
		bulletList: "cke_button_bulletedlist",
		numberList: "cke_button_numberedlist",
		fontStyle: "cke_styles",
		fontFormat: "cke_format",
		font: "cke_font",
		fontSize: "cke_fontSize",
		textColor: "cke_button_textcolor",
		bgColor: "cke_button_bgcolor",
		cut: "cke_button_cut",
		copy: "cke_button_copy",
		paste: "cke_button_paste",
		pasteText: "cke_button_pastetext",
		pasteWord: "cke_button_pastefromword",
		undo: "cke_button_undo",
		redo: "cke_button_redo",
		find: "cke_button_find",
		replace: "cke_button_replace",
		selectAll: "cke_button_selectAll",
		spellcheck: "cke_button_checkspell",
		link: "cke_button_link",
		unlink: "cke_button_unlink",
		anchor: "cke_button_anchor",
		image: "cke_button_image",
		quote: "cke_button_blockquote",
		div: "cke_button_creatediv",
		showBlocks: "cke_button_showblocks",
		form: "cke_button_form",
		checkbox: "cke_button_checkbox",
		radio: "cke_button_radio",
		text: "cke_button_textfield",
		textArea: "cke_button_textarea",
		select: "cke_button_select",
		button: "cke_button_button",
		imageButton: "cke_button_imagebutton",
		hidden: "cke_button_hiddenfield",
		flash: "cke_button_flash",
		table: "cke_button_table",
		horizontalRule: "cke_button_horizontalrule",
		smiley: "cke_button_smiley",
		specialChar: "cke_button_specialchar",
		pageBreak: "cke_button_pagebreak"
	},
	
	ckeDefaultButtons:{
		bold: "cke_button_bold",
		italic: "cke_button_italic",
		bulletList: "cke_button_bulletedlist",
		numberList: "cke_button_numberedlist"
	},
	
	ckeBasicButtons:{
		bold: "cke_button_bold",
		italic: "cke_button_italic",
		underline: "cke_button_underline",
		strike: "cke_button_strike",
		link: "cke_button_link",
		image: "cke_button_image",
		justifyLeft: "cke_button_justifyleft",
		justifyCenter: "cke_button_justifycenter",
		justifyRight: "cke_button_justifyright",
		indent: "cke_button_indent",
		outdent: "cke_button_outdent",
		bulletList: "cke_button_bulletedlist",
		numberList: "cke_button_numberedlist"
	},
	
	ckeStandardButtons:{
		bold: "cke_button_bold",
		italic: "cke_button_italic",
		link: "cke_button_link",
		unlink: "cke_button_unlink",
		anchor: "cke_button_anchor",
		image: "cke_button_image",
		justifyLeft: "cke_button_justifyleft",
		justifyCenter: "cke_button_justifycenter",
		justifyRight: "cke_button_justifyright",
		indent: "cke_button_indent",
		outdent: "cke_button_outdent",
		bulletList: "cke_button_bulletedlist",
		numberList: "cke_button_numberedlist",
		fontStyle: "cke_styles",
		fontFormat: "cke_format",
		font: "cke_font",
		fontSize: "cke_fontSize"
	},
	
	ckeEmailButtons:{
		font: "cke_font",
		fontSize: "cke_fontSize",
		bold: "cke_button_bold",
		italic: "cke_button_italic",
		underline: "cke_button_underline",
		justifyLeft: "cke_button_justifyleft",
		justifyCenter: "cke_button_justifycenter",
		justifyRight: "cke_button_justifyright",
		indent: "cke_button_indent",
		outdent: "cke_button_outdent",
		bulletList: "cke_button_bulletedlist",
		numberList: "cke_button_numberedlist"
	},
	
    /**
     * Test basic tool bar is loaded.
     */
    testToolbarTypeBasic:{
    	attributes : {toolbar: "basic"},
    	test : [function(component) {
    		this.assertRickTextInitalized();
    	}, function(component) {
    		this.assertButtonsOnToolBar(this.ckeBasicButtons);
    	}]
    },
    
    /**
     * Test full tool bar is loaded.
     */
    testToolbarTypeFull:{
    	attributes : {toolbar: "full"},
    	test : [function(component) {
    		this.assertRickTextInitalized();
    	}, function(components) {
    		this.assertButtonsOnToolBar(this.ckeButtons);
    	}]
    },
    
    /**
     * Test standard tool bar is loaded.
     */
    testToolbarTypeStandard:{
    	attributes : {toolbar: "standard"},
    	test : [function(component) {
    		this.assertRickTextInitalized();
    	}, function(components) {
    		this.assertButtonsOnToolBar(this.ckeStandardButtons);
    	}]
    },
    
    /**
     * Test email tool bar is loaded.
     */
    testToolbarTypeEmail:{
    	attributes : {toolbar: "email"},
    	test : [function(component) {
    		this.assertRickTextInitalized();
    	}, function(components) {
    		this.assertButtonsOnToolBar(this.ckeEmailButtons);
    	}]
    },
    
    /**
     * Test default tool bar is loaded.
     */
    // TODO : @ctatlah - uncomment after john pushes fix
    _testToolbarTypeDefault:{
    	attributes : {toolbar: ""},
    	test : [function(component) {
    		this.assertRickTextInitalized();
    	}, function(components) {
    		this.assertButtonsOnToolBar(this.ckeDefaultButtons);
    	}]
    },
    
    /**
     * Valid toolbar location value. ckeditor is loaded with toolbar in proper place bottom.
     */
    testToolbarLocationBottom:{
    	attributes : {toolbarLocation: "outerspace"},
    	test : [function(component) {
    		this.assertRickTextInitalized();
    	}, function(component) {
    		this.assertToolbarPresent(false);
    	}]
    },
    
    /**
     * Invalid toolbar location value. ckeditor is loaded but no toolbar present.
     */
    testToolbarLocationInvalid:{
    	attributes : {toolbarLocation: "outerspace"},
    	test : [function(component) {
    		this.assertRickTextInitalized();
    	}, function(component) {
    		this.assertToolbarPresent(false);
    	}]
    },
    
    /**
     * Disable richText.
     */
    testDisableRichText:{
    	attributes : {isRichText: false},
    	test : function(component) {
    		this.assertCkeEditorPresent(false);
    	}
    },
    
    /**
     * Test invalid dimensions.
     */
    testRichTextInvalidDimensions:{
    	attributes : {width: -100, height:-10},
    	test : function(component) {
    		// just verify ckeditor loaded
    		this.assertRickTextInitalized();
    	}
    },
    
    /**
     * Test rich text editor content.
     */
    testRichTextContent:{
    	attributes : {value: "<h3 style='color:red;'><span style='font-family:courier new,courier,monospace;'><span style='font-size:8px;'>test content</span></span></h3>"},
    	test : [function(component) {
    		this.assertRickTextInitalized();
    	}, function(component) {
    		var content = component.get("v.value");
    		$A.test.assertNotNull(content, 
    			"Content should be present (note: can not verify styling)");
    	}]    }, 
    
    assertRickTextInitalized : function() {
    	$A.test.addWaitFor(true, function(){
    		return !$A.util.isUndefinedOrNull(
    			$A.test.getElementByClass("cke_editor"));
		});
    },
    
    assertCkeEditorPresent : function(isPresent) {
    	var elem = $A.test.getElementByClass("cke_editor");
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
})