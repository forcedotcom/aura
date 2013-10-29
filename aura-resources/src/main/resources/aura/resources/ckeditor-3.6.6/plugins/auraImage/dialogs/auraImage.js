function getNonNativeId(simpleId) 
{
	return CKEDITOR.dialog.getCurrent()._.editor.name + ':' + simpleId;
}

/**
 * Convenient function to shorten the code.
 */
function GetE(simpleId)
{
	var id = getNonNativeId(simpleId);
    return window.document.getElementById(id);
}

var ERROR_CLASS = 'cke_dialog_ui_error';

/**
 * This method supports both fields created with api and fields coded in plain native
 * HTML provided it meets the ckeditor HTML structure.
 *
 * - Adds the ERROR_CLASS class from the base element wrapping the input field
 * - Appends a container (div) to hold the error message if it doesn't already
 *   exists else the error message is updated.
 *
 * @param id       Id of the input (mandatory).
 * @param msg	   Error message
 * @param tabName  Name of the tab to which belong the component.
 * 				   To be specified only for API generated input fields.
 */
function showError(id, msg, tabName)
{
    var dialog = CKEDITOR.dialog.getCurrent();
    var document = dialog.getElement().getDocument();
    var errorEltId;
    var baseElement;

    if (tabName && tabName.length > 0) { // API field
        baseElement = dialog.getContentElement(tabName, id).getElement();
        var tmp = baseElement.getId();
        errorEltId = tmp.substring(0, tmp.length - '_uiElement'.length) + '_errorMsg'
    } else { // HTML native field
        baseElement = document.getById('cke_' + id + '_uiElement');
        errorEltId = id + '_errorMsg';
    }

    var errorElt = document.getById(errorEltId);
    if (!errorElt) {
        var errorDiv = document.$.createElement('div');
        errorDiv.id = errorEltId;
        errorDiv.className = 'ck_dialog_ui_errorMsg';
        errorDiv.innerHTML = msg;
        baseElement.$.appendChild(errorDiv);
    } else {
        errorElt.setHtml(msg);
    }

    var currentClassValue = baseElement.getAttribute('class');
    if (currentClassValue.indexOf(ERROR_CLASS) == -1)
    { // Handles the case where another different error occurs after one.
        var newClassValue = currentClassValue + " " + ERROR_CLASS;
        baseElement.setAttribute('class', newClassValue.replace(/^\s+|\s+$/g, ""));
    }
}

/**
 * This method supports both fields created with api and fields coded in plain native
 * HTML provided it meets the ckeditor HTML structure.
 *
 * - Removes the ERROR_CLASS class from the base element wrapping the input field
 * - Removes the container (div) holding the error message.
 *
 * @param id       Id of the input (mandatory).
 * @param tabName  Name of the tab to which belong the component.
 * 				   To be specified only for API generated input fields.
 */
function hideError(id, tabName)
{
    var dialog = CKEDITOR.dialog.getCurrent();
    var document = dialog.getElement().getDocument();
    var errorEltId;
    var baseElement;

    if (tabName && tabName.length > 0) { // API mode
        baseElement = dialog.getContentElement(tabName, id).getElement();
        var tmp = baseElement.getId();
        errorEltId = tmp.substring(0, tmp.length - '_uiElement'.length) + '_errorMsg'
    } else {
        baseElement = document.getById('cke_' + id + '_uiElement');
        errorEltId = id + '_errorMsg';
    }

    var errorElt = document.getById(errorEltId);
    if (errorElt) {
        var parent = errorElt.$.parentNode;
        parent.removeChild(errorElt.$);
    }

    var currentClassValue = baseElement.getAttribute('class');
    baseElement.setAttribute('class', currentClassValue.replace(ERROR_CLASS, '').replace(/^\s+|\s+$/g, ""));
}

/**
 * Aura Image Plugin
 */
CKEDITOR.dialog.add( 'auraImage', function( editor )
{
    // Protection against CSRF attacks.
    var CSRF_PROTECT = "while(1);";
    var SERVLET_URL = "/servlet/rtaImage?";

    var isEmpty = function (value)
    {
        return value === null || value.length === 0;
    }

    var isNotEmpty = function (value)
    {
        return !isEmpty(value);
    }

    var onImgLoadEvent = function()
    {
        // Image is ready.
        var original = this.originalElement;
        original.setCustomData( 'isReady', 'true' );
        original.removeListener( 'load', onImgLoadEvent );
        original.removeListener( 'error', onImgLoadErrorEvent );
        original.removeListener( 'abort', onImgLoadErrorEvent );

        this.firstLoad = false;
    };

    var onImgLoadErrorEvent = function()
    {
        // Error. Image is not loaded.
        var original = this.originalElement;
        original.removeListener( 'load', onImgLoadEvent );
        original.removeListener( 'error', onImgLoadErrorEvent );
        original.removeListener( 'abort', onImgLoadErrorEvent );
    };

    /**
     * Called just before submitting the upload image form.
     */
    var onUpload = function ()
    {
        var sFile = GetE('file').value;
        var fileRegex = sFile.match(/(.*)[\/\\]([^\/\\]+\.\w+)$/);
        if (fileRegex) {
            GetE('fileName').value = fileRegex[2];
        } else {
            GetE('fileName').value = sFile;
        }
        // This is needed because with multi-part form data the file contents
        // has to be the last Request param
        GetE('altText').value = GetE('txtAlt2').value;

        return true;
    }

    /**
     * Make sure that the json response from the servlet holds the protection against CSRF attacks
     * and strip it from the response if so.
     *
     * @param jsonStr The Json message returns by the RtaImageUploadServlet (with the CSRF protection).
     * @return The original message minus the CSRF protection string.
     */
    var evalAjaxServletOutput = function (jsonStr)
    {
        if (jsonStr.substring(0, CSRF_PROTECT.length) !== CSRF_PROTECT){
            //If it doesn't start with CSRF_PROTECT, it didn't come from AjaxServlet...something's wrong
            throw new Error("CSRF protect string not added to servlet response.");
        } else  {
            return eval('('+jsonStr.substring(CSRF_PROTECT.length, jsonStr.length) + ')');
        }
    }

    /**
     * Update the content of the dialog accordingly to the provided parameters.
     *
     * @param jsonMessage The json message to process
     * @param dialog      Reference to the dialog to update
     *
     * @return true if no errors occured, false otherwise.
     */
    var processUpload = function (jsonMessage, dialog)
    {
        if (jsonMessage.uploadStatus) {
            dialog.setValueOf('info', 'txtUrl', jsonMessage.src);
            if (jsonMessage.alt)
                dialog.setValueOf('info', 'txtAlt', jsonMessage.alt);
            if (jsonMessage.width)
              dialog.setValueOf('info', 'imgWidth', jsonMessage.width);
            if (jsonMessage.height)
              dialog.setValueOf('info', 'imgHeight', jsonMessage.height);

            return true;
        } else {
            showError(getNonNativeId('file'), jsonMessage.errMsg);
            return false;
        }
    }

    /**
     * Specific function to clean up the image upload form. This is needed because this part
     * of the dialog is not created using the CKEDITOR's API so that we don't benefit from the
     * setup logic.
     */
    var cleanUpUploadForm = function ()
    {
        var document = CKEDITOR.dialog.getCurrent().getElement().getDocument();

        // Clean up field values
	document.getById(getNonNativeId('file')).setValue('');
	document.getById(getNonNativeId('txtAlt2')).setValue('');
        document.getById(getNonNativeId('fileName')).setValue('');
        document.getById(getNonNativeId('altText')).setValue('');

        // Clean up error messages
        hideError('txtUrl', 'info');
        hideError(getNonNativeId('file'));
    }

    var onUrlChange = function() {
        var dialog = CKEDITOR.dialog.getCurrent();
        var doc = dialog.getElement().getDocument();
        var urlElt = dialog.getContentElement('info', 'txtUrl');

        if (isNotEmpty(urlElt.getValue())) {
            hideError('txtUrl', 'info');
        } else {
            var msg = '<b>'
                + editor.config.auraLabels.CkeImageDialog.error
                + '</b> '
                + editor.config.auraLabels.CkeImageDialog.missingUrlError;
            showError('txtUrl', msg, 'info');
        }
    }
    
    var limitMaxNumberOfImages = function(id, tabName, dialog) {
        var imageUploadLimit = editor.config.imageUploadLimit;
        if (!imageUploadLimit) { return; }
        var imgCount = editor.document.getElementsByTag( 'img' ).count();
        if (!dialog.imageEditMode && imgCount >= imageUploadLimit) {
            showError(id, editor.config.auraLabels.CkeImageDialog.imageUploadLimit_info, tabName);
            return true;
        } else {
            hideError(id, tabName);
            return false;
        }
    }

    var handleOK = function (evt)
    {	
        var dialog = evt.data.dialog,
            id = dialog.currentPage === 'info' ? 'txtUrl' : getNonNativeId('file'),
            tabName = dialog.currentPage === 'info' ? 'info' : null;
        if (limitMaxNumberOfImages(id, tabName, dialog)) {return;}

        if (dialog.currentPage === 'info')
        {
            var url = dialog.getContentElement('info', 'txtUrl').getValue();
            onUrlChange();
            if (isNotEmpty(url)) {
                if ( dialog.fire( 'ok', { hide : true } ).hide !== false )
                    dialog.hide();
            }
        }
        else
        {
            var doc = CKEDITOR.document;
            if ( dialog.imageEditMode && isEmpty(doc.getById(getNonNativeId('file')).getValue()) )
            {
                if ( dialog.fire( 'ok', { hide : true } ).hide !== false )
                    dialog.hide();
            }
            else
            {
                if (onUpload())
		    // Fix for W-1180188 and W-1189266, setting name of iframe again as IE has this weired issue for dynamic iframes	
		    if (CKEDITOR.env.ie ) {
		    	window.frames[editor.name + ':uploadWindow'].name = editor.name + ':uploadWindow';	
                    }
		    doc.getById(getNonNativeId('frmUpload')).$.submit();
            }
        }
    }

    // Content of the Upload tab. This is necessary as the CKEDITOR's API doesn't make it possible to
    // 1) submit additionnal fields at the same time as a file field.
    // 2) handle the CSRF PROTECTION string returns in the json string (standard image dialog expect some
    //    plain html code with a call to callback function to be returned by the servlet what we don't
    //    want.
    var tmp = new Array();

    // Fix for W-1180188 and W-1189266, do not set target as iframes is not present yet
    if(CKEDITOR.env.ie ) {
    	tmp.push('<form id="' + editor.name + ':frmUpload" method="post" action="" enctype="multipart/form-data" accept-charset="UTF-8">');
    }
    else{
    	tmp.push('<form id="' + editor.name + ':frmUpload" method="post" target="' + editor.name + ':uploadWindow" action="" enctype="multipart/form-data" accept-charset="UTF-8">');
    }
    tmp.push('  <input type="hidden" name="fileName" id="' + editor.name + ':fileName" value="" />');
    tmp.push('  <input type="hidden" name="altText" id="' + editor.name + ':altText" value="" />');
    tmp.push('	<div class="cke_dialog_ui_vbox">');
    tmp.push('  <table cellspacing="0" border="0" align="left" style="width: 100%;" role="presentation">');
    tmp.push('    <tr>');
    tmp.push('      <td class="cke_dialog_ui_vbox_child">');
    tmp.push('          <div id="cke_' + editor.name + ':file_uiElement" class="cke_dialog_ui_text" role="presentation">');
    tmp.push('            <label for="' + editor.name + ':file" class="cke_dialog_ui_labeled_label">' + editor.config.auraLabels.CkeImageDialog.uploadTab_file + '</label>');
    tmp.push('            <div class="cke_dialog_ui_labeled_content">');
    tmp.push('                <div class="cke_dialog_ui_input_file">');
    tmp.push('                    <input id="' + editor.name + ':file" type="file" class="cke_dialog" size="40" name="file" onclick="disabledEventPropagation(event);" onchange="checkValidFiletype();" aria-labelledby="file" /><br/>');
    tmp.push('                </div>');
    tmp.push('            </div>');
    tmp.push('          </div>');
    tmp.push('      </td>');
    tmp.push('    </tr>');
    tmp.push('    <tr>');
    tmp.push('      <td class="cke_dialog_ui_vbox_child">');
    tmp.push('          <div class="cke_dialog_ui_input_desc">' + editor.config.auraLabels.CkeImageDialog.uploadTab_file_info + '</div>');
    tmp.push('      </td>');
    tmp.push('    </tr>');
    tmp.push('    <tr>');
    tmp.push('      <td sclass="cke_dialog_ui_vbox_child">');
    tmp.push('          <div class="cke_dialog_ui_text" role="presentation">');
    tmp.push('            <label for="' + editor.name + ':txtAlt2" class="cke_dialog_ui_labeled_label">' + editor.config.auraLabels.CkeImageDialog.uploadTab_desc + '</label>');
    tmp.push('            <div class="cke_dialog_ui_labeled_content">');
    tmp.push('                <div class="cke_dialog_ui_input_text" role="presentation">');
    tmp.push('                    <input id="' + editor.name + ':txtAlt2" class="cke_dialog_ui_input_text" style="width: 100%" type="text" aria-labelledby="file" />');
    tmp.push('                </div>');
    tmp.push('            </div>');
    tmp.push('          </div>');
    tmp.push('      </td>');
    tmp.push('    </tr>');
    tmp.push('    <tr>');
    tmp.push('      <td class="cke_dialog_ui_vbox_child">');
    tmp.push('          <div class="cke_dialog_ui_input_desc">' + editor.config.auraLabels.CkeImageDialog.uploadTab_desc_info + '</div>');
    tmp.push('      </td>');
    tmp.push('    </tr>');
    tmp.push('  </table>');
    tmp.push('  </div>');
    tmp.push('</form>');
    // Fix for W-1180188 and W-1189266, dont create iframe yet. Add a div marker to add it later on 
    if(CKEDITOR.env.ie ) {	
    	tmp.push('<div id="uploadWindowDiv"></div>');
    }
    else{
    	tmp.push('<iframe name="' + editor.name + ':uploadWindow" id="' + editor.name + ':uploadWindow" style="display:none;" onload="onUploadCompleted();" src="/blank.html"></iframe>');
    }
    var uploadHtml = tmp.join('\n');

    return {
        title : editor.config.auraLabels.CkeImageDialog.title,
        minWidth : 420,
        minHeight : 160,
        onShow : function()
        {
            this.imageElement = false;

            // Default: create a new element.
            this.imageEditMode = false;

            this.firstLoad = true;

            var editor = this.getParentEditor(),
                sel = this.getParentEditor().getSelection(),
                element = sel.getSelectedElement();

            // Copy of the image
            this.originalElement = editor.document.createElement( 'img' );
            this.originalElement.setAttribute( 'alt', '' );
            this.originalElement.setCustomData( 'isReady', 'false' );

            if ( element && element.getName() == 'img' && !element.data( 'cke-realelement' ) )
            {
                this.imageEditMode = element.getName();
                this.imageElement = element;
            }

            if ( this.imageEditMode )
            {
                // Use the original element as a buffer from  since we don't want
                // temporary changes to be committed, e.g. if the dialog is canceled.
                this.cleanImageElement = this.imageElement;
                this.imageElement = this.cleanImageElement.clone( true, true );

                // Fill out all fields.
                this.setupContent(this.imageElement);
            }
            else
            {
                this.imageElement =  editor.document.createElement( 'img' );
            }

            // Hide the width and height fields not exposed for now but used for
            // to take into account the constrained values returned by the RtaImageUploadSerlvet.
            this.getContentElement('info', 'imgWidth').getElement().hide();
            this.getContentElement('info', 'imgHeight').getElement().hide();

            // Switch to the appropriate tab and display image properties
            if ( this.imageEditMode && element.getAttribute('src'))
            {
                if (element.getAttribute('src').indexOf(SERVLET_URL) == -1)
                {
                    // The img tag references a Salesforce image
                    this.showPage('info');
                    this.hidePage('upload');
                    this.selectPage('info');
                    this.currentPage = 'info';
                }
                else
                {
                    // The img tag references a non Salesforce image
                    this.showPage('upload');
                    this.hidePage('info');
                    this.selectPage('upload');
                    this.currentPage = 'upload';

                    // Just filling the description field in the upload tab.
                    var doc = this.getElement().getDocument();
				                    
                    doc.getById(editor.name + ':txtAlt2').setValue(element.getAttribute('alt'));
                }
                this.getButton('insert').getElement().setStyle('display', 'none');
                this.getButton('update').getElement().setStyle('display', '');
            }
            else
            {
                this.showPage('info');
                this.showPage('upload');
                this.selectPage('upload');
                this.currentPage = 'upload';
                this.getButton('insert').getElement().setStyle('display', '');
                this.getButton('update').getElement().setStyle('display', 'none');
            }
            
            // disable image upload tab if upload url is not provided
            // TODO: lazy init upload tab
            if (!editor.config.filebrowserImageUploadUrl) {
                this.showPage('info');
                this.hidePage('upload');
                this.selectPage('info');
                this.currentPage = 'info';
                this.getButton('insert').getElement().setStyle('display', '');
                this.getButton('update').getElement().setStyle('display', 'none');
            }   
        },
        onOk : function()
        {
            if ( this.imageEditMode )
            {
                // Restore the original element before all commits.
                this.imageElement = this.cleanImageElement;
                delete this.cleanImageElement;
            }
            else
            {
                // Create a new image.
                this.imageElement = editor.document.createElement( 'img' );
                this.imageElement.setAttribute( 'alt', 'User-added image' );
            }

            var doc = this.getElement().getDocument();
            if (this.imageEditMode && isEmpty(doc.getById(editor.name + ':file').getValue()) && this.currentPage === 'upload')
            {
                this.imageElement.setAttribute('alt', doc.getById(editor.name + ':txtAlt2').getValue());
            }
            else
            {
                this.commitContent(this.imageElement);
            }

            if (!this.imageEditMode )
            {
                editor.insertElement( this.imageElement );
            }
        },
        onLoad : function ()
        {
            // Fix for W-1162957, The earlier fix caused W-1190728 	
            if (CKEDITOR.env.ie6Compat || CKEDITOR.env.ie7Compat) {
        		var dialog = CKEDITOR.dialog.getCurrent();
        		// Get the txtUrl field. It can't be null
        		var urlField = dialog.getContentElement('info', 'txtUrl').getInputElement();				
        		// Set the width		
        		urlField.setStyle('width', '418px');					
      	    }

	       // Fix for W-1180188 and W-1189266
	       if (CKEDITOR.env.ie ) {
        		// Reset event for file field		
        		var theField = document.getElementById(editor.name + ':file');
        		
        		// For IE8 and IE9, the event handlers get assigned twice and called twice. 
        		// So making sure that we only attach events if they are not already attached
        		// Fix for W-1348171, Opening dialog for IE10.
        		var onClickStr = (CKEDITOR.env.ie9Compat || CKEDITOR.env.ie10Compat) ? 'function onclick(event)' : 'function onclick()';		
        		var oldClick = (theField.onclick) ? theField.onclick.toString() : 'undefined';
        		if(oldClick.indexOf(onClickStr) != 0){
        			if (theField.addEventListener){ // IE9
        				theField.addEventListener('click', function(){disabledEventPropagation(event);}, false);										
        			}
        			else if (theField.attachEvent){ // IE6, IE7 and IE8
        				theField.attachEvent('onclick', function(){disabledEventPropagation(event);});										
        			}	
        		}
        				
        		var onChangeStr = (CKEDITOR.env.ie9Compat || CKEDITOR.env.ie10Compat) ? 'function onchange(event)' : 'function onchange()';		
        		var oldChange = (theField.onchange) ? theField.onchange.toString() : 'undefined';		
        		if(oldChange.indexOf(onChangeStr) != 0){
        			if (theField.addEventListener){ // IE9										
        				theField.addEventListener('change', function(){checkValidFiletype();},false);
        			}
        			else if (theField.attachEvent){ // IE6, IE7 and IE8										
        				theField.attachEvent('onchange', function(){checkValidFiletype();});
        			}	
        		}						
        		
        		// create iframe and append in the div
        		var theDiv = document.getElementById('uploadWindowDiv');			
        		var iFrame = document.createElement('iframe');
        		
        		// Set name and style this way for IE as setAttribute was not working
        		iFrame.name = editor.name + ':uploadWindow';
        		iFrame.style.display = 'none';			
        		
        		// Set rest of the attributes
        		iFrame.setAttribute('id', editor.name + ':uploadWindow');		
        		iFrame.setAttribute('src', '/blank.html');
        		
        		// Attach event								
        		if (iFrame.addEventListener){ // IE9
        			iFrame.addEventListener('load',function(){onUploadCompleted();},false);
        		}
        		else if (iFrame.attachEvent){ // IE6, IE7 and IE8
        			iFrame.attachEvent('onload',function(){onUploadCompleted();});
        		}
        	
        		// Append iframe to div
        	        theDiv.appendChild(iFrame);
        	        
        		// Set the iframe as target for form	
        		CKEDITOR.document.getById(getNonNativeId('frmUpload')).setAttribute('target', editor.name + ':uploadWindow');
    	    }

            // Update the action URL of the upload frm.
            CKEDITOR.document.getById(getNonNativeId('frmUpload')).setAttribute('action', editor.config.filebrowserImageUploadUrl);

            this.on('selectPage', function ( event )
                {
                    this.currentPage = event.data.page;
                });

            this.on('onUploadCompleted', function ( event )
                {
                    var response = evalAjaxServletOutput(event.data);
                    if (response.isRunninTests)
                    {
                        isRunningTests = response.isRunninTests;
                    }

                    var hasNoError = processUpload(response, this);

                    if (hasNoError && this.fire( 'ok', { hide : true } ).hide !== false ) {
                        this.hide();
                        editor.config.uploadedImages++;
                    }
                });
        },
        onHide : function ()
        {

            // For IE6, IE7 we need to force the data reload to make sure that an uploaded image is correctly displayed
            // Fixes bug: W-1007791.
            if (CKEDITOR.env.ie6Compat || CKEDITOR.env.ie7Compat) {
                var editor = this.getParentEditor();
                editor.getMode().loadData(editor.getData());
            }

            if ( this.originalElement )
            {
                this.originalElement.removeListener( 'load', onImgLoadEvent );
                this.originalElement.removeListener( 'error', onImgLoadErrorEvent );
                this.originalElement.removeListener( 'abort', onImgLoadErrorEvent );
                this.originalElement.remove();
                this.originalElement = false;		// Dialog is closed.
            }

            cleanUpUploadForm();

            delete this.imageElement;
        },
        contents :
        [
            {
                id : 'upload',
                label : editor.config.auraLabels.CkeImageDialog.uploadTab,
                elements :
                [
                    {
                        type : 'html',
                        html : uploadHtml
                    }
                ]
            },
            {
                id : 'info',
                label : editor.config.auraLabels.CkeImageDialog.infoTab,
                accessKey : 'I',
                elements:
                [
                    {
                        type : 'vbox',
                        children :
                        [
                            {
                                type : 'text',
                                id : 'txtUrl',
                                label : editor.config.auraLabels.CkeImageDialog.infoTab_url,
                                'default' : '',
                                style : 'width: 100%',
                                onKeyUp : onUrlChange,
                                onChange : function ()
                                {
                                    var dialog = this.getDialog(),
                                        newUrl = this.getValue();

                                    //Update original image
                                    if ( newUrl.length > 0 )	//Prevent from load before onShow
                                    {
                                        dialog = this.getDialog();
                                        var original = dialog.originalElement;

                                        original.setCustomData( 'isReady', 'false' );
                                        original.on( 'load', onImgLoadEvent, dialog );
                                        original.on( 'error', onImgLoadErrorEvent, dialog );
                                        original.on( 'abort', onImgLoadErrorEvent, dialog );
                                        original.setAttribute( 'src', newUrl );
                                    }

                                },
                                setup : function (element)
                                {
                                    var url = element.data( 'cke-saved-src' ) || element.getAttribute( 'src' );
                                    var field = this;

                                    field.setValue( url );		// And call this.onChange()
                                                                // Manually set the initial value.(#4191)
                                    field.setInitValue();
                                },
                                commit : function (element)
                                {
                                    if ( this.getValue() || this.isChanged() )
                                    {
                                        element.data( 'cke-saved-src', this.getValue() );
                                        element.setAttribute( 'src', this.getValue() );
                                    }
                                }
                            },
                            {
                                type : 'html',
                                html : '<div class="cke_dialog_ui_input_desc">' + editor.config.auraLabels.CkeImageDialog.infoTab_url_info + '<div>'
                            },
                            {
                                type : 'text',
                                id : 'txtAlt',
                                label : editor.config.auraLabels.CkeImageDialog.infoTab_desc,
                                setup : function (element)
                                {
                                    this.setValue( element.getAttribute( 'alt' ) );
                                },
                                commit : function (element)
                                {
                                    if ( this.getValue() || this.isChanged() ) {
                                        element.setAttribute( 'alt', this.getValue() );
                                    }
                                }
                            },
                            {
                                type : 'html',
                                html : '<div class="cke_dialog_ui_input_desc">' + editor.config.auraLabels.CkeImageDialog.infoTab_desc_info + '<div>'
                            },
                            {
                                type : 'text',
                                id : 'imgWidth',
                                width : '40px',
                                style : "display : 'none';",
                                label : editor.lang.common.width,
                                labelLayout : 'horizontal',
                                setup : function (element)
                                {
                                    this.setValue( element.getAttribute( 'width' ) );
                                },
                                commit : function (element)
                                {
                                    if ( this.getValue() || this.isChanged() ) {
                                        element.setAttribute( 'width', this.getValue() );
                                    }
                                }
                            },
                            {

                                type : 'text',
                                width : '40px',
                                id : 'imgHeight',
                                label : editor.lang.common.height,
                                labelLayout : 'horizontal',
                                setup : function (element)
                                {
                                    this.setValue( element.getAttribute( 'height' ) );
                                },
                                commit : function (element)
                                {
                                    if ( this.getValue() || this.isChanged() ) {
                                        element.setAttribute( 'height', this.getValue() );
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ],
        buttons :
        [
            // The chief reason why we have two buttons for the actual OK button is that
            // CKEDITOR's API doesn't allow the button labels to be modified dynamically.
            // So, those are making up a workaround this limitation.
            {
                type : 'button',
                id : 'update',
                title : 'Update Image',
                'class' : 'cke_dialog_ui_button_update',
                label : editor.config.auraLabels.CkeImageDialog.btn_upadte,
                onClick : function (evt)
                {
                    handleOK(evt);
                }
            },
            {
                type : 'button',
                id : 'insert',
                title : 'Insert Image',
                'class' : 'cke_dialog_ui_button_insert',
                label : editor.config.auraLabels.CkeImageDialog.btn_insert,
                onClick : function (evt)
                {
                    handleOK(evt);
                }
            },
            CKEDITOR.dialog.cancelButton,
        ]

    };

});

function onUploadCompleted()
{
	var responseText;
	// Fix for W-1348171, js errros on image upload in IE10
	if (CKEDITOR.env.ie10Compat) {		
		responseText = GetE('uploadWindow').contentDocument.body.innerHTML;
    }
    else{
		responseText = GetE('uploadWindow').contentWindow.document.body.innerHTML;
	}

    responseText = responseText.replace( /^\s*/, "" );

    if (responseText.length > 0) {
        CKEDITOR.dialog.getCurrent().fire('onUploadCompleted', responseText);
    }
}

function disabledEventPropagation(event) {
   if (event.stopPropagation){
       event.stopPropagation();
   }
   else if(window.event){
      window.event.cancelBubble=true;
   }
}

/**
 * Called on change of the file input field to check that the type of the selected file
 * is a Salesfroce supported one (valid image extension).
 */
function checkValidFiletype()
{	
    var dialog = CKEDITOR.dialog.getCurrent();
    var config = dialog.getParentEditor().config;
    var uploadAllowedExtRegex	= new RegExp( config.imageUploadAllowedExtensions, 'i' ) ;
    var uploadDeniedExtRegex	= new RegExp( config.imageUploadDeniedExtensions, 'i' ) ;
    var sFile = GetE('file').value;

    if ( ( config.imageUploadAllowedExtensions.length > 0 && !uploadAllowedExtRegex.test( sFile ) ) ||
        ( config.imageUploadDeniedExtensions.length > 0 && uploadDeniedExtRegex.test( sFile ) ) ) {
        var msg = '<b>'
            + editor.config.auraLabels.CkeImageDialog.error
            + '</b>&nbsp;'
            + editor.config.auraLabels.CkeImageDialog.wrongFileTypeError;
        showError(getNonNativeId('file'), msg);
        if (dialog.imageEditMode)
            dialog.disableButton('update');
        else
            dialog.disableButton('insert');
    } else {
        hideError(getNonNativeId('file'));
        if (dialog.imageEditMode)
            dialog.enableButton('update');
        else
            dialog.enableButton('insert');
    }
}
