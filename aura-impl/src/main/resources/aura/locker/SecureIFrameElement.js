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

var SecureIFrameElement = {
	addMethodsAndProperties: function(prototype) {
	    "use strict";

	    function SecureIFrameContentWindow(w, key) {
	    	var sicw = Object.create(null, {
	            toString: {
	                value: function() {
	                    return "SecureIFrameContentWindow: " + w + "{ key: " + JSON.stringify(key) + " }";
	                }
	            }
	        });
	
	    	Object.defineProperties(sicw, {
	            postMessage: SecureObject.createFilteredMethod(sicw, w, "postMessage")
	    	});
	
	    	return sicw;
	    }
	
	    Object.defineProperties(prototype, {
	        // Standard HTMLElement methods
	        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
	        blur: SecureObject.createFilteredMethodStateless("blur", prototype),
	        focus: SecureObject.createFilteredMethodStateless("focus", prototype),
	        contentWindow: {
	        	get: function() {
					var raw = SecureObject.getRaw(this, prototype);
	        		return raw.contentWindow ? SecureIFrameContentWindow(raw.contentWindow, ls_getKey(this)) : raw.contentWindow;
	        	}
	        }
	    });
	    	
	    // Standard list of iframe's properties from:
	    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement
	    // Note: ignoring 'contentDocument', 'sandbox' and 'srcdoc' from the list above.
	    ["height", "width", "name", "src"].forEach(function (name) {
			Object.defineProperty(prototype, name, SecureObject.createFilteredPropertyStateless(name, prototype));
		});
	}
};
