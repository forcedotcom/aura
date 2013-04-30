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
 * @namespace Simple Value Provider. Holds MapValue of stuff
 * @constructor
 */
function SimpleValueProvider() {
    this.values = null;
}

/**
 * Setter values
 * @param values
 */
SimpleValueProvider.prototype.setValues = function(values) {
    this.values = values;
};

/**
 * Getter values
 */
SimpleValueProvider.prototype.getValues = function() {
    return this.values;
};

/**
 * Gets value and creates new simple value that references specified component
 *
 * @param expression
 * @param [component]
 * @param [callback]
 * @return {SimpleValue}
 */
SimpleValueProvider.prototype.getValue = function(expression, component, callback) {
    var value;

    if( this.values ) {
        value = this.values;
        var propRef = expression.getStem();
        while (!$A.util.isUndefinedOrNull(propRef)) {
            var root = propRef.getRoot();
            value = value.getValue(root);
            if(!value) {
                // the value should be a Value Object. if not, set as undefined and done.
                value = undefined;
                break;
            }
            propRef = propRef.getStem();
        }
    }

    if ($A.util.isValue(value) && $A.util.isComponent(component)) {
        var newValue = value.unwrap();

        // create new simple value that references owner component
        value = valueFactory.create(newValue, null, component);
    }

    if( $A.util.isFunction(callback) ) {
        callback.call(null, value);
    }

    return value;
};