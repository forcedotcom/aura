/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint sub: true */

/**
 * @constructor
 * @param {function (function (Object), function (Object))} 
 *		A function which is used to wrap the the promised work. The function should accept a success
 * 		and error handle which the work function can invoke to either resolve or reject the promise. 
 */
$A.ns.Promise = function (fn) {
	var self = this;

	self.resolveHandler = null;
	self.rejectHandler = null;
	self.thenPromise = null;
	self.isResolved = false;
	self.isRejected = false;

	if (fn) {
		$A.ns.Promise.exec(fn, 
			[function (res) { self.resolve(res); }, function (err) { self.reject(err); }], 
			function (err, result) {
				if (err) {
					self.reject(err);
				}
			});
	}
};

/**
 * Resolves the promise with an optional result value. Executes the sucess hanlder which
 * may or may not have been registered by the consumer of the promise. 
 * 
 * Once the the promise enters the resolved state, it is may not be resolved or rejected again.
 *
 * @param {Object=} result The resulting value from the work executed (optional). 
 */
$A.ns.Promise.prototype.resolve = function (result) {

	// Do nothing if the promise has already been resolved or rejected.
	if (!this.isResolved && !this.isRejected) {

        this.isResolved = true;
        this.result = result;

        if (typeof this.resolveHandler === 'function') {
			this.resolveHandler(result);
		}	
	}
	else {
		$A.log('Promise has already been rejected.');
	}
};

/**
 * Rejects the promise with the error value. Ideally, the error value is the causing Error object or some helpful
 * message to indicate what went wrong in while resolving the promised work. Every error which occurs in a promise 
 * execution context is caught sent to this function if available. If a reject handler is not present on the current
 * promise, then the rejection will chain to the next promise. If no error handler is registered at all, then errors
 * will be swallowed entirely.
 * 
 * Once the the promise enters the rejected state, it is may not be resolved or rejected again.
 *
 * @param {{Object, Error}} err Ideally the Error object which was thrown in the execution context of the promised work.
 */
$A.ns.Promise.prototype.reject = function (err) {

	// Do nothing if the promise has already been resolved or rejected.
	if (!this.isResolved && !this.isRejected) {

		this.isRejected = true;
        this.error = err;

		if (typeof this.rejectHandler === 'function') { 
			this.rejectHandler(err);
		}
		else if (this.thenPromise) {
			this.thenPromise.reject(err);
		}	
		else {
			$A.error('Unhandled error occurred while processing promised work.', err);
		}
	}
	else {
		$A.log('Promise has already been rejected.');
	}
};

/**
 * Success and error handler entry point for the promise. 
 *
 * @param {function (Object=)} successFunction Resolve handler - function which will be executed in a resolved/successs state.
 * @param {function (Object=)} error Error handler - function which will be executed in a rejected/error state.
 * @return {Promise} A chainable promise to use if the previous then handler wishes to process some data.
 */ 
$A.ns.Promise.prototype.then = function (successFunction, errorFunction) {
    if(this.isResolved) {
        successFunction(this.result);
        return;
    }

    if(this.isRejected) {
        errorFunction(this.error);
        return;
    }

	var thenPromise = this.thenPromise = new $A.ns.Promise();

	// When this promise is done. 
	// Asynchronously execute the next promise.
	this.resolveHandler = function (previousResult) {
		if (typeof successFunction === 'function') {
			$A.ns.Promise.exec(successFunction, [previousResult], function (err, result) {
				if (err) {
					thenPromise.reject(err);
				} else {
                    if ($A.ns.Promise.isThenable(result)) {
                        result["then"](
                            function(val) { return thenPromise.resolve(val); },
                            function(err) { return thenPromise.reject(err); });
                    } else {
                        thenPromise.resolve(result);
                    }
				}
			});
		}
	};

	this.rejectHandler = errorFunction;

	return thenPromise; 
};

/**
 * An object is a 'thenable' if it contains a property named "then" that is a function.
 * (A Promise is-a thenable)
 *
 * @param object
 * @returns {*|boolean}
 */
$A.ns.Promise.isThenable = function(object) {
    // Using [] instead of . operator to get around aura's obfuscation of non-exported functions
    return object && typeof object["then"] === 'function';
};

/**
 * @description Force this to be asynchronous.
 * 
 * This is important because if the consumer of this promise is
 * not performing I/O, then the function will return immediately which 
 * does not allow for the handlers to be properly registered.
 * 
 * DO NOT USE THIS EXTERNALLY FROM THE PROMISE OBJECT.
 * @private 
 */ 
$A.ns.Promise.exec = function (fn, args, cb) {
	var self = this;

	setTimeout(function () {		
		var res;

		try {
			res = fn.apply(self, args);
			cb(null, res);
		}
		catch (e) {
			cb(e);
		}					
	}, 0);	
};

/**
 * Factory which accepts a variable number of Promise objects and 
 * creates an asynch wall for those promises to finish their work.
 * This function is static - do not add it to the Promise prototype.
 *
 * @param {...Promise} A variable number of Promise objects.
 * @returns {Promise} A promise which is resolved after all given promises are resolved.
 */
$A.ns.Promise.when = function () {
	var arg,
		args = arguments,
		argc = arguments.length,
		rets = [],
		resolved = 0,
        promise = new $A.ns.Promise();

	function register(i, p) {
		p.then(function (value) {
			rets[i] = value;

			if (++resolved === argc) {
				promise.resolve(rets);
			}
		}, 
		function (err) {
			promise.reject(err);
		});
	}
	
    for (var i = 0; i < args.length; i++) {
		arg = args[i];

        // Duck type to allow any 'thenable' to be handled.
		if (arg && typeof arg.then === 'function') {
			register(i, arg);
        }
        else {
            throw 'A non thenable was provided to when';
        }
	}
	
	return promise;
};

//#include aura.Promise_export
