({
	getSuccess: function (cmp) {
		var result = cmp.getValue('v.result');

		return function (res) {
			result.setValue(res);
		};
	},

	getError: function (cmp) {
		var error = cmp.getValue('v.error');
		
		return function (cfg) {
			if (cfg.state === 'ERROR') {
				error.setValue(cfg.action.getError()[0].message);	
			}
		};
	}
})