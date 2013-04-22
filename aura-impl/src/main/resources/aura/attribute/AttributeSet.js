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
 * @namespace Creates an AttributeSet instance.
 * @param {Object} config Sets the values with the config object, if provided.
 * @param {Object} valueProvider Sets the value provider for the attributes.
 * @param {AttributeDefSet} attributeDefSet The metadata describing the attributes in the set.
 * @constructor
 * @protected
 */
function AttributeSet(config, valueProvider, attributeDefSet, component, localCreation) {
    this.valueProvider = valueProvider;
    this.values = config || {};
    this.attributeDefSet = attributeDefSet;
    this.component = component;
    this.localCreation = localCreation;

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    this["values"] = this.values;
    //#end
}

AttributeSet.prototype.auraType = "AttributeSet";

/**
 * Returns the value of the attribute with the given name.
 * @param {String} name The name of the attribute.
 * @param {Boolean} raw If raw is set to false, evaluate expressions in the form {!xxx}.
 * @returns {Object} Value of the attribute with the given name.
 */
AttributeSet.prototype.getValue = function(name, raw) {
    this.createDefault(name);

    var ve = this.values.getValue(name);
    var value;
    if (!raw && ve && ve.isExpression()) {
        value = expressionService.getValue(this.getValueProvider(), ve);
    } else {
        value = ve;
    }

    return value;
};

/**
 * Returns the raw value referenced using property syntax.
 * @param {String} key The data key to look up on the Attribute.
 */
AttributeSet.prototype.get = function(key) {
    return $A.expressionService.get(this, key);
};

/**
 * Returns the raw value based on the given name.
 * @param {String} name The name of the attribute.
 */
AttributeSet.prototype.getRawValue = function(name) {
    var ret = this.getValue(name);
    if (ret && ret.getValue && !ret.getRawValue) {
        ret = ret.getValue();
    }

    return ret;
};

/**
 * Set the attribute of the given name to the given value.
 * @param {String} name The name can be a path expression inside. E.g. {!xxx....}
 * @param {Object} value The value to be set.
 */
AttributeSet.prototype.setValue = function(name, value) {
    this.createDefault(name);

    var ve = this.values.getValue(name);
    if (ve.isExpression()) {
        expressionService.setValue(this.getValueProvider(), ve, value);
    } else {
        ve.setValue(value);
    }
};

/**
 * Destroys the component.
 * @private
 */
AttributeSet.prototype.destroy = function(async) {
    this.values.destroy(async);

    delete this.values;
    delete this.valueProvider;
    delete this.attributeDefSet;
    delete this.component;
    delete this.localCreation;
};

/**
 * Returns the value provider.
 */
AttributeSet.prototype.getValueProvider = function() {
    return this.valueProvider;
};

/**
 * Returns the value provider of the component.
 */
AttributeSet.prototype.getComponentValueProvider = function() {
    var valueProvider = this.valueProvider;
    if (!valueProvider) {
        return undefined;
    }

    return valueProvider.auraType !== Component.prototype.auraType && $A.util.isFunction(valueProvider.getComponent) ?
        valueProvider.getComponent() : valueProvider;
};

/**
 * Merge data from two given objects.
 * @param {Object} yourMap The source map.
 * @param {Object} overwrite The map which overwrites the source map with its values
 * and insert new ones if they don't already exist in the source map.
 */
AttributeSet.prototype.merge = function(yourMap, overwrite) {
    this.values.merge(yourMap, overwrite);
};

AttributeSet.prototype.createDefault = function(name) {
    if (!$A.util.isUndefinedOrNull(name) && !this.values.contains(name)) {
        // Dynamically create the attribute now that something has asked for it
        var attributeDef = this.attributeDefSet.getDef(name.toLowerCase());

        // DCHASMAN TODO Enable this when we have the time to fix the myriad of places that still reference non-existent attributes
        // $A.assert(attributeDef, "Unknown attribute " + this.component + "." + name);

        if (attributeDef) {
            var defaultValue = attributeDef.getDefault();

            var value = this.attributeDefSet.createAttribute(defaultValue, attributeDef, this.component, this.valueProvider, this.localCreation);

            this.values.put(name, value);
        }
    }
};

//#include aura.attribute.AttributeSet_export
