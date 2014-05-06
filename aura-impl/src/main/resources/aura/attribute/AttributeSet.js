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
    this.values = new MapValue({});
    this.attributeDefSet = attributeDefSet;
    this.component = component;
    this.localCreation = localCreation;

    this.createInstances(config);

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    this["values"] = this.values;
    //#end
}

AttributeSet.prototype.auraType = "AttributeSet";


/**
 * DO NOT USE THIS METHOD.
 *
 * @public
 *
 * @deprecated use Component.get(name) instead
 */
AttributeSet.prototype.getValue = function (name, raw) {
    //$A.warning("DEPRECATED USE OF attributes.getValue(name). USE component.get(\"v.name\") INSTEAD.");
    return this._getValue(name,raw);
};

/**
 * Whether attribute exists
 *
 * @param {String} name - name of attribute
 * @returns {boolean} true if attribute exists
 * @private
 */
AttributeSet.prototype.hasAttribute = function(name) {
    return this.values.contains(name);
};

/**
 * Returns the value of the attribute with the given name.
 * @param {String} name The name of the attribute.
 * @param {Boolean} [raw] If raw is set to false, evaluate expressions in the form {!xxx}.
 * @returns {Object} Value of the attribute with the given name.
 *
 * TEMPORARILY INTERNALIZED TO GATE ACCESS
 *
 * @private
 *
 */
AttributeSet.prototype._getValue = function(name, raw) {
    var ve = this.values.getValue(name, true);

    if (!ve) {
    	this.createDefault(name);
        ve = this.values.getValue(name);
    }
    
    var value;
    if (!raw && ve && ve.isExpression && ve.isExpression()) {
        value = expressionService.getValue(this.getValueProvider(), ve);
    } else {
        value = ve;
    }

    return value;
};

/**
 * DO NOT USE THIS METHOD.
 *
 * @public
 *
 * @deprecated use Component.get(name) instead
 */
AttributeSet.prototype.get = function(key) {
    return $A.expressionService.get(this, key);
};

/**
 * Returns the raw value referenced using property syntax.
 * @param {String} key The data key to look up on the Attribute.
 *
 * TEMPORARILY INTERNALIZED TO GATE ACCESS
 *
 * @private
 *
 */
AttributeSet.prototype._get = function (key) {
    return $A.expressionService.get(this, key);
};


/**
 * Returns the raw value based on the given name.
 * @param {String} name The name of the attribute.
 */
AttributeSet.prototype.getRawValue = function(name) {
    var ret = this._getValue(name);
    if (ret && ret._getValue && !ret.getRawValue) {
        ret = ret._getValue();
    }

    return ret;
};

/**
 * DO NOT USE THIS METHOD.
 *
 * @public
 *
 * @deprecated use Component.set(name,value) instead
 */
AttributeSet.prototype.setValue = function (name,value) {
    //$A.warning("DEPRECATED USE OF attributes.setValue(name,value). USE component.set(name,value) INSTEAD.");
    this._setValue(name,value);
};

/**
 * Set the attribute of the given name to the given value.
 * @param {String} name The name can be a path expression inside. E.g. {!xxx....}
 * @param {Object} value The value to be set.
 *
 * TEMPORARILY INTERNALIZED TO GATE ACCESS
 *
 * @private
 *
 */
AttributeSet.prototype._setValue = function(name, value) {
    this.createDefault(name);

    var ve = this.values.getValue(name);
    if (ve.isExpression()) {
        expressionService.setValue(this.getValueProvider(), ve, value);
    } else {
        ve.setValue(value);
    }
};

/**
 * DO NOT USE THIS METHOD.
 *
 * @public
 *
 * @deprecated use Component.set(name,value) instead
 */
AttributeSet.prototype.set= function (name, value) {
    //$A.warning("DEPRECATED USE OF attributes.set(name,value). USE component.set(name,value) INSTEAD.");
    this._set(name, value);
};

/**
 * Set the attribute of the given name to the given value.
 * @param {String} name The name can be a path expression inside. E.g. {!xxx....}
 * @param {Object} value The value to be set.
 *
 * TEMPORARILY INTERNALIZED TO GATE ACCESS
 *
 * @private
 *
 */
AttributeSet.prototype._set = function (name, value) {
    this.createDefault(name);

    var ve = this.values._getValue(name);
    if (ve.isExpression()) {
        expressionService.setValue(this.getValueProvider(), ve, value);
    } else {
        ve.setValue(value);
    }
};

/**
 * Set the attribute of the given name to the given value.
 * @param {String} name The name can be a path expression inside. E.g. {!xxx....}
 * @param {Object} value The value to be set.
 */
AttributeSet.prototype.set = function (name, value) {
    this.createDefault(name);

    var ve = this.values.getValue(name);
    if (ve.isExpression()) {
        expressionService.setValue(this.getValueProvider(), ve, value);
    } else {
        ve.setValue(value);
    }
};

/**
 * Returns the value provider.
 * @return {Object} value provider
 */
AttributeSet.prototype.getValueProvider = function() {
    return this.valueProvider;
};

/**
 * Returns the value provider of the component.
 * @return {Object} component or value provider
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
 * @param {Object} yourMap The map to merge with this AttributeSet.
 * @param {Object} overwrite - should identical values in yourMap overwrite existing values
 * and insert new ones if they don't already exist in this AttributeSet.
 */
AttributeSet.prototype.merge = function(yourMap, overwrite) {
    var my = this.values.value;
    var keys = yourMap.value;

    for (var key in keys) {
        var yourvalue = yourMap.getValue(key);
        if (overwrite || !(key in my)) {
            my[key] = yourvalue;
        }
    }
};

/**
 * Reset the attribute set to point at a different def set.
 *
 * Allows us to change the set of attributes in a set when
 * we inject a new component. No checking is done here, if checking is
 * desired, it should be done by the caller.
 *
 * Doesn't check the current state of attributes because they don't matter.
 * This will create/update attributes based on new AttributeDefSet,
 * provided attribute config and current attribute values
 *
 * @param {AttributeDefSet} attributeDefSet the new def set to install.
 * @param {Object} attributes - new attributes configuration
 * @private
 */
AttributeSet.prototype.recreate = function(attributeDefSet, attributes) {
    $A.assert(attributeDefSet && attributeDefSet.auraType === "AttributeDefSet",
        "Valid AttributeDefSet is required to recreate attributes");
    this.attributeDefSet = attributeDefSet;

    var normalized = null;
    if (attributes) {
        // in case attributes aren't wrapped in "values" object
        if (attributes["values"] === undefined) {
            normalized = {};
            normalized["values"] = attributes;
        } else {
            normalized = attributes;
        }
    }

    // we need to go through new attributeDefs and create/update
    // attributes with new attributes provided
    this.createInstances(normalized);
};

/**
 * Merge data from a simple collection of attribute values, treated as expressions.
 * @param {Object} yourValues The map to merge with this AttributeSet.
 * @param {Object} overwrite - should identical values in yourMap overwrite existing values
 * and insert new ones if they don't already exist in this AttributeSet.
 * @private
 */
AttributeSet.prototype.mergeValues = function(yourValues, overwrite) {
    var my = this.values.value;
    for (var key in yourValues) {
        var yourvalue = yourValues[key];
        if (overwrite || !(key in my)) {
            this._getValue(key).setValue(yourvalue);
        }
    }
};

/**
 * Creates default attribute. Creation is lazy in getValue and setValue
 * @param {String} name - name of attribute
 * @private
 */
AttributeSet.prototype.createDefault = function(name) {
    if (name && !this.hasAttribute(name)) {
        // Dynamically create the attribute now that something has asked for it
        var attributeDef = this.attributeDefSet.getDef(name.toLowerCase());

        // DCHASMAN TODO Enable this when we have the time to fix the myriad of places that still reference non-existent attributes
        // $A.assert(attributeDef, "Unknown attribute " + this.component + "." + name);

        if (attributeDef) {
            var defaultValue = attributeDef.getDefault();
            this.createAttribute(name, defaultValue, attributeDef);
        }
    }
};

/**
 * Destroys the component.
 * @param {Boolean} async - whether to put in our own trashcan
 * @private
 */
AttributeSet.prototype.destroy = function(async) {
    this.values.destroy(async);

    this.values = undefined;
    this.valueProvider = undefined;
    this.attributeDefSet = undefined;
    this.component = undefined;
    this.localCreation = undefined;
};

/**
 * Loop through AttributeDefSet and create or update value using provided config
 *
 * @param {Object} config - attribute configuration
 * @private
 */
AttributeSet.prototype.createInstances = function(config){
    var values = this.attributeDefSet.getValues();
    var valuesOrder = this.attributeDefSet.getNames();
    if (values && valuesOrder) {
        var configValues = config ? config["values"] : null;

        for (var i = 0; i < valuesOrder.length; i++) {
            var lowerName = valuesOrder[i];
            var attributeDef = values[lowerName];

            var name = attributeDef.getDescriptor().getQualifiedName();
            var value = undefined;

            if (configValues) {
                value = configValues[name];

                /* This check is to distinguish between a AttributeDefRef that came from server
                 * which has a descriptor and value, and just a  thing that somebody on the client
                 * passed in. This totally breaks when somebody pass a map that has a key in it
                 * called "descriptor", like DefModel.java in the IDE
                 * TODO: better way to distinguish real AttDefRefs from random junk
                 */
                if (value && value["descriptor"]) {
                    value = value["value"];
                }
            }

            var hasValue = !$A.util.isUndefined(value);
            if (!hasValue && !this.hasAttribute(name)) {
                // We cannot defer creation of default facets because they must be recreated in server order on the client
                var isFacet = attributeDef.getTypeDefDescriptor() === "aura://Aura.Component[]";
                if (isFacet) {
                    value = attributeDef.getDefault();
                    hasValue = !$A.util.isUndefined(value);
                }
            }
            if (hasValue) {

                if (this.hasAttribute(name)) {
                    // set new value if attribute already exists
                    this.setValue(name, value);
                } else {
                    // create new if attribute doesn't exist
                    $A.pushCreationPath(name);
                    try {
                        this.createAttribute(name, value, attributeDef);
                    } finally {
                        $A.popCreationPath(name);
                    }
                }
            }
        }
    }
};


/**
 * Create attribute and store in values
 *
 * @private
 * @param {String} name - name of attribute
 * @param {Object} config - attribute config(s)
 * @param {AttributeDef} def - attribute definition
 */
AttributeSet.prototype.createAttribute = function(name, config, def) {
    var valueConfig;
    var act = $A.getContext().getCurrentAction();
    var noInstantiate = def.getTypeDefDescriptor() === "aura://Aura.ComponentDefRef[]";

    if (config && config["componentDef"]) {
        // TODO - not sure why doForce param is set false here
        //  had to make it explicit to add last param, but it was missing (aka false) in the past
        valueConfig = componentService.newComponentDeprecated(config, null, this.localCreation, true);
    } else if (aura.util.isArray(config)) {
        valueConfig = [];
        var self = this;
        var createComponent = function(itemConfig) {
            var ic = itemConfig,
                varName = ic['var'];
            return function(item, idx) {
                if (!ic["attributes"]) {
                    ic["attributes"] = {
                        "values": {}
                    };
                }

                if (act) {
                    act.setCreationPathIndex(idx);
                }

                ic["attributes"]["values"][varName] = item;
                ic["delegateValueProvider"] = self.valueProvider;
                ic["valueProviders"] = {};
                ic["valueProviders"][varName] = item;

                var cmp = componentService.newComponentDeprecated(ic, self.valueProvider, self.localCreation, true);
                valueConfig.push(cmp);
            };
        };

        for(var i = 0; i < config.length; i++) {
            var v = config[i];
            if (v["componentDef"]) {
                if (v["items"]) {
                    if (act) {
                        act.setCreationPathIndex(i);
                        act.pushCreationPath("realbody");
                    }
                    // iteration of some sort
                    var itemsValue = expressionService.getValue(this.valueProvider, valueFactory.create(v["items"]));
                    // temp workaround for no typedef if value is null
                    if (itemsValue && itemsValue.each) {
                        itemsValue.each(createComponent(v), v["reverse"]);
                    }
                    if (act) {
                        act.popCreationPath("realbody");
                    }
                } else {
                    if (noInstantiate) {
                        // make a shallow clone of the cdr with the proper value provider set
                        var cdr = {};
                        cdr["componentDef"] = v["componentDef"];
                        cdr["localId"] = v["localId"];
                        cdr["attributes"] = v["attributes"];
                        cdr["valueProvider"] = this.valueProvider;
                        valueConfig.push(new SimpleValue(cdr, def, this.component));
                    } else {
                        if (act) { act.setCreationPathIndex(i); }
                        valueConfig.push(componentService.newComponentDeprecated(v, this.valueProvider,
                            this.localCreation, true));
                    }
                }

            } else {
                valueConfig.push(v);
            }
        }
    } else {
        valueConfig = config;
    }

    // For unset maps and lists, we need to get that it's a map or list, and then reset the value to null/undef
    var hasRealValue = true;
    if (valueConfig === undefined || valueConfig === null) {
        var defType = def.getTypeDefDescriptor();
        if (defType.lastIndexOf("[]") === defType.length - 2 || defType.indexOf("://List") >= 0) {
            hasRealValue = valueConfig;
            valueConfig = [];
        } else if (defType.indexOf("://Map") >= 0) {
            hasRealValue = valueConfig;
            valueConfig = {};
        }
    }

    valueConfig = valueFactory.create(valueConfig, def, this.component);
    if (!hasRealValue) {
        // For maps and arrays that were null or undefined, we needed to make a
        // fake empty one to get the right value type, but now need to set the
        // actual value:
        valueConfig.setValue(hasRealValue);
    }

    this.values.put(name, valueConfig);

};
