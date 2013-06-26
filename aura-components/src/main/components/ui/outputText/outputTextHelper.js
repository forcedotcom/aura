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
			textValue = textValue.replace(/(\r\n|\r)/g, '\n');							
			var parts = textValue.split('\n');
			if (parts.length == 1) {
				containerEl.appendChild(document.createTextNode(parts[0]));
			} else {
				for (var i=0; i< parts.length; i++) {
					containerEl.appendChild(document.createTextNode(parts[i]));
					containerEl.appendChild(document.createElement('br'))
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