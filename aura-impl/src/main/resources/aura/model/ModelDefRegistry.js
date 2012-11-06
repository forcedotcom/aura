/*
 * Copyright (C) 2012 salesforce.com, inc.
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
 * @namespace A registry for ModelDefs.
 * @constructor
 */
function ModelDefRegistry(){
    this.modelDefs = {};
}

ModelDefRegistry.prototype.auraType = "ModelDefRegistry";

/**
 * Returns a ModelDef instance or config after adding to the registry.
 * Throws an error if config is not provided.
 * @param {Object} config Passes in a config, a ModelDef, or the name of a ModelDef.
 * @returns a ModelDef instance or config after adding to the registry
 */
ModelDefRegistry.prototype.getDef = function(config){
    aura.assert(config, "ModelDef Config required for registration");
    // We don't re-register (or modify in any way) once we've registered
    var descriptor = config["descriptor"];
    var ret = this.modelDefs[descriptor];
    if (!ret) {
        ret = new ModelDef(config);
        this.modelDefs[ret.getDescriptor().toString()] = ret;
    }
    return ret;
};
