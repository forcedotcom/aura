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
 * @description A registry for ActionDef.
 * @constructor
 * @protected
 */
function ActionDefRegistry(){
    this.actionDefs = {};
}

ActionDefRegistry.prototype.auraType = "ActionDefRegistry";

/**
 * Returns an ActionDef instance from registry
 * @param {String} descriptor name of an ActionDef.
 * @returns {ActionDef} ActionDef from registry
 */
ActionDefRegistry.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No ActionDef descriptor specified");
    return this.actionDefs[descriptor];
};

/**
 * Returns an ActionDef after creating and adding to the registry.
 * @param {object} config config of a ActionDef.
 * @return {ActionDef}
 */
ActionDefRegistry.prototype.createDef = function(config) {
    $A.assert(config && config["descriptor"], "ActionDef Config required for registration");
    var def = this.getDef(config["descriptor"]);
    if(!def) {
        def = new ActionDef(config);
        this.actionDefs[def.getDescriptor().toString()] = def;
    }
    return def;
};

Aura.Controller.ActionDefRegistry = ActionDefRegistry;