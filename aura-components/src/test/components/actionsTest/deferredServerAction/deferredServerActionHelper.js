({
	getSuccess: function (cmp) {
		return function (res) {
			cmp.set('v.result', res);
		};
	},

	getError: function (cmp) {
		return function (cfg) {
			if (cfg.state === 'ERROR') {
				cmp.set('v.error', cfg.action.getError()[0].message);	
			}
		};
	}
})