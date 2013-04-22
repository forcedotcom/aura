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
 * @namespace The Event Definition including the descriptor, type, and attributes.
 * An EventDef instance is created as part of Aura initialization.
 * @constructor
 */
function EventDef(config) {
    this.descriptor = new DefDescriptor(config["descriptor"]);
    this.superDef = this.initSuperDef(config);
    this.attributeDefs = config["attributes"];   // TODO: real defs
    this.type = config["type"];
}

/**
 * Gets the event descriptor. (e.g. markup://foo:bar)
 * @returns {Object}
 */
EventDef.prototype.getDescriptor = function(){
    return this.descriptor;
};

/**
 * Gets the event type.
 * @returns {Object}
 */
EventDef.prototype.getEventType = function() {
    return this.type;
};

/**
 * Gets the attribute definitions.
 * @returns {AttributeDef}
 */
EventDef.prototype.getAttributeDefs = function() {
    return this.attributeDefs;
};

/**
 * Gets the event definition for the immediate super type.
 * @returns {EventDef} The EventDef for the immediate super type, or null if none exists (should only be null for aura:event)
 */
EventDef.prototype.getSuperDef = function() {
    return this.superDef;
};

/**
 * Initializes the event definition for the immediate super type.
 * @param {Object} config The argument that contains the super definition, or null if none exists.
 * @private
 */
EventDef.prototype.initSuperDef = function(config) {
    if (config["superDef"]) {
        return $A.eventService.getEventDef(config["superDef"]);
    }else{
        return null;
    }
};

//#include aura.event.EventDef_export
