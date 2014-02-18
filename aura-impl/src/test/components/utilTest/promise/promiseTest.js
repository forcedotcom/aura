({
	/**
	 * Tests that synchronous work is deferred and resolved correctly.
	 */ 
	testImmediateResolution: {

		test: [function () {
			var result = null,
				p = $A.util.createPromise(function (success, error) {
					success('done');
				});

			p.then(function (res) {
				result = res;
			});

			$A.test.addWaitFor('done', function () { return result; });
		}]
	},

	/**
	 * Tests that the execution of promise work is totally asynchronous.
	 */
	testFunctionComposition: {

		test: [function () {
			var order = [], 
				isComplete = false;

			function wrap() {
				function create() {
					return $A.util.createPromise(function (done) {
						order.push('promise');
						done(1);
					});
				}

				return create().then(function (r) {
					order.push('then0');
					return r;
				});
			}

			wrap().then(function (r) {
				order.push('then1');
				isComplete = true;
			}); 

			$A.test.addWaitFor(true, function () { return isComplete; }, function () {
				$A.test.assertEquals(order[0], 'test');
				$A.test.assertEquals(order[1], 'promise');
				$A.test.assertEquals(order[2], 'then0');
				$A.test.assertEquals(order[3], 'then1'); 
			});

			order.push('test');
		}]
	},

	/**
	 * Tests that synchronous work is deferred and rejected correctly.
	 */
	testImmediateRejection: { 

		test: [function () {
			var result = null, 
				e = null, 
				p = $A.util.createPromise(function (success, error) {
					error('error');
				});

			p.then(function (res) {
				result = res;
			}, function (err) {
				e = err;
			});

			$A.test.addWaitFor('error', function () { return e; });
		}]
	},

	/**
	 * Tests that synchronous work catches errors and rejects correctly.
	 */
	testImmediateError: {

		test: [function () {
			var result = null, 
				e = null, 
				p = $A.util.createPromise(function (success, error) {
					throw 'ERMAHGERD';
				});

			p.then(function (res) {
				result = res;
			}, function (err) {
				e = err;
			});

			$A.test.addWaitFor('ERMAHGERD', function () { return e; });	
		}]
	},

	/**
	 * Tests that chained promises chain their resolved values properly.
	 */ 
	testChainedResolution: {

		test: [function () {
			var result = null,
				p = $A.util.createPromise(function (success, error) {
					success(42);
				});
			
			p.then(function (r) { return r + 2; })
				.then(function (r) { return r / 2; })
				.then(function (r) { result = r; });

			$A.test.addWaitFor(22, function () { return result; });			
		}]
	}, 

	/**
	 * Tests that an error within the promise execution is resolved to the
	 * the chained promsied. 
	 */
	testChainedResolutionRejection: {

		test: [function () {
			var result = null,
				e = null,
				p = $A.util.createPromise(function (success, error) {
					success(42);
				});
			
			p.then(function (r) { throw 'ERMAHGERD'; })
				.then(function (r) { /* should not be called */ }, function (err) { e = err; });

			$A.test.addWaitFor('ERMAHGERD', function () { return e; });			
		}]
	},

	/**
	 * Tests that when resolves multiple promises correctly using Fibonacci series. 
	 */ 
	testWhen: {

		test: [function () {
			var result = null;

			function asyncFib(n) {
				return $A.util.createPromise(function (done) {			
					if (n === 0) return done(0); 
					if (n === 1) return done(1); 
		
					$A.util.when(asyncFib(n - 2), asyncFib(n - 1)).then(function (res) {
						done(res[0] + res[1]);
					});
				});
			}	

			asyncFib(3).then(function (res) { 
				result = res; 
			});

			$A.test.addWaitFor(2, function () { return result; });			
		}]
	}, 

	/**
	 * Tests that the promise returned by when is rejected when one of the 
	 * promises provided is rejected. 
	 */ 
	testWhenError: {

		test: [function () {
			var a = $A.util.createPromise(),
				b = $A.util.createPromise(),
				result = null,
				error = null;

			$A.util.when(a, b).then(function (res) { result = res; }, function (err) { error = err; });

			// Reject the promise - simulates error
			b.reject('foo');	

			// Resolve other promise 
			a.resolve('bar');

			$A.test.assertEquals('foo', error);
			$A.test.assertNull(result);
		}]
	}
})