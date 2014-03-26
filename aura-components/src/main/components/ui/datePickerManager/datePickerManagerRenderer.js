({
	render: function (cmp, hlp) {
		var body = this.superRender();

		// Append datePicker directly to the body. 
		// This allows the absolute positions to be calculated appropriately.
		document.body.appendChild(body[0]);
	}
})