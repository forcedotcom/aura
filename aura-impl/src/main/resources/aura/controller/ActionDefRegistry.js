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
/**
 * @namespace A registry for ControllerDefs.
 * @constructor
 * @protected
 */
function ActionDefRegistry(){
    this.actionDefs = {};
}

ActionDefRegistry.prototype.auraType = "ActionDefRegistry";

/**
 * Returns a ActionDef instance from registry
 * Throws an error if config is not provided.
 * @param {Object} config Passes in the descriptor of an ActionDef.
 */
ActionDefRegistry.prototype.getDef = function(config){
    aura.assert(config, "ActionDef Config required for registration");
    
    // We don't re-register (or modify in any way) once we've registered
    var descriptor = config.descriptor;
    var ret = this.actionDefs[descriptor];
    if (!ret) {
        ret = new ActionDef(config);
        
        // Only track server actions to save space
        if (ret.isServerAction()) {
        	this.actionDefs[ret.getDescriptor().toString()] = ret;
        }
    }
    
    return ret;
};
