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
{
	appendTextElements : function(textValue, containerEl) {
		
		if (!containerEl) {
			return;
		}
	
		if (typeof textValue == 'number') {
			containerEl.appendChild(document.createTextNode(textValue));
		} else	if (typeof textValue == 'string' && textValue.length > 0) {			
			textValue = textValue.replace(/(\r\n|\r|(\\r\\n)|\\r|\\n)/g, '\n');
			//workaround for closure compiles "*" into unicode in some context;
			var wildCard = '*';
			var regex = new RegExp("[^\\n]." + wildCard + "|\\n", "g");			
			var parts = textValue.match(regex);
			
			if (textValue === '\n') {
				containerEl.appendChild(document.createElement('br'));
			} else if (!parts || parts.length == 1) {
				containerEl.appendChild(document.createTextNode(textValue));
			} else {
				var len = parts.length;
				for (var i=0; i< len; i++) {
					if (parts[i] === '\n') {
						containerEl.appendChild(document.createElement('br'));
					} else {
						containerEl.appendChild(document.createTextNode(parts[i]));
					}					
				}
			}			
		} else {
			containerEl.appendChild(document.createTextNode(''));
		}
	},
	
	removeChildren : function(element) {
		if (element && element.nodeType == 1) {
			var child = element.firstChild, nextChild;
	
			while (child) {
			    nextChild = child.nextSibling;		    
			    $A.util.removeElement(child);		    
			    child = nextChild;
			}
		}
	}
}