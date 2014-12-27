({
	/**
	 * Tests sanity of the Action#defer. 
	 *
	 * @author 	dmcmillen
	 * @since 	190
	 */	

	/**
	 * Basic sanity tests that use server actions and the component action queue.
	 */ 
	testMeaningOfLife: {

		test: [function (cmp) {
			var simpleDeferBtn = cmp.find('simpleDeferBtn');

			$A.test.assertTruthy(simpleDeferBtn);	

                        $A.test.clickOrTouch(simpleDeferBtn.getElement());

			$A.test.addWaitFor(42, function () {
				return cmp.get('v.result');
			});
		}, 
		function (cmp) {
			var chainedDeferBtn = cmp.find('chainedDeferBtn');

			$A.test.assertTruthy(chainedDeferBtn);	

                        $A.test.clickOrTouch(chainedDeferBtn.getElement());
			
			$A.test.addWaitFor(44, function () {
				return cmp.get('v.result');
			});	
		},
		function (cmp) {
			var errorDeferBtn = cmp.find('errorDeferBtn');

			$A.test.assertTruthy(errorDeferBtn);	

                        $A.test.clickOrTouch(errorDeferBtn.getElement());
			
			$A.test.addWaitFor('Foo', function () {
				var err = cmp.get('v.error');
				return err ? err : null;
			});	
		},
		function (cmp) {
			var chainedErrorDeferBtn = cmp.find('chainedErrorDeferBtn');

			$A.test.assertTruthy(chainedErrorDeferBtn);	

			chainedErrorDeferBtn.getElement().click();
			
			$A.test.addWaitFor('Foo', function () {
				var err = cmp.get('v.error');
				return err ? err : null;
			});	
		}]
	},

	/** 
	 * Verifies that using the action API oddly does not break callbacks.
	 * This should be considered an edge case. 
	 */ 
	testCallbackWrappedDefer: {

		test: [function (cmp) {
			var callbackWrappedDeferBtn = cmp.find('callbackWrappedDeferBtn');

			$A.test.assertTruthy(callbackWrappedDeferBtn);	

                        $A.test.clickOrTouch(callbackWrappedDeferBtn.getElement());
			
			$A.test.addWaitFor('Foo', function () {
				return cmp.get('v.result');
			});	
		}]
	}
})
