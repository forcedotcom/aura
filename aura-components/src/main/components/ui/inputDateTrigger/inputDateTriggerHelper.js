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
	/**
	 * @param {Component} component An instance of ui:inputDate
	 */
	displayDatePicker: function (component) {
		var self 		= this,
			concComp	= component.getConcreteComponent(),
			el 		= component.getElement(),
			value 		= concComp.get('v.value'),
			currentDate = value ? $A.localizationService.parseDateTime(value, 'yyyy-MM-dd') : new Date();

		$A.get('e.ui:showDatePicker').setParams({
			element  	: el,
			value      	: self.getDateString(currentDate),
			onselected 	: function (evt) {
			    concComp.set('v.value', evt.getParam('value'));
			}
		}).fire();
	}			
})