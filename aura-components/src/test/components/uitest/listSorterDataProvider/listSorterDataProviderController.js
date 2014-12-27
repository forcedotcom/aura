({
	onInit: function(cmp) {
		cmp.set('v.columns', cmp.get('m.columns'));
		cmp.set('v.sortBy', cmp.get('m.defaultOrderByList'))
	},
	
	onProvide: function(cmp, evt, helper) {		
		helper.fireDataChangeEvent(cmp, {columns: cmp.get('m.columns'), orderBy: cmp.get('m.defaultOrderByList')});
	}
})