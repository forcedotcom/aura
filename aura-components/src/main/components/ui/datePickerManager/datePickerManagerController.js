({
	handleShowDatePicker: function (cmp, evt) {
		var datePicker = cmp.find('datePicker'),
			el = datePicker.getElement(),
			params = evt.getParams(),
			box = params.element.getBoundingClientRect(),
			scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
			scrollLeft = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;

		// Position datePicker.
		// Using scrollTop & scrollLeft for IE support; avoid window.scrollY & window.scrollX.
		el.style.top = box.bottom + scrollTop + 'px';
		el.style.left = box.left + scrollLeft + 'px';

		// Keep reference to onselected callback.
		cmp._onselected = params.onselected;

		// Set value and show datePicker.
		datePicker.setValue('v.value', params.value);
		datePicker.setValue('v.visible', true);
	},

	handleDateSelected: function (cmp, evt) {
		var selected = cmp._onselected;

		// Invoke onselected if it's a function; otherwise, assume Aura.Action.
		if (selected && $A.util.isFunction(selected)) {
			selected.call({}, evt);
		}
		else if (selected.auraType === 'Action') {
			selected.runDeprecated(evt);
		}
	}
})