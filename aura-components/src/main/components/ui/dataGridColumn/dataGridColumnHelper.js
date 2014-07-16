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
	intialize: function (cmp) {
		this.intializeDefaultOutputComponent(cmp);
		this.intializeDefaultInputComponent(cmp);
	},

	intializeDefaultOutputComponent: function (cmp) {
		var outputComponent = cmp.get('v.outputComponent')[0];

		// Wire up default outputComponent if not explicitly set.
		if (!outputComponent.attributes) {
			this.wireComponentDefRef(cmp, outputComponent);
		}
	},

	intializeDefaultInputComponent: function (cmp) {
		var inputComponent = cmp.get('v.inputComponent')[0];

		// Wire up default outputComponent if not explicitly set.
		if (!inputComponent.attributes) {
			this.wireComponentDefRef(cmp, inputComponent);
		}
	},

	wireComponentDefRef: function (cmp, defRef) {
		var name = cmp.get('v.name'),
			namePath = name.split('.'),
			// propertyReference = this.createPropertyReference('value', ['row', 'item'].concat(namePath));
			propertyReference = this.createPropertyReference('value', ['item'].concat(namePath));

		defRef.attributes = {
			values: {
				value: propertyReference
			}
		};
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
			onsortchange = cmp.get('v.onsortchange'),
			newValue;
		
		if (direction === 'descending') {
			newValue = 'ascending'	
		} else {
			newValue = 'descending';	
			name = '-' + name;
		}

		cmp.set('v.direction', newValue);

		// onsortchanged
		if (onsortchange) {
			onsortchange.runDeprecated(name);
		}
	}
})