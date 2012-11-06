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
 * @namespace Creates a new ModelDef instance.
 * @constructor
 */
function ModelDef(config){
    this.descriptor = new DefDescriptor(config["descriptor"]);
    var members = [];
    this.members = members;

    // TODO: members should be valuedefs with typedefs
    for (var i = 0; i < config["members"].length; i++) {
        var m = config["members"][i];
        members.push(m["name"]);
    }
}

ModelDef.prototype.auraType = "ModelDef";

/**
 * Gets the descriptor. (e.g. markup://foo:bar)
 * @returns {DefDescriptor}
 */
ModelDef.prototype.getDescriptor = function(){
    return this.descriptor;
};

/**
 * Returns a new Model instance for this component.
 * @param {Object} config
 * @param {Component} component
 * @returns {Model}
 */
ModelDef.prototype.newInstance = function(config, component){
    return new Model(this, config, component);
};

/**
 * Gets member names containing ValueDef and TypeDef.
 * @returns {Object}
 */
ModelDef.prototype.getMemberNames = function() {
    return this.members;
};
//#include aura.model.ModelDef_export
