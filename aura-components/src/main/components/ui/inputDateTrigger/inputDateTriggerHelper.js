({
	/**
	 * @param {Component} component An instance of ui:inputDate
	 */
	displayDatePicker: function (component) {
		var self 		= this,
			el 			= component.getElement(),
			value 		= component.get('v.value'),
			currentDate = value ? $A.localizationService.parseDateTime(value, 'yyyy-MM-dd') : new Date();

		$A.get('e.ui:showDatePicker').setParams({
			element  	: el,
			value      	: self.getDateString(currentDate),
			onselected 	: function (evt) {
				component.setValue('v.value', evt.getParam('value'));
			}
		}).fire();
	}			
})