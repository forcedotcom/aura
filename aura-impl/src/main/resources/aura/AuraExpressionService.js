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
/**
 * @description The Aura Expression Service, accessible using $A.expressionService.  Processes Expressions.
 * @constructor
 */
var AuraExpressionService = function AuraExpressionService() {
	var expressionService = {

		/**
		 * Trims markup syntax off a given string expression, removing leading {!
		 * and trailing } notation.
		 *
		 * @param {Object}
		 *            expression The expression to be normalized.
		 * @returns {Object} The normalized string, or the input parameter, if
		 *          it was not a string.
		 */
		normalize : function(expression) {
			if ($A.util.isString(expression)) {
				expression = expression.
                // Strip expression wrappers: {!x.x.x} -> x.x.x
                    replace(/^\s*\{\!|\}\s*$/g, '').
                // Normalize Array indices: x.x[2] -> x.x.2
                    replace(/\[(\d+)\]/g,".$1");
			}
			return expression;
		},

		/**
		 * Resolves a hierarchical dot expression in string form against the
		 * provided object if possible.
		 *
		 * @param {String}
		 *            expression The string expression to be resolved.
		 * @param {Object}
		 *            container The object against which to resolve the
		 *            expression.
		 * @returns {Object} The target of the expression, or undefined.
		 */
		resolve : function(expression, container) {
			var target = container;
			var path = expression;
            if(!$A.util.isArray(path)) {
                path = path.split('.');
            }
            var segment;
            while (!$A.util.isUndefinedOrNull(target) && path.length) {
            	segment = path.shift();
            	//#if {"modes" : ["TESTINGDEBUG", "AUTOTESTINGDEBUG", "DEVELOPMENT"]}
            	if(!target["hasOwnProperty"](segment)) {
            		var searchkey = segment.toLowerCase();
            		for(var key in target){
            			if(target.hasOwnProperty(key) && key.toLowerCase() == searchkey) {
            				// You can't include container and target in the error, as it will json serialize it and causes a max iteration exception.
    						console.error("Possible Case Sensitivity Issue: Expression '" + expression + "' on segment '" + segment + "'", [container, target]);
    						$A.error("Possible Case Sensitivity Issue: Expression '" + expression + "' on segment '" + segment + "'. Possible you meant '" + key + "'");
            				return;
            			}
            		}					
				}
            	//#end
				
				target = target[segment];
			  
				if ($A.util.isExpression(target)) {
					target = target.evaluate();
				}
			}
			return target;
		},

		/**
		 * @protected
		 */
		create : function(valueProvider, config) {
			return valueFactory.create(config, null, valueProvider);
		},

		/**
		 * @private
		 */
		// TODO: unify with above create method
		createPassthroughValue : function(primaryProviders, cmp) {
			return new PassthroughValue(primaryProviders, cmp);
		}

    };

	// #include aura.AuraExpressionService_export

	return expressionService;
};
