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
 * @description A registry for HelperDefs.
 * @constructor
 */
function HelperDefRegistry(){
    this.helperDefs = {};
}

/**
 * Returns a HelperDef instance from registry
 * @param {String} descriptor component definition descriptor to lookup on the HelperDef
 * @returns {HelperDef} HelperDef from registry
 */
HelperDefRegistry.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No component descriptor specified");
    return this.helperDefs[descriptor];
};

/**
 * Returns a HelperDef after creating and adding to the registry.
 * @param {ComponentDef} componentDef component definition
 * @param {Object} libraries library defs map
 * @returns {HelperDef}
 */
HelperDefRegistry.prototype.createDef = function(componentDef, libraries) {
    $A.assert(componentDef, "Component definition is required to create ProviderDef");
    var componentDescriptor = componentDef.getDescriptor().getQualifiedName();
    var def = this.getDef(componentDescriptor);
    if (!def) {
        def = new HelperDef(componentDef, libraries);
        this.helperDefs[componentDescriptor] = def;
    }
    return def;
};

Aura.Helper.HelperDefRegistry = HelperDefRegistry;