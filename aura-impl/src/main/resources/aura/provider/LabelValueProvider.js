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
 * @description Label Provider. Performs server action to retrieve label values
 * @constructor
 */
$A.ns.LabelValueProvider = function() {
    this.values = {};
    this.queue = {};
};

/**
 * Performs LabelController.getLabel action to get specified section and name.
 * Sets up label queue so that server action for the same label is only requested once
 *
 * @param {String} section - label section
 * @param {String} name - label section
 * @param {Function} [callback] - callback
 * @return {String}
 * @private
 */
$A.ns.LabelValueProvider.prototype.requestServerLabel = function(section, name, callback) {
    var lvp = this,
        queue = this.getQueue(section, name),
        placeholder = $A.getContext().getMode() === "PROD" ? "" : "[" + section + "." + name + "]";

    if ($A.util.isFunction(callback)) {
        queue.addCallback(callback);
    }

    if (!queue.isRequested()) {

        var action = $A.get("c.aura://LabelController.getLabel");

        action.setParams({
            "name": name,
            "section": section
        });

        action.setCallback(this, function(a) {
            var returnValue = placeholder;
            if(a.getState() === "SUCCESS") {
                returnValue = a.getReturnValue();
                if(!this.values[section]){
                    this.values[section]={};
                }
                this.values[section][name] = returnValue;
            } else {
                $A.log("Error getting label: " + section + "." +name);
            }

            var callbacks = queue.getCallbacks();
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i].call(null, returnValue);
            }

            lvp.removeQueue(section, name);
        });

        $A.enqueueAction(action);

        $A.run(function() {}, "LabelValueProvider.requestServerLabel");

        queue.setRequested();
    }

    return placeholder;

};

/**
 * Gets queue for specified label
 *
 * @param {String} section - label section
 * @param {String} name - label name
 * @return {LabelQueue} queue for given label
 */
$A.ns.LabelValueProvider.prototype.getQueue = function(section, name) {
    var exp = this.getQueueKey(section, name);
    if (!this.queue[exp]) {
        this.queue[exp] = new $A.ns.LabelQueue();
    }
    return this.queue[exp];
};

/**
 * Removes label queue
 * @param {String} section - label section
 * @param {String} name - label name
 */
$A.ns.LabelValueProvider.prototype.removeQueue = function(section, name) {
    var exp = this.getQueueKey(section, name);
    delete this.queue[exp];
};

/**
 * Gets label key in queue
 * @param {String} section - label section
 * @param {String} name - label name
 */
$A.ns.LabelValueProvider.prototype.getQueueKey = function(section, name) {
    return section + "." + name;
};

/**
 * returns $Label values
 */
$A.ns.LabelValueProvider.prototype.getValues = function(values) {
    return this.values;
};

/**
 * Merges $Label values
 */
$A.ns.LabelValueProvider.prototype.merge = function(values) {
    $A.util.apply(this.values, values, true, true);
};

/**
 * Loops through existing values to find value. If no value found, send request to server
 *
 * @param {String} expression - expression
 * @param {Component} [component] - component
 * @param {Function} [callback] - callback
 * @return {String}
 */
$A.ns.LabelValueProvider.prototype.get = function(expression, callback) {
    var value;
    var path=expression.split('.');

    if(path.length == 2) {
        var section=path[0];
        var name=path[1];
        value = this.values[section]&&this.values[section][name];
        if(value === undefined) {
            // request from server if no value found in existing gvps
            value = this.requestServerLabel(section, name, callback);
        } else {
            if( $A.util.isFunction(callback) ) {
                callback.call(null, value);
            }

        }
    } else {
        $A.log("$Label requests must have both section and name");
    }

    return value;
};
