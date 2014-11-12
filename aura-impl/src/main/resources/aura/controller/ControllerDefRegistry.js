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
 * @description A registry for ControllerDef instances.
 * @constructor
 * @protected
 */
function ControllerDefRegistry(){
    this.controllerDefs = {};
}

ControllerDefRegistry.prototype.auraType = "ControllerDefRegistry";

/**
 * Returns a ControllerDef instance from registry or config after adding to the registry.
 * Throws an error if config is not provided.
 * @param {Object} config Passes in a config, a ControllerDef, or the name of a ControllerDef.
 */
ControllerDefRegistry.prototype.getDef = function(config){
    aura.assert(config, "ControllerDef Config required for registration");
    // We don't re-register (or modify in any way) once we've registered
    var descriptor = config.descriptor;
    var ret = this.controllerDefs[descriptor];
    if (!ret) {
        ret = new ControllerDef(config);
        this.controllerDefs[ret.getDescriptor().toString()] = ret;
    }
    return ret;
};
