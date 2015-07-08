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
 * @description A registry for EventDefs.
 * @constructor
 */
function EventDefRegistry() {
    this.eventDefs = {};
}

/**
 * Returns an EventDef instance from registry.
 * @param {String} name descriptor name of an EventDef.
 * @returns {EventDef} EventDef instance from registry, or config after adding to the registry
 */
EventDefRegistry.prototype.getDef = function(name) {
    $A.assert(name, "No EventDef specified");
    if(name.indexOf("://") === -1){
        name = "markup://" + name;
    }
    return this.eventDefs[name];
};

/**
 * Creates and saves EventDef into registry
 * @param {Object} config config for EventDef
 * @returns {EventDef} instance from registry
 */
EventDefRegistry.prototype.createDef = function(config) {
    $A.assert($A.util.isObject(config), "EventDef config required for registration");
    var descriptor = config["descriptor"];
    if(!descriptor && config["getDescriptor"]){
        descriptor = config.getDescriptor();
    }
    var def = this.getDef(descriptor);
    if (!def) {
        def = new EventDef(config);
        this.eventDefs[def.getDescriptor().toString()] = def;
    }
    return def;
};

Aura.Event.EventDefRegistry = EventDefRegistry;