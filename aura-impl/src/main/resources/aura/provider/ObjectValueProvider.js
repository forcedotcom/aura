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
 * @description Simple Value Provider. Holds generic map of Key/Value Pairs
 * @constructor
 */
$A.ns.ObjectValueProvider = function() {
    this.values = {};
};

/**
 * returns $GVP values
 */
$A.ns.ObjectValueProvider.prototype.getValues = function(values) {
    return this.values;
};

/**
 * Merges all values into the existing ones.
 *
 * @param values
 */
$A.ns.ObjectValueProvider.prototype.merge = function(values) {
    $A.util.apply(this.values, values, true, true);
};

/**
 * Gets value and creates new simple value that references specified component.
 *
 * @param {String} expression used to compute the new values.
 * @param {Function} callback called after creating the new values
 * @return {Object} The value referenced by the expression.
 */
$A.ns.ObjectValueProvider.prototype.get = function(expression, callback) {
    var value = $A.expressionService.resolve(expression,this.values);
    if( $A.util.isFunction(callback) ) {
        callback(value);
    }
    return value;
};