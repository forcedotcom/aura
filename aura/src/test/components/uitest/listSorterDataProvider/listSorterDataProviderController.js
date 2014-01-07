({
	onInit: function(cmp) {		
		cmp.getValue('v.columns').setValue(cmp.get('m.columns'));
		cmp.getValue('v.sortBy').setValue(cmp.get('m.defaultOrderByList'))
	}
})