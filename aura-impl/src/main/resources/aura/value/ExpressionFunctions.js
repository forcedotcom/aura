/*
 * Copyright (C) 2012 salesforce.com, inc.
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
/*
 * client implementations of all the expression functions
 */
var expressionFunctions = {
    eq: function equals(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        if (aura.util.isUndefinedOrNull(a)) {
            return aura.util.isUndefinedOrNull(b);
        }
        return a === b;
    },

    ne: function notequals(args) {
        return !expressionFunctions.eq(args);
    },

    "if": function ternary(args) {
    	var a = args[0];
    	a = a?a.unwrap():a;
        return a ? args[1] : args[2];
    },

    // add also is string concatenate
    add: function add(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        if (aura.util.isUndefinedOrNull(a)) {
            if (aura.util.isString(b)) {
                return b;
            } else if (aura.util.isUndefinedOrNull(b)) {
                return "";
            }
        } else if (aura.util.isUndefinedOrNull(b) && aura.util.isString(a)) {
            return a;
        }
        return a + b;
    },

    sub: function subtract(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a - b;
    },

    mult: function multiply(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a * b;
    },

    div: function divide(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a / b;
    },

    mod: function modulus(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a % b;
    },

    neg: function negate(args) {
    	var a = args[0];
    	a = a?a.unwrap():a;
        return -a;
    },

    abs: function absolutevalue(args) {
    	var a = args[0];
    	a = a?a.unwrap():a;
        return Math.abs(a);
    },

    gt: function greaterthan(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a > b;
    },

    lt: function lessthan(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a < b;
    },

    ge: function greaterthanorequalto(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a >= b;
    },

    le: function lessthanorequalto(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a <= b;
    },

    and: function and(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
        return a && b;
    },

    or: function or(args) {
    	var a = args[0];
    	var b = args[1];
    	a = a?a.unwrap():a;
    	b = b?b.unwrap():b;
    	return a || b;
    },

    not: function not(args) {                             
    	var a = args[0];
        a = a ? a.unwrap() : a;
        return a !== true;
    }
};

//#include aura.value.ExpressionFunctions_export
