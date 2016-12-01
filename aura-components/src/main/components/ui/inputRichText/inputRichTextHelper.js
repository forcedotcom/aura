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

		if (editorInstance && $A.util.isFunction(editorInstance.on)) {
            editorInstance.on(event, $A.getCallback(this.editorEventHandler), cmp);
		} else {
			var element = this.getInputElement(cmp);
            this.lib.interactive.attachDomHandlerToElement(cmp, element, event);
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
                cmp.set('v.value', content);
            }
        }
	},

	/**
	 * bound to ck event handler in
	 * helper.addDomhandler
	 */
	editorEventHandler : function(event) {
		var cmp;

		// "this" inside this function is the component,
		// because that is how it was bound in addDomHandler.
		// Not the best approach, but this is how it was
		if($A.util.isComponent(this) && this.isValid()) {
			cmp = this.getConcreteComponent();
		}

		if (cmp && cmp.isValid()) {
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
	initEditor : function(cmp, callback) {
		if ($A.util.getBooleanValue(cmp.get('v.isRichText'))) {
            $A.clientService.loadClientLibrary('CKEditor', function () {

    			var editorInstance = this.getEditorInstance(cmp);
    			if (!editorInstance) {
    				var helper = cmp.getConcreteComponent().getDef().getHelper() || this;
    				editorInstance = CKEDITOR.replace(helper.getEditorId(cmp),  helper.getEditorConfig(cmp));
    			}

    			if(editorInstance && $A.util.isFunction(editorInstance.on)) {
    				editorInstance.on("instanceReady", $A.getCallback(function() {
	    				if (cmp.isValid()) {
	    					cmp.getEvent("editorInstanceReady").fire();
	    				}
	                    callback();
    				}));
    			}
                
            }.bind(this));
		}
    },

	isLibraryLoaded: function() {
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
            //This code stops a cycle of setting the value and updating the content in a change handler
            //The regex normallizes the value to what is being set in the value for in the inputTextArea
            //which is extended
            if (content === this.getContent(cmp).replace(/(\r\n)|\n/g,'\r\n')) {
                return;
            }
		    /* W-2905193
			   Setting the content before completion of the previous setContent causes a "Permission Denied" error
			   in IE11. So we collect content in an array while other calls to setData are pending. Then we unwind
			   the array one at a time.
			 */
			if (editorInstance._settingContent) {
				if (!editorInstance._nextContent) {
					editorInstance._nextContent = [];
				}
				editorInstance._nextContent.push(content);
			} else {
				editorInstance._settingContent = true;
				this._setData(editorInstance, content);
			}
		}
	},

	_setData : function(editorInstance, content) {
		var helper = this;
		var options = {};
		options.callback = function() {
			if (!$A.util.isEmpty(editorInstance._nextContent)) {
				helper._setData(editorInstance,editorInstance._nextContent.shift());
			} else {
				editorInstance._settingContent = false;
			}
		};
		if ($A.util.isUndefinedOrNull(content)) {
			options.noSnapshot = true;
		}
		editorInstance.setData(content, options);
	},

	getLocale : function() {
		return $A.get("$Locale.langLocale");
	},

	/**
	 * Converts all html to entities
	 * for XSS protection W-3351001
	 */
	_HTMLEntities: function(str) {
		var ret;
		var cleanerEl = document.createElement('div');
		cleanerEl.innerText = str;
		ret = cleanerEl.innerHTML;
		cleanerEl = null; //explicitly derefrence so element is collected after use
		return ret;
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
			toolbarLocation = cmp.get('v.toolbarLocation'),
			placeholder = cmp.get("v.placeholder"),
			extraAllowedContent = this.getExtraAllowedContent(),
			label = this._HTMLEntities(cmp.get('v.label'));

		var config = {
				language : locale,
				width: width,
				height: height,
				bodyClass: 'inputRichTextBody',
				toolbar : toolbarConfig,
				toolbarLocation : toolbarLocation,
				toolbarCanCollapse : false,
				resize_enabled : false,
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
	    		forceSimpleAmpersand : true,
	    		title : label,
                customConfig: false, //don't load the config.js by default
				stylesSet : false, //don't load the styleSet.js by default
                extraAllowedContent : extraAllowedContent
			};

		//don't need to load the extra plugin if not needed
		if (placeholder) {
			config.placeholder = placeholder;
			config.extraPlugins = 'confighelper';
		}

		return config;
	},

	/**
	 * Copies all the properties of source to target if they don't already exist.
	 */
	merge: function(target, source) {
        var property;

        if (target && source) {
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
        case 'custom':
            var config = cmp.get("v.customToolbarConfig");
            // Initialize with the default
            var customToolbarConfig = toolbar;
            if (config != null && !$A.util.isEmpty(config)) {
                if ($A.util.isString(config)) {
                    try {
                        // parse into a JSON object
                        customToolbarConfig = JSON.parse(config);
                    } catch (e) { // eslint-disable-line no-empty
                        // Use the default if there is an error
                        // Set in line 288 above
                    }
                } else if ($A.util.isArray(config)) {
                    customToolbarConfig = config;
                }
            }
            toolbarConfig = customToolbarConfig;
            break;
		default:
			toolbarConfig = toolbar;
		}
		return toolbarConfig;
	},

    getExtraAllowedContent: function() {
        // CK4 filters some html tags and attributes by default, which disappear on save or during toggle from html to source and back
        // see http://docs.ckeditor.com#!/guide/dev_allowed_content_rules
        // these are safe, supported tags we always want to allow in client validation regardless of which plugins or toolbars are loaded
        // some of these would only be needed if pasting in styled content from an outside app (which is supported)
        var tags = [];
        tags.push('div{*}(*); span{*}(*); p{*}(*); br{*}(*); hr{*}(*);');
        tags.push('h1{*}(*); h2{*}(*); h3{*}(*); h4{*}(*); h5{*}(*); h6{*}(*);');
        tags.push('a[!href]{*}(*);');
        tags.push('img[!src,alt,width,height,border]{*}(*);');
        tags.push('font[face,size,color];');
        tags.push('strike; s; b; em; strong; i; big; small; sub; sup; blockquote; ins; kbd; pre; tt;');
        tags.push('abbr; acronym; address; bdo; caption; cite; code; col; colgroup;');
        tags.push('dd; del; dfn; dl; dt; q; samp; var;');
        tags.push('table{*}(*)[align,border,cellpadding,cellspacing,summary];');
        tags.push('caption{*}(*); tbody{*}(*); thead{*}(*); tfoot{*}(*); th{*}(*)[scope]; tr{*}(*); td{*}(*)[scope];');
        return tags.join(' ');
    },

	unrender : function(cmp) {
		var editorInstance = this.getEditorInstance(cmp);
		try {
			editorInstance.destroy();
        } catch (e) {
            return;
        }
	}
})// eslint-disable-line semi
