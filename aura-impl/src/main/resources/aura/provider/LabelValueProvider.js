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
 * @namespace Label Provider. Performs server action to retrieve label values
 * @constructor
 */
var LabelValueProvider = function() {

    var labelValueProvider = {

        /**
         * Wrapper that calls appropriate getter depending on whether component parameter is defined and a component
         *
         * @param expression
         * @param component
         * @return {*}
         */
        get: function(expression, component) {

            var result;

            if(this.isLabelExpression(expression)) {

                if($A.util.isComponent(component)) {
                    result = $A.expressionService.get(component, expression);
                } else {
                    result = $A.get(expression);
                }
            }

            return result;
        },

        /**
         * Wrapper that returns SimpleValue object instead of String
         *
         * @param expression
         * @param component
         * @return {SimpleValue}
         */
        getValue: function(expression, component) {

            var result;

            if(this.isLabelExpression(expression) && $A.util.isComponent(component)) {
                result = $A.expressionService.getValue(component, expression);
            }

            return result;
        },

        /**
         * Checks value is not defined or SimpleValue is not defined
         *
         * @param value
         * @return {boolean}
         */
        isUndefinedSimpleValue: function(value) {
            return (!value || (value.toString() === "SimpleValue" && !value.isDefined()));
        },

        /**
         * Performs LabelController.getLabel action to get specified section and name
         *
         * @param valueProvider
         * @param expression
         * @return {SimpleValue}
         */
        requestServerLabel: function(valueProvider, expression) {

            var action = $A.get("c.aura://LabelController.getLabel"),
                propRef = expression.getStem(),
                name = propRef.path[1],
                section = propRef.path[0];

            action.setParams({
                "name": name,
                "section": section
            });

            var placeholder = $A.getContext().getMode() === "PROD" ? "" : "<" + section + "." + name + ">";

            // create SimpleValue with temporary value of section and name
            var resValue = valueFactory.create(placeholder, null, $A.util.isComponent(valueProvider) ? valueProvider : null);

            action.setCallback(this, function(a) {
                if(a.getState() == "SUCCESS") {
                    resValue.setValue(a.getReturnValue());
                } else {
                    $A.log("Error getting label: " + expression.getValue());
                }
            });

            action.runAfter(action);

            if (!$A.util.isComponent(valueProvider)) {
                // forces immediate lookup if not data-bound to component
                $A.eventService.finishFiring();
            }

            return resValue;

        },

        /**
         * Checks for $Label expression
         *
         * @param expression
         * @return {boolean}
         */
        isLabelExpression: function(expression) {
            if ($A.util.isString(expression)) {
                expression = valueFactory.parsePropertyReference(expression);
            }
            return (expression.getRoot() === "$Label");
        }

    };

    //#include aura.provider.LabelValueProvider_export

    return labelValueProvider;
};