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
 * @namespace Creates a new AttributeDefSet instance.
 * @param {Object} parent
 * @param {Object} configs For each configs object provided, a new AttributeDef instance is added
 * @constructor
 * @protected
 */
function AttributeDefSet(parent, configs){
    if (configs) {
        var values = {};
        for (var i = 0; i < configs.length; i++) {
            var attributeDef = new AttributeDef(configs[i]);
            values[attributeDef.getDescriptor().getQualifiedName().toLowerCase()] = attributeDef;
        }

        this.values = values;
    }
}

AttributeDefSet.prototype.auraType = "AttributeDefSet";

/**
 * Creates instances of AttributeDefSet
 * @private
 */
AttributeDefSet.prototype.createInstances = function(config, component, suppressValidation, localCreation){
    var values = this.values;
    var mapConfig = {};
    if (values) {
        var configValues = config ? config["values"] : null;
        for (var lowerName in values) {
            var attributeDef = values[lowerName];

            var name = attributeDef.getDescriptor().getQualifiedName();
            var value = undefined;

            if (configValues) {
                value = configValues[name];

                /* This check is to distinguish between a AttributeDefRef that came from server
                 * which has a descriptor and value, and just a thing that somebody on the client
                 * passed in. This totally breaks when somebody pass a map that has a key in it
                 * called "descriptor", like DefModel.java in the IDE
                 * TODO: better way to distinguish real AttDefRefs from random junk
                 */
                if (value && value["descriptor"] && value["value"] !== undefined) {
                    value = value["value"];
                }
            }

            var hasValue = !$A.util.isUndefined(value);
            if (!suppressValidation){
                aura.assert(hasValue || !attributeDef.isRequired(), "Missing required attribute " + name);
            }

            if (!hasValue) {
                // We cannot defer creation of default facets because they must be recreated in server order on the client to maintain globalId integrity
                var isFacet = attributeDef.getTypeDefDescriptor() === "aura://Aura.Component[]";
                if (isFacet) {
                    value = attributeDef.getDefault();
                    hasValue = !$A.util.isUndefined(value);
                }
            }

            if (hasValue) {
                var attribute = this.createAttribute(value, attributeDef, component, config["valueProvider"], localCreation);
                mapConfig[name] = attribute;
            }
        }
    }

    return new AttributeSet(new MapValue(mapConfig), config["valueProvider"], this, component, localCreation);
};

/**
 * For each AttributeDef value, pass it into the given function.
 * @param {Function} f The function to pass the values into.
 */
AttributeDefSet.prototype.each = function(f){
    var values = this.values;
    if (values) {
        for (var name in values){
            f(values[name]);
        }
    }
};

/**
 * Returns the AttributeDef object.
 * @param {String} name The name of the AttributeDef instance, which matches the qualified name of the attributeDef descriptor.
 * @returns {AttributeDef}
 */
AttributeDefSet.prototype.getDef = function(name){
    var values = this.values;
    if (values) {
        return values[name.toLowerCase()];
    }
    return null;
};

/**
 * @private
 */
AttributeDefSet.prototype.createAttribute = function(config, def, component, valueProvider, localCreation, forceInstantiate) {
    function createComponent(item) {
        if (!v["attributes"]) {
            v["attributes"] = {
                "values": {}
            };
        }

        v["attributes"]["values"][varName] = item;
        v["delegateValueProvider"] = valueProvider;
        v["valueProviders"] = {};
        v["valueProviders"][varName] = item;

        var cmp = componentService.newComponent(v, valueProvider, localCreation, true);

        delete v["attributes"]["values"][varName];
        delete v["valueProviders"];

        valueConfig.push(cmp);
    }

    var noInstantiate = def.getTypeDefDescriptor() === "aura://Aura.ComponentDefRef[]";
    var valueConfig;
    if (config && config["componentDef"]) {
        valueConfig = componentService.newComponent(config, null, localCreation, true);
    } else if (aura.util.isArray(config)) {
        valueConfig = [];

        for(var i = 0; i < config.length; i++) {
            var v = config[i];
            if (v["componentDef"]) {
                if (v["items"]) {
                    //foreach
                    var itemsValue = expressionService.getValue(valueProvider, valueFactory.create(v["items"]));
                    // temp workaround for no typedef if value is null
                    if (itemsValue && itemsValue.each) {
                        var varName = v['var'];
                        itemsValue.each(createComponent, v["reverse"]);
                    }
                } else {
                    if (noInstantiate && !forceInstantiate) {
                        valueConfig.push(new SimpleValue(v, def, component));
                    } else {
                        valueConfig.push(componentService.newComponent(v, valueProvider, localCreation, true));
                    }
                }

            } else {
                valueConfig.push(v);
            }
        }
    } else {
        valueConfig = config;
    }

    return valueFactory.create(valueConfig, def, component);
};

//#include aura.attribute.AttributeDefSet_export
