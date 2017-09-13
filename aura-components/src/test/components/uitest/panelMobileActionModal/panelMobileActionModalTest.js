({
	/**
	 * verify modal displays and transition events are fired.
	 */
	testTransitionEventsFired:{
    	test: [function(cmp){
    		cmp.find('createPanelBtn').get('e.press').fire();
    	}, function(cmp) {
    		this.waitForPanel("uiModal", true);
    	}, function(cmp) {
    		this.waitForTransitionCounts(cmp, 1);
    	}, function(cmp) {
    		this.waitForTransitionHasClassCounts(cmp, 1);
    	}]
	},
	/**
	 * verify when modal open/close, transition events are fired.
	 */
	testOpenAndClose:{
    	test: [function(cmp){
			cmp.set("v.closeAfterCreate", true);
    		cmp.find('createPanelBtn').get('e.press').fire();
    	}, function(cmp) {			
    		this.waitForTransitionCounts(cmp, 2);
    	}, function(cmp) {
    		this.waitForTransitionHasClassCounts(cmp, 2);
    	}]
    },
    
    waitForTransitionCounts : function(cmp, expectedCount) {
    	$A.test.addWaitForWithFailureMessage(expectedCount, function() {
    		var transitionBeginCount = cmp.get('v.tansitionBeginEventCount');
			var transitionEndCount = cmp.get('v.tansitionEndEventCount');
			return transitionBeginCount === transitionEndCount ? transitionBeginCount : -1;
		}, 'Transition events not called');
	},

	waitForTransitionHasClassCounts: function(cmp, expectedCount) {
    	$A.test.addWaitForWithFailureMessage(expectedCount, function() {
			var tansitionBeginEventHasGlassCount = cmp.get('v.tansitionBeginEventHasGlassCount');
    		var tansitionEndEventHasGlassCount = cmp.get('v.tansitionEndEventHasGlassCount');
			return tansitionBeginEventHasGlassCount === tansitionEndEventHasGlassCount ? tansitionBeginEventHasGlassCount : -1 ;
		}, 'Transition hasGlassBackground param is not set');
    },
            
    waitForPanel : function(type, isOpen) {
    	$A.test.addWaitForWithFailureMessage(isOpen, function() {
			var panel = $A.test.getElementByClass(type);
			return !$A.util.isUndefinedOrNull(panel);
		}, "Panel was not " + (isOpen ? "open" : "closed"));
    }
})