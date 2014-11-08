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
 * Returns a ProviderDef instance or config after adding to the registry.
 * Throws an error if componentDefDesciptor is not provided.
 * @param {Object} componentDefDescriptor Required. The component definition descriptor to lookup on the providerDefs.
 * @param {Object} config Passes in a config, a ProviderDef, or the name of a ProviderDef.
 */
ProviderDefRegistry.prototype.getDef = function(componentDefDescriptor, config){
    aura.assert(componentDefDescriptor, "ComponentDef Descriptor is required");
    var ret = this.providerDefs[componentDefDescriptor];
    if(!ret && config){
        ret = new ProviderDef(config);
        this.providerDefs[componentDefDescriptor] = ret;
    }
    return ret;
};
