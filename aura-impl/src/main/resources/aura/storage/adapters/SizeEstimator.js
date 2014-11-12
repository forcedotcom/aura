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
 * @description Provides operations to estimate size of JSON objects in memory.
 * @constructor
 */
var SizeEstimator = function SizeEstimator(){
};

/*
 * Note on sizing.  The following values are taken from the ECMAScript specification, where available.
 * Other values are guessed.
 *
 * Source: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 */
SizeEstimator.prototype.CHARACTER_SIZE = 2;
SizeEstimator.prototype.NUMBER_SIZE = 8;
// note: this value is not defined by the spec.
SizeEstimator.prototype.BOOLEAN_SIZE = 4;
SizeEstimator.prototype.POINTER_SIZE = 8;

SizeEstimator.prototype.hasOwnProperty = Object.prototype.hasOwnProperty;

SizeEstimator.prototype.estimateSize = function(value) {
    var bytes = 0;
    var type = typeof value;

    if (value === null || value === undefined) {
        bytes = 0;
    } else if (type === 'boolean') {
        bytes = this.BOOLEAN_SIZE;
    } else if (type === 'string') {
        bytes = this.sizeOfString(value);
    } else if (type === 'number') {
        bytes = this.NUMBER_SIZE;
    } else if (type === 'object') {
        // we have an object or an array. optimize for the case of a larger
        // object/array by using native JSON serialization and the resulting
        // string length. however, JSON.stringify doesn't handle objects/arrays
        // with cycles. thankfully these are rare so we give up and say 0.
        try {
            bytes = $A.util.json.encode(value).length;
        } catch (e) {
            $A.log("Error during size estimate, using 0: " + e);
            bytes = 0;
        }
    } else if (type === 'function') {
        // uh-oh. This is likely wrong.
        bytes = this.POINTER_SIZE;
    } else {
        bytes = this.POINTER_SIZE;
    }
    return bytes;
};

SizeEstimator.prototype.sizeOfString = function(value) {
    return value.length * this.CHARACTER_SIZE;
};
