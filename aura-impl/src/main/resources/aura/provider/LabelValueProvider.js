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
    this.values = null;
    this.queue = {};
};

/**
 * Checks value is not defined or SimpleValue is not defined
 *
 * @param value
 * @return {boolean}
 * @private
 */
$A.ns.LabelValueProvider.prototype.isUndefinedSimpleValue = function(value) {
    return (!value || (value.toString() === "SimpleValue" && !value.isDefined()));
};

/**
 * Performs LabelController.getLabel action to get specified section and name.
 * Sets up label queue so that server action for the same label is only requested once
 *
 * @param section
 * @param name
 * @param [component] component owner
 * @param [callback]
 * @return {SimpleValue}
 * @private
 */
$A.ns.LabelValueProvider.prototype.requestServerLabel = function(section, name, component, callback) {

    var lvp = this,
        queue = this.getQueue(section, name),
        isComponent = $A.util.isComponent(component),
        placeholder = $A.getContext().getMode() === "PROD" ? "" : "[" + section + "." + name + "]",
        resValue = valueFactory.create(placeholder, null, isComponent ? component : null);

    if (isComponent) {
        queue.addComponent(component);
    }

    if ($A.util.isFunction(callback)) {
        queue.addCallback(callback);
    }

    queue.addReturnValue(resValue);

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
                callbacks[i].call(null, resValue);
            }

            lvp.removeQueue(section, name);
        });

        $A.enqueueAction(action);

        if (!isComponent) {
            // forces immediate lookup if not data-bound to component
        	$A.run(function() {}, "LabelValueProvider.requestServerLabel");
        }

        queue.setRequested();
    }

    return resValue;

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
 * @param expression
 * @param [component]
 * @param [callback]
 * @return {SimpleValue}
 */
$A.ns.LabelValueProvider.prototype.getValue = function(expression, component, callback) {

    var value;

    if(expression.path && expression.path.length == 3) {

        var stem = expression.getStem(),
            section = stem.path[0],
            name = stem.path[1];

        if( this.values ) {
            value = this.values;
            var propRef = expression.getStem();
            while (!$A.util.isUndefinedOrNull(propRef)) {
                var root = propRef.getRoot();
                value = value.getValue(root);
                if(!value) {
                    // the value should be a Value Object. if not, set as undefined and done.
                    value = undefined;
                    break;
                }
                propRef = propRef.getStem();
            }
        }

        if(this.isUndefinedSimpleValue(value)) {
            // request from server if no value found in existing gvps
            value = this.requestServerLabel(section, name, component, callback);
        } else {

            if ($A.util.isValue(value) && $A.util.isComponent(component)) {
                // create new value object with reference to owner component
                value = valueFactory.create(value.unwrap(), null, component);
            }

            if( $A.util.isFunction(callback) ) {
                callback.call(null, value);
            }

        }
    } else {
        $A.log("$Label requests must have both section and name");
    }

    return value;
};
