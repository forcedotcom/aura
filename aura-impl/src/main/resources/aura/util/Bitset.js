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
/*jslint bitwise: false*/
/**
 * @namespace
 * @constructor
 */
function Bitset(str) {
    if (typeof (str) != "string") {
        str = "";
    }
    Bitset.init();
    this.data = str.split('');
    this.trim();
}

// members
Bitset.prototype.testBit = function(n) {
    var i = Math.floor(n / 6);
    if (i >= this.data.length) {
        return false;
    } else {
        return ((Bitset.codes[this.data[i]] & (0x20 >> (n % 6))) !== 0);
    }
};
Bitset.prototype.setBit = function(n) {
    var i = Math.floor(n / 6);
    this.pad(i);
    this.data[i] = Bitset.alphabet[Bitset.codes[this.data[i]]
            | (0x20 >> (n % 6))];
};
Bitset.prototype.clearBit = function(n) {
    var i = Math.floor(n / 6);
    if (i < this.data.length) {
        this.data[i] = Bitset.alphabet[Bitset.codes[this.data[i]]
                & (0xff ^ (0x20 >> (n % 6)))];
        this.trim();
    }
};
Bitset.prototype.toString = function() {
    return this.data.join('');
};
// remove trailing 0's
Bitset.prototype.trim = function() {
    for ( var i = this.data.length - 1; i >= 0; i--) {
        if (this.data[i] != Bitset.alphabet[0]) {
            break;
        }
    }
    this.data.splice(i + 1, this.data.length);
};
// pad with leading 0's if necessary
Bitset.prototype.pad = function(n) {
    var size = this.data.length;
    for ( var i = 0; i <= n - size; i++) {
        this.data.push(Bitset.alphabet[0]);
    }
};
Bitset.prototype.length = function() {
    return this.data.length;
};
// statics

Bitset.initialized = false;

Bitset.init = function() {
    if (!Bitset.initialized) {
        Bitset.initialized = true;
        Bitset.alphabet = [
           'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
           'Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f',
           'g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v',
           'w','x','y','z','0','1','2','3','4','5','6','7','8','9','+','/'
        ];

        Bitset.codes = [];
        for ( var i = 0; i < Bitset.alphabet.length; i++) {
            Bitset.codes[Bitset.alphabet[i]] = i;
        }
    }
};

//#include aura.util.Bitset_export
