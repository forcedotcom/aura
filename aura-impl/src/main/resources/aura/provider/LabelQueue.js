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
 * @namespace Label Queue. Holds the components and callbacks for a particular $Label.
 * Queues request for the same $Label to make server calls efficient
 *
 * @constructor
 */
$A.ns.LabelQueue = function() {
    this.reset();
};

/**
 * Getter SimpleValues
 * @return {Array}
 */
$A.ns.LabelQueue.prototype.getReturnValues = function() {
    return this.returnValues;
};

/**
 * Add SimpleValue to return values
 * @param {SimpleValue} value
 */
$A.ns.LabelQueue.prototype.addReturnValue = function(value) {
    this.returnValues.push(value);
};

/**
 * Getter callbacks
 * @return {Array}
 */
$A.ns.LabelQueue.prototype.getCallbacks = function() {
    return this.callbacks;
};

/**
 * Add callback
 * @param {Function} callback
 */
$A.ns.LabelQueue.prototype.addCallback = function(callback) {
    this.callbacks.push(callback);
};

/**
 * Set requested flag
 */
$A.ns.LabelQueue.prototype.setRequested = function() {
    this.requested = true;
};

/**
 * Checks whether requested
 * @return {Boolean}
 */
$A.ns.LabelQueue.prototype.isRequested = function() {
    return this.requested;
};

/**
 * Resets / Initializes queue variables
 */
$A.ns.LabelQueue.prototype.reset = function() {
    this.callbacks = [];
    this.returnValues = [];
    this.requested = false;
};