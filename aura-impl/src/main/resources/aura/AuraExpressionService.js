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
 * @namespace The Aura Expression Service, accessible using $A.expressionService.  Processes Expressions.
 * @constructor
 */
var AuraExpressionService = function AuraExpressionService(){
    var expressionService = {
        setValue : function(valueProvider, expression, value){
            if (expression.getValue) {
                expression = expression.getValue();
            }
            var lastDot = expression.lastIndexOf('.');
            aura.assert(lastDot>0, "Invalid expression for setValue");

            var parentExpression = expression.substring(0, lastDot)+"}";
            var lastPart = expression.substring(lastDot+1, expression.length-1);

            var parentValue = this.getValue(valueProvider, parentExpression);
            parentValue.getValue(lastPart).setValue(value);
        },

        /**
         * Get the wrapped value of an expression. Use <code>Component.getValue()</code> if you are retrieving the value of a component.
         * <code>$A.expressionService.get(cmp, "v.attribute")</code> is equivalent to <code>cmp.getValue("v.attribute")</code>.
         * @param {Object} valueProvider The value provider
         * @param {String} expression The expression to be evaluated
         * @public
         * @memberOf AuraExpressionService
         */
        getValue: function(valueProvider, expression){
            if (aura.util.isString(expression)) {
                expression = valueFactory.parsePropertyReference(expression);
            }
            if (expression.toString() === "FunctionCallValue") {
                // TODO: bleh need better test here
                return expression.getValue(valueProvider);
            }
            var propRef = expression;
            var value = valueProvider;
            var isLabel = false;
            while (!aura.util.isUndefinedOrNull(propRef)) {
                var root = propRef.getRoot();
                value = value.getValue(root);
                if (!value) {
                	if (root === "$Label") {
                		isLabel = true;
                	}
                    // check for globals
                    value = $A.getContext().getGlobalValueProvider(root);
                }

                if (!value) {
                    // still nothing, time to die
                    break;
                } 
                else if (isLabel && value.toString()==="SimpleValue" && !value.isDefined() ) {
                	// undefined $Label when section exists
            		break;
            	}
                
                propRef = propRef.getStem();
            }

            if (isLabel && (!value || ( value.toString()==="SimpleValue" && !value.isDefined() ) )) {
            	var action = $A.get("c.aura://LabelController.getLabel");

	            propRef = expression.getStem();
	            var n = propRef.path[1];
	            var s = propRef.path[0];
	            action.setParams({
	                "name": n,
	                "section": s
	            });

	            action.setCallback(this, function(a){
	                if(a.getState() == "SUCCESS") {
	                    $A.log(a.getReturnValue);
	                } else {
	                    $A.log("Missing Value");
	                }
	            });
            
	            action.runAfter(action);
	            $A.eventService.finishFiring();
	            return "<deferred>";
            }
            
            return value;
        },

        /**
         * Get the raw value referenced using property syntax. Use <code>Component.get()</code> if you are retrieving the value of a component.
         * @param {Object} valueProvider The value provider
         * @param {String} expression The expression to be evaluated
         * @public
         * @memberOf AuraExpressionService
         */
        get : function(valueProvider, expression){
            return $A.unwrap(this.getValue(valueProvider, expression));
        },

        /**
         * @private
         */
        create : function(valueProvider, config){
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
    //#include aura.AuraExpressionService_export

    return expressionService;
};
