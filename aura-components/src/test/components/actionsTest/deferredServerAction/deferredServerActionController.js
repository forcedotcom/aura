({
	/**
	 * Runs the 'meaningOfLife' server action (returns 42).
	 * Should place 42 on the screen. 
	 */ 
	simpleDefer: function (cmp, evt, hlp) {
		var meaningOfLifeAction = cmp.get('c.meaningOfLife');
		$A.deferAction(meaningOfLifeAction).then(hlp.getSuccess(cmp), hlp.getError(cmp));	
	},

	/**
	 * Runs the 'meaningOfLife' server action (returns 42) and chains the successful promises while adding 2. 
	 * Should place 44 on the screen.
	 */
	chainedDefer: function (cmp, evt, hlp) {
		var meaningOfLifeAction = cmp.get('c.meaningOfLife');
		
		$A.deferAction(meaningOfLifeAction)
			.then(function (res) { return res + 2; })
			.then(hlp.getSuccess(cmp), hlp.getError(cmp));		
	}, 

	/**
	 * Runs the 'alwaysThrows' server action (throws an exception always).
	 * Verifies that the exception is handled by the reject/error handler.
	 */
	errorDefer: function (cmp, evt, hlp) {
		var alwaysThrows = cmp.get('c.alwaysThrows');
		$A.deferAction(alwaysThrows).then(hlp.getSuccess(cmp), hlp.getError(cmp));
	},

	/**
	 * Runs the 'alwaysThrows' server action (throws an exception always).
	 * Verifies that the error object is chained to the closest reject/error handler.
	 */
	chainedErrorDefer: function (cmp, evt, hlp) {
		var alwaysThrows = cmp.get('c.alwaysThrows');
		$A
			.deferAction(alwaysThrows)
			.then(function () { /* should not be called */ })
			.then(function () { /* should not be called */ }, hlp.getError(cmp))
			.then(function () { /* should not be called */ });
	},

	callbackWrappedDefer: function (cmp, evt, hlp) {
		var meaningOfLifeAction = cmp.get('c.meaningOfLife'), 
			firstResult, 
			secondResult;

		meaningOfLifeAction.setCallback(this, function (a) {
			firstResult = a.getReturnValue();
			check();		
		});

		$A.deferAction(meaningOfLifeAction).then(function (result) {
			secondResult = result;
			check(); 
		});

		function check() {
			if (firstResult && secondResult) {
				cmp.set('v.result', 'Foo');
			}
		}
	}
})