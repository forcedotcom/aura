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
function LabelValueProvider() {
    this.values = null;
    this.queue = {};
}

/**
 * Checks value is not defined or SimpleValue is not defined
 *
 * @param value
 * @return {boolean}
 * @private
 */
LabelValueProvider.prototype.isUndefinedSimpleValue = function(value) {
    return (!value || (value.toString() === "SimpleValue" && !value.isDefined()));
};

/**
 * Performs LabelController.getLabel action to get specified section and name.
 * Sets up label queue so that server action for the same label is only requested once
 *
 * @param expression
 * @param [component] component owner
 * @param [callback]
 * @return {SimpleValue}
 * @private
 */
LabelValueProvider.prototype.requestServerLabel = function(expression, component, callback) {

    var lvp = this,
        queue = this.getQueue(expression),
        propRef = expression.getStem(),
        name = propRef.path[1],
        section = propRef.path[0],
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
                $A.log("Error getting label: " + expression.getValue());
            }

            var callbacks = queue.getCallbacks();

            for (i = 0; i < callbacks.length; i++) {
                callbacks[i].call(null, resValue);
            }

            lvp.removeQueue(expression);
        });

        action.runAfter(action);

        if (!isComponent) {
            // forces immediate lookup if not data-bound to component
            $A.eventService.finishFiring();
        }

        queue.setRequested();
    }

    return resValue;

};

/**
 * Gets queue for specified label
 *
 * @param expression
 * @return {LabelQueue}
 */
LabelValueProvider.prototype.getQueue = function(expression) {
    var exp = expression.getValue();
    if (!this.queue[exp]) {
        this.queue[exp] = new LabelQueue();
    }
    return this.queue[exp];
};

/**
 * Removes label queue
 * @param expression
 */
LabelValueProvider.prototype.removeQueue = function(expression) {
    var exp = expression.getValue();
    delete this.queue[exp];
};

/**
 * Setter $Label values
 * @param values
 */
LabelValueProvider.prototype.setValues = function(values) {
    this.values = values;
};

/**
 * Getter $Label values
 * @return {Object} Label values
 */
LabelValueProvider.prototype.getValues = function() {
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
LabelValueProvider.prototype.getValue = function(expression, component, callback) {

    var value;

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
        value = this.requestServerLabel(expression, component, callback);
    } else {

        if ($A.util.isValue(value) && $A.util.isComponent(component)) {
            // create new value object with reference to owner component
            value = valueFactory.create(value.unwrap(), null, component);
        }

        if( $A.util.isFunction(callback) ) {
            callback.call(null, value);
        }

    }

    return value;
};
