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
 * @description Creates a new ControllerDef, including the descriptor and action definitions.
 * A ControllerDef instance is created as part of the ComponentDef initialization.
 * @constructor
 * @param {Object} config
 * @export
 */
function ControllerDef(config){
    this.descriptor = config["descriptor"];
    this.actionDefs = {};
    var actionDefs = config["actionDefs"];

    for(var i=0;i<actionDefs.length;i++){
        var actionDefConfig = actionDefs[i];
        var actionDef = $A.componentService.createActionDef(actionDefConfig);
        this.actionDefs[actionDef.getName()] = actionDef;
    }
}

/**
 * Gets the Controller Descriptor with the format <code>markup://aura:component</code>.
 * @returns {String} ControllerDef descriptor
 */
ControllerDef.prototype.getDescriptor = function(){
    return this.descriptor;
};

/**
 * Check if an action def exists.
 */
ControllerDef.prototype.hasActionDef = function(key){
    return this.actionDefs.hasOwnProperty(key);
};

/**
 * Gets the Action Definition.
 * @param {String} key The data key to look up on the element.
 * @returns {Object}
 * @export
 */
ControllerDef.prototype.getActionDef = function(key){
    var action = this.actionDefs[key];
    if (!action) {
        var ae = new $A.auraError("Unable to find '"+key+"' on '"+this.descriptor+"'.", null, $A.severity.QUIET);
        // ControllerDef config descriptor uses compound:// so that it can find the right thing,
        // but error reporting only cares about the component name so replacing it with markup:// here.
        ae.setComponent(this.descriptor.replace("compound://", "markup://").replace(".", ":"));
        throw ae;
    }
    return action;
};

/**
 * Gets the value of the Controller Definition based on the given key.
 * @param {String} key The data key to look up on the element.
 * @returns {Object} A new Action Definition instance
 * @export
 */
ControllerDef.prototype.get = function(key){
    return this.getActionDef(key).newInstance();
};

Aura.Controller.ControllerDef = ControllerDef;
