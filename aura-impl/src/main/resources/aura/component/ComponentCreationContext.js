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
 * Component creation context builds components by determining whether server request is required or
 * client side creation is possible. It saves the component hierarchy into an array then calls init
 * on each component from bottom up. Once all initialized, the callback provided is called with the
 * top level component
 *
 * @param {(Object|Object[])} config - configuration of top level component
 * @param {Object} scope - callback scope
 * @param {Function} callback - callback function
 * @param {Object} [attributeValueProvider] - attribute value provider
 * @param {Boolean} [localCreation]
 * @param {Boolean} [forceServer]
 * @param {Boolean} [forceClient]
 *
 * @protected
 * @class ComponentCreationContext
 * @constructor
 */
$A.ns.ComponentCreationContext = function(config, scope, callback, attributeValueProvider,
                                          localCreation, forceServer, forceClient) {

    // TODO: remove forceServer and localCreation. When CCC and async component creation is DONE,
    // localCreation and forceServer wouldn't need to be passed in by user

    this.scope = scope;
    this.callback = callback;
    this.components = [];           // all components created
    this.topIndexes = [];           // indexes of top level components
    this.tops = [];                 // top level components, populated with topIndexes
    this.descriptors = [];          // all component descriptors being created

    // keep track of components to know when we're done
    this.count = 0;
    this.index = 0;

    this.isArray = false;
    this.arrayLength = 0;

    if ($A.util.isArray(config)) {
        this.loadComponentArray(config, attributeValueProvider, localCreation, forceServer, forceClient);
    } else {
        this.loadComponent(config, attributeValueProvider, localCreation, null, true, forceServer, forceClient);
    }
};

/**
 * Loads new component to top level component tree.
 *
 * @param {Object} config - configuration for component
 * @param {Object} [attributeValueProvider] - attribute value provider
 * @param {Boolean} [localCreation]
 * @param {Function} [callback] - callback function
 * @param {Boolean} [isTop] - signifies top level component
 * @param {Boolean} [forceServer] - force server request
 * @param {Boolean} [forceClient] - force client only
 */
$A.ns.ComponentCreationContext.prototype.loadComponent = function(config, attributeValueProvider, localCreation,
                                                                  callback, isTop, forceServer, forceClient) {

    var configObj = $A.componentService.getComponentConfigs(config, attributeValueProvider),
        def = configObj["definition"],
        desc = configObj["descriptor"],
        self = this,
        currentIndex = this.index;

    this.descriptors[currentIndex] = desc;

    if (isTop) {
        // keep track of top level component(s) to be return to callback
        this.topIndexes.push(currentIndex);
    }

    /**
     * Wraps provided callback to perform component bookkeeping
     *
     * @param {Component} component
     */
    var wrapper = function(component) {
        self.components[currentIndex] = component;
        self.count--;

        if ($A.util.isFunction(callback)) {
            callback.call(self.scope, component);
        }
        self.finished();
    };

    config = configObj["configuration"];

    // increment component count
    this.count++;
    this.index++;

    // partial config
    if (config["creationPath"]) {
        forceClient = true;
    }

    config["componentDef"] = {
        "descriptor": desc
    };

    if ((!forceClient && (!def || (def && def.hasRemoteDependencies()))) || forceServer) {
        this.requestComponent(config, attributeValueProvider, wrapper);
    } else {
        var newComp = this.buildComponent(config, attributeValueProvider, localCreation);
        wrapper(newComp);
    }
};

/**
 * Creates and will return an array of components in the order specified in array config
 *
 * @param {Object[]} configs - array of component configs
 * @param {Object} [attributeValueProvider] - attribute value provider
 * @param {Boolean} [localCreation]
 * @param {Boolean} [forceServer]
 * @param {Boolean} [forceClient]
 */
$A.ns.ComponentCreationContext.prototype.loadComponentArray = function(configs, attributeValueProvider, localCreation,
                                                                       forceServer, forceClient) {
    $A.assert($A.util.isArray(configs) && configs.length, "configs should be array of component configurations");

    /**
    creating an array of components. Used in {@link $A.ns.ComponentCreationContext.finished}
     */
    this.isArray = true;
    this.arrayLength = configs.length;

    for (var i = 0; i < configs.length; i++) {
        this.loadComponent(configs[i], attributeValueProvider, localCreation, null, true, forceServer, forceClient);
    }

};

/**
 * Request server dependent component. Callback is called with component when action completes.
 *
 * @param {Object} config - component config
 * @param {Object} [avp] - attribute value provider
 * @param {Function} callback - callback
 */
$A.ns.ComponentCreationContext.prototype.requestComponent = function(config, avp, callback) {
    var action = $A.get("c.aura://ComponentController.getComponent"),
        attributes = config["attributes"] ?
            (config["attributes"]["values"] ? config["attributes"]["values"] : config["attributes"])
            : null,
        atts = {},
        doubleCall = false;

    //
    // Note to self, these attributes are _not_ Aura Values. They are instead either
    // a literal string or a (generic object) map.
    //
    for (var key in attributes) {
        var value = attributes[key];
        if (value && value.hasOwnProperty("value")) {
            value = value["value"];
        }
        // no def or component here, because we don't have one.
        var auraValue = valueFactory.create(value);
        atts[key] = $A.componentService.computeValue(auraValue, avp);
    }

    action.setCallback(this, function(a){
        var newComp;

        //
        // DWR! DWR! DWR! storable actions can cause a 'double' callback, first with the cached
        // version, then with a refreshed version. This should _never_ happen, as the values should
        // always match, but we'd like to die 'gracefully' when it does occur.
        //
        if (doubleCall) {
            $A.assert(!doubleCall,
                "Two callbacks from " + a + " means our component is not storable: " + a.getReturnValue());
            return;
        }
        doubleCall = true;

        if (a.getState() === "SUCCESS") {
            var returnedConfig = a.getReturnValue();
            if (!returnedConfig["attributes"]) {
                returnedConfig["attributes"] = {};
            }
            var merging = returnedConfig["attributes"];
            if (merging.hasOwnProperty("values")) {
                merging = merging["values"];
            }
            for (var mkey in attributes) {
                merging[mkey] = attributes[mkey];
            }
            returnedConfig["localId"] = config["localId"];

            newComp = this.buildComponent(returnedConfig, avp, false);
        } else {
            // return text component with error message if something went wrong
            var errors = a.getError();

            newComp = this.buildComponent("markup://aura:text");
            if (errors) {
                newComp.set("v.value", errors[0].message);
            } else {
                newComp.set("v.value", "unknown error");
            }
        }
        if ($A.util.isFunction(callback)) {
            callback.call(this.scope, newComp);
        }
    });

    action.setParams({
        "name" : config["componentDef"]["descriptor"],
        "attributes" : atts
    });

    $A.enqueueAction(action);
};

/**
 * Component def should already be available at this point. Hence, no lazy or exclusive needed
 * and component can just be created
 *
 * @param {Object} config - component configuration
 * @param {Object} [attributeValueProvider] - attribute value provider
 * @param {Boolean} [localCreation] - local creation
 * @returns {Component} created component
 */
$A.ns.ComponentCreationContext.prototype.buildComponent = function(config, attributeValueProvider, localCreation) {
    var configObj = $A.componentService.getComponentConfigs(config, attributeValueProvider),
        def = configObj["definition"];

    $A.assert(def, "Component definition required to create component");

    config = configObj["configuration"];

    if(!config["creationPath"]) {
        localCreation = true;
        // shouldn't need lazy or exclusive components
        delete config["load"];
    }

    return new Component(config, localCreation, this);
};

/**
 * Finished is called whenever a component is created. Checks if all components are accounted for
 * and calls initializes them in reverse order.
 */
$A.ns.ComponentCreationContext.prototype.finished = function() {

    // if creating array of components, we need to check whether we have all the top levels
    var ready = this.isArray ? this.topIndexes.length === this.arrayLength : true;

    if (this.count === 0 && ready) {

        // put top level components into an array
        for (var t = 0; t < this.topIndexes.length; t++) {
            var position = this.topIndexes[t];
            this.tops.push(this.components[position]);
        }

        // initialize components in reverse order
        for (var i = this.components.length - 1; i >= 0; i--) {
            var component = this.components[i];
            $A.assert(component, "Should have component");
            component.fire("init");
            // remove reference to ccc in component to prevent memory leaks
            component.ccc = undefined;
        }

        var ret;

        if (!this.isArray) {
            $A.assert(this.tops.length === 1, "Should only have one top level component");
            ret = this.tops[0];
        } else {
            ret = this.tops;
        }

        this.callback.call(this.scope, ret);

    }
};

