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

	handleZIndex: function(cmp) {
		cmp.getElement().style.zIndex = cmp.get('v.zIndex');
	},

	handleReferenceElement: function(cmp, evt, helper) {
		
		var elem = cmp.getElement();
		var referenceElem = cmp.get('v.referenceElement');
		elem.offsetHeight;
		if(!cmp.positionConstraint) {
			cmp.positionConstraint = helper.lib.panelPositioning.createRelationship({
	            element:elem,
	            target:referenceElem,
	            appendToBody: true,
	            align: 'left top',
	            targetAlign: 'left bottom'
        	});
		}

		//some kind of race condtion here, look at tomorrow, brain failing
		helper.lib.panelPositioning.reposition();
		setTimeout(function() {
			helper.lib.panelPositioning.reposition();
		}, 100);
		
	}
})// eslint-disable-line semi