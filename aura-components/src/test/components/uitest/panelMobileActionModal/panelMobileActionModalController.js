({
	createModal : function(cmp, event, helper) {
		var createPanelEvt = helper.getCreatePanelEvent(cmp, cmp.get('v.closeAfterCreate'));
		createPanelEvt.fire();
	},
		
	incrementTrasitionBeginCount : function(cmp, event) {
		var oldCount = cmp.get('v.tansitionBeginEventCount');
		cmp.set('v.tansitionBeginEventCount', ++oldCount);

		var param = event.getParams();
		if(param.hasGlassBackground) {
			oldCount = cmp.get('v.tansitionBeginEventHasGlassCount');
			cmp.set('v.tansitionBeginEventHasGlassCount', ++oldCount);
		}
	},
	
	incrementTrasitionEndCount : function(cmp, event) {
		var oldCount = cmp.get('v.tansitionEndEventCount');
		cmp.set('v.tansitionEndEventCount', ++oldCount);

		var param = event.getParams();
		if(param.hasGlassBackground) {
			oldCount = cmp.get('v.tansitionEndEventHasGlassCount');
			cmp.set('v.tansitionEndEventHasGlassCount', ++oldCount);
		}
	}
})