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
        this.values = {};
        // maintain attribute order
        this.valuesOrder = [];
        var hasBody = false;
        for (var i = 0; i < configs.length; i++) {
            var attributeDef = new AttributeDef(configs[i]);
            var qname = attributeDef.getDescriptor().getQualifiedName().toLowerCase();
            this.values[qname] = attributeDef;

            // server side creates component and processes attributes first then processes facets or "body"
            // so we need to do the same client side to prevent global id mismatches.
            if (qname !== 'body') {
                this.valuesOrder.push(qname);
            } else {
                hasBody = true;
            }
        }

        if (hasBody) {
            this.valuesOrder.push('body');
        }
    }
}

AttributeDefSet.prototype.auraType = "AttributeDefSet";

/**
 * Creates instances of AttributeDefSet
 * @private
 */
AttributeDefSet.prototype.createInstances = function(config, component, suppressValidation, localCreation){
    var values = this.values;
    var valuesOrder = this.valuesOrder;
    var mapConfig = {};
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
                 * which has a descriptor and value, and just a thing that somebody on the client
                 * passed in. This totally breaks when somebody pass a map that has a key in it
                 * called "descriptor", like DefModel.java in the IDE
                 * TODO: better way to distinguish real AttDefRefs from random junk
                 */
                if (value && value["descriptor"]) {
                    value = value["value"];
                }
            }

            var hasValue = !$A.util.isUndefined(value);
            if (!suppressValidation){
                aura.assert(hasValue || !attributeDef.isRequired(), "Missing required attribute " + name);
            }
            if (!hasValue) {
                // We cannot defer creation of default facets because they must be recreated in server order on the cli
                var isFacet = attributeDef.getTypeDefDescriptor() === "aura://Aura.Component[]";
                if (isFacet) {
                    value = attributeDef.getDefault();
                    hasValue = !$A.util.isUndefined(value);
                }
            }
            if (hasValue) {
                var attribute;

                $A.pushCreationPath(name);
                try {
                    attribute = this.createAttribute(value, attributeDef, component, config["valueProvider"], localCreation, false);
                } finally {
                    $A.popCreationPath(name);
                }
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
    var valuesOrder = this.valuesOrder;
    if (values) {
        for (var i = 0; i < valuesOrder.length; i++) {
            f(values[valuesOrder[i]],i);
        }
    }
};

/**
 * Returns the AttributeDef object.
 * @param {String} name The name of the AttributeDef instance, which matches the qualified name of the attributeDef descriptor.
 * @returns {AttributeDef} An AttributeDef object is stored in a parent definition, such as a ComponentDef object. 
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
    function createComponent(item, idx) {
        if (!v["attributes"]) {
            v["attributes"] = {
                "values": {}
            };
        }

    	if (act) { 
            act.setCreationPathIndex(idx);
    	}
        	
        v["attributes"]["values"][varName] = item;
        v["delegateValueProvider"] = valueProvider;
        v["valueProviders"] = {};
        v["valueProviders"][varName] = item;

        var cmp = componentService.newComponentDeprecated(v, valueProvider, localCreation, true);

        delete v["attributes"]["values"][varName];
        delete v["valueProviders"];

        valueConfig.push(cmp);
    }

    var act = $A.getContext().getCurrentAction(); 
    var noInstantiate = def.getTypeDefDescriptor() === "aura://Aura.ComponentDefRef[]";
    var valueConfig;
    if (config && config["componentDef"]) {
    	// TODO - not sure why doForce param is set false here 
        //  had to make it explicit to add last param, but it was missing (aka false) in the past
        valueConfig = componentService.newComponentDeprecated(config, null, localCreation, true);
    } else if (aura.util.isArray(config)) {
        valueConfig = [];

        for(var i = 0; i < config.length; i++) {
                var v = config[i];
            if (v["componentDef"]) {
                if (v["items"]) {
                    if (act) { 
                        act.setCreationPathIndex(i);
                        act.pushCreationPath("realbody");
                    }
                    // iteration of some sort
                    var itemsValue = expressionService.getValue(valueProvider, valueFactory.create(v["items"]));
                    // temp workaround for no typedef if value is null
                    if (itemsValue && itemsValue.each) {
                        var varName = v['var'];
                        itemsValue.each(createComponent, v["reverse"]);
                    }
                    if (act) { 
                        act.popCreationPath("realbody");
                    }
                } else {
                    if (noInstantiate && !forceInstantiate) {
                        // make a shallow clone of the cdr with the proper value provider set 
                        var cdr = {};
                        cdr["componentDef"] = v["componentDef"];
                        cdr["localId"] = v["localId"];
                        cdr["attributes"] = v["attributes"];
                        cdr["valueProvider"] = valueProvider;
                        valueConfig.push(new SimpleValue(cdr, def, component));
                    } else {
                        if (act) { act.setCreationPathIndex(i); }
                        valueConfig.push(componentService.newComponentDeprecated(v, valueProvider, localCreation, true, null));
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
    valueConfig = valueFactory.create(valueConfig, def, component);
    if (!hasRealValue) {
        // For maps and arrays that were null or undefined, we needed to make a
        // fake empty one to get the right value type, but now need to set the
        // actual value:
        valueConfig.setValue(hasRealValue);
    }
    return valueConfig;
};

//#include aura.attribute.AttributeDefSet_export
