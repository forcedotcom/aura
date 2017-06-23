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
	DIRECTION_TOGGLE_MAP: {
		'ascending' : 'descending',
		'descending' : 'ascending'
	},

	initialize: function (cmp) {
		this.initializeDefaultOutputComponent(cmp);
	},

	initializeDefaultOutputComponent: function (cmp) {
		var outputComponent = cmp.get('v.outputComponent')[0];

		// Wire up default outputComponent if not explicitly set.
		if ($A.util.isEmpty(outputComponent.attributes.values)) {
			this.wireComponentDefRef(cmp, outputComponent);
		}
	},
	
	updateNameRef: function(cmp) {
		var outputComponent = cmp.get('v.outputComponent')[0];
		
		this.wireComponentDefRef(cmp, outputComponent);
	},

	wireComponentDefRef: function (cmp, defRef) {
		var name = cmp.get('v.name');
		if (name) {
		    var namePath = name.split('.'),
		        propertyReference = this.createPropertyReference('value', 'item.'+namePath);
		    
		    defRef.attributes = {
		        values: {
                    value: propertyReference
                }
		    };
		}
	},

	createPropertyReference: function (descriptor, path) {
		return {
			descriptor	: descriptor,
			value       : {
				exprType	: 'PROPERTY', 
				path		: path
			}
		};
	},

	toggleSort: function (cmp) {
		var name = cmp.get('v.name'),
			direction = cmp.get('v.direction'),
			initialDirOnSort = cmp.get('v.initialDirectionOnSort'),
			onsortchange = cmp.get('v.onsortchange'),
			newValue;
		
		newValue = $A.util.isEmpty(direction) ? initialDirOnSort : this.DIRECTION_TOGGLE_MAP[direction];

		if (newValue === 'descending') {
			name = '-' + name;
		}

		cmp.set('v.direction', newValue);

		// onsortchanged
		if (onsortchange) {
			onsortchange.runDeprecated(name);
		}
	}
})// eslint-disable-line semi
