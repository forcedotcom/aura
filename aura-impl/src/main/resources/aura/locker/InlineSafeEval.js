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

var getLockerSecret, setLockerSecret;

// DCHASMAN TODO Revert this after we clear issues with CKEditor and unsafe inline from W-3028925
function lazyInitInlinedSafeEvalWorkaround() {
	if (!window['$$safe-eval$$']) {
	  (function (window, placeholder, parent) {
	      'use strict';

	      // TODO: improve returnable detection. `function (...` is a trick used today
	      //       to return arbitrary code from actions, it should be legacy in the future.
	      var returnableEx = /^(\s*)([{(\["']|function\s*\()/;
	      // TODO: improve first comment removal
	      var trimFirstMultilineCommentEx = /^\/\*([\s\S]*?)\*\//;
	      var trimFirstLineCommentEx = /^\/\/.*\n?/;
	      var hookFn = '$globalEvalIIFE$';

	      // wrapping the source with `with` statements create a new lexical scope,
	      // that can prevent access to the globals in the worker by shodowing them
	      // with the members of new scopes passed as arguments into the `hookFn` call.
	      // additionally, when specified, strict mode will be enforced to avoid leaking
	      // global variables into the worker.
	      function addLexicalScopesToSource(src, options) {
	          // removing first line CSFR protection and other comments to facilitate
	          // the detection of returnable code
	          src = src.replace(trimFirstMultilineCommentEx, '');
	          src = src.replace(trimFirstLineCommentEx, '');
	          // only add return statement if source it starts with [, {, or (
	          var match = src.match(returnableEx);
	          if (match) {
	        	  src = src.replace(match[1], 'return ');
	          }
	          
	          if (options.useStrict) {
		          // forcing strict mode
		          src = '"use strict";\n' + src;
		      }
		        	
		  	  src = 'return (function(window){\n' + src + '\n}).call(arguments[0], arguments[0])';
		  	  
	          for (var i = 0; i < options.levels; i++) {
	              src = 'with(arguments[' + i + ']||{}){' + src + '}';
	          }
	          var code = 'function ' + hookFn + '(){' + src + '}';
	          if (options.sourceURL) {
	              code += '\n//# sourceURL=' + options.sourceURL;
	          }
	          return code;
	      }

	      function evalAndReturn(src) {
	          var script = document.createElement('script');
	          script.type = 'text/javascript';
	          window[hookFn] = undefined;
	          script.appendChild(document.createTextNode(src));
	          placeholder.appendChild(script);
	          placeholder.removeChild(script);
	          var result = window[hookFn];
	          window[hookFn] = undefined;
	          return result;
	      }

	      // adding non-configurable hooks into parent window.
	      Object.defineProperties(parent, {
	          '$$safe-eval$$': {
	              value: function(src, optionalSourceURL) {
	                  if (!src) {
	                	  return undefined;
	                  }
	                  var args = Array.prototype.slice.call(arguments, 1);
	                  optionalSourceURL = typeof optionalSourceURL === "string" ? args.shift() : undefined;
	                  var fn = evalAndReturn(addLexicalScopesToSource(src, {
	                      levels: args.length,
	                      useStrict: true,
	                      sourceURL: optionalSourceURL
	                  }));
	                  return fn.apply(undefined, args);
	              }
	          }
	      });

	      // locking down the environment
	      try {
	          // @W-2961201: fixing properties of Object to comply with strict mode
	          // and ES2016 semantics, we do this by redefining them while in 'use strict'
	          // https://tc39.github.io/ecma262/#sec-object.prototype.__defineGetter__
	          [Object, parent.Object].forEach(function (o) {
	        	  if (o === undefined) {
	        		  return;
	        	  }

	              o.defineProperty(o.prototype, '__defineGetter__', {
	                  value: function (key, fn) {
	                      return o.defineProperty(this, key, {
	                          get: fn
	                      });
	                  }
	              });
	              o.defineProperty(o.prototype, '__defineSetter__', {
	                  value: function (key, fn) {
	                      return o.defineProperty(this, key, {
	                          set: fn
	                      });
	                  }
	              });
	              o.defineProperty(o.prototype, '__lookupGetter__', {
	                  value: function (key) {
	                      var d, p = this;
	                      while (p && (d = o.getOwnPropertyDescriptor(p, key)) === undefined) {
	                          p = o.getPrototypeOf(this);
	                      }
	                      return d ? d.get : undefined;
	                  }
	              });
	              o.defineProperty(o.prototype, '__lookupSetter__', {
	                  value: function (key) {
	                      var d, p = this;
	                      while (p && (d = o.getOwnPropertyDescriptor(p, key)) === undefined) {
	                          p = o.getPrototypeOf(this);
	                      }
	                      return d ? d.set : undefined;
	                  }
	              });
	              // Immutable Prototype Exotic Objects
	              // https://github.com/tc39/ecma262/issues/272
	              o.seal(o.prototype);
	          });
	      } catch (ignore) {
	    	  // Ignored
	      }
	  })(window, document.body, window);
	}
}