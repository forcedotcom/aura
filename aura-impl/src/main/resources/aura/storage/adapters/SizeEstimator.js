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
SizeEstimator.prototype.POINTER_SIZE = 8;

SizeEstimator.prototype.hasOwnProperty = Object.prototype.hasOwnProperty;

SizeEstimator.prototype.estimateSize = function(value, cheater) {
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
        if ($A.util.isArray(value)) {
            //
            // We recurse here, and we use a cheat to avoid too
            // much overhead in detecting cycles. Since we can
            // only cycle using either objects or arrays, objects
            // are the easy case handled below. Arrays then can
            // only create a cycle without an object if it is
            // pure arrays. So we track array->array->...
            //
            if (cheater && $A.util.isArray(cheater)) {
                for (var j = 0; j < cheater.length; j++) {
                    if (value === cheater[j]) {
                        // bomb out, this is simply broken code.
                        return 0;
                    }
                }
            } else {
                cheater = [];
            }
            cheater.push(value);
            for (var i = 0; i < value.length; i++) {
                bytes += this.NUMBER_SIZE; //the index
                bytes += 8; // an assumed existence overhead
                bytes += this.estimateSize(value[i], cheater);
            }
            cheater.pop();
        } else {
            //
            // recursive case Be careful here, we have to mark as we go to
            // prevent cycles from crashing us. However, this actually distorts
            // our measurement by adding more stuff to every object. We could
            // not count it and use 'delete' below, but that is both slower,
            // and sometimes just wrong. So, well, life goes on.
            //
            if (value['__es_mark__'] !== undefined) {
                //
                // There is an exploit here, but I think it doesn't
                // matter so much. We will mis-estimate the size if
                // someone deliberatly puts an __es_mark__ in their
                // object.
                //
                return this.POINTER_SIZE;
            }
            // This adds 34 to the object size.
            value['__es_mark__'] = true;
            for (var j in value) {
                if (SizeEstimator.prototype.hasOwnProperty.call(value, j)) {
                    bytes += this.sizeOfString(j);
                    bytes += 8; // an assumed existence overhead
                    bytes += this.estimateSize(value[j]);
                }
            }
            //
            // there is a slim chance that we could have an exception
            // in there somewhere, but I think it doesn't matter, at
            // that point we are hosed anyway, and really, it should
            // never happen.
            //
            value['__es_mark__'] = undefined;
            // take off the boolean, but count the object overhead of 30...
            bytes -= 4;
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
