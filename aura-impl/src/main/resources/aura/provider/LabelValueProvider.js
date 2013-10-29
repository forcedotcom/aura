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
 * @namespace Label Provider. Performs server action to retrieve label values
 * @constructor
 */
$A.ns.LabelValueProvider = function() {
    this.values = undefined;
    this.queue = {};
};


/**
 * Performs LabelController.getLabel action to get specified section and name.
 * Sets up label queue so that server action for the same label is only
 * requested once.  And results are cached when AuraContext is joined, so the
 * queue only merges simultaneously-outstanding requests; future ones hit the
 * cached entry.
 *
 * @param section
 * @param name
 * @param [dest] value to hold result
 * @param [callback]
 * @private
 */
$A.ns.LabelValueProvider.prototype.requestServerLabel = function(section, name, dest, callback) {

    var lvp = this,
        queue = this.getQueue(section, name);

    if (dest) {
        queue.addReturnValue(dest);
    }
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

            var i = 0;

            if(a.getState() === "SUCCESS") {
                var returnValues = queue.getReturnValues();
                for (i = 0; i < returnValues.length; i++) {
                    returnValues[i].setValue(a.getReturnValue());
                }
            } else {
                $A.log("Error getting label: " + section + "." +name);
            }

            var callbacks = queue.getCallbacks();

            for (i = 0; i < callbacks.length; i++) {
                callbacks[i].call(null, a.getReturnValue());
            }

            lvp.removeQueue(section, name);
        });

        $A.enqueueAction(action);

        if (!dest || !dest.owner) {
            // forces immediate lookup if not data-bound to component
            $A.run(function() {}, "LabelValueProvider.requestServerLabel");
        }

        queue.setRequested();
    }
};

/**
 * Gets queue for specified label
 *
 * @param section
 * @param name
 * @return {LabelQueue}
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
 * @param section
 * @param name
 */
$A.ns.LabelValueProvider.prototype.removeQueue = function(section, name) {
    var exp = this.getQueueKey(section, name);
    delete this.queue[exp];
};

/**
 * Gets label key in queue
 * @param section
 * @param name
 */
$A.ns.LabelValueProvider.prototype.getQueueKey = function(section, name) {
    return section + "." + name;
};

/**
 * Setter $Label values
 * @param values
 */
$A.ns.LabelValueProvider.prototype.setValues = function(values) {
    this.values = values;
};

/**
 * Getter $Label values
 * @return {Object} Label values
 */
$A.ns.LabelValueProvider.prototype.getValues = function() {
    return this.values;
};

/**
 * Loops through existing values to find value. If no value found, send request to server
 *
 * @deprecated prefer setValue
 * @param expression
 * @param [component] component to mark dirty when value is retrieved
 * @param [callback] callback after value is retrieved
 * @return a new {SimpleValue}, which will get the actual value some time later.  It
 *     initially has a placeholder string only.
 */
$A.ns.LabelValueProvider.prototype.getValue = function(expression, component, callback) {
    if(!expression.path || expression.path.length != 3) {
        $A.log("$Label requests must have both section and name");
        return;
    }
    var stem = expression.getStem(),
        section = stem.path[0],
        name = stem.path[1];
    var placeholder = $A.getContext().getMode() === "PROD" ? "" : "[pending " + section + "." + name + "]";
    var value = valueFactory.create(placeholder, null, component ? component : null);
    this.setValue(expression, value,  callback);
    return value;
};

/**
 * Loops through existing values to find value. If no value found, send request to server
 *
 * @param expression
 * @param [dest] The desired destination value to assign.  May be undefined or null to not
 *     assign at all.
 * @param [callback] A callback to call after assigning dest.
 */
$A.ns.LabelValueProvider.prototype.setValue = function(expression, dest, callback) {

    if(!expression.path || expression.path.length != 3) {
        $A.log("$Label requests must have both section and name");
        return;
    }

    var value;
    var stem = expression.getStem(),
    section = stem.path[0],
    name = stem.path[1];

    if (this.values) {
        // Check for an existing cached value
        value = this.values;
        var propRef = expression.getStem();
        while (!$A.util.isUndefinedOrNull(propRef)) {
            var root = propRef.getRoot();
            value = value.getValue(root);
            if (!value || value instanceof SimpleValue && !value.isDefined()) {
                // the value should be a Value Object. If not, we'll end with value
                // as undefined, and we're done.  Values are entered for cache when
                // the Aura context is joined.
                value = undefined;
                break;
            }
            propRef = propRef.getStem();
        }
    }

    if (!value) {
        // request from server if no value found in existing gvps
        this.requestServerLabel(section, name, dest, callback);
    } else {
        if ($A.util.isValue(dest)) {
            dest.setValue(value);
        }
        if( $A.util.isFunction(callback) ) {
            callback.call(null, value);
        }
    }
};