/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	// %REMOVE_START%
	config.plugins =
		'about,' +
		'a11yhelp,' +
		'basicstyles,' +
		'bidi,' +
		'blockquote,' +
		'clipboard,' +
		'colorbutton,' +
		'colordialog,' +
		'contextmenu,' +
		'dialogadvtab,' +
		'div,' +
		'elementspath,' +
		'enterkey,' +
		'entities,' +
		'filebrowser,'+
		'find,' +
		'flash,' +
		'floatingspace,' +
		'font,' +
		'format,' +
		'forms,' +
		'horizontalrule,' +
		'htmlwriter,' +
		'image,' +
		'iframe,' +
		'indentlist,' +
		'indentblock,' +
		'justify,' +
		'language,' +
		'link,' +
		'list,' +
		'liststyle,' +
		'magicline,' +
		'maximize,' +
		'newpage,' +
		'pagebreak,' +
		'pastefromword,' +
		'pastetext,' +
		'preview,' +
		'print,' +
		'removeformat,' +
		'resize,' +
		'save,' +
		'selectall,' +
		'showblocks,' +
		'showborders,' +
		'smiley,' +
		'sourcearea,' +
		'specialchar,' +
		'stylescombo,' +
		'tab,' +
		'table,' +
		'tabletools,' +
		'templates,' +
		'toolbar,' +
		'undo,' +
		'wysiwygarea';
	// %REMOVE_END%

	// CK4 filters some html tags and attributes by default, which disappear on save or during toggle from html to source and back
	// see http://docs.ckeditor.com#!/guide/dev_allowed_content_rules
	// these are safe, supported tags we always want to allow in client validation regardless of which plugins or toolbars are loaded
	// some of these would only be needed if pasting in styled content from an outside app (which is supported)
	var tags = [];
	tags.push('div{*}(*); span{*}(*); p{*}(*); br{*}(*); hr{*}(*);');
	tags.push('h1{*}(*); h2{*}(*); h3{*}(*); h4{*}(*); h5{*}(*); h6{*}(*);');
	tags.push('a[!href]{*}(*);')
	tags.push('img[!src,alt,width,height,border]{*}(*);');
	tags.push('font[face,size,color];')
	tags.push('strike; s; b; em; strong; i; big; small; sub; sup; blockquote; ins; kbd; pre; tt;');
	tags.push('abbr; acronym; address; bdo; caption; cite; code; col; colgroup;');
	tags.push('dd; del; dfn; dl; dt; q; samp; var;');
	tags.push('table{*}(*)[align,border,cellpadding,cellspacing,summary];');
	tags.push('caption{*}(*); tbody{*}(*); thead{*}(*); tfoot{*}(*); th{*}(*)[scope]; tr{*}(*); td{*}(*)[scope];');
	config.extraAllowedContent = tags.join(' ');
};

// %LEAVE_UNMINIFIED% %REMOVE_LINE%
