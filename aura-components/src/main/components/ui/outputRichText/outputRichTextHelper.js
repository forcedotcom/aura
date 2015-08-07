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
    SUPPORTED_HTML_TAGS: ["a", "b", "big", "blockquote", "caption", "cite", "code", 
                          "del", "div", "em", "h1", "h2", "h3", "hr", "i", "img", "ins",
                          "kbd", "li", "ol", "p", "param", "pre", "q", "s", "samp", "small",
                          "span", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th",
                          "thead", "tr", "tt", "u", "ul", "var"],
    
    removeEventHandlers: function(element) {
        var attributes = element.attributes || [];
        for (var i = 0; i < attributes.length; i++) {
            if ($A.util.isIE && !attributes[i].specified) {
                continue;
            }
            if (attributes[i].nodeName.substring(0, 2) == "on") { // event handler
                attributes[i].nodeValue = null;
            }
        }
    },
    
    validate: function(component) {
        var value = component.get("v.value");
        if ($A.util.isUndefinedOrNull(value) || $A.util.isEmpty(value)) {
            return;
        }
        
        var supportedTags = component.get("v.supportedTags");
        if (supportedTags) {
            supportedTags = supportedTags.replace(/ /g,'').toLowerCase().split(",");
        } else {
            supportedTags = this.SUPPORTED_HTML_TAGS;
        }
        
        try {
        	var dummy = document.implementation.createHTMLDocument();
            var root = dummy.createElement('div');
            root.innerHTML = value;
            
            this.validateElement(root, supportedTags);
        
            var result = root.innerHTML;
            if (result != value) {
                component.set("v.value", result);
            }
            $A.util.removeElement(root);
        } catch (e) {
        	$A.warning("Exception caught while attempting to validate " + component.getGlobalId() + "; " + e);
        	component.set("v.value", $A.util.sanitizeHtml(value));
        }
    },
    
    validateElement: function(element, supportedTags) {
        if (element.nodeType == 3) { // text node
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
                    len = nodes.length
                    i--;
                }
            }
        }
    }
 // eslint-disable-line semi 
})