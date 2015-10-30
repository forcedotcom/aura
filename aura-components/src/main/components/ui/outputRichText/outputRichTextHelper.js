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
    SUPPORTED_HTML_TAGS: 	["a", "b", "big", "blockquote", "caption", "cite", "code", 
                         	 "del", "div", "em", "h1", "h2", "h3", "hr", "i", "img", "ins",
                         	 "kbd", "li", "ol", "p", "param", "pre", "q", "s", "samp", "small",
                         	 "span", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th",
                         	 "thead", "tr", "tt", "u", "ul", "var"],
                         	 
    SUPPORTED_ATTRS:		['accept','action','align','alt','autocomplete','background','bgcolor',
                    	     'border','cellpadding','cellspacing','checked','cite','class','clear','color',
                    	     'cols','colspan','coords','datetime','default','dir','disabled',
                    	     'download','enctype','face','for','headers','height','hidden','high','href',
                    	     'hreflang','id','ismap','label','lang','list','loop', 'low','max',
                    	     'maxlength','media','method','min','multiple','name','noshade','novalidate',
                    	     'nowrap','open','optimum','pattern','placeholder','poster','preload','pubdate',
                    	     'radiogroup','readonly','rel','required','rev','reversed','rows',
                    	     'rowspan','spellcheck','scope','selected','shape','size','span',
                    	     'srclang','start','src','step','style','summary','tabindex','title',
                    	     'type','usemap','valign','value','width','xmlns'],
    
    removeEventHandlers: function(element) {
        var attributes = element.attributes || [];
        for (var i = 0; i < attributes.length; i++) {
            if ($A.util.isIE && !attributes[i].specified) {
                continue;
            }
            if (attributes[i].nodeName.substring(0, 2) === "on") { // event handler
                attributes[i].nodeValue = null;
            }
        }
    },
    
    validate: function(component) {
        var value = component.get("v.value");
        if ($A.util.isUndefinedOrNull(value) || $A.util.isEmpty(value)) {
            return;
        }
        
        var supportedTags = this.getSupportedTags(component);
        var supportedAttrs = this.getSupportedAttributes(component);
        
        try {
            var sanitizedValue = this.lib.DOMPurify.sanitize(value, {ALLOWED_TAGS: supportedTags, ALLOWED_ATTR: supportedAttrs});
            
            if (sanitizedValue !== value) {
                component.set("v.value", sanitizedValue);
            }
        } catch (e) {
        	$A.warning("Exception caught while attempting to validate " + component.getGlobalId() + "; " + e);
        	component.set("v.value", $A.util.sanitizeHtml(value));
        }
    },
    
    validateElement: function(element, supportedTags) {
        if (element.nodeType === 3) { // text node
            return;
        }
        if (element.tagName && supportedTags.indexOf(element.tagName.toLowerCase()) < 0) {
            //element.parentNode.removeChild(element);
            $A.util.removeElement(element);
            return;
        }
        this.removeEventHandlers(element);
        var nodes = element.childNodes;

        if (nodes) {
        	var len = nodes.length;
            for (var i = 0; i < len; i++) {
                this.validateElement(nodes[i], supportedTags);
                if (len > nodes.length) { // the current element is removed
                    len = nodes.length;
                    i--;
                }
            }
        }
    },
    
    /**
     * Retrieve the HTML tag whitelist
     */
    getSupportedTags: function(component) {
    	var supportedTags = component.get("v.supportedTags");
    	
    	return supportedTags ? supportedTags.replace(/ /g,'').toLowerCase().split(",")
                : this.getDefaultSupportedTags(component);
    },
    
    /**
     * Retrieve the attribute whitelist
     */
    getSupportedAttributes: function(component) {
    	var supportedAttrs = component.get("v.supportedAttrs");
    	
    	return supportedAttrs ? supportedAttrs.replace(/ /g,'').toLowerCase().split(",")
    						  : this.getDefaultSupportedAttributes(component);
    },

    getDefaultSupportedTags: function() {
        return this.SUPPORTED_HTML_TAGS;
    },

    getDefaultSupportedAttributes: function() {
        return this.SUPPORTED_ATTRS;
    }
})// eslint-disable-line semi
