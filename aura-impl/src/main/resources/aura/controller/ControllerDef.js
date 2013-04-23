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
 * @namespace Creates a new ControllerDef, including the descriptor and action definitions.
 * A ControllerDef instance is created as part of the ComponentDef initialization.
 * @constructor
 * @param {Object} config
 */
function ControllerDef(config){
    this.descriptor = config["descriptor"];
    this.actionDefs = {};
    var actionDefs = config["actionDefs"];

    for(var i=0;i<actionDefs.length;i++){
        var actionDefConfig = actionDefs[i];
        var actionDef = $A.services.component.getActionDef(actionDefConfig);
        this.actionDefs[actionDef.getName()] = actionDef;
    }
}

ControllerDef.prototype.auraType = "ControllerDef";

/**
 * Gets the Controller Descriptor (e.g. markup://aura:component).
 * @returns {Object}
 */
ControllerDef.prototype.getDescriptor = function(){
    return this.descriptor;
};

/**
 * Gets the Action Definition.
 * @param {String} key The data key to look up on the element.
 * @returns {Object}
 */
ControllerDef.prototype.getActionDef = function(key){
    return this.actionDefs[key];
};

/**
 * Gets the value of the Controller Definition based on the given key.
 * @param {String} key The data key to look up on the element.
 * @returns {Object} A new Action Definition instance
 */
ControllerDef.prototype.getValue = function(key){
    return this.getActionDef(key).newInstance();
};

//#include aura.controller.ControllerDef_export
