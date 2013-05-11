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
 * @namespace Label Queue. Holds the components and callbacks for a particular $Label
 * @constructor
 */
function LabelQueue() {
    this.reset();
}

LabelQueue.prototype.getComponents = function() {
    return this.components;
};

LabelQueue.prototype.addComponent = function(component) {
    this.components.push(component);
};

LabelQueue.prototype.getReturnValues = function() {
    return this.returnValues;
};

LabelQueue.prototype.addReturnValue = function(value) {
    this.returnValues.push(value);
};

LabelQueue.prototype.getCallbacks = function() {
    return this.callbacks;
};

LabelQueue.prototype.addCallback = function(callback) {
    this.components.push(callback);
};

LabelQueue.prototype.setRequested = function() {
    this.requested = true;
};

LabelQueue.prototype.isRequested = function() {
    return this.requested;
};

LabelQueue.prototype.reset = function() {
    this.components = [];
    this.callbacks = [];
    this.returnValues = [];
    this.requested = false;
};