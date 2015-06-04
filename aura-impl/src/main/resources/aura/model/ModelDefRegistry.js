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
 * @description A registry for ModelDefs.
 * @constructor
 */
function ModelDefRegistry(){
    this.modelDefs = {};
}

ModelDefRegistry.prototype.auraType = "ModelDefRegistry";

/**
 * Returns a ModelDef instance from registry
 * @param {String} descriptor name of a ModelDef.
 * @returns {ModelDef} ModelDef from registry
 */
ModelDefRegistry.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No ModelDef descriptor specified");
    return this.modelDefs[descriptor];
};

/**
 * Returns a ModelDef after creating and adding to the registry.
 * @param {object} config config of a ModelDef.
 * @returns {ModelDef}
 */
ModelDefRegistry.prototype.createDef = function(config) {
    $A.assert(config && config["descriptor"], "ModelDef Config required for registration");
    var def = this.getDef(config["descriptor"]);
    if (!def) {
        def = new ModelDef(config);
        this.modelDefs[def.getDescriptor().toString()] = def;
    }
    return def;
};

Aura.Model.ModelDefRegistry = ModelDefRegistry;