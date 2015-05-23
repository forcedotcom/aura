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
 * @description A registry for ControllerDef instances.
 * @constructor
 * @protected
 */
function ControllerDefRegistry(){
    this.controllerDefs = {};
}

/**
 * Returns a ControllerDef instance from registry
 * @param {String} descriptor descriptor of a ControllerDef.
 * @returns {ControllerDef} ControllerDef from registry
 */
ControllerDefRegistry.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No ControllerDef descriptor specified");
    return this.controllerDefs[descriptor];
};

/**
 * Returns a ControllerDef after creating and adding to the registry.
 * @param {object} config config of a ControllerDef.
 * @return {ControllerDef}
 */
ControllerDefRegistry.prototype.createDef = function(config) {
    $A.assert(config && config["descriptor"], "ControllerDef Config required for registration");
    var def = this.getDef(config["descriptor"]);
    if (!def) {
        def = new ControllerDef(config);
        this.controllerDefs[def.getDescriptor().toString()] = def;
    }
    return def;
};

Aura.Controller.ControllerDefRegistry = ControllerDefRegistry;