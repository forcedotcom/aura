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
	 * @Override
	 */
	addDomHandler : function(cmp, event) {
		var	editorInstance = this.getEditorInstance(cmp);

		if (editorInstance) {
            editorInstance.on(event, this.editorEventHandler, cmp);
		} else {
			var el = this.getInputElement(cmp);
	        $A.util.on(el, event, this.lib.interactive.domEventHandler);
		}
	},

	/**
	 * @Override
	 */
	handleUpdate : function(cmp, event) {
		var helper = cmp.getDef().getHelper();
        var updateOn = helper.getUpdateOn(cmp);
        // if this is an event we're supposed to update on
        if (updateOn.indexOf(event.name || event.type) > -1) {
        	var value = cmp.get('v.value');
        	//TODO: Do we need to compare content here?
        	var content = helper.getContent(cmp);
        	if (value !== content) {
        		//setting the attribute value will trigger the change event and also rerender the component
        		//use a flag here prevent the component rerender every time the value is changed
        		//It is also used to prevent the editor content getting set again in the value change handler
        		//change event still fires even if "ignoreChange"(third argument) is set to true if v.value is an expression
        		cmp._updatingValue = true;
        		cmp.set('v.value', content);
        		cmp._updatingValue = false;
        	}
        }
	},

	editorEventHandler : function(event) {
		var cmp = this.getConcreteComponent();
		if (cmp.isValid()) {
			var helper = cmp.getDef().getHelper();

	        if (!helper) {
	            return;
	        }
	        // extended components can do some event processing before the Aura event gets fired
	        if (helper.preEventFiring) {
	            helper.preEventFiring(cmp, event);
	        }

	        //TODO: need to fire editor events
	        var e = cmp.getEvent(event.name);
			if (e) {
				e.fire();
			}
		}
	},


	/**
	 * Retrieve editor config and instantiate CKEditor instance.
	 * Also creates a CKEditor-based event listener to update
	 * the value attribute onchange of CKEditor contents.
	 *
	 * Called from renderer (afterRender) and controller (toggle)
	 *
	 */
	initEditor : function(cmp) {
		if ($A.util.getBooleanValue(cmp.get('v.isRichText'))) {
			if (!this.isLibraryLoaded(cmp)) {
				$A.warn("Richtext editor library is not loaded");
				return;
			}
			var editorInstance = this.getEditorInstance(cmp);

			if (!editorInstance) {
				var helper = cmp.getConcreteComponent().getDef().getHelper() || this;
				editorInstance = CKEDITOR.replace(helper.getEditorId(cmp),  helper.getEditorConfig(cmp));
			}
		}
    },

	isLibraryLoaded: function(cmp) {
		return typeof CKEDITOR !== "undefined";
	},

	toggle : function(cmp, isRichText) {
		var editorInstance = this.getEditorInstance(cmp);

		if (isRichText && !cmp.get('v.isRichText')) {
			cmp.set('v.isRichText', isRichText);
			if (!editorInstance) {
				this.initEditor(cmp);
			}
		}
		else if (!isRichText && cmp.get('v.isRichText')) {
			var plainText;

			cmp.set('v.isRichText', isRichText);

			if (editorInstance) {
				//Get the plain text before destroy
				plainText = editorInstance.document.getBody().getText();
				editorInstance.destroy();
			} else {
				plainText = cmp.get('v.value');
			}

			// TODO: determine if we want the <p></p> surrounding plain text when we toggle to rich text
			// Set the textarea contents to be the plaintext b/c ckeditor doesn't
			document.getElementById(this.getEditorId(cmp)).value = plainText;
			cmp.set('v.value', plainText);
		}
	},

	getEditorId : function(cmp) {
		return cmp.getConcreteComponent().get('v.domId');
	},

	getEditorInstance : function (cmp) {
		return typeof CKEDITOR === "undefined" ? null : CKEDITOR.instances[this.getEditorId(cmp)];
	},

	/**
	 * Retrieves the CKEditor (or textarea if toggled off) contents
	 * Called by the onchange listener to save contents to the value attribute
	 * which is autowired to save
	 */
	getContent : function(cmp) {
		var editorInstance = this.getEditorInstance(cmp);
		return editorInstance ? editorInstance.getData() : this.getDomElementValue(this.getInputElement(cmp)) || '';
	},

	setContent : function(cmp, content) {
		var editorInstance = this.getEditorInstance(cmp);
		if (editorInstance) {
			editorInstance.setData(content);
		}
	},

	getLocale : function(cmp) {
		return $A.get("$Locale.langLocale");
	},

	/**
	 * Main config method that creates CKEditor config object
	 * Called from renderer and controller (toggle)
	 * Returns a config object
	 */
	getEditorConfig : function(cmp) {
		var toolbarConfig = this.getToolbarConfig(cmp),
			locale = this.getLocale(cmp),
			width = cmp.get('v.width'),
			height = cmp.get('v.height'),
			toolbarLocation = cmp.get('v.toolbarLocation');

		var config = {
				language : locale,
				width: width,
				height: height,
				bodyClass: 'inputRichTextBody',
				toolbar : toolbarConfig,
				toolbarLocation : toolbarLocation,
				toolbarCanCollapse : false,
				resize_enabled : false,
				forcePasteAsPlainText : false,
	    		forceSimpleAmpersand : true,
	    		/*
	    	     * Deactivate:
	    	     * - The Element path component (RTE's "status bar")
	    	     * - Resizing ability (editing area maximization, resizing)
	    	     * - Context menus
	    	     */
	    		removePlugins : 'elementspath,maximize,resize,about,liststyle,tabletools,scayt,contextmenu',
	    		/*
	    	     * Hide some dialog tabs:
	    	     * - Link dialog: advanced and target tabs
	    	     */
	    		removeDialogTabs : 'link:advanced;image:advanced;table:advanced;tableProperties:advanced',

	    		enterMode : CKEDITOR.ENTER_BR, //to use <br/> instead of <p> each enter
				shiftEnterMode : CKEDITOR.ENTER_P,

				forcePasteAsPlainText : false,
	    		forceSimpleAmpersand : true
			};

		return config;
	},

	/**
	 * Copies all the properties of source to target if they don't already exist.
	 */
	merge: function(target, source) {
        var property;

        if (target) {
            for (property in source) {
            	target[property] = source[property];
            }
        }

        return target;
    },

	/**
	 * Get toolbar config based on value of toolbar attribute.
	 * Called by getEditorConfig()
	 */
	getToolbarConfig : function(cmp) {
		var toolbar = cmp.get("v.toolbar");
		var toolbarConfig;
		switch (toolbar) {
		case 'basic':
			if (!this.basicToolbarConfig) {
				this.basicToolbarConfig = [
	               	 {name: 'basicstyles', items : ['Bold', 'Italic', 'Underline', 'Strike']},
	               	 {name: 'links', items : ['Link']},
	               	 {name: 'insert', items : ['Image']},
	               	 {name: 'paragraph', items : ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'Indent', 'Outdent']},
	               	 {name: 'list', items : ['BulletedList', 'NumberedList']}
		            ];
			}
			toolbarConfig = this.basicToolbarConfig;
			break;
		case 'standard':
			if (!this.standardToolbarConfig) {
				this.standardToolbarConfig = [
	               	 {name: 'basicstyles', items : ['Bold', 'Italic']},
	               	 {name: 'links',       items : [ 'Link','Unlink','Anchor']},
	               	 {name: 'insert', items : ['Image']},
	               	 {name: 'paragraph', items : ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'Indent', 'Outdent', 'BulletedList', 'NumberedList']},
	               	 {name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] }
	            ];
			}
			toolbarConfig = this.standardToolbarConfig;
			break;
		case 'full' :
			if (!this.fullToolbarConfig) {
				this.fullToolbarConfig = [
			        { name: 'clipboard',   items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
			        { name: 'editing',     items : [ 'Find','Replace','-','SelectAll'] },
			        { name: 'forms',       items : [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
			        '/',
			        { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
			        { name: 'paragraph',   items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','CreateDiv','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
			        { name: 'links',       items : [ 'Link','Unlink','Anchor' ] },
			        { name: 'insert',      items : [ 'Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak' ] },
			        '/',
			        { name: 'styles',      items : [ 'Styles','Format','Font','FontSize' ] },
			        { name: 'colors',      items : [ 'TextColor','BGColor' ] },
			        { name: 'tools',       items : [ 'Maximize', 'ShowBlocks'] }
			    ];
			}
			toolbarConfig = this.fullToolbarConfig;
			break;
		case 'email':
			if (!this.emailToolbarConfig) {
				this.emailToolbarConfig = [
	               	 {name: 'format', items : ['Font', 'FontSize']},
	               	 {name: 'basicstyles', items : ['Bold','Italic','Underline']},
	               	 {name: 'paragraph', items : ['JustifyLeft','JustifyCenter', 'JustifyRight','BulletedList', 'NumberedList', 'Indent', 'Outdent']}
	            ];
			}
			toolbarConfig = this.emailToolbarConfig;
			break;
		default:
			toolbarConfig = toolbar;
		}
		return toolbarConfig;
	},

	unrender : function(cmp) {
		var editorInstance = this.getEditorInstance(cmp);
		if (editorInstance) {
			editorInstance.destroy();
		}
	}
})