({
	onInit: function(cmp) {
		cmp.set('v.columns', cmp.get('m.columns'));
		cmp.set('v.sortBy', cmp.get('m.defaultOrderByList'))
	}
})