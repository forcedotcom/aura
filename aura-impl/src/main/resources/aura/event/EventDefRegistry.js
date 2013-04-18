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
 * @namespace A registry for EventDefs.
 * @constructor
 */
function EventDefRegistry() {
    this.eventDefs = {};
}

/**
 * Returns an EventDef instance from registry or config after adding to the registry.
 * Throws an error if config is not provided.
 * @param {Object} config Passes in a config, an EventDef, or the name of an EventDef.
 * @returns a EventDef instance from registry, or config after adding to the registry
 */
EventDefRegistry.prototype.getEventDef = function(config) {
    aura.assert(config, "No EventDef specified");
    if (aura.util.isObject(config)) {
        aura.assert(config, "EventDef config required for registration");
        // We don't re-register (or modify in any way) once we've registered
        var descriptor = config["descriptor"];
        if(!descriptor && config["getDescriptor"]){
            descriptor = config.getDescriptor();
        }
        var ret = this.eventDefs[descriptor];
        if (!ret) {
            ret = new EventDef(config);
            this.eventDefs[ret.getDescriptor().toString()] = ret;
        }
        return ret;
    }else{
        if(config.indexOf("://") == -1){
            config = "markup://"+config;
        }
        return this.eventDefs[config];
    }
};
