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
	initialize: function (cmp) {
		var value = cmp.getValue('v.value'),
			outputComponentDefRef = cmp.get('v.outputComponent')[0],
			priv_outputComponent = cmp.getValue('v.priv_outputComponent'),
			valueProvider = {};

		if (outputComponentDefRef) {
			if (!outputComponentDefRef.attributes) { 
				outputComponentDefRef.attributes = { values : {} };	
			}  

			outputComponentDefRef.attributes.values['value'] = {
				descriptor 	: 'value',
				value 		: value
			};	

			// Create component and inject it. 
			$A.componentService.newComponentAsync(this, function (outputComponent) {
				priv_outputComponent.setValue([outputComponent]);
			}, outputComponentDefRef);
		}
	},

	/**
	 * Calculates the aggregate result based on the type attribute.
	 * Looks up the helper function using the type string. 
	 * Try adding an additional 'aggregate_*' function before override
	 * this function. 
	 */
	calculate: function (cmp) {
		var items		= cmp.getValue('v.items'),
			column		= cmp.get('v.column'),
			type 		= cmp.get('v.type'), 
			aggregate	= 0,
			fn 			= this['aggregate_' + type.toLowerCase()];

		if (fn) {
			var val = fn.call(this, items, column);

			if (!this.isValid(cmp, val)) {
	            $A.util.addClass(cmp.getElement(), 'error');
	        }
	        else {
	            $A.util.removeClass(cmp.getElement(), 'error');
	        }

			// Do NOT allow undefined to be set.
			if (val) {
				cmp.set('v.value', val);
			}
			else {
				cmp.set('v.value', undefined);
			}
		}
		else {
			$A.error('Unsupported aggregate function.');
		}
	},

	isValid: function (value) {
		return true;
	},

	extractNumbers: function (items, column) {
		var values = [];

		items.each(function (item) {
			var value = parseFloat(item.get(column));
			
			if (value) {
				values.push(value);				
			}
		});	

		return values;
	},

	/**
	 * @param {ArrayValue} items
	 * @param {String} column 
	 */
	aggregate_sum: function (items, column) {
		var sum = 0

		items.each(function (item) {
			var num = parseFloat(item.get(column));
			
			if (num) {
				sum += num;
			}
		});

		return sum;	
	},

	/**
	 * @param {ArrayValue} items
	 * @param {String} column 
	 */
	aggregate_avg: function (items, column) {
		var length = this.extractNumbers(items, column).length,
			sum = this.aggregate_sum(items, column);
		
		return Math.round(sum / length); 	
	},

	/**
	 * @param {ArrayValue} items
	 * @param {String} column 
	 */
	aggregate_min: function (items, column) {
		var values = this.extractNumbers(items, column);	
		return Math.min.call(this, values);
	},

	/**
	 * @param {ArrayValue} items
	 * @param {String} column 
	 */
	aggregate_max: function (items, column) {
		var values = this.extractNumbers(items, column);	
		return Math.max.call(this, values);
	}
})