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
 * @namespace Provides operations to estimate size of JSON objects in memory.
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

SizeEstimator.prototype.estimateSize = function(value) {
    var bytes = 0;

    if ($A.util.isBoolean(value)) {
        bytes = this.BOOLEAN_SIZE;
    } else if ($A.util.isString(value)) {
        bytes = this.sizeOfString(value);
    } else if ($A.util.isNumber(value)) {
        bytes = this.NUMBER_SIZE;
    } else if ($A.util.isArray(value) || $A.util.isObject(value)) {
        // recursive case
        for (var i in value) {
            bytes += this.sizeOfString(i);
            bytes += 8; // an assumed existence overhead
            bytes += this.estimateSize(value[i]);
        }
    }

    return bytes;
};

SizeEstimator.prototype.sizeOfString = function(value) {
    return value.length * this.CHARACTER_SIZE;
};

//#include aura.storage.adapters.SizeEstimator_export