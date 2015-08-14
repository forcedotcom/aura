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
 * @description The Aura Event Service, accessible using $A.eventService. Creates and Manages Events.
 * @constructor AuraEventService
 * @export
 */
function AuraEventService () {
    this.registry = new EventDefRegistry();
    this.eventDispatcher = [];

    this.savedEventConfigs = {};
}

/**
 * Returns qualified event name
 * @param {String} event Event name
 * @returns {String} qualified event name
 */
AuraEventService.prototype.qualifyEventName = function(event) {
    if(event.indexOf("://") === -1){
        event = "markup://"+event;
    }
    return event;
};

/**
 * Creates a new application event. Set the event parameters using <code>event.setParams()</code> and fire
 * it using <code>event.fire()</code>. For example, <code>$A.eventService.newEvent("app:navError")</code>
 * fires the <code>app:navError</code> event. Set parameters on the new event
 * by using <code>event.setParams()</code>.
 *
 * @param {String} eventDef The event object in the format namespace:component
 * @param {String=} eventName The event name if the event is a "COMPONENT" type event
 * @param {sourceCmp=} eventName The component source if the event is a "COMPONENT" type event
 * @return {Event} new Event
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.newEvent = function(eventDef, eventName, sourceCmp) {
    $A.assert(eventDef, "EventDef is required");
    eventDef = this.getEventDef(this.qualifyEventName(eventDef));

    if (eventDef) {
        var config = {};
        config["eventDef"] = eventDef;
        if (eventDef.getEventType() === 'COMPONENT') {
            config["name"]      = eventName;
            config["component"] = sourceCmp && sourceCmp.getConcreteComponent();
        } else {
            config["eventDispatcher"] = this.eventDispatcher;
        }
        return new Aura.Event.Event(config);
    }
};

/**
 * Dispatch events
 * @param {Event} evt The event object
 * @memberOf AuraEventService
 * @private
 */
AuraEventService.prototype.dispatchEventHandlers = function (handlers, evt) {
    for (var i = 0; i < handlers.length; i++) {
        handlers[i](evt);
    }
};

/**
 * Bubbles the event from the source to the root
 * @param {Event} evt The event object
 * @memberOf AuraEventService
 * @private
 */
AuraEventService.prototype.bubbleEvent = function(evt) {
    var eventName = evt.getName();
    var needsDispatch;
    var i,j;

    // Loop over facet value provider all the way up to the root
    var cmp = evt.getSource();
    while (cmp && cmp.isValid() && !evt.eventStopPropagation) {

        // Loop for super() parents inside the current component
        for (var superCmp = cmp; superCmp && !evt.eventStopPropagation; superCmp = superCmp.isValid() ? superCmp.getSuper() : null) {

            var dispatcher = superCmp.getEventDispatcher();
            var dispatcherHandlers = dispatcher && dispatcher[eventName];
            needsDispatch = false; // reset for each loop of inheritance

            // First of all, check if we have any dispatch handlers, if not we are done for this level
            if (dispatcherHandlers && dispatcherHandlers.length) {
                // In case somebody tries to insert new handlers during bubbling
                dispatcherHandlers = dispatcherHandlers.slice();
                needsDispatch = true;

                var cmpHandlerDefs = superCmp.getDef().getCmpHandlerDefs();
                // If we got cmp handler Defs, we need to check for eventDef matching
                if (cmpHandlerDefs) {
                    // Each handler
                    for (i = 0; i < cmpHandlerDefs.length && needsDispatch; i++) {
                        // Check for inheritance event def structure
                        for (var evtDef = evt.getDef(); evtDef; evtDef = evtDef.getSuperDef()) {
                            var hDef = cmpHandlerDefs[i]["eventDef"];

                            // If we have the def we guard against it. If we just have name, only check the name
                            // TODO @dval: Refactor this, once we remove all self-events + move parent->child event into methods
                            if (cmpHandlerDefs[i]["name"] === eventName && (!hDef || hDef === evtDef)) {
                                for (j = 0; j < dispatcherHandlers.length && superCmp.isValid(); j++) {
                                    dispatcherHandlers[j](evt);
                                }
                                needsDispatch = false;
                                break;
                            }

                            // And if we dont have a def, we are firing an event against ourselves
                            // TODO @dval: Refactor this, once we remove all self-events + move parent->child event into methods
                            if (!hDef) {
                                evt.stopPropagation();
                            }
                        }
                    }

                }

            } // dispatcher-check

            // If we need to dispatch here, is a direct parent-children event (no def handler)
            // So we can cancel Propagation
            if (needsDispatch && superCmp.getDef().getEventDef(eventName)) {
                evt.stopPropagation();
                for (j = 0; j < dispatcherHandlers.length; j++) {
                    dispatcherHandlers[j](evt);
                }
            }

        } // inheritance-loop

        if (!cmp.isValid()) {
            return;
        }

        // Look for a facet value provider (some providers may just be extending definitions)
        do {
            var next = cmp.getComponentValueProvider();
            if (next === cmp || !(next instanceof Component)) {
                // We are at the top-level now, so we are done;
                return;
            }
            if (next.getGlobalId() !== cmp.getGlobalId()) {
                // Reached a facet value provider
                cmp = next;
                break;
            }
            cmp = next;
        } while (cmp);
    } // parent-bubble-loop
};

/**
 * Returns the new event.
 * @param {String} name The event object in the format namespace:component
 * @memberOf AuraEventService
 */
AuraEventService.prototype.get = function(name) {
    return this.newEvent(name);
};

/**
 * Adds an event handler.
 * @param {Object} config The data for the event handler
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.addHandler = function(config) {
    config["event"] = this.qualifyEventName(config["event"]);

    var handlers = this.eventDispatcher[config["event"]];
    if (!handlers) {
        handlers = {};
        this.eventDispatcher[config["event"]] = handlers;
    }
    var cmpHandlers = handlers[config["globalId"]];
    if (cmpHandlers === undefined) {
        cmpHandlers = [];
        handlers[config["globalId"]] = cmpHandlers;
    }
    cmpHandlers.push(config["handler"]);
};

/**
 * Removes an event handler.
 * @param {Object} config The data for the event
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.removeHandler = function(config) {
    config["event"] = this.qualifyEventName(config["event"]);

    var handlers = this.eventDispatcher[config["event"]];
    if (handlers) {
        delete handlers[config["globalId"]];
    }
};

/**
 * Returns the event definition.
 * @param {String} descriptor name of EventDef
 * @return {EventDef} The event definition.
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.getEventDef = function(descriptor) {
    $A.assert(descriptor, "No EventDef descriptor specified");
    if(descriptor.indexOf("://") === -1){
        descriptor = "markup://" + descriptor;
    }
    var def = this.registry.getDef(descriptor),
        config = this.savedEventConfigs[descriptor];

    if (!def && config) {
        def = this.createEventDef(config);
        delete this.savedEventConfigs[descriptor];
    }

    return def;
};

/**
 * Creates and returns EventDef from config
 * @param {Object} config The parameters for the event
 * @return {EventDef} The event definition.
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.createEventDef = function(config) {
    var def =  this.registry.createDef(config);
    if (def) {
        delete this.savedEventConfigs[def.getDescriptor().toString()];
    }
    return def;
};

/**
 * Saves EventDef config so it can be use later when EventDef is actually used.
 * Allows Aura to only create EventDef when needed
 *
 * @param {Object} config event definition config
 */
AuraEventService.prototype.saveEventConfig = function(config) {
    $A.assert(config && config["descriptor"], "Event config required for registration");
    this.savedEventConfigs[config["descriptor"]] = config;
};

/**
 * Returns true if the event has handlers.
 * @param {String} name The event name
 * @memberOf AuraEventService
 * @public
 * @export
 */
AuraEventService.prototype.hasHandlers = function(name) {
    name = this.qualifyEventName(name);
    return !$A.util.isUndefined(this.eventDispatcher[name]);
};

//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
/**
 * Returns the qualified name of all events known to the registry.
 * Available in DEV mode only.
 * @export
 */
AuraEventService.prototype.getRegisteredEvents = function() {
    return Object.keys(this.registry.eventDefs);
};

/**
 * Whether there are pending events
 * Available in DEV mode only.
 * @export
 */
AuraEventService.prototype.hasPendingEvents = function() {
    return $A.clientService.inAuraLoop();
};
//#end

Aura.Services.AuraEventService = AuraEventService;
