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


	handleReferenceElement: function (cmp) {
		var elem = cmp.getElement();
		var referenceBox;
		var referenceElem = cmp.get('v.referenceElement');

		//hide while it is positioned
		elem.style.opacity = 0;
		if(!referenceElem) {
			return;
		} else {
			referenceBox = referenceElem.getBoundingClientRect();
		}

		if(referenceBox) {
			elem.style.width = referenceBox.width + 'px';
		}
		
		if(!cmp.positionConstraint) {
			cmp.positionConstraint = this.lib.panelPositioning.createRelationship({
	            element:elem,
	            target:referenceElem,
	            appendToBody: true,
	            align: 'left top',
	            targetAlign: 'left bottom'
        	});
		}
		
		this.lib.panelPositioning.reposition(function() {
			elem.style.opacity = 1;
		});
	}
})// eslint-disable-line semi
