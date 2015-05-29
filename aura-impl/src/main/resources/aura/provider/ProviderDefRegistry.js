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
 * @description A registry for ProviderDefs.
 * @constructor
 * @protected
 */
function ProviderDefRegistry(){
    this.providerDefs = {};
}

ProviderDefRegistry.prototype.auraType = "ProviderDefRegistry";

/**
 * Returns a ProviderDef instance from registry
 * @param {String} descriptor component definition descriptor to lookup on the providerDef
 * @returns {ProviderDef} ProviderDef from registry
 */
ProviderDefRegistry.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No component descriptor specified");
    return this.providerDefs[descriptor];
};

/**
 * Returns a ProviderDef after creating and adding to the registry.
 * @param {String} componentDescriptor descriptor of component
 * @param {object} config config of a ProviderDef.
 * @returns {ProviderDef}
 */
ProviderDefRegistry.prototype.createDef = function(componentDescriptor, config) {
    $A.assert(componentDescriptor, "Component descriptor is required to create ProviderDef");
    $A.assert(config, "ProviderDef Config required for registration");
    var def = this.getDef(componentDescriptor);
    if (!def) {
        def = new ProviderDef(config);
        this.providerDefs[componentDescriptor] = def;
    }
    return def;
};


Aura.Provider.ProviderDefRegistry = ProviderDefRegistry;